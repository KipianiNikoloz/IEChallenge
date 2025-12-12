from typing import List, Optional

from app.modules.observables.schemas import (
    EventRead,
    ObservableCreate,
    ObservableDetail,
    ObservableRead,
    ObservableStatus,
)

# Placeholder in-memory dataset.
_OBSERVABLES: list[ObservableDetail] = [
    ObservableDetail(
        id=1,
        name="Person A",
        metadata={"cohort": "alpha"},
        status=ObservableStatus.STABLE,
        utility_x=0.4,
        utility_y=0.6,
        utility_distance=0.72,
        events=[
            EventRead(
                id=1,
                observable_id=1,
                type="PAST",
                status="COMPLETED",
                label="past-1",
                sequence_index=0,
                weight=0.2,
            ),
            EventRead(
                id=2,
                observable_id=1,
                type="PLANNED",
                status="PLANNED",
                label="future-1",
                sequence_index=1,
                weight=0.3,
                is_cutoff=True,
            ),
        ],
    )
]


def list_observables() -> List[ObservableRead]:
    return [ObservableRead(**obs.dict()) for obs in _OBSERVABLES]


def get_observable(observable_id: int) -> Optional[ObservableDetail]:
    return next((obs for obs in _OBSERVABLES if obs.id == observable_id), None)


def create_observable(payload: ObservableCreate) -> ObservableDetail:
    new_id = max((obs.id for obs in _OBSERVABLES), default=0) + 1
    new_obs = ObservableDetail(
        id=new_id,
        name=payload.name,
        metadata=payload.metadata,
        status=payload.status,
        utility_x=0.0,
        utility_y=0.0,
        utility_distance=0.0,
        events=[],
    )
    _OBSERVABLES.append(new_obs)
    return new_obs
