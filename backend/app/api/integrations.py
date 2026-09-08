from fastapi import APIRouter

from app.schemas.system import IntegrationResponse, IntegrationStatus

router = APIRouter(prefix="/api", tags=["integrations"])


@router.get("/integrations", response_model=IntegrationResponse)
def integrations() -> IntegrationResponse:
    return IntegrationResponse(integrations=[
        IntegrationStatus(name="GigaChat", status="NOT_CONFIGURED"),
        IntegrationStatus(name="Wordstat", status="NOT_CONFIGURED"),
        IntegrationStatus(name="Webmaster", status="NOT_CONFIGURED"),
        IntegrationStatus(name="Metrika", status="NOT_CONFIGURED"),
    ])
