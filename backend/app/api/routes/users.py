from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.auth import get_current_user
from app.core.database import get_database_session
from app.schemas.auth import CurrentUser
from app.schemas.profile import ProfileResponse, ProfileUpdate
from app.services.profiles import read_profile, update_profile

router = APIRouter(prefix="/api/v1/users", tags=["Users"])


@router.get("/me", response_model=CurrentUser)
async def read_current_user(
    current_user: CurrentUser = Depends(get_current_user),
) -> CurrentUser:
    return current_user


@router.get("/me/profile", response_model=ProfileResponse)
async def read_my_profile(
    current_user: CurrentUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_database_session),
) -> ProfileResponse:
    profile = await read_profile(session, current_user)
    return ProfileResponse.model_validate(profile)


@router.patch("/me/profile", response_model=ProfileResponse)
async def update_my_profile(
    changes: ProfileUpdate,
    current_user: CurrentUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_database_session),
) -> ProfileResponse:
    profile = await update_profile(session, current_user, changes)
    return ProfileResponse.model_validate(profile)
