from datetime import UTC, datetime
import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import sessionmaker
from app.api.market_scans import SEEDS
from app.db import Base
from app.models import MarketEvidence, MarketQuery, MarketScan

def test_scan_registry_budget_dedup_and_source_evidence(tmp_path):
    assert len(SEEDS)>5 and len(SEEDS[:5])==5
    engine=create_engine(f"sqlite:///{(tmp_path/'scan.db').as_posix()}"); Session=sessionmaker(bind=engine); Base.metadata.create_all(engine)
    with Session() as db:
        scan=MarketScan(status="COLLECTING",started_at=datetime.now(UTC),seed_count=2,wordstat_request_count=0,raw_evidence_count=0,unique_query_count=0,intelligence_count=0,opportunity_count=0,model="test");db.add(scan);db.flush()
        query=MarketQuery(scan_id=scan.id,phrase="создание сайта",normalized_phrase="создание сайта");db.add(query);db.flush()
        db.add_all([MarketEvidence(scan_id=scan.id,market_query_id=query.id,seed="seed one",source_type="result",phrase=query.phrase,demand=10,collected_at=datetime.now(UTC),raw_payload={"source":"one"}),MarketEvidence(scan_id=scan.id,market_query_id=query.id,seed="seed two",source_type="association",phrase=query.phrase,demand=9,collected_at=datetime.now(UTC),raw_payload={"source":"two"})]);db.commit()
        assert len(db.scalars(select(MarketQuery)).all())==1
        evidence=db.scalars(select(MarketEvidence)).all();assert len(evidence)==2 and {x.source_type for x in evidence}=={"result","association"}
        db.add(MarketQuery(scan_id=scan.id,phrase="Создание сайта",normalized_phrase="создание сайта"))
        with pytest.raises(IntegrityError):db.commit()
    engine.dispose()
