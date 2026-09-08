from fastapi.testclient import TestClient

from app.main import app


def test_health() -> None:
    with TestClient(app) as client:
        response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "kotdela-ai-growth-engine"}


def test_integrations_are_not_configured() -> None:
    with TestClient(app) as client:
        response = client.get("/api/integrations")
    assert response.status_code == 200
    data = response.json()["integrations"]
    assert [item["name"] for item in data] == ["GigaChat", "Wordstat", "Webmaster", "Metrika"]
    assert all(item["status"] in {"NOT_CONFIGURED", "CONFIGURED", "CONNECTED", "ERROR"} for item in data)
