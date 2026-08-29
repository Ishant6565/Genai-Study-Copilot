import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_user_registration_and_login(client: AsyncClient):
    # 1. Register
    reg_payload = {
        "email": "teststudent@studypilot.ai",
        "password": "Password123!",
        "full_name": "Test Student"
    }
    reg_resp = await client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_resp.status_code == 201
    data = reg_resp.json()
    assert "access_token" in data
    assert data["user"]["email"] == "teststudent@studypilot.ai"
    token = data["access_token"]

    # 2. Duplicate registration should fail
    dup_resp = await client.post("/api/v1/auth/register", json=reg_payload)
    assert dup_resp.status_code == 400

    # 3. Login
    login_payload = {
        "email": "teststudent@studypilot.ai",
        "password": "Password123!"
    }
    login_resp = await client.post("/api/v1/auth/login", json=login_payload)
    assert login_resp.status_code == 200
    assert "access_token" in login_resp.json()

    # 4. Profile /me with token
    headers = {"Authorization": f"Bearer {token}"}
    me_resp = await client.get("/api/v1/auth/me", headers=headers)
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == "teststudent@studypilot.ai"


@pytest.mark.asyncio
async def test_demo_login(client: AsyncClient):
    resp = await client.post("/api/v1/auth/demo-login")
    assert resp.status_code == 200
    assert "access_token" in resp.json()
    assert "user" in resp.json()
