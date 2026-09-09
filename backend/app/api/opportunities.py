from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import Opportunity, RawSearchQuery, SearchIntentCalibration
from app.schemas.opportunities import OpportunityList, OpportunityView, SitePageInventory

router=APIRouter(tags=["opportunities"])
SCOPE="opportunities detected in the current search-demand sample"
INVENTORY=[
 SitePageInventory(url="/#services",page_type="service_section",title="Сайты для бизнеса",h1="Делаем digital, который делает дело.",description="Лендинги, корпоративные сайты и магазины — от структуры до публикации.",business_topics=["website development","corporate/business websites"],offered_services=["лендинги","корпоративные сайты","магазины","индивидуальная разработка"],target_intents=["BUY_SERVICE"],source_file="src/content/site.ts",active=True),
 SitePageInventory(url="/#services",page_type="service_section",title="Приложения и кабинеты",h1="Делаем digital, который делает дело.",description="Личные кабинеты, CRM, ERP и внутренние сервисы.",business_topics=["web applications / personal accounts"],offered_services=["web-приложения","API-интеграции","автоматизация"],target_intents=["BUY_SERVICE"],source_file="src/content/site.ts",active=True),
 SitePageInventory(url="/#services",page_type="service_section",title="UX/UI и дизайн-системы",h1="Делаем digital, который делает дело.",description="Сценарии, прототипы и визуальный язык продукта.",business_topics=["UX/UI"],offered_services=["исследование","прототип","дизайн интерфейса","дизайн-системы"],target_intents=["BUY_SERVICE"],source_file="src/content/site.ts",active=True),
 SitePageInventory(url="/#services",page_type="service_section",title="Редизайн и развитие",h1="Делаем digital, который делает дело.",description="Внешний вид, мобильная версия, скорость и конверсия.",business_topics=["redesign","promotion/development"],offered_services=["аудит","редизайн","поддержка"],target_intents=["BUY_SERVICE"],source_file="src/content/site.ts",active=True),
]

def _view(row):
 p=row.evidence or {}; return OpportunityView(id=row.id,title=row.title,opportunity_type=p["opportunity_type"],cluster=p["cluster"],subtopic=p["subtopic"],status=row.status,priority=p["priority"],priority_reasons=p["priority_reasons"],evidence_count=p["evidence_count"],total_frequency_evidence=p["total_frequency_evidence"],strongest_queries=p["strongest_queries"],site_coverage=p["site_coverage"],recommended_action=p["recommended_action"],rationale=p["rationale"])

@router.get("/api/site-inventory",response_model=list[SitePageInventory])
def inventory(): return INVENTORY

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

@router.get("/api/opportunities",response_model=OpportunityList)
def list_opportunities(priority:str|None=Query(None),opportunity_type:str|None=Query(None),status:str|None=Query(None),cluster:str|None=Query(None),db:Session=Depends(get_db)):
 rows=db.scalars(select(Opportunity).order_by(Opportunity.id)).all(); items=[_view(x) for x in rows if (not status or x.status==status)]; items=[x for x in items if (not priority or x.priority==priority) and (not opportunity_type or x.opportunity_type==opportunity_type) and (not cluster or x.cluster==cluster)]; return OpportunityList(items=items)
