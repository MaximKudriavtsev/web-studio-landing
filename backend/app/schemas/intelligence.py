from enum import Enum

from pydantic import BaseModel, Field, model_validator


class Intent(str, Enum):
    COMMERCIAL = "COMMERCIAL"
    INFORMATIONAL = "INFORMATIONAL"
    DIY = "DIY"
    NAVIGATIONAL = "NAVIGATIONAL"
    OTHER = "OTHER"


class Relevance(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    NONE = "NONE"


class Commerciality(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class Disposition(str, Enum):
    OPPORTUNITY_CANDIDATE = "OPPORTUNITY_CANDIDATE"
    WATCH = "WATCH"
    IGNORE = "IGNORE"


class ClusterTaxonomy(str, Enum):
    WEB_DEVELOPMENT_SERVICES = "WEB_DEVELOPMENT_SERVICES"
    WEB_DESIGN_UX = "WEB_DESIGN_UX"
    AI_WEBSITE_TOOLS = "AI_WEBSITE_TOOLS"
    DIY_NO_CODE = "DIY_NO_CODE"
    INFORMATIONAL_WEB_DEV = "INFORMATIONAL_WEB_DEV"
    NICHE_PRODUCT_DEVELOPMENT = "NICHE_PRODUCT_DEVELOPMENT"
    IRRELEVANT_TOOLS = "IRRELEVANT_TOOLS"
    IRRELEVANT_OTHER = "IRRELEVANT_OTHER"


class CalibrationLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class QueryInput(BaseModel):
    raw_query_id: int
    phrase: str
    demand: int | None
    source_type: str | None


class QueryIntelligence(BaseModel):
    raw_query_id: int
    normalized_query: str = Field(min_length=1, max_length=500)
    intent: Intent
    business_relevance: Relevance
    commerciality: Commerciality
    cluster_name: str = Field(min_length=1, max_length=250)
    disposition: Disposition
    confidence: float = Field(ge=0, le=1)
    reason: str = Field(min_length=1, max_length=1000)


class IntelligenceBatch(BaseModel):
    items: list[QueryIntelligence]


class CalibratedQueryIntelligence(BaseModel):
    raw_query_id: int
    normalized_query: str = Field(min_length=1, max_length=500)
    intent: Intent
    business_relevance: Relevance
    commerciality: Commerciality
    cluster: ClusterTaxonomy
    subtopic: str = Field(min_length=1, max_length=250)
    ambiguity: CalibrationLevel
    query_specificity: CalibrationLevel
    disposition: Disposition
    confidence: float = Field(ge=0, le=1)
    reason: str = Field(min_length=1, max_length=1000)

    @model_validator(mode="after")
    def enforce_opportunity_gate(self):
        if self.disposition == Disposition.OPPORTUNITY_CANDIDATE:
            if self.business_relevance not in {Relevance.HIGH, Relevance.MEDIUM}:
                raise ValueError("opportunity requires HIGH or MEDIUM business relevance")
            if self.commerciality == Commerciality.LOW:
                raise ValueError("opportunity requires non-LOW commerciality")
            if self.ambiguity == CalibrationLevel.HIGH:
                raise ValueError("high ambiguity cannot be an opportunity")
        return self


class CalibrationBatch(BaseModel):
    items: list[CalibratedQueryIntelligence]


class AnalyzeRequest(BaseModel):
    limit: int = Field(default=44, ge=1, le=44)


class AnalyzeSummary(BaseModel):
    processed: int
    batches: int
    opportunity_candidates: int
    watch: int
    ignored: int
    clusters: int
    errors: int = 0


class IntelligenceQueryView(BaseModel):
    raw_query_id: int
    phrase: str
    demand: int | None
    source_type: str | None
    intent: Intent
    business_relevance: Relevance
    commerciality: Commerciality
    cluster_name: str
    disposition: Disposition
    confidence: float


class IntelligenceQueryList(BaseModel):
    raw_queries: int
    analyzed: int
    ignored: int
    watch: int
    opportunity_candidates: int
    clusters: int
    items: list[IntelligenceQueryView]
