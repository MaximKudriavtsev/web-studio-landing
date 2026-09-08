from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.collectors.wordstat import WordstatClient, WordstatError
from app.config import get_settings
from app.db import get_db
from app.models import RawSearchQuery, SearchDemandPoint
from app.schemas.wordstat import DynamicsRequest, DynamicsResponse, TopRequest, TopResponse

router = APIRouter(prefix="/api/wordstat", tags=["wordstat"])


def create_client() -> WordstatClient:
    settings = get_settings()
    if not settings.wordstat_configured:
        raise HTTPException(status_code=503, detail="Wordstat is not configured")
    return WordstatClient(
        settings.wordstat_api_key,
        settings.yandex_folder_id,
        max_requests=settings.wordstat_max_requests_per_run,
    )


def wordstat_error(exc: WordstatError) -> HTTPException:
    return HTTPException(status_code=502, detail=str(exc))


@router.post("/top", response_model=TopResponse)
def top(request: TopRequest, db: Session = Depends(get_db)) -> TopResponse:
    client = create_client()
    try:
        response = client.get_top(request)
    except WordstatError as exc:
        raise wordstat_error(exc) from exc
    finally:
        client.close()

    collected_at = datetime.now(UTC)
    request_parameters = request.model_dump(mode="json")
    for result_type, items in (("result", response.results), ("association", response.associations)):
        for item in items:
            db.add(RawSearchQuery(
                query=item.phrase,
                demand=item.count,
                source="wordstat",
                collected_at=collected_at,
                source_payload={
                    "seed_phrase": request.phrase,
                    "result_type": result_type,
                    "request_parameters": request_parameters,
                    "response_item": item.model_dump(mode="json"),
                },
            ))
    db.commit()
    return response.model_copy(update={"seed_phrase": request.phrase})


@router.post("/dynamics", response_model=DynamicsResponse)
def dynamics(request: DynamicsRequest, db: Session = Depends(get_db)) -> DynamicsResponse:
    client = create_client()
    try:
        response = client.get_dynamics(request)
    except WordstatError as exc:
        raise wordstat_error(exc) from exc
    finally:
        client.close()

    collected_at = datetime.now(UTC)
    device = ",".join(item.value for item in request.devices)
    for point in response.results:
        db.add(SearchDemandPoint(
            phrase=request.phrase,
            source="wordstat",
            period=request.period.value,
            period_date=point.date,
            count=point.count,
            share=point.share,
            regions=request.regions,
            device=device,
            collected_at=collected_at,
        ))
    db.commit()
    return response
