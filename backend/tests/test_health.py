import os

import pytest
from httpx import AsyncClient

os.environ["TESTING"] = "1"

from app.main import app  # noqa: E402


@pytest.mark.anyio
async def test_health_ok(async_client: AsyncClient) -> None:
    response = await async_client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
