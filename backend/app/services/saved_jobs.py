from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import SavedJob
from app.schemas.saved_job import SavedJobCreate, SavedJobUpdate


async def create_saved_job(session: AsyncSession, user_id: UUID, data: SavedJobCreate) -> SavedJob:
    job = SavedJob(user_id=user_id, **data.model_dump(mode="json"))
    session.add(job)
    await session.commit()
    await session.refresh(job)
    return job


async def list_saved_jobs(session: AsyncSession, user_id: UUID, limit: int, offset: int) -> list[SavedJob]:
    result = await session.execute(
        select(SavedJob).where(SavedJob.user_id == user_id)
        .order_by(SavedJob.created_at.desc(), SavedJob.id.desc())
        .limit(limit).offset(offset)
    )
    return list(result.scalars())


async def get_saved_job(session: AsyncSession, user_id: UUID, job_id: UUID) -> SavedJob:
    result = await session.execute(
        select(SavedJob).where(SavedJob.id == job_id, SavedJob.user_id == user_id)
    )
    job = result.scalar_one_or_none()
    if job is None:
        raise HTTPException(status_code=404, detail="Saved job not found.")
    return job


async def update_saved_job(session: AsyncSession, user_id: UUID, job_id: UUID, data: SavedJobUpdate) -> SavedJob:
    job = await get_saved_job(session, user_id, job_id)
    for field, value in data.model_dump(mode="json", exclude_unset=True).items():
        setattr(job, field, value)
    await session.commit()
    await session.refresh(job)
    return job


async def delete_saved_job(session: AsyncSession, user_id: UUID, job_id: UUID) -> None:
    job = await get_saved_job(session, user_id, job_id)
    await session.delete(job)
    await session.commit()
