from fastapi import APIRouter, Depends, HTTPException, status

from app.modules.auth.schemas import LoginRequest, TokenResponse, UserRead
from app.modules.auth.service import authenticate_user, issue_token_for_user

router = APIRouter()


def get_current_user() -> UserRead:
    # Placeholder for JWT decoding; always returns the single admin user.
    user = authenticate_user("admin", "admin")
    assert user is not None
    return user


@router.post("/login", response_model=TokenResponse, summary="Admin login")
async def login(payload: LoginRequest) -> TokenResponse:
    user = authenticate_user(payload.username, payload.password)
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
