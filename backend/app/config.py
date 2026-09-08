from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    service_name: str = "kotdela-ai-growth-engine"
    environment: str = "LOCAL"
    stage: str = "FOUNDATION"
    database_url: str = "sqlite:///./data/ai_growth_engine.db"
    cors_origins: str = "http://localhost:5173"
    model_config = SettingsConfigDict(env_file=BACKEND_DIR / ".env", env_prefix="AI_", extra="ignore")

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
