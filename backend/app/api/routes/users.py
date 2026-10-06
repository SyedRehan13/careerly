from fastapi import APIRouter, Depends

from app.api.dependencies.auth import get_current_user
from app.schemas.auth import CurrentUser

router = APIRouter(prefix="/api/v1/users", tags=["Users"])


@router.get("/me", response_model=CurrentUser)
async def read_current_user(
    current_user: CurrentUser = Depends(get_current_user),
) -> CurrentUser:
    return current_user
