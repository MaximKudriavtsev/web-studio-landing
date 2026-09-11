from collections.abc import Generator

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import BACKEND_DIR, get_settings


class Base(DeclarativeBase):
    pass


settings = get_settings()
if settings.database_url.startswith("sqlite:///./"):
    database_path = BACKEND_DIR / settings.database_url.removeprefix("sqlite:///./")
    database_path.parent.mkdir(parents=True, exist_ok=True)
    database_url = f"sqlite:///{database_path.as_posix()}"
else:
    database_url = settings.database_url

connect_args = {"check_same_thread": False} if database_url.startswith("sqlite") else {}
engine = create_engine(database_url, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def init_db() -> None:
    from app.models import entities  # noqa: F401
    Base.metadata.create_all(bind=engine)
    _add_search_intent_columns()
    _migrate_calibration_versioning()
    _add_strategic_scan_columns()


def _add_strategic_scan_columns() -> None:
    """Add Phase 6 metadata without rewriting historical local scans."""
    if not database_url.startswith("sqlite"):
        return
    inspector = inspect(engine)
    additions = {
        "market_scans": {
            "scan_type": "VARCHAR(30) DEFAULT 'BROAD'",
            "hypothesis_id": "INTEGER",
            "service_line": "VARCHAR(40)",
            "platform": "VARCHAR(40)",
        },
        "market_evidence": {"hypothesis_id": "INTEGER"},
    }
    with engine.begin() as connection:
        for table, columns in additions.items():
            existing = {column["name"] for column in inspector.get_columns(table)}
            for name, sql_type in columns.items():
                if name not in existing:
                    connection.execute(text(f"ALTER TABLE {table} ADD COLUMN {name} {sql_type}"))


def _add_search_intent_columns() -> None:
    """Additive compatibility for the pre-migration experimental SQLite database."""
    if not database_url.startswith("sqlite"):
        return
    existing = {column["name"] for column in inspect(engine).get_columns("search_intents")}
    additions = {
        "business_relevance": "VARCHAR(20)",
        "commerciality": "VARCHAR(20)",
        "cluster_name": "VARCHAR(250)",
        "disposition": "VARCHAR(40)",
        "reasoning": "TEXT",
    }
    with engine.begin() as connection:
        for name, sql_type in additions.items():
            if name not in existing:
                connection.execute(text(f"ALTER TABLE search_intents ADD COLUMN {name} {sql_type}"))


def _migrate_calibration_versioning() -> None:
    """Preserve the Phase 2.1 rows while replacing their one-row-only constraint with versioning."""
    if not database_url.startswith("sqlite"):
        return
    inspector = inspect(engine)
    if "search_intent_calibrations_v1_legacy" in inspector.get_table_names():
        with engine.begin() as connection:
            current_count = connection.execute(text("SELECT COUNT(*) FROM search_intent_calibrations")).scalar() or 0
            if current_count == 0:
                connection.execute(text("""
                    INSERT INTO search_intent_calibrations (
                        id, raw_query_id, calibration_version, model, normalized_query, intent,
                        primary_goal, business_relevance, commerciality, cluster_name, subtopic,
                        ambiguity, query_breadth, query_specificity, disposition, confidence,
                        reasoning, created_at, updated_at
                    )
                    SELECT id, raw_query_id, 'V1', 'GigaChat-3-Ultra', normalized_query, intent,
                        NULL, business_relevance, commerciality, cluster_name, subtopic,
                        ambiguity, NULL, query_specificity, disposition, confidence,
                        reasoning, created_at, updated_at
                    FROM search_intent_calibrations_v1_legacy
                """))
            connection.execute(text("DROP TABLE search_intent_calibrations_v1_legacy"))
        return
    if "search_intent_calibrations" not in inspector.get_table_names():
        return
    existing = {column["name"] for column in inspector.get_columns("search_intent_calibrations")}
    if {"calibration_version", "model", "primary_goal", "query_breadth"}.issubset(existing):
        return

    from app.models import SearchIntentCalibration

    legacy_indexes = [index["name"] for index in inspector.get_indexes("search_intent_calibrations")]
    with engine.begin() as connection:
        connection.execute(text("ALTER TABLE search_intent_calibrations RENAME TO search_intent_calibrations_v1_legacy"))
        for index_name in legacy_indexes:
            connection.execute(text(f'DROP INDEX IF EXISTS "{index_name}"'))
        SearchIntentCalibration.__table__.create(bind=connection, checkfirst=False)
        connection.execute(text("""
            INSERT INTO search_intent_calibrations (
                id, raw_query_id, calibration_version, model, normalized_query, intent,
                primary_goal, business_relevance, commerciality, cluster_name, subtopic,
                ambiguity, query_breadth, query_specificity, disposition, confidence,
                reasoning, created_at, updated_at
            )
            SELECT id, raw_query_id, 'V1', 'GigaChat-3-Ultra', normalized_query, intent,
                NULL, business_relevance, commerciality, cluster_name, subtopic,
                ambiguity, NULL, query_specificity, disposition, confidence,
                reasoning, created_at, updated_at
            FROM search_intent_calibrations_v1_legacy
        """))
        connection.execute(text("DROP TABLE search_intent_calibrations_v1_legacy"))


def get_db() -> Generator[Session, None, None]:
    with SessionLocal() as session:
        yield session
