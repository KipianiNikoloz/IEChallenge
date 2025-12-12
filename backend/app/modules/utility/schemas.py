from pydantic import BaseModel


class UtilitySnapshot(BaseModel):
    observable_id: int
    utility_x: float
    utility_y: float
    utility_distance: float
    status: str


class GlobalUtilityMetrics(BaseModel):
    average_distance: float
    percent_below_cutoff: float
    system_stability_index: float
    total_observables: int
