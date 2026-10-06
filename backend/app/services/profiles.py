from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Profile
from app.schemas.auth import CurrentUser
from app.schemas.profile import ProfileUpdate


async def ensure_profile(session: AsyncSession, user: CurrentUser) -> Profile:
    # Concurrent first requests must not overwrite an existing, edited profile.
    await session.execute(
        insert(Profile)
        .values(id=user.id, full_name=user.full_name[:200] if user.full_name else None)
        .on_conflict_do_nothing(index_elements=[Profile.id])
    )
    result = await session.execute(select(Profile).where(Profile.id == user.id))
    return result.scalar_one()


async def read_profile(session: AsyncSession, user: CurrentUser) -> Profile:
    profile = await ensure_profile(session, user)
    await session.commit()
    return profile


async def update_profile(
    session: AsyncSession, user: CurrentUser, changes: ProfileUpdate
) -> Profile:
    profile = await ensure_profile(session, user)
    # Omitted fields stay unchanged; explicit null clears a field.
    for field, value in changes.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
    await session.commit()
    await session.refresh(profile)
    return profile
