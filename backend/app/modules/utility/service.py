import math
from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.models import Event, Observable
from app.modules.observables.schemas import EventStatus, EventType, ObservableStatus
from app.modules.observables.service import get_observable
from app.modules.utility.schemas import GlobalUtilityMetrics, UtilitySnapshot

CUTOFF_DISTANCE = 1.0


def _compute_utility_from_events(events: list[Event]) -> tuple[float, float]:
    utility_x = 0.0
    utility_y = 0.0
    for event in events:
        if event.status == EventStatus.COMPLETED:
            utility_x += event.weight
            utility_y += event.weight * (1.0 if event.type == EventType.PAST else 0.5)
        elif event.status == EventStatus.FAILED:
            utility_x -= event.weight
        elif event.status == EventStatus.PLANNED:
            utility_y += event.weight * (1.0 if event.type != EventType.PAST else 0.3)
        if event.type == EventType.OPTIMIZATION and event.status in {
            EventStatus.COMPLETED,
            EventStatus.PLANNED,
        }:
            utility_x += event.weight * 0.5
            utility_y += event.weight
    return utility_x, utility_y


async def recompute_snapshot(session: AsyncSession, observable: Observable) -> UtilitySnapshot:
    utility_x, utility_y = _compute_utility_from_events(observable.events)
    utility_distance = math.sqrt(utility_x**2 + utility_y**2)
    observable.utility_x = utility_x
    observable.utility_y = utility_y
    observable.utility_distance = utility_distance
    observable.status = (
        ObservableStatus.OPTIMIZED if utility_distance >= CUTOFF_DISTANCE else ObservableStatus.AT_RISK
    )
    session.add(observable)
    await session.commit()
    await session.refresh(observable)
    return UtilitySnapshot(
        observable_id=observable.id,
        utility_x=utility_x,
        utility_y=utility_y,
        utility_distance=utility_distance,
        status=observable.status.value if isinstance(observable.status, ObservableStatus) else observable.status,
    )


async def get_snapshot_for_observable(
    session: AsyncSession, observable_id: int
) -> Optional[UtilitySnapshot]:
    detail = await get_observable(session, observable_id)
    if not detail:
        return None
    # refetch ORM instance with events
    result = await session.execute(
        select(Observable).options(selectinload(Observable.events)).where(Observable.id == observable_id)
    )
    observable = result.scalars().first()
    if not observable:
        return None
    return await recompute_snapshot(session, observable)


async def compute_global_metrics(session: AsyncSession) -> GlobalUtilityMetrics:
    result = await session.execute(select(Observable))
    observables = result.scalars().all()
    if not observables:
        return GlobalUtilityMetrics(
            average_distance=0.0,
            percent_below_cutoff=0.0,
            system_stability_index=1.0,
            total_observables=0,
        )

    distances = [obs.utility_distance for obs in observables]
    below_cutoff = [d for d in distances if d < CUTOFF_DISTANCE]
    average_distance = sum(distances) / len(distances)
    percent_below_cutoff = len(below_cutoff) / len(distances)
    stability_index = 1 - percent_below_cutoff

    return GlobalUtilityMetrics(
        average_distance=round(average_distance, 3),
        percent_below_cutoff=round(percent_below_cutoff, 3),
        system_stability_index=round(stability_index, 3),
        total_observables=len(observables),
    )
