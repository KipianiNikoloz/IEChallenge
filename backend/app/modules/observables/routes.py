from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_session
from app.modules.auth.routes import get_current_user
from app.modules.auth.schemas import UserRead
from app.modules.observables.schemas import (
    EventCreate,
    EventRead,
    EventUpdate,
    ObservableCreate,
    ObservableDetail,
    ObservableRead,
    ObservableUpdate,
)
from app.modules.observables.service import (
    create_event_for_observable,
    create_observable,
    delete_event,
    delete_observable,
    get_observable,
    list_events_for_observable,
    list_observables,
    update_event,
    update_observable,
)

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


@router.patch("/{observable_id}", response_model=ObservableDetail, summary="Update observable")
async def update_observable_endpoint(
    observable_id: int,
    payload: ObservableUpdate,
    _: UserRead = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> ObservableDetail:
    observable = await update_observable(session, observable_id, payload)
    if not observable:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Observable not found")
    return observable


@router.delete(
    "/{observable_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete observable",
)
async def delete_observable_endpoint(
    observable_id: int,
    _: UserRead = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> None:
    deleted = await delete_observable(session, observable_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Observable not found")
    return None


@router.get(
    "/{observable_id}/events",
    response_model=list[EventRead],
    summary="List events for an observable",
)
async def get_events_for_observable(
    observable_id: int,
    _: UserRead = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[EventRead]:
    events = await list_events_for_observable(session, observable_id)
    if events is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Observable not found")
    return events


@router.post(
    "/{observable_id}/events",
    response_model=EventRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create event for observable",
)
async def create_event_endpoint(
    observable_id: int,
    payload: EventCreate,
    _: UserRead = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> EventRead:
    event = await create_event_for_observable(session, observable_id, payload)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Observable not found")
    return event


@router.patch(
    "/events/{event_id}",
    response_model=EventRead,
    summary="Update event",
)
async def update_event_endpoint(
    event_id: int,
    payload: EventUpdate,
    _: UserRead = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> EventRead:
    event = await update_event(session, event_id, payload)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    return event


@router.delete(
    "/events/{event_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete event",
)
async def delete_event_endpoint(
    event_id: int,
    _: UserRead = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> None:
    deleted = await delete_event(session, event_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    return None
