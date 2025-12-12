from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.models import Event, Observable
from app.modules.observables.schemas import (
    EventRead,
    ObservableCreate,
    ObservableDetail,
    ObservableRead,
)


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
        metadata=observable.metadata or {},
        status=observable.status,
        utility_x=observable.utility_x,
        utility_y=observable.utility_y,
        utility_distance=observable.utility_distance,
    )


def _observable_to_detail(observable: Observable) -> ObservableDetail:
    events = sorted(observable.events, key=lambda e: e.sequence_index)
    return ObservableDetail(
        **_observable_to_read(observable).model_dump(),
        events=[_event_to_read(event) for event in events],
    )


async def list_observables(session: AsyncSession) -> List[ObservableRead]:
    result = await session.execute(select(Observable))
    observables = result.scalars().all()
    return [_observable_to_read(obs) for obs in observables]


async def get_observable(session: AsyncSession, observable_id: int) -> Optional[ObservableDetail]:
    result = await session.execute(
        select(Observable).options(selectinload(Observable.events)).where(Observable.id == observable_id)
    )
    observable = result.scalars().first()
    if not observable:
        return None
    return _observable_to_detail(observable)


async def create_observable(
    session: AsyncSession, payload: ObservableCreate
) -> ObservableDetail:
    observable = Observable(
        name=payload.name,
        metadata=payload.metadata,
        status=payload.status,
        utility_x=0.0,
        utility_y=0.0,
        utility_distance=0.0,
    )
    session.add(observable)
    await session.commit()
    await session.refresh(observable)
    return _observable_to_detail(observable)
