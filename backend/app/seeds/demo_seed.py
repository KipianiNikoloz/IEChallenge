import asyncio
import logging
from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import AsyncSessionLocal
from app.db.models import Event, Observable
from app.modules.observables.schemas import EventStatus, EventType, ObservableStatus
from app.modules.utility.service import recompute_snapshot

logger = logging.getLogger(__name__)


DemoObservable = dict[str, object]


DEMO_OBSERVABLES: Sequence[DemoObservable] = [
    {
        "name": "Person Alpha",
        "meta": {"cohort": "alpha", "region": "north"},
        "status": ObservableStatus.STABLE,
        "events": [
            {
                "label": "Baseline",
                "type": EventType.PAST,
                "status": EventStatus.COMPLETED,
                "weight": 1.0,
                "sequence_index": 0,
            },
            {
                "label": "Incident",
                "type": EventType.PAST,
                "status": EventStatus.FAILED,
                "weight": 1.2,
                "sequence_index": 1,
            },
            {
                "label": "Recovery Plan",
                "type": EventType.PLANNED,
                "status": EventStatus.PLANNED,
                "weight": 1.5,
                "sequence_index": 2,
                "is_cutoff": True,
            },
        ],
    },
    {
        "name": "Person Beta",
        "meta": {"cohort": "beta", "region": "west"},
        "status": ObservableStatus.AT_RISK,
        "events": [
            {
                "label": "Optimization",
                "type": EventType.OPTIMIZATION,
                "status": EventStatus.COMPLETED,
                "weight": 1.8,
                "sequence_index": 0,
            },
            {
                "label": "Follow-up",
                "type": EventType.PLANNED,
                "status": EventStatus.PLANNED,
                "weight": 1.0,
                "sequence_index": 1,
            },
        ],
    },
]


async def seed_demo_data(session: AsyncSession) -> None:
    """Idempotently seed a couple of demo observables + events for UI/testing."""
    existing = await session.execute(select(Observable.name))
    existing_names = set(existing.scalars().all())

    created = 0
    for record in DEMO_OBSERVABLES:
        if record["name"] in existing_names:
            continue
        observable = Observable(
            name=record["name"],
            meta=record["meta"],
            status=record["status"],
            utility_x=0.0,
            utility_y=0.0,
            utility_distance=0.0,
        )
        session.add(observable)
        await session.flush()

        for event in record["events"]:
            session.add(
                Event(
                    observable_id=observable.id,
                    label=event["label"],
                    type=event["type"],
                    status=event["status"],
                    description=event.get("description"),
                    sequence_index=event["sequence_index"],
                    is_cutoff=event.get("is_cutoff", False),
                    weight=event.get("weight", 1.0),
                    timestamp=event.get("timestamp"),
                )
            )

        await session.commit()
        await session.refresh(observable)
        await recompute_snapshot(session, observable)
        created += 1

    logger.info("Demo seed complete. Added %s observables.", created)


async def main() -> None:
    async with AsyncSessionLocal() as session:
        await seed_demo_data(session)


if __name__ == "__main__":
    asyncio.run(main())
