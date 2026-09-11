from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, JSON, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class RawSearchQuery(TimestampMixin, Base):
    __tablename__ = "raw_search_queries"
    id: Mapped[int] = mapped_column(primary_key=True)
    query: Mapped[str] = mapped_column(String(500), index=True)
    source: Mapped[str] = mapped_column(String(50), default="wordstat")
    demand: Mapped[int | None] = mapped_column(Integer)
    collected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    source_payload: Mapped[dict | None] = mapped_column(JSON)


class SearchDemandPoint(TimestampMixin, Base):
    __tablename__ = "search_demand_points"
    id: Mapped[int] = mapped_column(primary_key=True)
    phrase: Mapped[str] = mapped_column(String(500), index=True)
    source: Mapped[str] = mapped_column(String(50), default="wordstat", index=True)
    period: Mapped[str] = mapped_column(String(30), index=True)
    period_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    count: Mapped[int] = mapped_column(Integer)
    share: Mapped[float] = mapped_column(Float)
    regions: Mapped[list] = mapped_column(JSON, default=list)
    device: Mapped[str] = mapped_column(String(100))
    collected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)


class SearchIntent(TimestampMixin, Base):
    __tablename__ = "search_intents"
    id: Mapped[int] = mapped_column(primary_key=True)
    raw_query_id: Mapped[int | None] = mapped_column(ForeignKey("raw_search_queries.id"), index=True)
    intent: Mapped[str] = mapped_column(String(100), index=True)
    normalized_query: Mapped[str] = mapped_column(String(500))
    confidence: Mapped[float | None] = mapped_column(Float)
    business_relevance: Mapped[str | None] = mapped_column(String(20), index=True)
    commerciality: Mapped[str | None] = mapped_column(String(20))
    cluster_name: Mapped[str | None] = mapped_column(String(250), index=True)
    disposition: Mapped[str | None] = mapped_column(String(40), index=True)
    reasoning: Mapped[str | None] = mapped_column(Text)
    raw_query: Mapped[RawSearchQuery | None] = relationship()


class SearchIntentCalibration(TimestampMixin, Base):
    __tablename__ = "search_intent_calibrations"
    __table_args__ = (UniqueConstraint("raw_query_id", "calibration_version", name="uq_calibration_raw_version"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    raw_query_id: Mapped[int] = mapped_column(ForeignKey("raw_search_queries.id"), index=True)
    calibration_version: Mapped[str] = mapped_column(String(20), index=True)
    model: Mapped[str] = mapped_column(String(100))
    normalized_query: Mapped[str] = mapped_column(String(500))
    intent: Mapped[str] = mapped_column(String(100), index=True)
    primary_goal: Mapped[str | None] = mapped_column(String(40), index=True)
    business_relevance: Mapped[str] = mapped_column(String(20), index=True)
    commerciality: Mapped[str] = mapped_column(String(20))
    cluster_name: Mapped[str] = mapped_column(String(50), index=True)
    subtopic: Mapped[str] = mapped_column(String(250), index=True)
    ambiguity: Mapped[str] = mapped_column(String(20), index=True)
    query_breadth: Mapped[str | None] = mapped_column(String(20), index=True)
    query_specificity: Mapped[str] = mapped_column(String(20), index=True)
    disposition: Mapped[str] = mapped_column(String(40), index=True)
    confidence: Mapped[float] = mapped_column(Float)
    reasoning: Mapped[str] = mapped_column(Text)
    raw_query: Mapped[RawSearchQuery] = relationship()


class Trend(TimestampMixin, Base):
    __tablename__ = "trends"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(250), index=True)
    direction: Mapped[str] = mapped_column(String(30))
    score: Mapped[float | None] = mapped_column(Float)
    evidence: Mapped[dict | None] = mapped_column(JSON)


class Opportunity(TimestampMixin, Base):
    __tablename__ = "opportunities"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(250))
    status: Mapped[str] = mapped_column(String(30), default="NEW", index=True)
    score: Mapped[float | None] = mapped_column(Float)
    summary: Mapped[str | None] = mapped_column(Text)
    evidence: Mapped[dict | None] = mapped_column(JSON)


