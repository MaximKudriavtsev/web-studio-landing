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
from app.models import RawSearchQuery, SearchIntent, SearchIntentCalibration
from app.providers.gigachat import GigaChatClient, GigaChatStructuredOutputError
from app.providers.gigachat import GigaChatError, create_gigachat_ssl_context
from app.intelligence.routing import route_semantics
from app.schemas.intelligence import CalibratedQueryIntelligence, IntelligenceBatch, QueryInput, SemanticAnalysisBatch, SemanticQueryAnalysis


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


def calibrated_item(raw_id: int, phrase: str) -> dict:
    is_official = phrase == "создание официального сайта"
    is_website = phrase == "website"
    return {
        "raw_query_id": raw_id,
        "normalized_query": phrase,
        "intent": "COMMERCIAL",
        "business_relevance": "HIGH",
        "commerciality": "MEDIUM",
        "primary_goal": "BUY_SERVICE",
        "cluster": "WEB_DEVELOPMENT_SERVICES",
        "subtopic": "official website" if is_official else "general website",
        "ambiguity": "HIGH" if is_website else "LOW" if is_official else "MEDIUM",
        "query_breadth": "BROAD" if is_website else "NARROW" if is_official else "MEDIUM",
        "query_specificity": "LOW" if is_website else "HIGH" if is_official else "MEDIUM",
        "disposition": "WATCH" if is_website else "OPPORTUNITY_CANDIDATE",
        "confidence": 0.9,
        "reason": "Calibration regression case",
    }


def test_calibration_taxonomy_ambiguity_and_opportunity_gate() -> None:
    website = CalibratedQueryIntelligence.model_validate(calibrated_item(1, "website"))
    official = CalibratedQueryIntelligence.model_validate(calibrated_item(2, "создание официального сайта"))
    assert website.ambiguity.value == "HIGH"
    assert website.disposition.value == "WATCH"
    assert official.ambiguity.value == "LOW"
    assert official.query_specificity.value == "HIGH"

    invalid_cluster = calibrated_item(3, "test") | {"cluster": "MODEL_INVENTED_CLUSTER"}
    with pytest.raises(ValueError):
        CalibratedQueryIntelligence.model_validate(invalid_cluster)

    high_ambiguity_opportunity = calibrated_item(4, "test") | {"ambiguity": "HIGH"}
    with pytest.raises(ValueError, match="high ambiguity"):
        CalibratedQueryIntelligence.model_validate(high_ambiguity_opportunity)

    diy_opportunity = calibrated_item(5, "test") | {"intent": "DIY", "commerciality": "LOW"}
    with pytest.raises(ValueError, match="non-LOW commerciality"):
        CalibratedQueryIntelligence.model_validate(diy_opportunity)


def semantic_item(raw_id: int, phrase: str, goal: str = "BUY_SERVICE") -> dict:
    item = calibrated_item(raw_id, phrase)
    return {key: value for key, value in item.items() if key not in {"cluster", "disposition"}} | {"primary_goal": goal}


@pytest.mark.parametrize(("phrase", "goal", "cluster"), [
    ("создание сайта бесплатно", "DIY_BUILD", "DIY_NO_CODE"),
    ("ии для создания сайтов", "FIND_TOOL", "AI_WEBSITE_TOOLS"),
    ("что такое веб разработка", "LEARN", "INFORMATIONAL_WEB_DEV"),
    ("сайт для создания фото", "FIND_TOOL", "IRRELEVANT_TOOLS"),
    ("майнкрафт сайт создание", "OTHER", "IRRELEVANT_OTHER"),
    ("кто создал интернет", "LEARN", "IRRELEVANT_OTHER"),
    ("веб дизайн заказать", "BUY_SERVICE", "WEB_DESIGN_UX"),
])
def test_semantic_routing_precedence(phrase: str, goal: str, cluster: str) -> None:
    analysis = SemanticQueryAnalysis.model_validate(semantic_item(1, phrase, goal))
    assert route_semantics(phrase, analysis).cluster.value == cluster


def test_breadth_is_independent_from_ambiguity_and_website_is_not_opportunity() -> None:
    analysis = SemanticQueryAnalysis.model_validate(semantic_item(1, "website"))
    routed = route_semantics("website", analysis)
    assert routed.query_breadth.value == "BROAD"
    assert routed.ambiguity.value == "HIGH"
    assert routed.disposition.value != "OPPORTUNITY_CANDIDATE"

    broad_service = SemanticQueryAnalysis.model_validate(semantic_item(2, "создание сайта", "LEARN") | {"ambiguity": "HIGH"})
    routed_service = route_semantics("создание сайта", broad_service)
    assert routed_service.cluster.value == "WEB_DEVELOPMENT_SERVICES"
    assert routed_service.query_breadth.value == "BROAD"
    assert routed_service.ambiguity.value == "MEDIUM"

    free = SemanticQueryAnalysis.model_validate(semantic_item(3, "создание сайта бесплатно", "FIND_TOOL"))
    routed_free = route_semantics("создание сайта бесплатно", free)
    assert routed_free.cluster.value == "DIY_NO_CODE"
    assert routed_free.disposition.value == "IGNORE"


