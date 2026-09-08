# Архитектура

Frontend остаётся статическим React SPA. AI Growth Engine — отдельное локальное FastAPI-приложение с SQLAlchemy и SQLite. Слои API, providers, collectors, intelligence и actions разделены. Database URL задаётся конфигурацией, поэтому SQLite можно позже заменить PostgreSQL без изменения бизнес-логики.

Scheduler запускается вместе с backend, но на FOUNDATION не содержит внешних jobs. Frontend обращается к backend по `VITE_AI_API_URL` (по умолчанию `http://localhost:8000`).
