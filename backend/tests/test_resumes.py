import unittest
from datetime import datetime, timezone
from types import SimpleNamespace
from uuid import uuid4

import httpx

from app.api.dependencies.auth import get_current_user
from app.core.database import get_database_session
from app.main import app
from app.schemas.auth import CurrentUser
from app.schemas.resume import ResumeResponse


class ResumeValidationTests(unittest.IsolatedAsyncioTestCase):
    def test_resume_response_serializes_orm_attributes_and_json_content(self):
        user_id = uuid4()
        now = datetime.now(timezone.utc)
        response = ResumeResponse.model_validate(SimpleNamespace(
            user_id=user_id,
            content={"full_name": "Ada Lovelace", "skills": ["Python"]},
            updated_at=now,
        ))

        self.assertEqual(response.user_id, user_id)
        self.assertEqual(response.content.full_name, "Ada Lovelace")
        self.assertEqual(response.content.skills, ["Python"])

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

    async def test_resume_requires_authentication(self):
        url = "/api/v1/users/me/resume"
        for method in ("GET", "PUT"):
            response = await self.client.request(method, url, json={"content": {}})
            self.assertEqual(response.status_code, 401)

    async def test_resume_rejects_identity_unknown_fields_and_oversized_sections(self):
        app.dependency_overrides[get_current_user] = lambda: CurrentUser(id=uuid4())
        url = "/api/v1/users/me/resume"
        invalid_contents = (
            {"user_id": str(uuid4())},
            {"unexpected": "field"},
            {"summary": "x" * 20_001},
            {"skills": ["x" * 81]},
            {"skills": ["skill"] * 41},
            {"experience": [{"id": "role-1", "unknown": "field"}]},
            {"education": [{"id": "school-1", "description": "x" * 20_001}]},
            {"experience": [{"id": ""}]},
        )

        for content in invalid_contents:
            with self.subTest(content=next(iter(content))):
                response = await self.client.put(url, json={"content": content})
                self.assertEqual(response.status_code, 422)

        missing_content = await self.client.put(url, json={})
        self.assertEqual(missing_content.status_code, 422)
