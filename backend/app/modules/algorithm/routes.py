from fastapi import APIRouter, Depends

from app.modules.algorithm.schemas import AlgorithmLogEntry, AlgorithmSummary
from app.modules.algorithm.service import get_algorithm_summary, list_algorithm_logs
from app.modules.auth.routes import get_current_user
from app.modules.auth.schemas import UserRead

router = APIRouter()


@router.get("/summary", response_model=AlgorithmSummary, summary="Algorithm summary")
async def algorithm_summary(_: UserRead = Depends(get_current_user)) -> AlgorithmSummary:
    return get_algorithm_summary()


@router.get("/logs", response_model=list[AlgorithmLogEntry], summary="Algorithm logs")
async def algorithm_logs(_: UserRead = Depends(get_current_user)) -> list[AlgorithmLogEntry]:
    return list_algorithm_logs()
