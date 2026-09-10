from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import StrategicHypothesis
from app.strategy import YANDEX_KIT_HYPOTHESIS, YANDEX_KIT_SEEDS

router = APIRouter(prefix="/api/strategy", tags=["strategy"])


def ensure_yandex_kit_hypothesis(db: Session) -> StrategicHypothesis:
    row = db.scalar(select(StrategicHypothesis).where(StrategicHypothesis.title == YANDEX_KIT_HYPOTHESIS["title"]))
    if row:
        return row
    row = StrategicHypothesis(**YANDEX_KIT_HYPOTHESIS)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.get("/hypotheses", response_model=list[dict])
def hypotheses(db: Session = Depends(get_db)):
    ensure_yandex_kit_hypothesis(db)
    return [
        {"id": row.id, "title": row.title, "service_line": row.service_line, "platform": row.platform,
         "hypothesis_type": row.hypothesis_type, "status": row.status, "rationale": row.rationale,
         "evidence_status": row.evidence_status, "created_at": row.created_at}
        for row in db.scalars(select(StrategicHypothesis).order_by(StrategicHypothesis.id))
    ]


@router.get("/seed-packs/yandex-kit", response_model=dict)
def yandex_kit_seed_pack():
    return {"name": "YANDEX_KIT", "status": "NOT_RUN", "seeds": YANDEX_KIT_SEEDS}
