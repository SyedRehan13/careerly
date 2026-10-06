from datetime import date, datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.auth import get_current_user
from app.core.database import get_database_session
from app.schemas.auth import CurrentUser
from app.schemas.dashboard import DashboardSummary
from app.services.dashboard import get_dashboard_summary

router = APIRouter(prefix="/api/v1/dashboard", tags=["Dashboard"])


@router.get("/summary", response_model=DashboardSummary)
async def read_dashboard_summary(
    user: Annotated[CurrentUser, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_database_session)],
    as_of_date: date | None = None,
    recent_limit: Annotated[int, Query(ge=1, le=20)] = 5,
    follow_up_limit: Annotated[int, Query(ge=1, le=20)] = 5,
) -> DashboardSummary:
    effective_date = as_of_date if as_of_date is not None else datetime.now(timezone.utc).date()
    return await get_dashboard_summary(session, user.id, effective_date, recent_limit, follow_up_limit)
