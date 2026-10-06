import os
import unittest
from datetime import date, datetime, timedelta, timezone
from uuid import uuid4

import httpx
from sqlalchemy import pool, text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine

from app.api.dependencies.auth import get_current_user
from app.core.database import get_database_session, get_database_url
from app.main import app
from app.models import Application, SavedJob
from app.schemas.auth import CurrentUser

URL = "/api/v1/dashboard/summary"


class DashboardValidationTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.client = httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test")

        async def unused_session():
            yield None

        app.dependency_overrides[get_database_session] = unused_session

    async def asyncTearDown(self):
        app.dependency_overrides.clear()
        await self.client.aclose()

    async def test_missing_token_rejected(self):
        response = await self.client.get(URL)
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.headers["www-authenticate"], "Bearer")

    async def test_invalid_limits_and_date(self):
        app.dependency_overrides[get_current_user] = lambda: CurrentUser(id=uuid4())
        for params in ({"recent_limit": 0}, {"recent_limit": 21}, {"follow_up_limit": -1}, {"follow_up_limit": 21}, {"as_of_date": "2026-02-30"}):
            response = await self.client.get(URL, params=params)
            self.assertEqual(response.status_code, 422)


@unittest.skipUnless(os.getenv("CAREERLY_TEST_DATABASE") == "1", "Enable rollback-only database checks with CAREERLY_TEST_DATABASE=1.")
class DashboardDatabaseTests(unittest.IsolatedAsyncioTestCase):
    async def test_counts_ordering_dates_limits_and_isolation(self):
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
                        # An authenticated identity with no data must receive zeros and empty arrays.
                        app.dependency_overrides[get_current_user] = lambda: CurrentUser(id=uuid4())
                        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
                            empty = await client.get(URL)
                            self.assertEqual(empty.status_code, 200)
                            self.assertEqual(empty.json()["saved_jobs_count"], 0)
                            self.assertEqual(empty.json()["total_applications"], 0)
                            self.assertEqual(empty.json()["active_applications"], 0)
                            self.assertTrue(all(count == 0 for count in empty.json()["applications_by_status"].values()))
                            self.assertEqual(empty.json()["recent_applications"], [])
                            self.assertEqual(empty.json()["upcoming_follow_ups"], [])
                            self.assertEqual(empty.json()["as_of_date"], datetime.now(timezone.utc).date().isoformat())
                            app.dependency_overrides[get_current_user] = lambda: CurrentUser(id=ids[0])
                            day = date(2035, 1, 10)
                            baseline = (await client.get(URL, params={"as_of_date": day.isoformat()})).json()
                            app.dependency_overrides[get_current_user] = lambda: CurrentUser(id=ids[1])
                            other_baseline = (await client.get(URL, params={"as_of_date": day.isoformat()})).json()
                            specs = [
                                ("applied", day),
                                ("interviewing", day + timedelta(days=1)),
                                ("offer", day + timedelta(days=2)),
                                ("rejected", day),
                                ("withdrawn", day),
                                ("applied", day - timedelta(days=1)),
                                ("applied", None),
                            ]
                            applications = []
                            for index, (status, follow_up) in enumerate(specs):
                                application = Application(user_id=ids[0], title=f"Test {index}", company="Dashboard test", status=status, follow_up_date=follow_up, created_at=datetime(2100, 1, 1, tzinfo=timezone.utc) + timedelta(seconds=index))
                                session.add(application)
                                applications.append(application)
                            foreign = Application(user_id=ids[1], title="Other user", company="Other", status="interviewing", follow_up_date=day, created_at=datetime(2101, 1, 1, tzinfo=timezone.utc))
                            session.add(foreign)
                            session.add_all([SavedJob(user_id=ids[0], title="Saved", company="Example"), SavedJob(user_id=ids[1], title="Other saved", company="Other")])
                            await session.flush()
                            app.dependency_overrides[get_current_user] = lambda: CurrentUser(id=ids[0])
                            response = await client.get(URL, params={"as_of_date": day.isoformat(), "recent_limit": 20, "follow_up_limit": 20})
                            self.assertEqual(response.status_code, 200)
                            summary = response.json()
                            self.assertEqual(summary["saved_jobs_count"], baseline["saved_jobs_count"] + 1)
                            self.assertEqual(summary["total_applications"], baseline["total_applications"] + 7)
                            self.assertEqual(summary["active_applications"], baseline["active_applications"] + 5)
                            for status, increment in {"applied": 3, "interviewing": 1, "offer": 1, "rejected": 1, "withdrawn": 1}.items():
                                self.assertEqual(summary["applications_by_status"][status], baseline["applications_by_status"][status] + increment)
                            recent_ids = [row["id"] for row in summary["recent_applications"]]
                            self.assertEqual(recent_ids[:7], [str(row.id) for row in reversed(applications)])
                            follow_ups = summary["upcoming_follow_ups"]
                            self.assertTrue(all(row["status"] in ("applied", "interviewing", "offer") and row["follow_up_date"] >= day.isoformat() for row in follow_ups))
                            fixture_ids = {str(row.id) for row in applications}
                            self.assertEqual([row["id"] for row in follow_ups if row["id"] in fixture_ids], [str(row.id) for row in applications[:3]])
                            for key in ("recent_applications", "upcoming_follow_ups"):
                                self.assertTrue(all(row["user_id"] == str(ids[0]) for row in summary[key]))
                                self.assertNotIn(str(foreign.id), [row["id"] for row in summary[key]])
                            limited = (await client.get(URL, params={"as_of_date": day.isoformat(), "recent_limit": 1, "follow_up_limit": 1})).json()
                            self.assertEqual(len(limited["recent_applications"]), 1)
                            self.assertEqual(len(limited["upcoming_follow_ups"]), 1)
                            app.dependency_overrides[get_current_user] = lambda: CurrentUser(id=ids[1])
                            other = (await client.get(URL, params={"as_of_date": day.isoformat()})).json()
                            self.assertEqual(other["total_applications"], other_baseline["total_applications"] + 1)
                            self.assertEqual(other["saved_jobs_count"], other_baseline["saved_jobs_count"] + 1)
                            self.assertTrue(all(row["user_id"] == str(ids[1]) for row in other["recent_applications"]))
                finally:
                    app.dependency_overrides.clear()
                    await transaction.rollback()
        finally:
            await engine.dispose()
