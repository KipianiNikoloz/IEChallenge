import math
from typing import Dict, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.models import Event, Observable
from app.modules.observables.schemas import EventStatus, EventType, ObservableStatus
from app.modules.utility.schemas import GlobalUtilityMetrics, UtilitySnapshot

CUTOFF_DISTANCE = 1.0
_snapshot_cache: Dict[int, UtilitySnapshot] = {}


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


def _calculate_snapshot(observable: Observable) -> UtilitySnapshot:
    utility_x, utility_y = _compute_utility_from_events(observable.events)
    utility_distance = math.sqrt(utility_x**2 + utility_y**2)
    events_present = len(observable.events) > 0
    current_status = (
        observable.status if isinstance(observable.status, ObservableStatus) else ObservableStatus.STABLE
    )
    if utility_distance >= CUTOFF_DISTANCE:
        status = ObservableStatus.OPTIMIZED
    elif events_present:
        status = ObservableStatus.AT_RISK
    else:
        status = current_status

    return UtilitySnapshot(
        observable_id=observable.id,
        utility_x=utility_x,
        utility_y=utility_y,
        utility_distance=utility_distance,
        status=status.value if isinstance(status, ObservableStatus) else str(status),
    )


def _cache_snapshot(snapshot: UtilitySnapshot) -> None:
    _snapshot_cache[snapshot.observable_id] = snapshot


def clear_snapshot_cache_for_observable(observable_id: int) -> None:
    _snapshot_cache.pop(observable_id, None)


async def _load_observable_with_events(
    session: AsyncSession, observable_id: int
) -> Optional[Observable]:
    result = await session.execute(
        select(Observable).options(selectinload(Observable.events)).where(Observable.id == observable_id)
    )
    return result.scalars().first()


async def recompute_snapshot(session: AsyncSession, observable: Observable) -> UtilitySnapshot:
    snapshot = _calculate_snapshot(observable)
    observable.utility_x = snapshot.utility_x
    observable.utility_y = snapshot.utility_y
    observable.utility_distance = snapshot.utility_distance
    try:
        observable.status = ObservableStatus(snapshot.status)
    except ValueError:
        observable.status = ObservableStatus.AT_RISK
    session.add(observable)
    await session.commit()
    await session.refresh(observable)
    _cache_snapshot(snapshot)
    return snapshot


async def get_snapshot_for_observable(
    session: AsyncSession, observable_id: int, recompute: bool = False
) -> Optional[UtilitySnapshot]:
    observable = await _load_observable_with_events(session, observable_id)
    if not observable:
        return None
    if recompute:
        return await recompute_snapshot(session, observable)
    cached = _snapshot_cache.get(observable_id)
    if cached:
        return cached
    snapshot = _calculate_snapshot(observable)
    _cache_snapshot(snapshot)
    return snapshot


async def compute_global_metrics(session: AsyncSession) -> GlobalUtilityMetrics:
    result = await session.execute(select(Observable).options(selectinload(Observable.events)))
    observables = result.scalars().unique().all()
    if not observables:
        return GlobalUtilityMetrics(
            average_distance=0.0,
            percent_below_cutoff=0.0,
            system_stability_index=1.0,
            total_observables=0,
        )

    snapshots: list[UtilitySnapshot] = []
    for obs in observables:
        cached = _snapshot_cache.get(obs.id)
        if cached:
            snapshots.append(cached)
        else:
            snapshot = _calculate_snapshot(obs)
            _cache_snapshot(snapshot)
            snapshots.append(snapshot)
    distances = [snap.utility_distance for snap in snapshots]
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
