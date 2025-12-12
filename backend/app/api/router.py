from fastapi import APIRouter

from app.modules.algorithm.routes import router as algorithm_router
from app.modules.auth.routes import router as auth_router
from app.modules.observables.routes import router as observables_router
from app.modules.utility.routes import router as utility_router

api_router = APIRouter()
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(observables_router, prefix="/observables", tags=["observables"])
api_router.include_router(utility_router, tags=["utility"])
api_router.include_router(algorithm_router, prefix="/algorithm", tags=["algorithm"])
