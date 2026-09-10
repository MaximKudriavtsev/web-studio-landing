import json
from datetime import UTC, datetime

from fastapi.testclient import TestClient
from sqlalchemy import create_engine, func, select
from sqlalchemy.orm import sessionmaker

from app.db import Base, get_db
from app.design_guardrails import CONTRACT_PATH, validate_generation_request
from app.intelligence.service_routing import Platform, ServiceLine, route_platform, route_service_line
from app.main import app
from app.models import MarketEvidence, MarketIntelligence, MarketQuery, MarketScan, Opportunity, StrategicHypothesis


def test_service_line_and_platform_routing():
    assert route_service_line("создание корпоративного сайта", "WEB_DEVELOPMENT_SERVICES") == ServiceLine.CORPORATE_WEBSITE
    assert route_service_line("разработка интернет магазина", "WEB_DEVELOPMENT_SERVICES") == ServiceLine.ECOMMERCE
    assert route_service_line("разработка веб приложения", "WEB_DEVELOPMENT_SERVICES") == ServiceLine.WEB_APPLICATION
    assert route_service_line("разработка личного кабинета", "WEB_DEVELOPMENT_SERVICES") == ServiceLine.PERSONAL_ACCOUNT
    assert route_service_line("ux ui дизайн", "WEB_DESIGN_UX") == ServiceLine.UX_UI
    assert route_service_line("редизайн сайта", "WEB_DESIGN_UX") == ServiceLine.REDESIGN
    assert route_platform("создание интернет магазина на яндекс кит") == Platform.YANDEX_KIT
    assert route_service_line("создание интернет магазина на яндекс кит", "WEB_DEVELOPMENT_SERVICES") == ServiceLine.ECOMMERCE


def test_design_contract_and_extension_guardrail():
    contract = json.loads(CONTRACT_PATH.read_text(encoding="utf-8"))
    assert contract["tokens"]["colors"]["lime"] == "#c9ff55"
    assert {"Header", "Footer", "service-card"}.issubset(contract["allowed_components"])
    assert validate_generation_request({"components": ["service-card"], "style_changes": ["new_font"]})["status"] == "REJECTED"
    result = validate_generation_request({"components": ["pricing-comparison"]})
    assert result["status"] == "DESIGN_EXTENSION_REQUIRED"


def test_v2_split_is_versioned_and_hypothesis_is_not_opportunity(tmp_path):
    engine = create_engine(f"sqlite:///{(tmp_path/'phase5.db').as_posix()}")
    Session = sessionmaker(bind=engine, expire_on_commit=False); Base.metadata.create_all(engine)
    with Session() as db:
        scan = MarketScan(status="OPPORTUNITIES_BUILT", started_at=datetime.now(UTC), seed_count=1, wordstat_request_count=1, raw_evidence_count=2, unique_query_count=2, intelligence_count=2, opportunity_count=1, model="test")
        db.add(scan); db.flush()
        db.add(Opportunity(title="Historical", status=f"SCAN_{scan.id}_PROPOSED", evidence={"opportunity_type":"WATCH_TOPIC","cluster":"WEB_DEVELOPMENT_SERVICES","subtopic":"old","priority":"LOW","priority_reasons":[],"evidence_count":1,"total_frequency_evidence":1,"strongest_queries":[],"site_coverage":"PARTIAL","recommended_action":"WATCH","rationale":"old","scan_id":scan.id}))
        for phrase in ("создание корпоративного сайта", "создание интернет магазина"):
            query=MarketQuery(scan_id=scan.id,phrase=phrase,normalized_phrase=phrase);db.add(query);db.flush()
            db.add(MarketEvidence(scan_id=scan.id,market_query_id=query.id,seed="seed",source_type="result",phrase=phrase,demand=10,collected_at=datetime.now(UTC),raw_payload={}))
            db.add(MarketIntelligence(scan_id=scan.id,market_query_id=query.id,version="V2",model="test",payload={"cluster":"WEB_DEVELOPMENT_SERVICES","disposition":"OPPORTUNITY_CANDIDATE","primary_goal":"BUY_SERVICE","subtopic":phrase}))
        db.commit();scan_id=scan.id
    def override():
        with Session() as db: yield db
    app.dependency_overrides[get_db]=override
    try:
        with TestClient(app) as client:
            response=client.post(f"/api/opportunities/build/{scan_id}/v2")
            hypotheses=client.get("/api/strategy/hypotheses")
        assert response.status_code==200
        assert {x["service_line"] for x in response.json()["items"]}=={"CORPORATE_WEBSITE","ECOMMERCE"}
        with Session() as db:
            assert db.scalar(select(func.count()).select_from(Opportunity).where(Opportunity.status==f"SCAN_{scan_id}_PROPOSED"))==1
            assert db.scalar(select(func.count()).select_from(StrategicHypothesis))==1
            assert db.scalar(select(func.count()).select_from(Opportunity))==3
        assert hypotheses.json()[0]["status"]=="RESEARCH_REQUIRED"
    finally:
        app.dependency_overrides.clear();engine.dispose()
