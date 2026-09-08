import json

import httpx
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, func, select
from sqlalchemy.orm import Session, sessionmaker

from app.api import intelligence as intelligence_api
from app.config import get_settings
from app.db import Base, get_db
from app.main import app
from app.models import RawSearchQuery, SearchIntent
from app.providers.gigachat import GigaChatClient, GigaChatStructuredOutputError
from app.schemas.intelligence import IntelligenceBatch, QueryInput


def response_item(raw_id: int, disposition: str, cluster: str) -> dict:
    return {
        "raw_query_id": raw_id,
        "normalized_query": f"query {raw_id}",
        "intent": "COMMERCIAL" if disposition == "OPPORTUNITY_CANDIDATE" else "OTHER",
        "business_relevance": "HIGH" if disposition == "OPPORTUNITY_CANDIDATE" else "NONE",
        "commerciality": "HIGH" if disposition == "OPPORTUNITY_CANDIDATE" else "LOW",
        "cluster_name": cluster,
        "disposition": disposition,
        "confidence": 0.9,
        "reason": "Validated classification",
    }


def test_batch_parsing_and_authorization_headers() -> None:
    calls = []

    def handler(request: httpx.Request) -> httpx.Response:
        calls.append(request.url.path)
        assert "super-secret" not in str(request.url)
        if request.url.path.endswith("/oauth"):
            assert request.headers["Authorization"].startswith("Basic ")
            return httpx.Response(200, json={"access_token": "temporary-token"})
        assert request.headers["Authorization"] == "Bearer temporary-token"
        content = json.dumps({"items": [response_item(1, "OPPORTUNITY_CANDIDATE", "Разработка сайтов")]})
        return httpx.Response(200, json={"choices": [{"message": {"content": content}}]})

    client = GigaChatClient("client", "super-secret", scope="GIGACHAT_API_PERS", model="test", transport=httpx.MockTransport(handler))
    result = client.analyze_batch([QueryInput(raw_query_id=1, phrase="веб разработка", demand=100, source_type="association")])
    client.close()
    assert result.items[0].disposition.value == "OPPORTUNITY_CANDIDATE"
    assert calls == ["/api/v2/oauth", "/v1/chat/completions"]


def test_check_uses_separate_oauth_host_and_parses_models() -> None:
    seen_urls = []

    def handler(request: httpx.Request) -> httpx.Response:
        seen_urls.append(str(request.url))
        assert "secret" not in str(request.url)
        if request.url.path.endswith("/oauth"):
            assert request.url.host == "ngw.devices.sberbank.ru"
            assert request.url.port == 9443
            return httpx.Response(200, json={"access_token": "temporary-token"})
        assert request.url.host == "api.giga.chat"
        assert request.url.path == "/v1/models"
        return httpx.Response(200, json={"object": "list", "data": [
            {"id": "GigaChat-2", "object": "model"},
            {"id": "GigaChat-2-Pro", "object": "model"},
        ]})

    client = GigaChatClient("client", "secret", scope="GIGACHAT_API_PERS", model="GigaChat-2-Max", transport=httpx.MockTransport(handler))
    models = client.check()
    client.close()
    assert models == ["GigaChat-2", "GigaChat-2-Pro"]
    assert seen_urls == [
        "https://ngw.devices.sberbank.ru:9443/api/v2/oauth",
        "https://api.giga.chat/v1/models",
    ]


def test_check_endpoint_warns_when_configured_model_is_unavailable(monkeypatch: pytest.MonkeyPatch) -> None:
    from app.api import integrations

    class FakeClient:
        def __init__(self, *args, **kwargs):
            pass

        def check(self) -> list[str]:
            return ["GigaChat-2", "GigaChat-2-Pro"]

        def close(self) -> None:
            pass

    monkeypatch.setenv("GIGACHAT_CLIENT_ID", "configured")
    monkeypatch.setenv("GIGACHAT_CLIENT_SECRET", "configured")
    get_settings.cache_clear()
    monkeypatch.setattr(integrations, "GigaChatClient", FakeClient)
    try:
        with TestClient(app) as client:
            response = client.post("/api/integrations/gigachat/check")
        data = response.json()
        assert data["status"] == "CONNECTED"
        assert data["models"] == ["GigaChat-2", "GigaChat-2-Pro"]
        assert "not available" in data["warning"]
        assert "configured" not in json.dumps(data)
    finally:
        get_settings.cache_clear()


