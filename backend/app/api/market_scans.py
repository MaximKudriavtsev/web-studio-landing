from datetime import UTC, datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from app.api.intelligence import create_gigachat_client
from app.api.wordstat import create_client
from app.collectors.wordstat import WordstatError
from app.config import get_settings
from app.db import get_db
from app.intelligence.routing import route_semantics
from app.intelligence.service_routing import route_service_dimensions
from app.models import MarketEvidence, MarketIntelligence, MarketQuery, MarketScan
from app.schemas.intelligence import QueryInput
from app.schemas.wordstat import TopRequest

router=APIRouter(prefix="/api/market-scans",tags=["market-scans"])
SEEDS=["создание сайта","разработка корпоративного сайта","создание интернет магазина","разработка веб приложения","разработка личного кабинета","ux ui дизайн","редизайн сайта","доработка сайта"]

@router.post("",response_model=dict)
def collect_market_scan(db:Session=Depends(get_db)):
 settings=get_settings(); budget=min(settings.wordstat_max_requests_per_run,5); seeds=SEEDS[:budget]
 scan=MarketScan(status="COLLECTING",started_at=datetime.now(UTC),completed_at=None,seed_count=len(seeds),wordstat_request_count=0,raw_evidence_count=0,unique_query_count=0,intelligence_count=0,opportunity_count=0,model=settings.gigachat_model,notes="Controlled Market Scan V1")
 db.add(scan); db.commit(); db.refresh(scan); client=create_client(); errors=[]
 try:
  for seed in seeds:
   try: response=client.get_top(TopRequest(phrase=seed,numPhrases=30,regions=[],devices=["DEVICE_ALL"])); scan.wordstat_request_count=client.requests_used
   except WordstatError as exc: errors.append({"seed":seed,"error":str(exc)}); break
   now=datetime.now(UTC)
   for source_type,items in (("result",response.results),("association",response.associations)):
    for item in items:
     normalized=" ".join(item.phrase.casefold().split()); query=db.scalar(select(MarketQuery).where(MarketQuery.scan_id==scan.id,MarketQuery.normalized_phrase==normalized))
     if not query: query=MarketQuery(scan_id=scan.id,phrase=item.phrase,normalized_phrase=normalized); db.add(query); db.flush()
     db.add(MarketEvidence(scan_id=scan.id,market_query_id=query.id,seed=seed,source_type=source_type,phrase=item.phrase,demand=item.count,collected_at=now,raw_payload={"seed":seed,"source_type":source_type,"response_item":item.model_dump(mode="json")}))
   db.commit()
 finally: client.close()
 scan.raw_evidence_count=db.scalar(select(func.count()).select_from(MarketEvidence).where(MarketEvidence.scan_id==scan.id)) or 0; scan.unique_query_count=db.scalar(select(func.count()).select_from(MarketQuery).where(MarketQuery.scan_id==scan.id)) or 0; scan.status="COLLECTED" if not errors else "PARTIAL"; scan.notes=str(errors) if errors else scan.notes; db.commit()
 return {"scan_id":scan.id,"status":scan.status,"seeds":seeds,"requests_used":scan.wordstat_request_count,"raw_evidence":scan.raw_evidence_count,"unique_queries":scan.unique_query_count,"errors":errors}

@router.post("/{scan_id}/analyze",response_model=dict)
def analyze_scan(scan_id:int,db:Session=Depends(get_db)):
 scan=db.get(MarketScan,scan_id)
 if not scan: raise HTTPException(404,"Market scan not found")
 queries=db.scalars(select(MarketQuery).outerjoin(MarketIntelligence,MarketIntelligence.market_query_id==MarketQuery.id).where(MarketQuery.scan_id==scan_id,MarketIntelligence.id.is_(None)).order_by(MarketQuery.id)).all()
 batch_size=max(1,min(get_settings().gigachat_batch_size,20)); client=create_gigachat_client(); processed=0; batches=0; errors=[]
 try:
  for offset in range(0,len(queries),batch_size):
   batch=queries[offset:offset+batch_size]; batches+=1
   try: result=client.calibrate_batch([QueryInput(raw_query_id=q.id,phrase=q.phrase,demand=None,source_type=None) for q in batch])
   except Exception as exc: errors.append({"query_ids":[q.id for q in batch],"error":type(exc).__name__}); continue
   for semantic in result.items:
    query=next(q for q in batch if q.id==semantic.raw_query_id); routed=route_semantics(query.phrase,semantic); payload=routed.model_dump(mode="json"); service_line,platform=route_service_dimensions(query.phrase,payload["cluster"]); payload.update(service_line=service_line.value,platform=platform.value); db.add(MarketIntelligence(scan_id=scan_id,market_query_id=query.id,version="V2",model=scan.model,payload=payload)); processed+=1
   db.commit()
 finally: client.close()
 scan.intelligence_count=db.scalar(select(func.count()).select_from(MarketIntelligence).where(MarketIntelligence.scan_id==scan_id)) or 0; scan.status="ANALYZED" if scan.intelligence_count==scan.unique_query_count else "INTELLIGENCE_PARTIAL"; db.commit()
 return {"scan_id":scan_id,"expected_queries":len(queries),"batches":batches,"processed":processed,"total_intelligence":scan.intelligence_count,"errors":errors}

@router.get("/{scan_id}",response_model=dict)
def get_scan(scan_id:int,db:Session=Depends(get_db)):
 scan=db.get(MarketScan,scan_id)
 if not scan: raise HTTPException(404,"Market scan not found")
 return {"id":scan.id,"status":scan.status,"seed_count":scan.seed_count,"wordstat_requests":scan.wordstat_request_count,"raw_evidence":scan.raw_evidence_count,"unique_queries":scan.unique_query_count,"intelligence":scan.intelligence_count,"opportunities":scan.opportunity_count,"model":scan.model}
