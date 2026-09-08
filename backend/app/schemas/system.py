from typing import Literal

from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: Literal["ok"]
    service: str


class IntegrationStatus(BaseModel):
    name: str
    status: Literal["NOT_CONFIGURED", "CONFIGURED", "CONNECTED", "ERROR"]


class IntegrationResponse(BaseModel):
    integrations: list[IntegrationStatus]


class IntegrationCheckResponse(BaseModel):
    integration: Literal["Wordstat"]
    status: Literal["NOT_CONFIGURED", "CONNECTED", "ERROR"]
    message: str | None = None
