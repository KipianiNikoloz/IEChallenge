import logging
from typing import Optional

from app.modules.auth.schemas import UserRead

logger = logging.getLogger(__name__)

# Placeholder single-admin auth; replace with persistent storage and JWT validation.
_ADMIN_USER = UserRead(id=1, username="admin", role="admin")
_ADMIN_PASSWORD = "admin"  # noqa: S105


def authenticate_user(username: str, password: str) -> Optional[UserRead]:
    if username == _ADMIN_USER.username and password == _ADMIN_PASSWORD:
        logger.debug("Authenticated user %s", username)
        return _ADMIN_USER
    logger.warning("Failed authentication attempt for %s", username)
    return None


def issue_token_for_user(user: UserRead) -> str:
    # TODO: replace with JWT generation using settings.secret_key and expiry.
    return f"fake-token-for-{user.username}"
