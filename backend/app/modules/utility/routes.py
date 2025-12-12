from fastapi import APIRouter, Depends, HTTPException, status

from app.modules.auth.routes import get_current_user
from app.modules.auth.schemas import UserRead
from app.modules.utility.schemas import GlobalUtilityMetrics, UtilitySnapshot
from app.modules.utility.service import compute_global_metrics, get_snapshot_for_observable

router = APIRouter()


@router.get("/utility/global", response_model=GlobalUtilityMetrics, summary="Global utility metrics")
async def get_global_utility(_: UserRead = Depends(get_current_user)) -> GlobalUtilityMetrics:
    return compute_global_metrics()


@router.get(
    "/observables/{observable_id}/utility",
    response_model=UtilitySnapshot,
    summary="Utility for an observable",
)
async def get_utility_for_observable(
    observable_id: int, _: UserRead = Depends(get_current_user)
) -> UtilitySnapshot:
    snapshot = get_snapshot_for_observable(observable_id)
    if not snapshot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Observable not found")
    return snapshot


@router.post(
    "/observables/{observable_id}/utility/recompute",
    response_model=UtilitySnapshot,
    summary="Recompute utility for an observable",
)
async def recompute_utility_for_observable(
    observable_id: int, _: UserRead = Depends(get_current_user)
) -> UtilitySnapshot:
    snapshot = get_snapshot_for_observable(observable_id)
    if not snapshot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Observable not found")
    return snapshot
