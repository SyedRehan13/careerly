from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Application
from app.schemas.application import ApplicationCreate, ApplicationStatus, ApplicationUpdate


async def create_application(session: AsyncSession, user_id: UUID, data: ApplicationCreate) -> Application:
    # Preserve Python dates for PostgreSQL; serialize only the URL.
    values = data.model_dump()
    if values["job_url"] is not None:
        values["job_url"] = str(values["job_url"])
    application = Application(user_id=user_id, **values)
    session.add(application)
    await session.commit()
    await session.refresh(application)
    return application


async def list_applications(
    session: AsyncSession, user_id: UUID, limit: int, offset: int,
    status: ApplicationStatus | None,
) -> list[Application]:
    query = select(Application).where(Application.user_id == user_id)
    if status is not None:
        query = query.where(Application.status == status)
    result = await session.execute(
        query.order_by(Application.created_at.desc(), Application.id.desc())
        .limit(limit).offset(offset)
    )
    return list(result.scalars())


async def get_application(session: AsyncSession, user_id: UUID, application_id: UUID) -> Application:
    result = await session.execute(
        select(Application).where(Application.id == application_id, Application.user_id == user_id)
    )
    application = result.scalar_one_or_none()
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found.")
    return application


async def update_application(session: AsyncSession, user_id: UUID, application_id: UUID, data: ApplicationUpdate) -> Application:
    application = await get_application(session, user_id, application_id)
    values = data.model_dump(exclude_unset=True)
    if values.get("job_url") is not None:
        values["job_url"] = str(values["job_url"])
    for field, value in values.items():
        setattr(application, field, value)
    await session.commit()
    await session.refresh(application)
    return application


async def delete_application(session: AsyncSession, user_id: UUID, application_id: UUID) -> None:
    application = await get_application(session, user_id, application_id)
    await session.delete(application)
    await session.commit()
