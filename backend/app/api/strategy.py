from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.wordstat import create_client as create_wordstat_client
from app.collectors.wordstat import WordstatError
from app.config import get_settings
from app.db import get_db
from app.intelligence.routing import route_semantics
from app.intelligence.service_routing import Platform, ServiceLine, route_service_dimensions
from app.models import MarketEvidence, MarketIntelligence, MarketQuery, MarketScan, StrategicConclusion, StrategicHypothesis
from app.providers.gigachat import GigaChatClient, GigaChatError
from app.schemas.intelligence import QueryInput
from app.schemas.wordstat import TopRequest
from app.strategy import YANDEX_KIT_HYPOTHESIS, YANDEX_KIT_SEEDS

router = APIRouter(prefix="/api/strategy", tags=["strategy"])
MODEL = "GigaChat-3-Ultra"


def ensure_yandex_kit_hypothesis(db: Session) -> StrategicHypothesis:
    row = db.scalar(select(StrategicHypothesis).where(StrategicHypothesis.title == YANDEX_KIT_HYPOTHESIS["title"]))
    if not row:
        row = StrategicHypothesis(**YANDEX_KIT_HYPOTHESIS)
        db.add(row); db.commit(); db.refresh(row)
    return row


@router.get("/hypotheses", response_model=list[dict])
def hypotheses(db: Session = Depends(get_db)):
    ensure_yandex_kit_hypothesis(db)
    return [{"id": row.id, "title": row.title, "service_line": row.service_line, "platform": row.platform,
             "hypothesis_type": row.hypothesis_type, "status": row.status, "rationale": row.rationale,
             "evidence_status": row.evidence_status, "created_at": row.created_at}
            for row in db.scalars(select(StrategicHypothesis).order_by(StrategicHypothesis.id))]


@router.get("/seed-packs/yandex-kit", response_model=dict)
def yandex_kit_seed_pack():
    return {"name": "YANDEX_KIT", "status": "NOT_RUN", "seeds": YANDEX_KIT_SEEDS}


@router.post("/hypotheses/{hypothesis_id}/scans", response_model=dict)
def collect_strategic_scan(hypothesis_id: int, db: Session = Depends(get_db)):
    hypothesis = db.get(StrategicHypothesis, hypothesis_id)
    if not hypothesis:
        raise HTTPException(404, "Strategic hypothesis not found")
    settings = get_settings()
    seeds = YANDEX_KIT_SEEDS[:min(settings.wordstat_max_requests_per_run, 5)]
    scan = MarketScan(status="COLLECTING", scan_type="STRATEGIC", hypothesis_id=hypothesis.id,
                      service_line=hypothesis.service_line, platform=hypothesis.platform,
                      started_at=datetime.now(UTC), seed_count=len(seeds), wordstat_request_count=0,
                      raw_evidence_count=0, unique_query_count=0, intelligence_count=0,
                      opportunity_count=0, model=MODEL, notes="Yandex KIT strategic controlled scan")
    db.add(scan); db.commit(); db.refresh(scan)
    client = create_wordstat_client(); errors = []
    try:
        for seed in seeds:
            try:
                response = client.get_top(TopRequest(phrase=seed, numPhrases=30, regions=[], devices=["DEVICE_ALL"]))
                scan.wordstat_request_count = client.requests_used
            except WordstatError as exc:
                errors.append({"seed": seed, "error": str(exc)}); break
            now = datetime.now(UTC)
            for source_type, items in (("result", response.results), ("association", response.associations)):
                for item in items:
                    normalized = " ".join(item.phrase.casefold().split())
                    query = db.scalar(select(MarketQuery).where(MarketQuery.scan_id == scan.id, MarketQuery.normalized_phrase == normalized))
                    if not query:
                        query = MarketQuery(scan_id=scan.id, phrase=item.phrase, normalized_phrase=normalized)
                        db.add(query); db.flush()
                    db.add(MarketEvidence(scan_id=scan.id, hypothesis_id=hypothesis.id, market_query_id=query.id,
                                          seed=seed, source_type=source_type, phrase=item.phrase, demand=item.count,
                                          collected_at=now, raw_payload={"seed": seed, "source_type": source_type,
                                                                          "response_item": item.model_dump(mode="json")}))
            db.commit()
    finally:
        client.close()
    scan.raw_evidence_count = db.scalar(select(func.count()).select_from(MarketEvidence).where(MarketEvidence.scan_id == scan.id)) or 0
    scan.unique_query_count = db.scalar(select(func.count()).select_from(MarketQuery).where(MarketQuery.scan_id == scan.id)) or 0
    scan.status = "COLLECTED" if not errors else "PARTIAL"
    scan.notes = str(errors) if errors else scan.notes; db.commit()
    return {"scan_id": scan.id, "scan_type": scan.scan_type, "hypothesis_id": hypothesis.id, "seeds": seeds,
            "requests_used": scan.wordstat_request_count, "raw_evidence": scan.raw_evidence_count,
            "unique_queries": scan.unique_query_count, "errors": errors}