def test_invalid_structured_output_retries_once() -> None:
    completions = 0

    def handler(request: httpx.Request) -> httpx.Response:
        nonlocal completions
        if request.url.path.endswith("/oauth"):
            return httpx.Response(200, json={"access_token": "token"})
        completions += 1
        return httpx.Response(200, json={"choices": [{"message": {"content": "not-json"}}]})

    client = GigaChatClient("client", "secret", scope="GIGACHAT_API_PERS", model="test", transport=httpx.MockTransport(handler))
    with pytest.raises(GigaChatStructuredOutputError, match="after one retry"):
        client.analyze_batch([QueryInput(raw_query_id=1, phrase="test", demand=1, source_type="result")])
    client.close()
    assert completions == 2


def test_missing_credentials(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("GIGACHAT_CLIENT_ID", "")
    monkeypatch.setenv("GIGACHAT_CLIENT_SECRET", "")
    get_settings.cache_clear()
    try:
        with TestClient(app) as client:
            response = client.post("/api/integrations/gigachat/check")
        assert response.json()["status"] == "NOT_CONFIGURED"
    finally:
        get_settings.cache_clear()


def test_persistence_categories_raw_evidence_and_no_duplicates(tmp_path, monkeypatch: pytest.MonkeyPatch) -> None:
    engine = create_engine(f"sqlite:///{(tmp_path / 'intelligence.db').as_posix()}")
    Base.metadata.create_all(engine)
    TestSession = sessionmaker(bind=engine, expire_on_commit=False)
    with TestSession() as session:
        session.add_all([
            RawSearchQuery(query="веб разработка", demand=100, collected_at=__import__("datetime").datetime.now(__import__("datetime").UTC), source_payload={"result_type": "association"}),
            RawSearchQuery(query="создание сайта бесплатно", demand=80, collected_at=__import__("datetime").datetime.now(__import__("datetime").UTC), source_payload={"result_type": "result"}),
            RawSearchQuery(query="майнкрафт сайт создание", demand=50, collected_at=__import__("datetime").datetime.now(__import__("datetime").UTC), source_payload={"result_type": "result"}),
        ])
        session.commit()

    def override_db():
        with TestSession() as session:
            yield session

    class FakeClient:
        def analyze_batch(self, queries: list[QueryInput]) -> IntelligenceBatch:
            dispositions = ["OPPORTUNITY_CANDIDATE", "WATCH", "IGNORE"]
            return IntelligenceBatch.model_validate({"items": [
                response_item(query.raw_query_id, dispositions[index], "Разработка сайтов" if index < 2 else "Игровой шум")
                for index, query in enumerate(queries)
            ]})

        def close(self) -> None:
            pass

    monkeypatch.setattr(intelligence_api, "create_gigachat_client", lambda: FakeClient())
    app.dependency_overrides[get_db] = override_db
    try:
        with TestClient(app) as client:
            first = client.post("/api/intelligence/analyze-existing", json={"limit": 44})
            second = client.post("/api/intelligence/analyze-existing", json={"limit": 44})
        assert first.json()["opportunity_candidates"] == 1
        assert first.json()["watch"] == 1
        assert first.json()["ignored"] == 1
        assert second.json()["processed"] == 0
        with Session(engine) as session:
            assert session.scalar(select(func.count()).select_from(RawSearchQuery)) == 3
            assert session.scalar(select(func.count()).select_from(SearchIntent)) == 3
    finally:
        app.dependency_overrides.clear()
        engine.dispose()
