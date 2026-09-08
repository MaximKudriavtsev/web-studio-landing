import httpx
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker

from app.api import wordstat as wordstat_api
from app.collectors.wordstat import WordstatClient, WordstatError
from app.db import Base, get_db
from app.main import app
from app.models import RawSearchQuery
from app.schemas.wordstat import DynamicsRequest, RegionsDistributionRequest, TopRequest, TopResponse


def mock_client(handler, *, max_retries: int = 0) -> WordstatClient:
    return WordstatClient(
        "super-secret-key",
        "folder-123",
        transport=httpx.MockTransport(handler),
        max_retries=max_retries,
    )


def test_authorization_payload_and_top_mapping() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.headers["Authorization"] == "Api-key super-secret-key"
        payload = __import__("json").loads(request.content)
        assert payload == {
            "phrase": "создание сайтов",
            "numPhrases": 10,
            "regions": [],
            "devices": ["DEVICE_ALL"],
            "folderId": "folder-123",
        }
        return httpx.Response(200, json={
            "totalCount": "1200",
            "results": [{"phrase": "создание сайтов цена", "count": "420"}],
            "associations": [{"phrase": "веб студия", "count": "85"}],
        })

    client = mock_client(handler)
    response = client.get_top(TopRequest(phrase="создание сайтов", numPhrases=10))
    client.close()
    assert response.total_count == 1200
    assert response.results[0].count == 420
    assert response.associations[0].phrase == "веб студия"


def test_dynamics_mapping_and_payload() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        payload = __import__("json").loads(request.content)
        assert payload["period"] == "PERIOD_WEEKLY"
        assert payload["fromDate"].startswith("2026-01-01")
        assert payload["folderId"] == "folder-123"
        return httpx.Response(200, json={"results": [{
            "date": "2026-01-05T00:00:00Z", "count": "321", "share": "0.0125"
        }]})

    client = mock_client(handler)
    response = client.get_dynamics(DynamicsRequest(
        phrase="создание сайтов",
        period="PERIOD_WEEKLY",
        fromDate="2026-01-01T00:00:00Z",
    ))
    client.close()
    assert response.results[0].count == 321
    assert response.results[0].share == 0.0125


def test_regions_distribution_contract() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.path.endswith("/regions")
        payload = __import__("json").loads(request.content)
        assert payload["region"] == "REGION_CITIES"
        return httpx.Response(200, json={"results": [{
            "region": "213", "count": "90", "share": "0.02", "affinityIndex": "1.4"
        }]})

    client = mock_client(handler)
    response = client.get_regions_distribution(RegionsDistributionRequest(
        phrase="создание сайтов", region="REGION_CITIES"
    ))
    client.close()
    assert response.results[0].region == "213"
    assert response.results[0].affinity_index == 1.4


@pytest.mark.parametrize("status_code", [401, 403])
def test_auth_errors_are_sanitized(status_code: int) -> None:
    client = mock_client(lambda _: httpx.Response(status_code, json={"message": "secret detail"}))
    with pytest.raises(WordstatError, match="authentication or access denied") as error:
        client.get_regions_tree()
    client.close()
    assert "super-secret-key" not in str(error.value)


@pytest.mark.parametrize(
    ("status_code", "message"),
    [(429, "rate limit"), (500, "temporarily unavailable")],
)
def test_retryable_http_errors_are_bounded(status_code: int, message: str) -> None:
    attempts = 0

    def handler(_: httpx.Request) -> httpx.Response:
        nonlocal attempts
        attempts += 1
        return httpx.Response(status_code)

    client = mock_client(handler, max_retries=2)
    with pytest.raises(WordstatError, match=message):
        client.get_regions_tree()
    client.close()
    assert attempts == 3


def test_timeout_is_bounded() -> None:
    attempts = 0

    def handler(request: httpx.Request) -> httpx.Response:
        nonlocal attempts
        attempts += 1
        raise httpx.ReadTimeout("timed out", request=request)

    client = mock_client(handler, max_retries=1)
    with pytest.raises(WordstatError, match="timed out"):
        client.get_regions_tree()
    client.close()
    assert attempts == 2


def test_missing_credentials_check(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("AI_WORDSTAT_API_KEY", "")
    monkeypatch.setenv("AI_YANDEX_FOLDER_ID", "")
    from app.config import get_settings
    get_settings.cache_clear()
    try:
        with TestClient(app) as client:
            response = client.post("/api/integrations/wordstat/check")
        assert response.json() == {"integration": "Wordstat", "status": "NOT_CONFIGURED", "message": None}
    finally:
        get_settings.cache_clear()


def test_top_endpoint_persists_results(tmp_path, monkeypatch: pytest.MonkeyPatch) -> None:
    test_engine = create_engine(f"sqlite:///{(tmp_path / 'test.db').as_posix()}")
    Base.metadata.create_all(test_engine)
    TestSession = sessionmaker(bind=test_engine, expire_on_commit=False)

    def override_db():
        with TestSession() as session:
            yield session

    class FakeClient:
        def get_top(self, _: TopRequest) -> TopResponse:
            return TopResponse.model_validate({
                "totalCount": "505",
                "results": [{"phrase": "сайт под ключ", "count": "100"}],
                "associations": [{"phrase": "веб разработка", "count": "50"}],
            })

        def close(self) -> None:
            pass

    monkeypatch.setattr(wordstat_api, "create_client", lambda: FakeClient())
    app.dependency_overrides[get_db] = override_db
    try:
        with TestClient(app) as client:
            response = client.post("/api/wordstat/top", json={
                "phrase": "создание сайтов", "numPhrases": 5, "regions": [], "devices": ["DEVICE_ALL"]
            })
        assert response.status_code == 200
        assert response.json()["seedPhrase"] == "создание сайтов"
        with Session(test_engine) as session:
            rows = session.scalars(select(RawSearchQuery).order_by(RawSearchQuery.id)).all()
        assert [(row.query, row.demand) for row in rows] == [("сайт под ключ", 100), ("веб разработка", 50)]
        assert rows[0].source_payload["result_type"] == "result"
        assert rows[1].source_payload["result_type"] == "association"
        assert rows[0].source_payload["seed_phrase"] == "создание сайтов"
    finally:
        app.dependency_overrides.clear()
        test_engine.dispose()