@router.post("/scans/{scan_id}/analyze", response_model=dict)
def analyze_strategic_scan(scan_id: int, db: Session = Depends(get_db)):
    scan = db.get(MarketScan, scan_id)
    if not scan or scan.scan_type != "STRATEGIC":
        raise HTTPException(404, "Strategic scan not found")
    queries = db.scalars(select(MarketQuery).outerjoin(MarketIntelligence, MarketIntelligence.market_query_id == MarketQuery.id)
                         .where(MarketQuery.scan_id == scan_id, MarketIntelligence.id.is_(None)).order_by(MarketQuery.id)).all()
    settings = get_settings(); batch_size = max(1, min(settings.gigachat_batch_size, 20))
    processed = 0; batches = 0; errors = []
    client = GigaChatClient(settings.gigachat_client_id, settings.gigachat_client_secret,
                            scope=settings.gigachat_scope, model=MODEL, ca_bundle=settings.gigachat_ca_bundle)
    try:
        for offset in range(0, len(queries), batch_size):
            batch = queries[offset:offset + batch_size]; batches += 1
            try:
                result = client.calibrate_batch([QueryInput(raw_query_id=q.id, phrase=q.phrase, demand=None, source_type=None) for q in batch])
            except GigaChatError as exc:
                errors.append({"query_ids": [q.id for q in batch], "error": str(exc)}); continue
            for semantic in result.items:
                query = next(q for q in batch if q.id == semantic.raw_query_id)
                routed = route_semantics(query.phrase, semantic); payload = routed.model_dump(mode="json")
                service_line, platform = route_service_dimensions(query.phrase, payload["cluster"])
                payload.update(service_line=service_line.value, platform=platform.value)
                db.add(MarketIntelligence(scan_id=scan_id, market_query_id=query.id, version="V2", model=MODEL, payload=payload))
                processed += 1
            db.commit()
    finally:
        client.close()
    scan.intelligence_count = db.scalar(select(func.count()).select_from(MarketIntelligence).where(MarketIntelligence.scan_id == scan_id)) or 0
    scan.status = "ANALYZED" if scan.intelligence_count == scan.unique_query_count else "INTELLIGENCE_PARTIAL"
    db.commit()
    return {"scan_id": scan.id, "batches": batches, "processed": processed,
            "total_intelligence": scan.intelligence_count, "errors": errors}


