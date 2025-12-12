import asyncio
import os
import sys
from pathlib import Path
from typing import AsyncIterator

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

ROOT = Path(__file__).resolve().parents[1]

if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

os.environ["TESTING"] = "1"

from app.db.base import Base  # noqa: E402
from app.db.database import get_session  # noqa: E402
from app.main import app  # noqa: E402
from app.modules.auth.service import ensure_admin_user  # noqa: E402


@pytest.fixture
async def async_client() -> AsyncIterator[AsyncClient]:
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", future=True)
    TestingSessionLocal = sessionmaker(
        bind=engine, class_=AsyncSession, expire_on_commit=False, autoflush=False
    )

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async def override_get_session() -> AsyncIterator[AsyncSession]:
        async with TestingSessionLocal() as session:
            yield session

    app.dependency_overrides[get_session] = override_get_session

    async with TestingSessionLocal() as session:
        await ensure_admin_user(session, username="admin", password="admin")

    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client

    app.dependency_overrides.clear()
    await engine.dispose()
