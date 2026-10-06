import os
import unittest
from uuid import uuid4

import httpx
from sqlalchemy import pool, text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine

from app.api.dependencies.auth import get_current_user
from app.core.database import get_database_session, get_database_url
from app.main import app
from app.schemas.auth import CurrentUser


class SavedJobValidationTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.client = httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test")

        async def unused_session():
            yield None

        app.dependency_overrides[get_database_session] = unused_session

    async def asyncTearDown(self):
        app.dependency_overrides.clear()
        await self.client.aclose()

    async def test_all_operations_require_authentication(self):
        url = "/api/v1/saved-jobs"
        for method, path in (("GET", url), ("POST", url), ("GET", f"{url}/{uuid4()}"), ("PATCH", f"{url}/{uuid4()}"), ("DELETE", f"{url}/{uuid4()}")):
            response = await self.client.request(method, path, json={})
            self.assertEqual(response.status_code, 401)

    async def test_invalid_fields_and_owner_rejected(self):
        app.dependency_overrides[get_current_user] = lambda: CurrentUser(id=uuid4())
        valid = {"title": "Developer", "company": "Example"}
        for changes in ({"title": "  "}, {"title": None}, {"company": ""}, {"title": "x" * 201}, {"description": "x" * 20001}, {"job_url": "javascript:alert(1)"}, {"user_id": str(uuid4())}, {"id": str(uuid4())}):
            response = await self.client.post("/api/v1/saved-jobs", json=valid | changes)
            self.assertEqual(response.status_code, 422)
        for changes in ({"title": None}, {"company": None}, {"user_id": str(uuid4())}):
            response = await self.client.patch(f"/api/v1/saved-jobs/{uuid4()}", json=changes)
            self.assertEqual(response.status_code, 422)

    async def test_invalid_pagination_and_job_id(self):
        app.dependency_overrides[get_current_user] = lambda: CurrentUser(id=uuid4())
        for query in ("limit=0", "limit=101", "offset=-1"):
            response = await self.client.get(f"/api/v1/saved-jobs?{query}")
            self.assertEqual(response.status_code, 422)
        response = await self.client.get("/api/v1/saved-jobs/not-a-uuid")
        self.assertEqual(response.status_code, 422)


@unittest.skipUnless(os.getenv("CAREERLY_TEST_DATABASE") == "1", "Enable rollback-only database tests with CAREERLY_TEST_DATABASE=1.")
class SavedJobDatabaseTests(unittest.IsolatedAsyncioTestCase):
    async def test_crud_pagination_and_cross_user_isolation(self):
        engine = create_async_engine(get_database_url(), connect_args={"ssl": "require"}, poolclass=pool.NullPool)
        try:
            async with engine.connect() as connection:
                transaction = await connection.begin()
                try:
                    ids = list((await connection.execute(text("SELECT id FROM auth.users ORDER BY id LIMIT 2"))).scalars())
                    if len(ids) < 2:
                        self.skipTest("Two existing Auth users are required to test isolation.")
                    async with AsyncSession(bind=connection, expire_on_commit=False, join_transaction_mode="create_savepoint") as session:
                        async def test_session():
                            yield session

                        app.dependency_overrides[get_database_session] = test_session
                        app.dependency_overrides[get_current_user] = lambda: CurrentUser(id=ids[0])
                        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
                            url = "/api/v1/saved-jobs"
                            first = await client.post(url, json={"title": "  Developer  ", "company": "Example", "job_url": "https://example.com/jobs/1", "location": "Remote"})
                            self.assertEqual(first.status_code, 201)
                            job = first.json()
                            self.assertEqual(job["title"], "Developer")
                            self.assertEqual(job["user_id"], str(ids[0]))
                            item_url = f"{url}/{job['id']}"
                            second = await client.post(url, json={"title": "Second", "company": "Example"})
                            self.assertEqual(second.status_code, 201)
                            page = await client.get(url, params={"limit": 1})
                            self.assertEqual(page.status_code, 200)
                            self.assertEqual(len(page.json()), 1)
                            next_page = await client.get(url, params={"limit": 1, "offset": 1})
                            self.assertNotEqual(page.json()[0]["id"], next_page.json()[0]["id"])
                            updated = await client.patch(item_url, json={"description": "Updated", "location": None})
                            self.assertEqual(updated.status_code, 200)
                            self.assertEqual(updated.json()["title"], "Developer")
                            self.assertIsNone(updated.json()["location"])
                            empty = await client.patch(item_url, json={})
                            self.assertEqual(empty.status_code, 200)
                            app.dependency_overrides[get_current_user] = lambda: CurrentUser(id=ids[1])
                            listing = await client.get(url)
                            self.assertTrue(all(row["user_id"] == str(ids[1]) for row in listing.json()))
                            for method in ("GET", "PATCH", "DELETE"):
                                response = await client.request(method, item_url, json={"title": "Unauthorized edit"} if method == "PATCH" else None)
                                self.assertEqual(response.status_code, 404)
                            app.dependency_overrides[get_current_user] = lambda: CurrentUser(id=ids[0])
                            own = await client.get(item_url)
                            self.assertEqual(own.json()["title"], "Developer")
                            self.assertEqual(own.json()["description"], "Updated")
                            deleted = await client.delete(item_url)
                            self.assertEqual(deleted.status_code, 204)
                            self.assertEqual(deleted.content, b"")
                            self.assertEqual((await client.get(item_url)).status_code, 404)
                            self.assertEqual((await client.delete(item_url)).status_code, 404)
                    policies = list((await connection.execute(text("SELECT cmd FROM pg_policies WHERE tablename = :name"), {"name": "saved_jobs"})).scalars())
                    self.assertEqual(set(policies), {"SELECT", "INSERT", "UPDATE", "DELETE"})
                    self.assertTrue(await connection.scalar(text("SELECT relrowsecurity FROM pg_class WHERE oid = 'public.saved_jobs'::regclass")))
                finally:
                    app.dependency_overrides.clear()
                    await transaction.rollback()
        finally:
            await engine.dispose()