def test_additional_ca_is_loaded_with_verification_enabled(tmp_path, monkeypatch: pytest.MonkeyPatch) -> None:
    from app.providers import gigachat as provider

    certificate = tmp_path / "trusted.crt"
    certificate.write_text("test certificate placeholder")

    class FakeContext:
        verify_mode = __import__("ssl").CERT_REQUIRED
        loaded: str | None = None

        def load_verify_locations(self, *, cafile: str) -> None:
            self.loaded = cafile

    context = FakeContext()
    monkeypatch.setattr(provider.ssl, "create_default_context", lambda: context)
    result = create_gigachat_ssl_context(str(certificate))
    assert result.verify_mode == __import__("ssl").CERT_REQUIRED
    assert result.loaded == str(certificate)


def test_missing_ca_path_has_safe_error(tmp_path) -> None:
    missing = tmp_path / "missing.crt"
    with pytest.raises(GigaChatError, match="CA bundle does not exist") as error:
        create_gigachat_ssl_context(str(missing))
    assert "credential" not in str(error.value).lower()


def test_client_uses_custom_verified_ssl_context_without_environment_network_config(monkeypatch: pytest.MonkeyPatch) -> None:
    from app.providers import gigachat as provider

    class FakeContext:
        verify_mode = __import__("ssl").CERT_REQUIRED

    ssl_context = FakeContext()
    captured: dict = {}

    class FakeHttpClient:
        def __init__(self, **kwargs) -> None:
            captured.update(kwargs)

        def close(self) -> None:
            pass

    monkeypatch.setattr(provider, "create_gigachat_ssl_context", lambda _: ssl_context)
    monkeypatch.setattr(provider.httpx, "Client", FakeHttpClient)

    client = GigaChatClient("client", "super-secret", scope="GIGACHAT_API_PERS", model="test", ca_bundle="local.crt")
    client.close()

    assert captured["trust_env"] is False
    assert captured["verify"] is ssl_context
    assert captured["verify"].verify_mode == __import__("ssl").CERT_REQUIRED
    assert "super-secret" not in repr(captured)


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


def test_calibration_preserves_baseline_and_raw_evidence(tmp_path, monkeypatch: pytest.MonkeyPatch) -> None:
    engine = create_engine(f"sqlite:///{(tmp_path / 'calibration.db').as_posix()}")
    Base.metadata.create_all(engine)
    TestSession = sessionmaker(bind=engine, expire_on_commit=False)
    original = []
    with TestSession() as session:
        for raw_id in range(1, 45):
            phrase = "website" if raw_id == 1 else "создание официального сайта" if raw_id == 2 else f"query {raw_id}"
            raw = RawSearchQuery(query=phrase, demand=100 - raw_id, collected_at=__import__("datetime").datetime.now(__import__("datetime").UTC), source_payload={"result_type": "result"})
            session.add(raw)
            session.flush()
            session.add(SearchIntent(raw_query_id=raw.id, normalized_query=phrase, intent="COMMERCIAL", business_relevance="HIGH", commerciality="MEDIUM", cluster_name=f"old-{raw_id}", disposition="WATCH", confidence=0.5, reasoning="old"))
            session.add(SearchIntentCalibration(raw_query_id=raw.id, calibration_version="V1", model="GigaChat-3-Ultra", normalized_query=phrase, intent="COMMERCIAL", primary_goal=None, business_relevance="HIGH", commerciality="MEDIUM", cluster_name="WEB_DEVELOPMENT_SERVICES", subtopic="v1", ambiguity="MEDIUM", query_breadth=None, query_specificity="MEDIUM", disposition="WATCH", confidence=0.5, reasoning="v1"))
            original.append((raw.id, raw.query, raw.demand, dict(raw.source_payload)))
        session.commit()

    def override_db():
        with TestSession() as session:
            yield session

    class FakeClient:
        def calibrate_batch(self, queries: list[QueryInput]) -> SemanticAnalysisBatch:
            return SemanticAnalysisBatch.model_validate({"items": [semantic_item(query.raw_query_id, query.phrase) for query in queries]})

        def close(self) -> None:
            pass

    monkeypatch.setattr(intelligence_api, "create_gigachat_client", lambda: FakeClient())
    app.dependency_overrides[get_db] = override_db
    try:
        with TestClient(app) as client:
            response = client.post("/api/intelligence/calibrate-existing", json={"limit": 44})
            repeated = client.post("/api/intelligence/calibrate-existing", json={"limit": 44})
        assert response.status_code == 200
        assert response.json()["processed"] == 44
        assert repeated.status_code == 409
        with TestSession() as session:
            current = [(row.id, row.query, row.demand, row.source_payload) for row in session.scalars(select(RawSearchQuery).order_by(RawSearchQuery.id))]
            assert current == original
            assert session.scalar(select(func.count()).select_from(SearchIntent)) == 44
            assert session.scalar(select(func.count()).select_from(SearchIntentCalibration)) == 88
            versions = set(session.scalars(select(SearchIntentCalibration.calibration_version)))
            assert versions == {"V1", "V2"}
            assert session.scalar(select(SearchIntentCalibration.subtopic).where(SearchIntentCalibration.raw_query_id == 2, SearchIntentCalibration.calibration_version == "V2")) == "official website"
    finally:
        app.dependency_overrides.clear()
        engine.dispose()
