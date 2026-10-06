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


class ProfileValidationTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.client = httpx.AsyncClient(
            transport=httpx.ASGITransport(app=app), base_url="http://test"
        )

        async def unused_session():
            yield None

        app.dependency_overrides[get_database_session] = unused_session

    async def asyncTearDown(self):
        app.dependency_overrides.clear()
        await self.client.aclose()

    async def test_missing_token_rejected_for_read_and_update(self):
        for method in ("GET", "PATCH"):
            response = await self.client.request(
                method, "/api/v1/users/me/profile", json={}
            )
            self.assertEqual(response.status_code, 401)

    async def test_cannot_supply_identity_or_server_fields(self):
        app.dependency_overrides[get_current_user] = lambda: CurrentUser(id=uuid4())
        for payload in (
            {"id": str(uuid4())},
            {"user_id": str(uuid4())},
            {"created_at": "2026-01-01T00:00:00Z"},
        ):
            response = await self.client.patch("/api/v1/users/me/profile", json=payload)
            self.assertEqual(response.status_code, 422)

    async def test_field_limits_and_types(self):
        app.dependency_overrides[get_current_user] = lambda: CurrentUser(id=uuid4())
        for payload in (
            {"full_name": "x" * 201},
            {"headline": "x" * 201},
            {"location": "x" * 201},
            {"bio": "x" * 5001},
            {"headline": ["invalid"]},
        ):
            response = await self.client.patch("/api/v1/users/me/profile", json=payload)
            self.assertEqual(response.status_code, 422)


@unittest.skipUnless(
    os.getenv("CAREERLY_TEST_DATABASE") == "1",
    "Set CAREERLY_TEST_DATABASE=1 to run rollback-only Supabase integration checks.",
)
class ProfileDatabaseTests(unittest.IsolatedAsyncioTestCase):
    async def test_profile_creation_updates_and_ownership(self):
        engine = create_async_engine(
            get_database_url(), connect_args={"ssl": "require"}, poolclass=pool.NullPool
        )
        try:
            async with engine.connect() as connection:
                transaction = await connection.begin()
                try:
                    ids = list((await connection.execute(
                        text("SELECT id FROM auth.users ORDER BY id LIMIT 2")
                    )).scalars())
                    if not ids:
                        self.skipTest("An existing Supabase user is required.")
                    async with AsyncSession(
                        bind=connection,
                        expire_on_commit=False,
                        join_transaction_mode="create_savepoint",
                    ) as session:
                        async def test_session():
                            yield session

                        app.dependency_overrides[get_database_session] = test_session
                        app.dependency_overrides[get_current_user] = lambda: CurrentUser(
                            id=ids[0], full_name="Initial Name"
                        )
                        async with httpx.AsyncClient(
                            transport=httpx.ASGITransport(app=app), base_url="http://test"
                        ) as client:
                            url = "/api/v1/users/me/profile"
                            first = await client.get(url)
                            self.assertEqual(first.status_code, 200)
                            self.assertEqual(first.json()["id"], str(ids[0]))
                            created_at = first.json()["created_at"]
                            updated = await client.patch(url, json={
                                "full_name": "Edited Name",
                                "headline": "  Backend developer  ",
                                "bio": "Test biography",
                            })
                            self.assertEqual(updated.status_code, 200)
                            self.assertEqual(updated.json()["headline"], "Backend developer")
                            self.assertEqual(updated.json()["created_at"], created_at)
                            repeated = await client.get(url)
                            self.assertEqual(repeated.json()["full_name"], "Edited Name")
                            cleared = await client.patch(url, json={"bio": None})
                            self.assertIsNone(cleared.json()["bio"])
                            self.assertEqual(cleared.json()["headline"], "Backend developer")
                            empty = await client.patch(url, json={})
                            self.assertEqual(empty.status_code, 200)
                            if len(ids) > 1:
                                app.dependency_overrides[get_current_user] = lambda: CurrentUser(id=ids[1])
                                other = await client.patch(url, json={"headline": "Other user"})
                                self.assertEqual(other.status_code, 200)
                                self.assertEqual(other.json()["id"], str(ids[1]))
                                app.dependency_overrides[get_current_user] = lambda: CurrentUser(id=ids[0])
                                original = await client.get(url)
                                self.assertEqual(original.json()["headline"], "Backend developer")
                            else:
                                print("Ownership across two users not exercised: only one Auth user exists.")
                finally:
                    app.dependency_overrides.clear()
                    await transaction.rollback()
        finally:
            await engine.dispose()
