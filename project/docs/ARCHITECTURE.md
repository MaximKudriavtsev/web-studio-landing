# Архитектура

Frontend остаётся статическим React SPA. AI Growth Engine — отдельное локальное FastAPI-приложение с SQLAlchemy и SQLite. Слои API, providers, collectors, intelligence и actions разделены. Database URL задаётся конфигурацией, поэтому SQLite можно позже заменить PostgreSQL без изменения бизнес-логики.

Scheduler запускается вместе с backend, но на FOUNDATION не содержит внешних jobs. Frontend обращается к backend по `VITE_AI_API_URL` (по умолчанию `http://localhost:8000`).

## Wordstat Phase 1

`collectors/wordstat.py` инкапсулирует официальный REST API, authentication, timeout, retry, request budget и преобразование ответов в Pydantic schemas. API layer инициирует только явные запросы. GetTop сохраняет отдельные result/association записи в `RawSearchQuery`; request provenance остаётся в `source_payload`. GetDynamics раскладывает каждый период в строку `SearchDemandPoint`, пригодную для последующей SQL-аналитики.

Bootstrap seeds хранятся отдельно в `backend/data/bootstrap_seeds.json` и не являются копией production content. Scheduler намеренно не содержит Wordstat jobs.

## GigaChat Phase 2

`providers/gigachat.py` получает короткоживущий OAuth token из Client ID/Secret, не логирует credentials/token и вызывает structured output `chat/completions`. `schemas/intelligence.py` ограничивает словари enum-значениями и confidence диапазоном 0–1. Batch size конфигурируется и ограничивается 20 фразами.

`POST /api/intelligence/analyze-existing` выбирает только RawSearchQuery без SearchIntent, поэтому повторный запуск не создаёт дубли. Валидный batch сохраняется транзакционно; invalid output получает один retry, затем batch отмечается ошибкой без записи. `GET /api/intelligence/queries` формирует summary и фильтрованный preview. Scheduler в этом контуре не используется.

GigaChat TLS использует `ssl.create_default_context()` и при наличии `AI_GIGACHAT_CA_BUNDLE` добавляет локальный доверенный CA через `load_verify_locations()`. Системные CA сохраняются, certificate verification остаётся обязательной. `verify=False`, `CERT_NONE` и insecure fallback отсутствуют.

GigaChat-specific `httpx.Client` создаётся с `trust_env=False`. Это локализованное решение для Windows-окружения, где environment-aware HTTPX path стабильно завершался `ConnectTimeout`, а прямой HTTPX path с тем же SSLContext успешно достигал API. Настройка не отключает и не обходит системный VPN/TUN, не ослабляет TLS и не отменяет проверку дополнительного CA; она исключает только environment variables/configuration из сетевого пути этого HTTPX client.