class MarketScan(TimestampMixin, Base):
    __tablename__ = "market_scans"
    id: Mapped[int] = mapped_column(primary_key=True)
    status: Mapped[str] = mapped_column(String(30), index=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    seed_count: Mapped[int] = mapped_column(Integer, default=0)
    wordstat_request_count: Mapped[int] = mapped_column(Integer, default=0)
    raw_evidence_count: Mapped[int] = mapped_column(Integer, default=0)
    unique_query_count: Mapped[int] = mapped_column(Integer, default=0)
    intelligence_count: Mapped[int] = mapped_column(Integer, default=0)
    opportunity_count: Mapped[int] = mapped_column(Integer, default=0)
    model: Mapped[str] = mapped_column(String(100))
    notes: Mapped[str | None] = mapped_column(Text)
    scan_type: Mapped[str] = mapped_column(String(30), default="BROAD", index=True)
    hypothesis_id: Mapped[int | None] = mapped_column(ForeignKey("strategic_hypotheses.id"), index=True)
    service_line: Mapped[str | None] = mapped_column(String(40), index=True)
    platform: Mapped[str | None] = mapped_column(String(40), index=True)


class MarketQuery(TimestampMixin, Base):
    __tablename__ = "market_queries"
    __table_args__ = (UniqueConstraint("scan_id", "normalized_phrase", name="uq_market_query_scan_phrase"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    scan_id: Mapped[int] = mapped_column(ForeignKey("market_scans.id"), index=True)
    phrase: Mapped[str] = mapped_column(String(500))
    normalized_phrase: Mapped[str] = mapped_column(String(500))


class MarketEvidence(TimestampMixin, Base):
    __tablename__ = "market_evidence"
    id: Mapped[int] = mapped_column(primary_key=True)
    scan_id: Mapped[int] = mapped_column(ForeignKey("market_scans.id"), index=True)
    market_query_id: Mapped[int] = mapped_column(ForeignKey("market_queries.id"), index=True)
    seed: Mapped[str] = mapped_column(String(500), index=True)
    source_type: Mapped[str] = mapped_column(String(30), index=True)
    phrase: Mapped[str] = mapped_column(String(500))
    demand: Mapped[int] = mapped_column(Integer)
    collected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    raw_payload: Mapped[dict] = mapped_column(JSON)
    hypothesis_id: Mapped[int | None] = mapped_column(ForeignKey("strategic_hypotheses.id"), index=True)


class MarketIntelligence(TimestampMixin, Base):
    __tablename__ = "market_intelligence"
    __table_args__ = (UniqueConstraint("market_query_id", "version", name="uq_market_intelligence_query_version"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    scan_id: Mapped[int] = mapped_column(ForeignKey("market_scans.id"), index=True)
    market_query_id: Mapped[int] = mapped_column(ForeignKey("market_queries.id"), index=True)
    version: Mapped[str] = mapped_column(String(20))
    model: Mapped[str] = mapped_column(String(100))
    payload: Mapped[dict] = mapped_column(JSON)


class StrategicHypothesis(TimestampMixin, Base):
    __tablename__ = "strategic_hypotheses"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(250), unique=True)
    service_line: Mapped[str] = mapped_column(String(40), index=True)
    platform: Mapped[str] = mapped_column(String(40), index=True)
    hypothesis_type: Mapped[str] = mapped_column(String(40), index=True)
    status: Mapped[str] = mapped_column(String(40), index=True)
    rationale: Mapped[str] = mapped_column(Text)
    evidence_status: Mapped[str] = mapped_column(String(40), index=True)


class StrategicConclusion(TimestampMixin, Base):
    __tablename__ = "strategic_conclusions"
    __table_args__ = (UniqueConstraint("scan_id", name="uq_strategic_conclusion_scan"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    scan_id: Mapped[int] = mapped_column(ForeignKey("market_scans.id"), index=True)
    hypothesis_id: Mapped[int] = mapped_column(ForeignKey("strategic_hypotheses.id"), index=True)
    decision: Mapped[str] = mapped_column(String(40), index=True)
    evidence_status: Mapped[str] = mapped_column(String(50), index=True)
    serp_status: Mapped[str] = mapped_column(String(40))
    rationale: Mapped[str] = mapped_column(Text)
    metrics: Mapped[dict] = mapped_column(JSON)


class AIAction(TimestampMixin, Base):
    __tablename__ = "ai_actions"
    id: Mapped[int] = mapped_column(primary_key=True)
    opportunity_id: Mapped[int | None] = mapped_column(ForeignKey("opportunities.id"), index=True)
    action_type: Mapped[str] = mapped_column(String(50), index=True)
    status: Mapped[str] = mapped_column(String(30), default="PROPOSED", index=True)
    reasoning: Mapped[str | None] = mapped_column(Text)
    payload: Mapped[dict | None] = mapped_column(JSON)
    opportunity: Mapped[Opportunity | None] = relationship()
