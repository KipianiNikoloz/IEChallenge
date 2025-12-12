from typing import List

from app.modules.observables.schemas import ObservableDetail, ObservableStatus
from app.modules.observables.service import get_observable, list_observables
from app.modules.utility.schemas import GlobalUtilityMetrics, UtilitySnapshot

CUTOFF_DISTANCE = 1.0


def recompute_snapshot(observable: ObservableDetail) -> UtilitySnapshot:
    # Placeholder: distance is precomputed; in real implementation recompute from events.
    return UtilitySnapshot(
        observable_id=observable.id,
        utility_x=observable.utility_x,
        utility_y=observable.utility_y,
        utility_distance=observable.utility_distance,
        status=observable.status.value if isinstance(observable.status, ObservableStatus) else observable.status,
    )


def get_snapshot_for_observable(observable_id: int) -> UtilitySnapshot | None:
    observable = get_observable(observable_id)
    if not observable:
        return None
    return recompute_snapshot(observable)


def compute_global_metrics() -> GlobalUtilityMetrics:
    observables: List = list_observables()
    if not observables:
        return GlobalUtilityMetrics(
            average_distance=0.0,
            percent_below_cutoff=0.0,
            system_stability_index=1.0,
            total_observables=0,
        )

    below_cutoff = [obs for obs in observables if obs.utility_distance < CUTOFF_DISTANCE]
    average_distance = sum(obs.utility_distance for obs in observables) / len(observables)
    percent_below_cutoff = len(below_cutoff) / len(observables)
    stability_index = 1 - percent_below_cutoff

    return GlobalUtilityMetrics(
        average_distance=round(average_distance, 3),
        percent_below_cutoff=round(percent_below_cutoff, 3),
        system_stability_index=round(stability_index, 3),
        total_observables=len(observables),
    )
