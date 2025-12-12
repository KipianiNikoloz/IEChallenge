from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_token
from app.db.database import get_session
from app.modules.auth.schemas import LoginRequest, TokenResponse, UserRead
from app.modules.auth.service import authenticate_user, get_user_by_username, issue_token_for_user

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme), session: AsyncSession = Depends(get_session)
) -> UserRead:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_token(token)
        username: str | None = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = await get_user_by_username(session, username)
    if user is None:
        raise credentials_exception
    return UserRead(id=user.id, username=user.username, role=user.role)


@router.post("/login", response_model=TokenResponse, summary="Admin login")
async def login(
    payload: LoginRequest, session: AsyncSession = Depends(get_session)
) -> TokenResponse:
    user = await authenticate_user(session, payload.username, payload.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
    token = issue_token_for_user(user)
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserRead, summary="Current admin")
async def me(current_user: UserRead = Depends(get_current_user)) -> UserRead:
    return current_user
