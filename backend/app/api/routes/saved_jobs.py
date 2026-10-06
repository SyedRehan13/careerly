from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.auth import get_current_user
from app.core.database import get_database_session
from app.schemas.auth import CurrentUser
from app.schemas.saved_job import SavedJobCreate, SavedJobResponse, SavedJobUpdate
from app.services import saved_jobs

router = APIRouter(prefix="/api/v1/saved-jobs", tags=["Saved jobs"])
User = Annotated[CurrentUser, Depends(get_current_user)]
Session = Annotated[AsyncSession, Depends(get_database_session)]


@router.post("", response_model=SavedJobResponse, status_code=201)
async def create_job(data: SavedJobCreate, user: User, session: Session):
    return await saved_jobs.create_saved_job(session, user.id, data)


@router.get("", response_model=list[SavedJobResponse])
async def list_jobs(
    user: User, session: Session,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
):
    return await saved_jobs.list_saved_jobs(session, user.id, limit, offset)


@router.get("/{job_id}", response_model=SavedJobResponse)
async def read_job(job_id: UUID, user: User, session: Session):
    return await saved_jobs.get_saved_job(session, user.id, job_id)


@router.patch("/{job_id}", response_model=SavedJobResponse)
async def update_job(job_id: UUID, data: SavedJobUpdate, user: User, session: Session):
    return await saved_jobs.update_saved_job(session, user.id, job_id, data)


@router.delete("/{job_id}", status_code=204)
async def delete_job(job_id: UUID, user: User, session: Session) -> Response:
    await saved_jobs.delete_saved_job(session, user.id, job_id)
    return Response(status_code=204)
