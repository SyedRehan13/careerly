from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.auth import get_current_user
from app.core.database import get_database_session
from app.models import Application
from app.schemas.auth import CurrentUser
from app.schemas.application import ApplicationCreate, ApplicationResponse, ApplicationStatus, ApplicationUpdate
from app.services import applications

router = APIRouter(prefix="/api/v1/applications", tags=["Applications"])
User = Annotated[CurrentUser, Depends(get_current_user)]
Session = Annotated[AsyncSession, Depends(get_database_session)]


@router.post("", response_model=ApplicationResponse, status_code=201)
async def create_application(data: ApplicationCreate, user: User, session: Session) -> Application:
    return await applications.create_application(session, user.id, data)


@router.get("", response_model=list[ApplicationResponse])
async def list_applications(
    user: User, session: Session,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
    status: ApplicationStatus | None = None,
) -> list[Application]:
    return await applications.list_applications(session, user.id, limit, offset, status)


@router.get("/{application_id}", response_model=ApplicationResponse)
async def read_application(application_id: UUID, user: User, session: Session) -> Application:
    return await applications.get_application(session, user.id, application_id)


@router.patch("/{application_id}", response_model=ApplicationResponse)
async def update_application(application_id: UUID, data: ApplicationUpdate, user: User, session: Session) -> Application:
    return await applications.update_application(session, user.id, application_id, data)


@router.delete("/{application_id}", status_code=204)
async def delete_application(application_id: UUID, user: User, session: Session) -> Response:
    await applications.delete_application(session, user.id, application_id)
    return Response(status_code=204)
