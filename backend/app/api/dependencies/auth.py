from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from starlette.concurrency import run_in_threadpool
from supabase_auth.errors import AuthError

from app.core.supabase import get_supabase_client
from app.schemas.auth import CurrentUser

bearer_scheme = HTTPBearer(auto_error=False)


def authentication_error(detail: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


async def get_current_user(
    credentials: Annotated[
        HTTPAuthorizationCredentials | None,
        Depends(bearer_scheme),
    ],
) -> CurrentUser:
    if credentials is None:
        raise authentication_error("Authentication token is required.")

    try:
        response = await run_in_threadpool(
            get_supabase_client().auth.get_user,
            credentials.credentials,
        )
    except AuthError as error:
        raise authentication_error(
            "Invalid or expired authentication token."
        ) from error

    if response is None or response.user is None:
        raise authentication_error("Invalid or expired authentication token.")

    metadata = response.user.user_metadata or {}
    full_name = metadata.get("full_name")

    return CurrentUser(
        id=response.user.id,
        email=response.user.email,
        full_name=full_name if isinstance(full_name, str) else None,
    )
