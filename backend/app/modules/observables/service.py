from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.models import Event, Observable
from app.modules.observables.schemas import (
    EventCreate,
    EventRead,
    EventUpdate,
    ObservableCreate,
    ObservableDetail,
    ObservableRead,
    ObservableUpdate,
)
from app.modules.utility.service import recompute_snapshot


def _event_to_read(event: Event) -> EventRead:
    return EventRead(
        id=event.id,
        observable_id=event.observable_id,
        type=event.type,
        status=event.status,
        label=event.label,
        description=event.description,
        sequence_index=event.sequence_index,
        is_cutoff=event.is_cutoff,
        weight=event.weight,
        timestamp=event.timestamp.isoformat() if event.timestamp else None,
    )


def _observable_to_read(observable: Observable) -> ObservableRead:
    return ObservableRead(
        id=observable.id,
        name=observable.name,
        metadata=observable.meta or {},
        status=observable.status,
        utility_x=observable.utility_x,
        utility_y=observable.utility_y,
        utility_distance=observable.utility_distance,
    )


def _observable_to_detail(observable: Observable, events: list[Event] | None = None) -> ObservableDetail:
    events = sorted(events if events is not None else observable.events, key=lambda e: e.sequence_index)
    return ObservableDetail(
        **_observable_to_read(observable).model_dump(),
        events=[_event_to_read(event) for event in events],
    )


async def _load_observable(session: AsyncSession, observable_id: int) -> Optional[Observable]:
    result = await session.execute(
        select(Observable).options(selectinload(Observable.events)).where(Observable.id == observable_id)
    )
    return result.scalars().first()


async def list_observables(session: AsyncSession) -> List[ObservableRead]:
    result = await session.execute(select(Observable))
    observables = result.scalars().all()
    return [_observable_to_read(obs) for obs in observables]


async def get_observable(session: AsyncSession, observable_id: int) -> Optional[ObservableDetail]:
    observable = await _load_observable(session, observable_id)
    if not observable:
        return None
    return _observable_to_detail(observable)


async def create_observable(
    session: AsyncSession, payload: ObservableCreate
) -> ObservableDetail:
    observable = Observable(
        name=payload.name,
        meta=payload.metadata,
        status=payload.status,
        utility_x=0.0,
        utility_y=0.0,
        utility_distance=0.0,
    )
    session.add(observable)
    await session.commit()
    await session.refresh(observable)
    # Avoid lazy-loading events during creation; none exist yet.
    return _observable_to_detail(observable, events=[])


async def update_observable(
    session: AsyncSession, observable_id: int, payload: ObservableUpdate
) -> Optional[ObservableDetail]:
    observable = await _load_observable(session, observable_id)
    if not observable:
        return None
    if payload.name is not None:
        observable.name = payload.name
    if payload.metadata is not None:
        observable.meta = payload.metadata
    if payload.status is not None:
        observable.status = payload.status
    session.add(observable)
    await session.commit()
    await session.refresh(observable)
    return _observable_to_detail(observable)


async def delete_observable(session: AsyncSession, observable_id: int) -> bool:
    observable = await _load_observable(session, observable_id)
    if not observable:
        return False
    await session.delete(observable)
    await session.commit()
    return True


async def list_events_for_observable(
    session: AsyncSession, observable_id: int
) -> Optional[list[EventRead]]:
    observable = await _load_observable(session, observable_id)
    if not observable:
        return None
    return [_event_to_read(event) for event in sorted(observable.events, key=lambda e: e.sequence_index)]


async def create_event_for_observable(
    session: AsyncSession, observable_id: int, payload: EventCreate
) -> Optional[EventRead]:
    observable = await _load_observable(session, observable_id)
    if not observable:
        return None
    event = Event(
        observable_id=observable_id,
        label=payload.label,
        type=payload.type,
        status=payload.status,
        description=payload.description,
        sequence_index=payload.sequence_index,
        is_cutoff=payload.is_cutoff,
        weight=payload.weight,
        timestamp=payload.timestamp,
    )
    session.add(event)
    await session.commit()
    await session.refresh(event)
    # Recompute to keep derived values in sync.
    observable = await _load_observable(session, observable_id)
    if observable:
        await recompute_snapshot(session, observable)
    return _event_to_read(event)


async def update_event(
    session: AsyncSession, event_id: int, payload: EventUpdate
) -> Optional[EventRead]:
    event = await session.get(Event, event_id)
    if not event:
        return None
    for field in ["label", "type", "status", "description", "sequence_index", "is_cutoff", "weight", "timestamp"]:
        value = getattr(payload, field)
        if value is not None:
            setattr(event, field, value)
    session.add(event)
    await session.commit()
    await session.refresh(event)
    observable = await _load_observable(session, event.observable_id)
    if observable:
        await recompute_snapshot(session, observable)
    return _event_to_read(event)


async def delete_event(session: AsyncSession, event_id: int) -> bool:
    event = await session.get(Event, event_id)
    if not event:
        return False
    observable_id = event.observable_id
    await session.delete(event)
    await session.commit()
    observable = await _load_observable(session, observable_id)
    if observable:
        await recompute_snapshot(session, observable)
    return True
