from enum import Enum
from pydantic import BaseModel

class OpportunityType(str, Enum):
    CONTENT_GAP="CONTENT_GAP"; SERVICE_GAP="SERVICE_GAP"; EXISTING_PAGE_IMPROVEMENT="EXISTING_PAGE_IMPROVEMENT"; INFORMATIONAL_CONTENT="INFORMATIONAL_CONTENT"; WATCH_TOPIC="WATCH_TOPIC"
class SiteCoverage(str, Enum): NONE="NONE"; PARTIAL="PARTIAL"; STRONG="STRONG"
class RecommendedAction(str, Enum): CREATE_SERVICE_PAGE="CREATE_SERVICE_PAGE"; CREATE_ARTICLE="CREATE_ARTICLE"; IMPROVE_EXISTING_PAGE="IMPROVE_EXISTING_PAGE"; PROMOTE_EXISTING_SERVICE="PROMOTE_EXISTING_SERVICE"; WATCH="WATCH"; DO_NOTHING="DO_NOTHING"
class Priority(str, Enum): HIGH="HIGH"; MEDIUM="MEDIUM"; LOW="LOW"
class SitePageInventory(BaseModel):
    url:str; page_type:str; title:str; h1:str; description:str; business_topics:list[str]; offered_services:list[str]; target_intents:list[str]; source_file:str; active:bool
class OpportunityView(BaseModel):
    id:int; title:str; opportunity_type:str; cluster:str; subtopic:str; status:str; priority:str; priority_reasons:list[str]; evidence_count:int; total_frequency_evidence:int; strongest_queries:list[dict]; site_coverage:str; recommended_action:str; rationale:str; scan_id:int|None=None; direct_results_count:int=0; associations_count:int=0; service_line:str="OTHER"; platform:str="UNSPECIFIED"
class OpportunityList(BaseModel):
    sample_scope:str="opportunities detected in the current search-demand sample"; items:list[OpportunityView]
