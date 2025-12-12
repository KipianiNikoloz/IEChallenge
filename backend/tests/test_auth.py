import pytest
from httpx import AsyncClient


@pytest.mark.anyio
async def test_login_success(async_client: AsyncClient) -> None:
    response = await async_client.post(
        "/api/v1/auth/login", json={"username": "admin", "password": "admin"}
    )
    assert response.status_code == 200
    body = response.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"
