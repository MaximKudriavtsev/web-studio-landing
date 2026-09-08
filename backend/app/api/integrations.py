from fastapi import APIRouter

from app.collectors.wordstat import WordstatClient, WordstatError
from app.config import get_settings
from app.providers.gigachat import GigaChatClient, GigaChatError
from app.schemas.system import IntegrationCheckResponse, IntegrationResponse, IntegrationStatus

router = APIRouter(prefix="/api", tags=["integrations"])
_wordstat_verified_status: str | None = None
_gigachat_verified_status: str | None = None


def wordstat_status() -> str:
    settings = get_settings()
    if not settings.wordstat_configured:
        return "NOT_CONFIGURED"
    return _wordstat_verified_status or "CONFIGURED"


def gigachat_status() -> str:
    settings = get_settings()
    if not settings.gigachat_configured:
        return "NOT_CONFIGURED"
    return _gigachat_verified_status or "CONFIGURED"


@router.get("/integrations", response_model=IntegrationResponse)
def integrations() -> IntegrationResponse:
    return IntegrationResponse(integrations=[
        IntegrationStatus(name="GigaChat", status=gigachat_status()),
        IntegrationStatus(name="Wordstat", status=wordstat_status()),
        IntegrationStatus(name="Webmaster", status="NOT_CONFIGURED"),
        IntegrationStatus(name="Metrika", status="NOT_CONFIGURED"),
    ])


@router.post("/integrations/wordstat/check", response_model=IntegrationCheckResponse)
def check_wordstat() -> IntegrationCheckResponse:
    global _wordstat_verified_status
    settings = get_settings()
    if not settings.wordstat_configured:
        _wordstat_verified_status = None
        return IntegrationCheckResponse(integration="Wordstat", status="NOT_CONFIGURED")

    client = WordstatClient(
        settings.wordstat_api_key,
        settings.yandex_folder_id,
        max_requests=settings.wordstat_max_requests_per_run,
    )
    try:
        client.get_regions_tree()
    except WordstatError as exc:
        _wordstat_verified_status = "ERROR"
        return IntegrationCheckResponse(integration="Wordstat", status="ERROR", message=str(exc))
    finally:
        client.close()

    _wordstat_verified_status = "CONNECTED"
    return IntegrationCheckResponse(integration="Wordstat", status="CONNECTED")


@router.post("/integrations/gigachat/check", response_model=IntegrationCheckResponse)
def check_gigachat() -> IntegrationCheckResponse:
    global _gigachat_verified_status
    settings = get_settings()
    if not settings.gigachat_configured:
        _gigachat_verified_status = None
        return IntegrationCheckResponse(integration="GigaChat", status="NOT_CONFIGURED")
    client = GigaChatClient(
        settings.gigachat_client_id,
        settings.gigachat_client_secret,
        scope=settings.gigachat_scope,
        model=settings.gigachat_model,
    )
    try:
        models = client.check()
    except GigaChatError as exc:
        _gigachat_verified_status = "ERROR"
        return IntegrationCheckResponse(integration="GigaChat", status="ERROR", message=str(exc))
    finally:
        client.close()
    _gigachat_verified_status = "CONNECTED"
    warning = None
    if settings.gigachat_model not in models:
        warning = "Configured GigaChat model is not available; select an available model before analysis"
    return IntegrationCheckResponse(
        integration="GigaChat",
        status="CONNECTED",
        models=models,
        warning=warning,
    )
