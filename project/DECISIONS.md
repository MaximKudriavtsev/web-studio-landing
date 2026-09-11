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

## Decision 014 — Scan-scoped market evidence

Каждый Market Scan имеет собственный ID. Phrase дедуплицируется внутри scan в MarketQuery, а каждое появление из seed/result/association сохраняется отдельным MarketEvidence. Production intelligence не имеет exact-44 ограничения и пишет versioned MarketIntelligence. Opportunities не смешивают scans; association не может самостоятельно дать HIGH, а одиночный BUY_SERVICE не создаёт service page.

## Decision 015 — Service line и platform не расширяют top-level taxonomy

Закрытая semantic taxonomy остаётся широкой. После semantic analysis детерминированный router независимо вычисляет продаваемую `service_line` и технологическую `platform`. Scan opportunities V2 агрегируются по этим измерениям и не перезаписывают предыдущие build versions.

## Decision 016 — Стратегические направления отделены от market evidence

`StrategicHypothesis` может существовать до исследования, но не становится `Opportunity` без evidence. Направление Яндекс KIT имеет статус `RESEARCH_REQUIRED`; seed pack зарегистрирован, но не запускался.

## Decision 017 — Генерация подчиняется Site Design Contract

Страница может собираться только из текущих tokens/components/layouts. Запрос недостающего primitive возвращает `DESIGN_EXTENSION_REQUIRED`; новые fonts, brand colors, button/radius/shadow systems, Header/Footer, navigation, container width и global spacing запрещены без approval.

## Decision 018 — Strategic scans и conclusions изолированы

Strategic Market Scan имеет `scan_type=STRATEGIC`, обязательную связь с hypothesis, service line и platform. Evidence также хранит hypothesis provenance. Conclusion не создаёт обычную opportunity или страницу: он выдаёт только `CREATE_SERVICE_PAGE`, `CREATE_ARTICLE`, `BOTH`, `WATCH` либо `DO_NOTHING` и обновляет advisory evidence status гипотезы.

## Decision 019 — Commercial strategic signal требует действия

HIGH relevance и MEDIUM/HIGH commerciality недостаточны для service recommendation, если запрос остаётся `LEARN/WATCH`. Помимо direct Yandex KIT и ECOMMERCE context требуется `BUY_SERVICE` либо явный service-action marker: создание, настройка, запуск, SEO, продвижение или разработка. Это защищает от превращения общего интереса к платформе в ложную service opportunity.
