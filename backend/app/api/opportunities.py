from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import MarketEvidence, MarketIntelligence, MarketQuery, MarketScan, Opportunity, RawSearchQuery, SearchIntentCalibration
from app.inventory import build_site_inventory
from app.schemas.opportunities import OpportunityList, OpportunityView, SitePageInventory

router=APIRouter(tags=["opportunities"])
SCOPE="opportunities detected in the current search-demand sample"

def _view(row):
 p=row.evidence or {}; return OpportunityView(id=row.id,title=row.title,opportunity_type=p["opportunity_type"],cluster=p["cluster"],subtopic=p["subtopic"],status=row.status,priority=p["priority"],priority_reasons=p["priority_reasons"],evidence_count=p["evidence_count"],total_frequency_evidence=p["total_frequency_evidence"],strongest_queries=p["strongest_queries"],site_coverage=p["site_coverage"],recommended_action=p["recommended_action"],rationale=p["rationale"],scan_id=p.get("scan_id"),direct_results_count=p.get("direct_results_count",0),associations_count=p.get("associations_count",0))

@router.get("/api/site-inventory",response_model=list[SitePageInventory])
def inventory(): return build_site_inventory()

@router.post("/api/opportunities/build",response_model=OpportunityList)
def build(db:Session=Depends(get_db)):
 existing=db.scalars(select(Opportunity).where(Opportunity.status=="PROPOSED_V1")).all()
 if existing: return OpportunityList(items=[_view(x) for x in existing])
 rows=db.execute(select(RawSearchQuery,SearchIntentCalibration).join(SearchIntentCalibration,SearchIntentCalibration.raw_query_id==RawSearchQuery.id).where(SearchIntentCalibration.calibration_version=="V2",SearchIntentCalibration.disposition!="IGNORE")).all()
 if len(rows)==0: raise HTTPException(409,"V2 calibration is required")
 groups={}
 for raw,item in rows: groups.setdefault(item.cluster_name,[]).append((raw,item))
 for cluster,pairs in groups.items():
  total=sum((r.demand or 0) for r,_ in pairs); buy=any(i.primary_goal=="BUY_SERVICE" for _,i in pairs); partial=cluster in {"WEB_DEVELOPMENT_SERVICES","WEB_DESIGN_UX"}; coverage="PARTIAL" if partial else "NONE"
  if buy and partial: typ,action="EXISTING_PAGE_IMPROVEMENT","IMPROVE_EXISTING_PAGE"
  elif buy: typ,action="SERVICE_GAP","CREATE_SERVICE_PAGE"
  elif cluster in {"AI_WEBSITE_TOOLS","INFORMATIONAL_WEB_DEV","DIY_NO_CODE"}: typ,action="INFORMATIONAL_CONTENT","CREATE_ARTICLE"
  else: typ,action="WATCH_TOPIC","WATCH"
  count=len(pairs); priority="HIGH" if buy and count>=2 and coverage!="STRONG" else "MEDIUM" if buy or count>=2 else "LOW"
  strongest=sorted([{"phrase":r.query,"frequency":r.demand,"disposition":i.disposition} for r,i in pairs],key=lambda x:x["frequency"] or 0,reverse=True)[:5]
  payload={"opportunity_type":typ,"cluster":cluster,"subtopic":pairs[0][1].subtopic,"priority":priority,"priority_reasons":["commercial BUY_SERVICE evidence" if buy else "business-relevant WATCH evidence",f"{count} supporting queries",f"site coverage {coverage}"],"evidence_count":count,"total_frequency_evidence":total,"strongest_queries":strongest,"site_coverage":coverage,"recommended_action":action,"rationale":f"Aggregated V2 evidence for {cluster}; this finding is limited to the current ‘создание сайтов’ sample."}
  db.add(Opportunity(title=cluster.replace("_"," ").title(),status="PROPOSED_V1",score=None,summary=payload["rationale"],evidence=payload))
 db.commit(); built=db.scalars(select(Opportunity).where(Opportunity.status=="PROPOSED_V1")).all(); return OpportunityList(items=[_view(x) for x in built])

