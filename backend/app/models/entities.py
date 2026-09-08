from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, JSON, String, Text, func
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


class AIAction(TimestampMixin, Base):
    __tablename__ = "ai_actions"
    id: Mapped[int] = mapped_column(primary_key=True)
    opportunity_id: Mapped[int | None] = mapped_column(ForeignKey("opportunities.id"), index=True)
    action_type: Mapped[str] = mapped_column(String(50), index=True)
    status: Mapped[str] = mapped_column(String(30), default="PROPOSED", index=True)
    reasoning: Mapped[str | None] = mapped_column(Text)
    payload: Mapped[dict | None] = mapped_column(JSON)
    opportunity: Mapped[Opportunity | None] = relationship()
