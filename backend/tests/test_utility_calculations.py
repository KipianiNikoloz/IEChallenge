import pytest
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.db.base import Base
from app.db.models import Event, Observable
from app.modules.observables.schemas import EventStatus, EventType, ObservableStatus
from app.modules.utility.service import _calculate_snapshot, _compute_utility_from_events, recompute_snapshot


@pytest.mark.anyio
async def test_compute_utility_weights_completed_vs_failed() -> None:
    events = [
        Event(type=EventType.PAST, status=EventStatus.COMPLETED, weight=2, label="done", sequence_index=0),
        Event(type=EventType.PAST, status=EventStatus.FAILED, weight=1, label="fail", sequence_index=1),
    ]
    ux, uy = _compute_utility_from_events(events)
    assert ux == 1  # 2 - 1
    assert uy == pytest.approx(2.0)  # completed past contributes weight * 1.0


def test_snapshot_sets_status_by_distance() -> None:
    observable = Observable(
        name="O",
        meta={},
        status=ObservableStatus.STABLE,
        events=[],
    )
    # No events keeps status
    snap = _calculate_snapshot(observable)
    assert snap.status == ObservableStatus.STABLE.value

    # Add events that push distance below cutoff -> AT_RISK
    observable.events = [
        Event(type=EventType.PLANNED, status=EventStatus.PLANNED, weight=0.2, sequence_index=0, label="p1")
    ]
    snap = _calculate_snapshot(observable)
    assert snap.status == ObservableStatus.AT_RISK.value

    # Distance above cutoff -> OPTIMIZED
    observable.events.append(
        Event(type=EventType.OPTIMIZATION, status=EventStatus.COMPLETED, weight=2.0, sequence_index=1, label="opt")
    )
    snap = _calculate_snapshot(observable)
    assert snap.status == ObservableStatus.OPTIMIZED.value


@pytest.mark.anyio
async def test_recompute_snapshot_refreshes_values() -> None:
    engine: AsyncEngine = create_async_engine("sqlite+aiosqlite:///:memory:", future=True)
    TestingSessionLocal = sessionmaker(
        bind=engine, class_=AsyncSession, expire_on_commit=False, autoflush=False
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with TestingSessionLocal() as session:
        obs = Observable(name="Live", meta={}, status=ObservableStatus.STABLE)
        event = Event(
            type=EventType.PAST, status=EventStatus.COMPLETED, weight=1.0, sequence_index=0, label="done"
        )
        obs.events = [event]
        session.add(obs)
        await session.commit()
        await session.refresh(obs)
        await recompute_snapshot(session, obs)
        assert obs.utility_distance > 0

    await engine.dispose()
