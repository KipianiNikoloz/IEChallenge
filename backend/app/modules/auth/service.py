import logging
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, get_password_hash, verify_password
from app.db.models.user import User
from app.modules.auth.schemas import UserRead

logger = logging.getLogger(__name__)


async def get_user_by_username(session: AsyncSession, username: str) -> Optional[User]:
    result = await session.execute(select(User).where(User.username == username))
    return result.scalars().first()


async def ensure_admin_user(session: AsyncSession, username: str, password: str) -> User:
    existing = await get_user_by_username(session, username)
    if existing:
        return existing
    user = User(username=username, hashed_password=get_password_hash(password), role="admin")
    session.add(user)
    await session.commit()
    await session.refresh(user)
    logger.info("Created default admin user %s", username)
    return user


async def authenticate_user(
    session: AsyncSession, username: str, password: str
) -> Optional[UserRead]:
    user = await get_user_by_username(session, username)
    if not user:
        logger.warning("Failed authentication attempt for %s", username)
        return None
    if not verify_password(password, user.hashed_password):
        logger.warning("Failed authentication attempt for %s", username)
        return None
    return UserRead(id=user.id, username=user.username, role=user.role)


def issue_token_for_user(user: UserRead) -> str:
    return create_access_token(subject=user.username)
