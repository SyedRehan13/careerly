from datetime import date
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Application, SavedJob
from app.schemas.application import ApplicationResponse
from app.schemas.dashboard import ApplicationStatusCounts, DashboardSummary

ACTIVE_STATUSES = ("applied", "interviewing", "offer")


async def get_dashboard_summary(
    session: AsyncSession,
    user_id: UUID,
    as_of_date: date,
    recent_limit: int,
    follow_up_limit: int,
) -> DashboardSummary:
    saved_jobs_count = await session.scalar(
        select(func.count()).select_from(SavedJob).where(SavedJob.user_id == user_id)
    )
    rows = await session.execute(
        select(Application.status, func.count())
        .where(Application.user_id == user_id)
        .group_by(Application.status)
    )
    counts = ApplicationStatusCounts(**dict(rows.all()))
    status_counts = counts.model_dump()
    recent = await session.scalars(
        select(Application).where(Application.user_id == user_id)
        .order_by(Application.created_at.desc(), Application.id.desc())
        .limit(recent_limit)
    )
    follow_ups = await session.scalars(
        select(Application).where(
            Application.user_id == user_id,
            Application.status.in_(ACTIVE_STATUSES),
            Application.follow_up_date >= as_of_date,
        )
        .order_by(Application.follow_up_date.asc(), Application.created_at.desc(), Application.id.desc())
        .limit(follow_up_limit)
    )
    return DashboardSummary(
        as_of_date=as_of_date,
        saved_jobs_count=saved_jobs_count,
        total_applications=sum(status_counts.values()),
        active_applications=sum(status_counts[status] for status in ACTIVE_STATUSES),
        applications_by_status=counts,
        recent_applications=[ApplicationResponse.model_validate(row) for row in recent],
        upcoming_follow_ups=[ApplicationResponse.model_validate(row) for row in follow_ups],
    )
