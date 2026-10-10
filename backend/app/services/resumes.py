from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Resume
from app.schemas.resume import ResumeContent, ResumeResponse


async def read_resume(session: AsyncSession, user_id: UUID) -> ResumeResponse:
    result = await session.execute(select(Resume).where(Resume.user_id == user_id))
    resume = result.scalar_one_or_none()
    if resume is None:
        return ResumeResponse(user_id=user_id, content=ResumeContent(), updated_at=None)
    return ResumeResponse.model_validate(resume)


async def save_resume(
    session: AsyncSession, user_id: UUID, content: ResumeContent
) -> ResumeResponse:
    result = await session.execute(select(Resume).where(Resume.user_id == user_id))
    resume = result.scalar_one_or_none()
    if resume is None:
        resume = Resume(user_id=user_id, content=content.model_dump(mode="json"))
        session.add(resume)
    else:
        resume.content = content.model_dump(mode="json")

    await session.commit()
    await session.refresh(resume)
    return ResumeResponse.model_validate(resume)
