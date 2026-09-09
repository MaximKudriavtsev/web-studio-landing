# Архитектурные решения

## Decision 001 — Отдельный backend-контур

AI Growth Engine создаётся отдельно от React frontend из-за секретов, background jobs, database, API integrations и автономных процессов.

## Decision 002 — Локальный MVP

MVP запускается на ноутбуке, а не на production hosting: это безопасный эксперимент, не создающий риск для действующего сайта и слабого/shared hosting.

## Decision 003 — Простой стек MVP

FastAPI, SQLite, SQLAlchemy и scheduler. На первом этапе без Docker, Redis, PostgreSQL, LangGraph и микросервисов.

## Decision 004 — Только APPROVAL

AI не изменяет production автоматически. Первый режим — `APPROVAL`.

## Decision 005 — Первый внешний контур

Первый контур исследования — `Wordstat + GigaChat`. Webmaster и Metrika подключаются позднее как feedback/measurement layer.

## Decision 006 — Граница применения LLM

Обычный код выполняет арифметику, проценты и baseline calculations. LLM используется для смысла, intents, clustering, интерпретации, ограниченных решений и генерации контента.

## Decision 007 — Markdown как постоянная память

Все существенные решения и изменения фиксируются в Markdown-документации проекта.

## Decision 008 — Wordstat только по явному запросу

Wordstat не подключается к scheduler на Phase 1. Каждый внешний запрос инициируется явно, а client ограничивает количество HTTP-попыток параметром `AI_WORDSTAT_MAX_REQUESTS_PER_RUN` с безопасным default 5. Это ограничивает расходы и исключает незаметный crawler.

## Decision 009 — Типизированный пакетный intelligence

GigaChat получает группы до `AI_GIGACHAT_BATCH_SIZE` запросов и возвращает JSON Schema output, валидируемый Pydantic. На невалидный ответ допускается один controlled retry; испорченный batch не сохраняется. Частотность передаётся только как evidence и не определяет opportunity автоматически.

## Decision 010 — Изолированный сетевой путь GigaChat

GigaChat-specific `httpx.Client` использует `trust_env=False`, потому что на текущем локальном Windows-окружении environment-aware HTTPX path приводит к `ConnectTimeout`, а прямой path с тем же проверяющим SSLContext достигает API. Решение не меняет Windows VPN/TUN или proxy settings, не отключает TLS verification и не обходит проверку CA; оно отключает только применение HTTPX environment variables/configuration для этого клиента.

## Decision 011 — Calibration как отдельный immutable experiment

Повторная intelligence-классификация не перезаписывает baseline `SearchIntent`: calibrated results сохраняются в `SearchIntentCalibration`. Endpoint требует ровно 44 baseline rows, запрещает повторную запись одной версии и использует закрытую taxonomy из восьми top-level clusters. `subtopic` остаётся конкретным, а opportunity gate валидируется Pydantic независимо от ответа модели.

## Decision 012 — Semantic analysis, routing и disposition разделены

GigaChat V2 определяет только primary goal и semantic attributes. Закрытый deterministic router применяет документированный precedence к восьми taxonomy clusters, после чего отдельный gate вычисляет disposition. Calibration version хранится вместе с model; уникальность `(raw_query_id, calibration_version)` позволяет сравнивать V1/V2 без перезаписи.

## Decision 013 — Opportunities только из V2 и repository inventory

Opportunity Engine агрегирует только non-IGNORE V2 evidence и сопоставляет его со статическим inventory, извлечённым из текущего repository без crawler. Build идемпотентен по `PROPOSED_V1`, priority дискретна и объяснима, а вывод всегда ограничен формулировкой «opportunities detected in the current search-demand sample».
