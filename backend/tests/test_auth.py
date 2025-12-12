from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_login_success() -> None:
    response = client.post("/api/v1/auth/login", json={"username": "admin", "password": "admin"})
    assert response.status_code == 200
    body = response.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"
