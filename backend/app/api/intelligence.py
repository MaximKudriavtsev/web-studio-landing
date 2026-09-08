from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db import get_db
from app.models import RawSearchQuery, SearchIntent
from app.providers.gigachat import GigaChatClient, GigaChatError
from app.schemas.intelligence import (
    AnalyzeRequest,
    AnalyzeSummary,
    Disposition,
    IntelligenceQueryList,
    IntelligenceQueryView,
    QueryInput,
)

router = APIRouter(prefix="/api/intelligence", tags=["intelligence"])


def create_gigachat_client() -> GigaChatClient:
    settings = get_settings()
    if not settings.gigachat_configured:
        raise HTTPException(status_code=503, detail="GigaChat is not configured")
    return GigaChatClient(
        settings.gigachat_client_id,
        settings.gigachat_client_secret,
        scope=settings.gigachat_scope,
        model=settings.gigachat_model,
        ca_bundle=settings.gigachat_ca_bundle,
    )


@router.post("/analyze-existing", response_model=AnalyzeSummary)
def analyze_existing(request: AnalyzeRequest, db: Session = Depends(get_db)) -> AnalyzeSummary:
    rows = db.execute(
        select(RawSearchQuery)
        .outerjoin(SearchIntent, SearchIntent.raw_query_id == RawSearchQuery.id)
        .where(SearchIntent.id.is_(None))
        .order_by(RawSearchQuery.id)
        .limit(request.limit)
    ).scalars().all()
    if not rows:
        return AnalyzeSummary(processed=0, batches=0, opportunity_candidates=0, watch=0, ignored=0, clusters=0)

    settings = get_settings()
    batch_size = max(1, min(settings.gigachat_batch_size, 20))
    client = create_gigachat_client()
    analyzed = []
    errors = 0
    batch_count = 0
    try:
        for offset in range(0, len(rows), batch_size):
            batch_count += 1
            batch_rows = rows[offset:offset + batch_size]
            inputs = [QueryInput(
                raw_query_id=row.id,
                phrase=row.query,
                demand=row.demand,
                source_type=(row.source_payload or {}).get("result_type"),
            ) for row in batch_rows]
            try:
                result = client.analyze_batch(inputs)
            except GigaChatError:
                errors += 1
                continue
            for item in result.items:
                db.add(SearchIntent(
                    raw_query_id=item.raw_query_id,
                    normalized_query=item.normalized_query,
                    intent=item.intent.value,
                    business_relevance=item.business_relevance.value,
                    commerciality=item.commerciality.value,
                    cluster_name=item.cluster_name,
                    disposition=item.disposition.value,
                    confidence=item.confidence,
                    reasoning=item.reason,
                ))
                analyzed.append(item)
            db.commit()
    finally:
        client.close()

    dispositions = [item.disposition for item in analyzed]
    return AnalyzeSummary(
        processed=len(analyzed),
        batches=batch_count,
        opportunity_candidates=dispositions.count(Disposition.OPPORTUNITY_CANDIDATE),
        watch=dispositions.count(Disposition.WATCH),
        ignored=dispositions.count(Disposition.IGNORE),
        clusters=len({item.cluster_name for item in analyzed}),
        errors=errors,
    )


@router.get("/queries", response_model=IntelligenceQueryList)
def list_queries(
    disposition: Disposition | None = Query(default=None),
    cluster: str | None = Query(default=None),
    db: Session = Depends(get_db),
) -> IntelligenceQueryList:
    statement = select(RawSearchQuery, SearchIntent).join(SearchIntent, SearchIntent.raw_query_id == RawSearchQuery.id)
    if disposition:
        statement = statement.where(SearchIntent.disposition == disposition.value)
    if cluster:
        statement = statement.where(SearchIntent.cluster_name == cluster)
    rows = db.execute(statement.order_by(RawSearchQuery.demand.desc()).limit(200)).all()
    all_intents = db.scalars(select(SearchIntent)).all()
    items = [IntelligenceQueryView(
        raw_query_id=raw.id,
        phrase=raw.query,
        demand=raw.demand,
        source_type=(raw.source_payload or {}).get("result_type"),
        intent=intent.intent,
        business_relevance=intent.business_relevance,
        commerciality=intent.commerciality,
        cluster_name=intent.cluster_name or "",
        disposition=intent.disposition,
        confidence=intent.confidence or 0,
    ) for raw, intent in rows]
    return IntelligenceQueryList(
        raw_queries=db.scalar(select(func.count()).select_from(RawSearchQuery)) or 0,
        analyzed=len(all_intents),
        ignored=sum(item.disposition == Disposition.IGNORE.value for item in all_intents),
        watch=sum(item.disposition == Disposition.WATCH.value for item in all_intents),
        opportunity_candidates=sum(item.disposition == Disposition.OPPORTUNITY_CANDIDATE.value for item in all_intents),
        clusters=len({item.cluster_name for item in all_intents if item.cluster_name}),
        items=items,
    )
