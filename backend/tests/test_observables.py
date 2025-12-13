import pytest
from httpx import AsyncClient


@pytest.mark.anyio
async def test_list_observables_empty(async_client: AsyncClient) -> None:
    response = await async_client.get("/api/v1/observables/")
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.anyio
async def test_create_and_get_observable(async_client: AsyncClient) -> None:
    create_payload = {"name": "Person A", "metadata": {"cohort": "alpha"}, "status": "STABLE"}
    create_resp = await async_client.post("/api/v1/observables/", json=create_payload)
    assert create_resp.status_code == 201
    created = create_resp.json()
    assert created["name"] == "Person A"
    obs_id = created["id"]

    get_resp = await async_client.get(f"/api/v1/observables/{obs_id}")
    assert get_resp.status_code == 200
    detail = get_resp.json()
    assert detail["id"] == obs_id
    assert detail["events"] == []


@pytest.mark.anyio
async def test_update_and_delete_observable(async_client: AsyncClient) -> None:
    create_resp = await async_client.post(
        "/api/v1/observables/", json={"name": "Person B", "metadata": {}, "status": "STABLE"}
    )
    obs_id = create_resp.json()["id"]

    update_resp = await async_client.patch(
        f"/api/v1/observables/{obs_id}", json={"name": "Person B2", "metadata": {"team": "x"}}
    )
    assert update_resp.status_code == 200
    updated = update_resp.json()
    assert updated["name"] == "Person B2"
    assert updated["metadata"] == {"team": "x"}

    delete_resp = await async_client.delete(f"/api/v1/observables/{obs_id}")
    assert delete_resp.status_code == 204

    final_get = await async_client.get(f"/api/v1/observables/{obs_id}")
    assert final_get.status_code == 404


@pytest.mark.anyio
async def test_event_crud_recomputes_utility(async_client: AsyncClient) -> None:
    create_resp = await async_client.post(
        "/api/v1/observables/", json={"name": "Person C", "metadata": {}, "status": "STABLE"}
    )
    obs_id = create_resp.json()["id"]

    event_payload = {"label": "p1", "type": "PAST", "status": "PLANNED", "weight": 1.0, "sequence_index": 0}
    event_resp = await async_client.post(f"/api/v1/observables/{obs_id}/events", json=event_payload)
    assert event_resp.status_code == 201
    event_id = event_resp.json()["id"]

    util_after_create = await async_client.get(f"/api/v1/observables/{obs_id}/utility")
    assert util_after_create.status_code == 200
    util_body = util_after_create.json()
    assert util_body["observable_id"] == obs_id
    assert util_body["utility_distance"] > 0
    assert util_body["status"] == "AT_RISK"

    update_event_resp = await async_client.patch(
        f"/api/v1/observables/events/{event_id}",
        json={"status": "COMPLETED", "weight": 2.0},
    )
    assert update_event_resp.status_code == 200

    util_after_update = await async_client.get(f"/api/v1/observables/{obs_id}/utility")
    assert util_after_update.status_code == 200
    assert util_after_update.json()["status"] == "OPTIMIZED"

    delete_event_resp = await async_client.delete(f"/api/v1/observables/events/{event_id}")
    assert delete_event_resp.status_code == 204

    list_events_resp = await async_client.get(f"/api/v1/observables/{obs_id}/events")
    assert list_events_resp.status_code == 200
    assert list_events_resp.json() == []
