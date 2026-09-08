from typing import Literal

from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: Literal["ok"]
    service: str


class IntegrationStatus(BaseModel):
    name: str
    status: Literal["NOT_CONFIGURED"]


class IntegrationResponse(BaseModel):
    integrations: list[IntegrationStatus]
