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
    assert response.json() == {"integrations": [
        {"name": "GigaChat", "status": "NOT_CONFIGURED"},
        {"name": "Wordstat", "status": "NOT_CONFIGURED"},
        {"name": "Webmaster", "status": "NOT_CONFIGURED"},
        {"name": "Metrika", "status": "NOT_CONFIGURED"},
    ]}
