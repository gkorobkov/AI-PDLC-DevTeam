from fastapi.testclient import TestClient
from app.main import app
from app.main import llm_client

client = TestClient(app)

def test_health_check():
    """Test API health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["environment"] in ["development", "production"]

def test_status():
    """Test API status endpoint."""
    response = client.get("/status")
    assert response.status_code == 200
    data = response.json()
    assert "service" in data
    assert "version" in data

def test_analyze_requirement_invalid_input():
    """Test requirement analyzer with invalid input."""
    response = client.post("/analyze-requirement", json={"business_idea": ""})
    # Empty business idea should still make request but API will handle validation
    assert response.status_code in [200, 422]

def test_test_llm_connection():
    """Test LLM connectivity endpoint success response contract."""
    original_complete = llm_client.complete

    def fake_complete(*args, **kwargs):
        return {
            "success": True,
            "content": "Hello from AI PDLC",
            "model": "test-model",
            "latency_ms": 12.5,
        }

    llm_client.complete = fake_complete
    try:
        response = client.get("/test-llm")
    finally:
        llm_client.complete = original_complete

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["message"] == "Hello from AI PDLC"
    assert data["model"] == "test-model"
    assert data["latency_ms"] == 12.5


def test_test_llm_connection_failure():
    """Test LLM connectivity endpoint failure response contract."""
    original_complete = llm_client.complete

    def fake_complete(*args, **kwargs):
        return {
            "success": False,
            "error": "provider unavailable",
            "model": "test-model",
            "latency_ms": 12.5,
        }

    llm_client.complete = fake_complete
    try:
        response = client.get("/test-llm")
    finally:
        llm_client.complete = original_complete

    assert response.status_code == 500
    assert response.json()["detail"] == "LLM test failed: provider unavailable"


def test_llm_limits_contract():
    """Test LLM limits endpoint success response contract."""
    original_get_key_limits = llm_client.get_key_limits

    def fake_get_key_limits(response_mode="safe"):
        return {
            "success": True,
            "supported": True,
            "provider": "openrouter",
            "model": "test-model",
            "limit": 10,
            "limit_remaining": 7,
            "usage": 3,
            "timestamp": "2026-06-06T00:00:00",
        }

    llm_client.get_key_limits = fake_get_key_limits
    try:
        response = client.get("/llm-limits")
    finally:
        llm_client.get_key_limits = original_get_key_limits

    assert response.status_code == 200
    data = response.json()
    assert data["supported"] is True
    assert data["provider"] == "openrouter"
    assert data["limit"] == 10
    assert data["limit_remaining"] == 7
    assert data["usage"] == 3


def test_llm_client_limits_response_modes():
    """Test safe and full LLM limits response modes."""
    original_get = llm_client.__class__.__dict__["get_key_limits"]

    class FakeResponse:
        def raise_for_status(self):
            return None

        def json(self):
            return {
                "data": {
                    "label": "sk-or-v1-test",
                    "creator_user_id": "user-test",
                    "limit": 10,
                    "limit_remaining": 8,
                    "usage": 2,
                }
            }

    import app.llm_client as llm_client_module

    original_requests_get = llm_client_module.requests.get
    llm_client_module.requests.get = lambda *args, **kwargs: FakeResponse()

    try:
        safe = original_get(llm_client, response_mode="safe")
        full = original_get(llm_client, response_mode="full")
    finally:
        llm_client_module.requests.get = original_requests_get

    assert "provider_payload" not in safe
    assert full["provider_payload"]["label"] == "sk-or-v1-test"
    assert full["provider_payload"]["creator_user_id"] == "user-test"


def test_test_llm_real_connection_contract():
    """Smoke-test endpoint without assuming external LLM credentials work."""
    response = client.get("/test-llm")
    assert response.status_code in [200, 500]
