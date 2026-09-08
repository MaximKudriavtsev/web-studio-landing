from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    service_name: str = "kotdela-ai-growth-engine"
    environment: str = "LOCAL"
    stage: str = "FOUNDATION"
    database_url: str = "sqlite:///./data/ai_growth_engine.db"
    cors_origins: str = "http://localhost:5173"
    wordstat_api_key: str = ""
    yandex_folder_id: str = ""
    wordstat_max_requests_per_run: int = 5
    gigachat_client_id: str = Field(default="", validation_alias="GIGACHAT_CLIENT_ID")
    gigachat_client_secret: str = Field(default="", validation_alias="GIGACHAT_CLIENT_SECRET")
    gigachat_scope: str = "GIGACHAT_API_PERS"
    gigachat_model: str = "GigaChat-2-Max"
    gigachat_batch_size: int = 15
    gigachat_ca_bundle: str = ""
    model_config = SettingsConfigDict(env_file=BACKEND_DIR / ".env", env_prefix="AI_", extra="ignore")

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def wordstat_configured(self) -> bool:
        return bool(self.wordstat_api_key.strip() and self.yandex_folder_id.strip())

    @property
    def gigachat_configured(self) -> bool:
        return bool(self.gigachat_client_id.strip() and self.gigachat_client_secret.strip())


@lru_cache
def get_settings() -> Settings:
    return Settings()
