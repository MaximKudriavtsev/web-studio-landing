from datetime import UTC, datetime
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, func, select
from sqlalchemy.orm import sessionmaker
from app.db import Base, get_db
from app.main import app
from app.models import Opportunity, RawSearchQuery, SearchIntentCalibration
from app.inventory import build_site_inventory

def test_v2_aggregation_coverage_idempotency_and_evidence_preservation(tmp_path):
    engine=create_engine(f"sqlite:///{(tmp_path/'opps.db').as_posix()}")
    Session=sessionmaker(bind=engine,expire_on_commit=False); Base.metadata.create_all(engine)
    evidence=[]
    with Session() as db:
        cases=[("создание официального сайта",100,"BUY_SERVICE","WEB_DEVELOPMENT_SERVICES","OPPORTUNITY_CANDIDATE","HIGH"),("создание сайта с нуля",80,"BUY_SERVICE","WEB_DEVELOPMENT_SERVICES","OPPORTUNITY_CANDIDATE","HIGH"),("website",999999,"LEARN","INFORMATIONAL_WEB_DEV","WATCH","LOW"),("майнкрафт сайт",500,"OTHER","IRRELEVANT_OTHER","IGNORE","NONE")]
        for phrase,demand,goal,cluster,disp,relevance in cases:
            raw=RawSearchQuery(query=phrase,demand=demand,source="wordstat",collected_at=datetime.now(UTC),source_payload={"result_type":"result"}); db.add(raw); db.flush(); evidence.append((raw.id,phrase,demand))
            db.add(SearchIntentCalibration(raw_query_id=raw.id,calibration_version="V2",model="test",normalized_query=phrase,intent="COMMERCIAL",primary_goal=goal,business_relevance=relevance,commerciality="MEDIUM" if goal=="BUY_SERVICE" else "LOW",cluster_name=cluster,subtopic="test",ambiguity="LOW",query_breadth="NARROW",query_specificity="HIGH",disposition=disp,confidence=.9,reasoning="test"))
            if phrase == "website":
                db.add(SearchIntentCalibration(raw_query_id=raw.id,calibration_version="V1",model="test",normalized_query=phrase,intent="COMMERCIAL",primary_goal=None,business_relevance="HIGH",commerciality="HIGH",cluster_name="WEB_DEVELOPMENT_SERVICES",subtopic="old",ambiguity="LOW",query_breadth=None,query_specificity="HIGH",disposition="OPPORTUNITY_CANDIDATE",confidence=.9,reasoning="old"))
        db.commit()
    def override():
        with Session() as db: yield db
    app.dependency_overrides[get_db]=override
    try:
        with TestClient(app) as client:
            first=client.post("/api/opportunities/build"); second=client.post("/api/opportunities/build")
        assert first.status_code==200 and len(first.json()["items"])==2
        assert len(second.json()["items"])==2
        service=next(x for x in first.json()["items"] if x["cluster"]=="WEB_DEVELOPMENT_SERVICES")
        info=next(x for x in first.json()["items"] if x["cluster"]=="INFORMATIONAL_WEB_DEV")
        assert service["evidence_count"]==2 and service["site_coverage"]=="PARTIAL"
        assert service["opportunity_type"]=="EXISTING_PAGE_IMPROVEMENT"
        assert info["priority"]!="HIGH"
        with Session() as db:
            assert db.scalar(select(func.count()).select_from(Opportunity))==2
            assert [(x.id,x.query,x.demand) for x in db.scalars(select(RawSearchQuery).order_by(RawSearchQuery.id))]==evidence
            assert db.scalar(select(func.count()).select_from(SearchIntentCalibration))==5
    finally:
        app.dependency_overrides.clear(); engine.dispose()

def test_dynamic_inventory_reflects_content_change(tmp_path):
    content="""services: [{ id: 'sites', title: 'Сайты для бизнеса', text: 'Первая версия', features: ['Лендинги']\n  },], cases: ["""
    path=tmp_path/"site.ts"; path.write_text(content,encoding="utf-8")
    assert build_site_inventory(path)[0].description=="Первая версия"
    path.write_text(content.replace("Первая версия","Обновлённая версия"),encoding="utf-8")
    assert build_site_inventory(path)[0].description=="Обновлённая версия"
