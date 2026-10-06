import os
import unittest
from uuid import UUID, uuid4

import httpx
from sqlalchemy import pool, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine

from app.api.dependencies.auth import get_current_user
from app.core.database import get_database_session, get_database_url
from app.main import app
from app.schemas.auth import CurrentUser


class ApplicationValidationTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.client = httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test")

        async def unused_session():
            yield None

        app.dependency_overrides[get_database_session] = unused_session

    async def asyncTearDown(self):
        app.dependency_overrides.clear()
        await self.client.aclose()

    async def test_all_operations_require_authentication(self):
        url = "/api/v1/applications"
        for method, path in (("GET", url), ("POST", url), ("GET", f"{url}/{uuid4()}"), ("PATCH", f"{url}/{uuid4()}"), ("DELETE", f"{url}/{uuid4()}")):
            response = await self.client.request(method, path, json={})
            self.assertEqual(response.status_code, 401)

    async def test_validation_and_owner_rejection(self):
        app.dependency_overrides[get_current_user] = lambda: CurrentUser(id=uuid4())
        valid = {"title": "Developer", "company": "Example"}
        for changes in ({"title": "  "}, {"company": None}, {"status": "invalid"}, {"status": None}, {"notes": "x" * 20001}, {"applied_date": "not-a-date"}, {"follow_up_date": "2026-02-30"}, {"job_url": "javascript:alert(1)"}, {"user_id": str(uuid4())}):
            response = await self.client.post("/api/v1/applications", json=valid | changes)
            self.assertEqual(response.status_code, 422)
        for changes in ({"status": None}, {"company": None}, {"id": str(uuid4())}):
            response = await self.client.patch(f"/api/v1/applications/{uuid4()}", json=changes)
            self.assertEqual(response.status_code, 422)

    async def test_invalid_filters_and_pagination(self):
        app.dependency_overrides[get_current_user] = lambda: CurrentUser(id=uuid4())
        for query in ("status=invalid", "limit=0", "limit=101", "offset=-1"):
            response = await self.client.get(f"/api/v1/applications?{query}")
            self.assertEqual(response.status_code, 422)
        self.assertEqual((await self.client.get("/api/v1/applications/not-a-uuid")).status_code, 422)


@unittest.skipUnless(os.getenv("CAREERLY_TEST_DATABASE") == "1", "Enable rollback-only database checks with CAREERLY_TEST_DATABASE=1.")
class ApplicationDatabaseTests(unittest.IsolatedAsyncioTestCase):
    async def test_crud_status_dates_and_ownership(self):
        engine = create_async_engine(get_database_url(), connect_args={"ssl": "require"}, poolclass=pool.NullPool)
        try:
            async with engine.connect() as connection:
                transaction = await connection.begin()
                try:
                    ids = list((await connection.execute(text("SELECT id FROM auth.users ORDER BY id LIMIT 2"))).scalars())
                    if len(ids) < 2:
                        self.skipTest("Two existing Auth users are required.")
                    async with AsyncSession(bind=connection, expire_on_commit=False, join_transaction_mode="create_savepoint") as session:
                        async def test_session():
                            yield session

                        app.dependency_overrides[get_database_session] = test_session
                        app.dependency_overrides[get_current_user] = lambda: CurrentUser(id=ids[0])
                        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
                            url = "/api/v1/applications"
                            created = await client.post(url, json={"title": "  Developer  ", "company": "Example", "applied_date": "2026-10-01", "job_url": "https://example.com/jobs/1"})
                            self.assertEqual(created.status_code, 201)
                            application = created.json()
                            self.assertEqual(application["title"], "Developer")
                            self.assertEqual(application["status"], "applied")
                            self.assertEqual(application["applied_date"], "2026-10-01")
                            self.assertEqual(application["user_id"], str(ids[0]))
                            item_url = f"{url}/{application['id']}"
                            second = await client.post(url, json={"title": "Second", "company": "Example", "status": "rejected"})
                            self.assertEqual(second.status_code, 201)
                            page = await client.get(url, params={"limit": 1})
                            next_page = await client.get(url, params={"limit": 1, "offset": 1})
                            self.assertEqual(len(page.json()), 1)
                            self.assertNotEqual(page.json()[0]["id"], next_page.json()[0]["id"])
                            updated = await client.patch(item_url, json={"status": "interviewing", "follow_up_date": "2026-10-15", "notes": "Prepare for interview"})
                            self.assertEqual(updated.status_code, 200)
                            self.assertEqual(updated.json()["status"], "interviewing")
                            self.assertEqual(updated.json()["applied_date"], "2026-10-01")
                            self.assertEqual(updated.json()["follow_up_date"], "2026-10-15")
                            filtered = await client.get(url, params={"status": "interviewing"})
                            self.assertTrue(all(row["status"] == "interviewing" for row in filtered.json()))
                            self.assertIn(application["id"], [row["id"] for row in filtered.json()])
                            cleared = await client.patch(item_url, json={"notes": None, "follow_up_date": None})
                            self.assertEqual(cleared.status_code, 200)
                            self.assertIsNone(cleared.json()["follow_up_date"])
                            self.assertEqual((await client.patch(item_url, json={})).status_code, 200)
                            app.dependency_overrides[get_current_user] = lambda: CurrentUser(id=ids[1])
                            other = await client.get(url)
                            self.assertTrue(all(row["user_id"] == str(ids[1]) for row in other.json()))
                            for method in ("GET", "PATCH", "DELETE"):
                                response = await client.request(method, item_url, json={"status": "rejected"} if method == "PATCH" else None)
                                self.assertEqual(response.status_code, 404)
                            app.dependency_overrides[get_current_user] = lambda: CurrentUser(id=ids[0])
                            self.assertEqual((await client.get(item_url)).json()["status"], "interviewing")
                            deleted = await client.delete(item_url)
                            self.assertEqual(deleted.status_code, 204)
                            self.assertEqual(deleted.content, b"")
                            self.assertEqual((await client.get(item_url)).status_code, 404)
                    policies = list((await connection.execute(text("SELECT cmd FROM pg_policies WHERE tablename = :name"), {"name": "applications"})).scalars())
                    self.assertEqual(set(policies), {"SELECT", "INSERT", "UPDATE", "DELETE"})
                    self.assertTrue(await connection.scalar(text("SELECT relrowsecurity FROM pg_class WHERE oid = 'public.applications'::regclass")))
                    # Direct SQL must also reject statuses outside the supported set.
                    with self.assertRaises(IntegrityError):
                        async with connection.begin_nested():
                            await connection.execute(text("UPDATE public.applications SET status = :s WHERE id = :id"), {"s": "invalid", "id": UUID(second.json()["id"])})
                finally:
                    app.dependency_overrides.clear()
                    await transaction.rollback()
        finally:
            await engine.dispose()
