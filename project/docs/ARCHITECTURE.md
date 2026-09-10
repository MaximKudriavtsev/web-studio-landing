# Архитектура

Frontend остаётся статическим React SPA. AI Growth Engine — отдельное локальное FastAPI-приложение с SQLAlchemy и SQLite. Слои API, providers, collectors, intelligence и actions разделены. Database URL задаётся конфигурацией, поэтому SQLite можно позже заменить PostgreSQL без изменения бизнес-логики.

Scheduler запускается вместе с backend, но на FOUNDATION не содержит внешних jobs. Frontend обращается к backend по `VITE_AI_API_URL` (по умолчанию `http://localhost:8000`).

## Service-Line Intelligence

Top-level taxonomy отвечает за semantic domain. Пост-LLM router в `intelligence/service_routing.py` независимо выводит `service_line` и `platform` из phrase и сохранённого cluster. V2 opportunity build агрегирует `cluster + service_line + relevant platform`, сохраняет dimensions в intelligence payload и пишет новую build version, не изменяя историческую.

`StrategicHypothesis` — отдельная advisory entity. Она не участвует в Opportunity Engine до появления evidence. Seed registries также не запускают collector автоматически.

## Design Contract boundary

`project/design/SITE_DESIGN_CONTRACT.json` задаёт разрешённые tokens, components, layouts и проверки. Generation gate разрешает существующие primitives, отклоняет произвольные global style changes и возвращает `DESIGN_EXTENSION_REQUIRED` для отсутствующего компонента. Pipeline заканчивается `APPROVED_FOR_MERGE`; publish не автоматизирован.

## Wordstat Phase 1

`collectors/wordstat.py` инкапсулирует официальный REST API, authentication, timeout, retry, request budget и преобразование ответов в Pydantic schemas. API layer инициирует только явные запросы. GetTop сохраняет отдельные result/association записи в `RawSearchQuery`; request provenance остаётся в `source_payload`. GetDynamics раскладывает каждый период в строку `SearchDemandPoint`, пригодную для последующей SQL-аналитики.

Bootstrap seeds хранятся отдельно в `backend/data/bootstrap_seeds.json` и не являются копией production content. Scheduler намеренно не содержит Wordstat jobs.

## GigaChat Phase 2

`providers/gigachat.py` получает короткоживущий OAuth token из Client ID/Secret, не логирует credentials/token и вызывает structured output `chat/completions`. `schemas/intelligence.py` ограничивает словари enum-значениями и confidence диапазоном 0–1. Batch size конфигурируется и ограничивается 20 фразами.

`POST /api/intelligence/analyze-existing` выбирает только RawSearchQuery без SearchIntent, поэтому повторный запуск не создаёт дубли. Валидный batch сохраняется транзакционно; invalid output получает один retry, затем batch отмечается ошибкой без записи. `GET /api/intelligence/queries` формирует summary и фильтрованный preview. Scheduler в этом контуре не используется.

GigaChat TLS использует `ssl.create_default_context()` и при наличии `AI_GIGACHAT_CA_BUNDLE` добавляет локальный доверенный CA через `load_verify_locations()`. Системные CA сохраняются, certificate verification остаётся обязательной. `verify=False`, `CERT_NONE` и insecure fallback отсутствуют.

GigaChat-specific `httpx.Client` создаётся с `trust_env=False`. Это локализованное решение для Windows-окружения, где environment-aware HTTPX path стабильно завершался `ConnectTimeout`, а прямой HTTPX path с тем же SSLContext успешно достигал API. Настройка не отключает и не обходит системный VPN/TUN, не ослабляет TLS и не отменяет проверку дополнительного CA; она исключает только environment variables/configuration из сетевого пути этого HTTPX client.

## GigaChat Phase 2.1 Calibration

`POST /api/intelligence/calibrate-existing` — versioned экспериментальный reanalysis mode для ровно 44 существующих RawSearchQuery и 44 baseline SearchIntent. Он не вызывает Wordstat и не перезаписывает baseline. Результаты сохраняются в отдельной `SearchIntentCalibration` с unique constraint по `(raw_query_id, calibration_version)`; повтор той же версии получает conflict.

Calibrated schema ограничивает `cluster` восемью стабильными enum-категориями и отдельно хранит `subtopic`, `ambiguity` и `query_specificity`. Pydantic запрещает `OPPORTUNITY_CANDIDATE`, если relevance ниже MEDIUM, commerciality LOW или ambiguity HIGH. Высокая частотность не участвует в обходе gate.

## Semantic Routing V2

V2 просит LLM вернуть только `primary_goal`, backward-compatible intent, relevance, commerciality, subtopic, ambiguity, breadth, specificity, confidence и reasoning. `app/intelligence/routing.py` затем применяет precedence: irrelevant other → irrelevant tools → AI website tools → DIY/no-code → calibrated broad service terms → informational → niche product → design → verified service demand. `WEB_DEVELOPMENT_SERVICES` не используется как fallback.

Disposition вычисляется после routing. Opportunity требует BUY_SERVICE/уверенный HIRE_SPECIALIST, HIGH relevance, non-LOW commerciality, non-HIGH ambiguity и service cluster. Versioned calibration rows сохраняют V1 и V2 рядом; unique constraint запрещает дубли одной версии.

## Phase 3 Opportunity Engine

Site inventory строится без crawler из routes и `src/content/site.ts`. Четыре service sections на `/#services` покрывают business websites, web applications, UX/UI и redesign; отсутствие отдельных service pages означает PARTIAL coverage.

Opportunity builder читает только V2 non-IGNORE rows, агрегирует evidence по стабильному cluster, сопоставляет coverage и сохраняет `PROPOSED_V1` идемпотентно. Priority — HIGH/MEDIUM/LOW с причинами; high frequency без commercial evidence не даёт HIGH. Engine остаётся advisory/approval-only.

## Phase 4 Market Scan

MarketScan ограничивает один collection run существующим Wordstat budget (не более 5). MarketQuery дедуплицирует нормализованную phrase внутри scan, сохраняя каждое seed/source occurrence в MarketEvidence. Production V2 intelligence обрабатывает любое число новых query batch-wise и идемпотентно, не касаясь calibration history.

Scan Opportunity Build учитывает direct/association split и актуальный inventory из deterministic parser `src/content/site.ts`. `total_frequency_evidence` — сумма потенциально пересекающихся signals, не market size, demand или unique users. Association-only evidence не создаёт HIGH; один BUY_SERVICE evidence получает только WATCH.
