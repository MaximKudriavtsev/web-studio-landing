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


def get_db() -> Generator[Session, None, None]:
    with SessionLocal() as session:
        yield session