def build_strategic_decision(rows: list[tuple[MarketQuery, MarketIntelligence]], evidence: list[MarketEvidence]) -> dict:
    direct_ids = {e.market_query_id for e in evidence if e.source_type == "result"}
    commercial = []; informational = []; noise = []
    for query, intel in rows:
        payload = intel.payload; is_direct = query.id in direct_ids
        is_kit = payload.get("platform") == Platform.YANDEX_KIT.value
        text = query.phrase.casefold().replace("ё", "е")
        has_service_action = any(term in text for term in ("создан", "настро", "запуск", "seo", "сео", "продвиж", "разработ"))
        has_information_marker = any(term in text for term in ("что это", "как работает", "отзыв", "возможност", "пример", "интеграц", "доставк", "заказ", "самозанят", "1с", "платформ", "настро", "seo", "сео"))
        is_commercial = (is_direct and is_kit and payload.get("service_line") == ServiceLine.ECOMMERCE.value
                         and payload.get("ambiguity") != "HIGH"
                         and (payload.get("primary_goal") == "BUY_SERVICE"
                              or (has_service_action and payload.get("business_relevance") == "HIGH"
                                  and payload.get("commerciality") in {"MEDIUM", "HIGH"})))
        is_information = (is_direct and is_kit
                          and ((payload.get("primary_goal") == "LEARN" and payload.get("disposition") != "IGNORE")
                               or has_information_marker))
        if is_commercial: commercial.append(query.id)
        if is_information: informational.append(query.id)
        if payload.get("disposition") == "IGNORE" or not is_kit: noise.append(query.id)
    if len(commercial) >= 2 and len(informational) >= 2:
        decision, status = "BOTH", "VALIDATED_FOR_BOTH"
    elif len(commercial) >= 2:
        decision, status = "CREATE_SERVICE_PAGE", "VALIDATED_FOR_SERVICE_RESEARCH"
    elif len(informational) >= 2:
        decision, status = "CREATE_ARTICLE", "VALIDATED_FOR_CONTENT_RESEARCH"
    elif commercial or informational:
        decision, status = "WATCH", "WEAK_SIGNAL"
    else:
        decision, status = "DO_NOTHING", "NO_SIGNAL"
    return {"decision": decision, "evidence_status": status,
            "serp_status": "SERP_RESEARCH_REQUIRED" if decision in {"CREATE_SERVICE_PAGE", "CREATE_ARTICLE", "BOTH"} else "NOT_REQUIRED",
            "commercial_query_ids": commercial, "informational_query_ids": informational, "noise_query_ids": noise,
            "direct_results": sum(e.source_type == "result" for e in evidence),
            "associations": sum(e.source_type == "association" for e in evidence)}


@router.post("/scans/{scan_id}/conclude", response_model=dict)
def conclude_strategic_scan(scan_id: int, db: Session = Depends(get_db)):
    existing = db.scalar(select(StrategicConclusion).where(StrategicConclusion.scan_id == scan_id))
    if existing:
        return {"scan_id": scan_id, "decision": existing.decision, "evidence_status": existing.evidence_status,
                "serp_status": existing.serp_status, "metrics": existing.metrics}
    scan = db.get(MarketScan, scan_id)
    if not scan or scan.scan_type != "STRATEGIC" or scan.status != "ANALYZED":
        raise HTTPException(409, "Completed strategic intelligence is required")
    rows = db.execute(select(MarketQuery, MarketIntelligence).join(MarketIntelligence, MarketIntelligence.market_query_id == MarketQuery.id)
                      .where(MarketQuery.scan_id == scan_id)).all()
    evidence = list(db.scalars(select(MarketEvidence).where(MarketEvidence.scan_id == scan_id)))
    metrics = build_strategic_decision(rows, evidence)
    hypothesis = db.get(StrategicHypothesis, scan.hypothesis_id)
    hypothesis.evidence_status = metrics["evidence_status"]; hypothesis.status = metrics["evidence_status"]
    rationale = "Decision uses direct intent evidence; overlapping Wordstat frequencies are evidence signals, not market size."
    row = StrategicConclusion(scan_id=scan.id, hypothesis_id=hypothesis.id, decision=metrics["decision"],
                              evidence_status=metrics["evidence_status"], serp_status=metrics["serp_status"],
                              rationale=rationale, metrics=metrics)
    db.add(row); scan.status = "CONCLUDED"; db.commit()
    return {"scan_id": scan.id, "decision": row.decision, "evidence_status": row.evidence_status,
            "serp_status": row.serp_status, "metrics": metrics}
