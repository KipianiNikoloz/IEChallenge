from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_session
from app.modules.auth.routes import get_current_user
from app.modules.auth.schemas import UserRead
from app.modules.observables.schemas import (
    ObservableCreate,
    ObservableDetail,
    ObservableRead,
)
from app.modules.observables.service import create_observable, get_observable, list_observables

router = APIRouter()


@router.get("/", response_model=list[ObservableRead], summary="List observables")
async def get_observables(
    _: UserRead = Depends(get_current_user), session: AsyncSession = Depends(get_session)
) -> list[ObservableRead]:
    return await list_observables(session)


@router.get("/{observable_id}", response_model=ObservableDetail, summary="Get observable")
async def get_observable_by_id(
    observable_id: int,
    _: UserRead = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> ObservableDetail:
    observable = await get_observable(session, observable_id)
    if not observable:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Observable not found")
    return observable


@router.post("/", response_model=ObservableDetail, status_code=status.HTTP_201_CREATED)
async def create_observable_endpoint(
    payload: ObservableCreate,
    _: UserRead = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> ObservableDetail:
    return await create_observable(session, payload)
