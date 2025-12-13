from fastapi import FastAPI

from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.core.logging import configure_logging
from app.db.database import AsyncSessionLocal
from app.modules.auth.service import ensure_admin_user


def create_application() -> FastAPI:
    configure_logging()
    application = FastAPI(
        title=settings.project_name,
        version="0.1.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    application.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    application.include_router(api_router, prefix=settings.api_prefix)

    @application.get("/health", tags=["health"])
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    if not settings.testing:
        @application.on_event("startup")
        async def startup() -> None:
            async with AsyncSessionLocal() as session:
                await ensure_admin_user(session, username="admin", password="admin")

    return application


app = create_application()
