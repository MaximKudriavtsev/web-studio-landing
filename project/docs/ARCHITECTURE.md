# Архитектура

Frontend остаётся статическим React SPA. AI Growth Engine — отдельное локальное FastAPI-приложение с SQLAlchemy и SQLite. Слои API, providers, collectors, intelligence и actions разделены. Database URL задаётся конфигурацией, поэтому SQLite можно позже заменить PostgreSQL без изменения бизнес-логики.

Scheduler запускается вместе с backend, но на FOUNDATION не содержит внешних jobs. Frontend обращается к backend по `VITE_AI_API_URL` (по умолчанию `http://localhost:8000`).

## Wordstat Phase 1

`collectors/wordstat.py` инкапсулирует официальный REST API, authentication, timeout, retry, request budget и преобразование ответов в Pydantic schemas. API layer инициирует только явные запросы. GetTop сохраняет отдельные result/association записи в `RawSearchQuery`; request provenance остаётся в `source_payload`. GetDynamics раскладывает каждый период в строку `SearchDemandPoint`, пригодную для последующей SQL-аналитики.

Bootstrap seeds хранятся отдельно в `backend/data/bootstrap_seeds.json` и не являются копией production content. Scheduler намеренно не содержит Wordstat jobs.
