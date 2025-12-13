import pytest
from httpx import AsyncClient


@pytest.mark.anyio
async def test_global_utility_empty(async_client: AsyncClient) -> None:
    resp = await async_client.get("/api/v1/utility/global")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_observables"] == 0
    assert data["average_distance"] == 0


@pytest.mark.anyio
async def test_recompute_utility(async_client: AsyncClient) -> None:
    create_payload = {"name": "Person B", "metadata": {}, "status": "STABLE"}
    create_resp = await async_client.post("/api/v1/observables/", json=create_payload)
    obs_id = create_resp.json()["id"]

    recompute = await async_client.post(f"/api/v1/observables/{obs_id}/utility/recompute")
    assert recompute.status_code == 200
    body = recompute.json()
    assert body["observable_id"] == obs_id
    assert "utility_distance" in body