@router.post("/api/opportunities/build/{scan_id}",response_model=OpportunityList)
def build_for_scan(scan_id:int,db:Session=Depends(get_db)):
 status=f"SCAN_{scan_id}_PROPOSED"; existing=db.scalars(select(Opportunity).where(Opportunity.status==status)).all()
 if existing:return OpportunityList(sample_scope="opportunities detected in this Market Scan sample",items=[_view(x) for x in existing])
 scan=db.get(MarketScan,scan_id)
 if not scan or scan.status not in {"ANALYZED","OPPORTUNITIES_BUILT"}:raise HTTPException(409,"Completed scan intelligence is required")
 rows=db.execute(select(MarketQuery,MarketIntelligence).join(MarketIntelligence,MarketIntelligence.market_query_id==MarketQuery.id).where(MarketQuery.scan_id==scan_id)).all(); groups={}
 for query,intel in rows:
  p=intel.payload
  if p["disposition"]!="IGNORE":groups.setdefault(p["cluster"],[]).append((query,p))
 for cluster,pairs in groups.items():
  qids=[q.id for q,_ in pairs]; evidence=list(db.scalars(select(MarketEvidence).where(MarketEvidence.scan_id==scan_id,MarketEvidence.market_query_id.in_(qids)))); direct=sum(e.source_type=="result" for e in evidence); assoc=sum(e.source_type=="association" for e in evidence); buy=any(p["primary_goal"]=="BUY_SERVICE" for _,p in pairs); partial=cluster in {"WEB_DEVELOPMENT_SERVICES","WEB_DESIGN_UX"}; coverage="PARTIAL" if partial else "NONE"; count=len(pairs)
  if cluster in {"AI_WEBSITE_TOOLS","INFORMATIONAL_WEB_DEV","DIY_NO_CODE"}:typ,action="INFORMATIONAL_CONTENT","CREATE_ARTICLE"
  elif buy and count>1 and partial:typ,action="EXISTING_PAGE_IMPROVEMENT","IMPROVE_EXISTING_PAGE"
  elif buy and count>1:typ,action="SERVICE_GAP","CREATE_SERVICE_PAGE"
  elif buy:typ,action="WATCH_TOPIC","WATCH"
  else:typ,action="WATCH_TOPIC","WATCH"
  priority="HIGH" if typ in {"SERVICE_GAP","EXISTING_PAGE_IMPROVEMENT"} and buy and count>=2 and direct>=2 else "MEDIUM" if buy or direct>=2 else "LOW"; total=sum(e.demand for e in evidence); strongest=sorted([{"phrase":e.phrase,"frequency":e.demand,"source_type":e.source_type,"seed":e.seed} for e in evidence],key=lambda x:x["frequency"],reverse=True)[:5]
  payload={"scan_id":scan_id,"opportunity_type":typ,"cluster":cluster,"subtopic":pairs[0][1]["subtopic"],"priority":priority,"priority_reasons":[f"{direct} direct results",f"{assoc} associations",f"site coverage {coverage}"],"evidence_count":len(evidence),"direct_results_count":direct,"associations_count":assoc,"total_frequency_evidence":total,"strongest_queries":strongest,"site_coverage":coverage,"recommended_action":action,"rationale":"Wordstat frequencies are overlapping evidence signals, not market size or unique users."}
  db.add(Opportunity(title=cluster.replace("_"," ").title(),status=status,summary=payload["rationale"],evidence=payload))
 db.commit(); built=db.scalars(select(Opportunity).where(Opportunity.status==status)).all(); scan.opportunity_count=len(built);scan.status="OPPORTUNITIES_BUILT";scan.completed_at=__import__("datetime").datetime.now(__import__("datetime").UTC);db.commit();return OpportunityList(sample_scope="opportunities detected in this Market Scan sample",items=[_view(x) for x in built])

@router.get("/api/opportunities",response_model=OpportunityList)
def list_opportunities(priority:str|None=Query(None),opportunity_type:str|None=Query(None),status:str|None=Query(None),cluster:str|None=Query(None),db:Session=Depends(get_db)):
 rows=db.scalars(select(Opportunity).order_by(Opportunity.id)).all(); items=[_view(x) for x in rows if (not status or x.status==status)]; items=[x for x in items if (not priority or x.priority==priority) and (not opportunity_type or x.opportunity_type==opportunity_type) and (not cluster or x.cluster==cluster)]; return OpportunityList(items=items)
