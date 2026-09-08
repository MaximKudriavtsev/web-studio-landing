from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.health import router as health_router
from app.api.integrations import router as integrations_router
from app.api.intelligence import router as intelligence_router
from app.api.wordstat import router as wordstat_router
from app.config import get_settings
from app.db import init_db
from app.scheduler import start_scheduler, stop_scheduler


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    start_scheduler()
    yield
    stop_scheduler()


settings = get_settings()
app = FastAPI(title="КОТ ДЕЛА AI Growth Engine", version="0.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
app.include_router(health_router)
app.include_router(integrations_router)
app.include_router(intelligence_router)
app.include_router(wordstat_router)
