# Changelog

## Unreleased — Foundation

- Добавлена постоянная проектная память.
- Добавлен локальный FastAPI/SQLAlchemy/SQLite backend skeleton.
- Добавлены health API и registry статусов интеграций.
- Подготовлен технический frontend route `/ai`.
- Реальные внешние интеграции и production deployment не выполнялись.

## Unreleased — Phase 1 Market Data

- Добавлен типизированный Wordstat REST adapter с API-key authentication, timeout, ограниченными retry и безопасными ошибками.
- Добавлены ручная проверка подключения и технические endpoints GetTop/GetDynamics.
- GetTop сохраняется в `RawSearchQuery`; временной ряд — в новой таблице `SearchDemandPoint`.
- Добавлены восемь bootstrap seed topics с provenance.
- `/ai` показывает статус Wordstat, проверку подключения и тестовую форму при `CONNECTED`.
- Scheduler не выполняет Wordstat jobs; реальные credentials и реальные запросы отсутствуют.
- `npm audit`: transitive `nanoid@3.3.16` имеет high advisory `GHSA-2v37-7h3g-55p8`. Он входит в dev toolchain через `postcss` → `vite`; production runtime сайта его не импортирует. Автоисправление не выполнялось.

## Unreleased — Phase 2 AI Intelligence

- Добавлен безопасный OAuth provider GigaChat и integration check.
- Добавлены типизированные intent, relevance, commerciality, cluster и disposition schemas.
- Добавлен пакетный анализ существующих RawSearchQuery с одним retry для invalid structured output.
- Расширена `SearchIntent`; добавлена недеструктивная SQLite-совместимость для существующей базы.
- Добавлены analyze-existing и queries preview API без scheduler automation.
- `/ai` показывает Search Intelligence summary, фильтры и preview table.
- Первый Wordstat sample подтвердил semantic noise: игровые, DIY, фото-инструменты и информационные запросы смешаны с коммерческим спросом.
- Реальный GigaChat-анализ не выполнялся: credentials `NOT_CONFIGURED`.
- OAuth token endpoint приведён к `ngw.devices.sberbank.ru:9443/api/v2/oauth`; model API остаётся на `api.giga.chat/v1`.
- Integration check безопасно возвращает ID реально доступных моделей и предупреждает, если configured model отсутствует.
- Добавлена безопасная поддержка дополнительного CA bundle для GigaChat поверх стандартного SSL trust store; локальные сертификаты исключены из Git.
- GigaChat HTTP client изолирован от environment-aware HTTPX path через `trust_env=False`; TLS verification и дополнительный CA остаются обязательными.
- Реальная проверка GigaChat подтверждена: OAuth и `GET /v1/models` вернули HTTP 200, configured model доступна; `chat/completions` не выполнялся.
- Добавлен Phase 2.1 calibration mode: закрытая taxonomy из восьми кластеров, `subtopic`, `ambiguity`, `query_specificity` и валидируемый opportunity gate.
- Calibrated results хранятся отдельно от исходного `SearchIntent`; повторная calibration блокируется, RawSearchQuery evidence не изменяется.
- Первый controlled calibration run на GigaChat-3-Ultra обработал 44/44 строк: 35 → 3 top-level clusters, 15 disposition changes. Зафиксирован calibration gap — чрезмерная концентрация в `WEB_DEVELOPMENT_SERVICES`; переход к Opportunity Engine отложен.
- Добавлен Semantic Routing V2: `primary_goal`, независимый `query_breadth`, deterministic routing precedence и отдельный disposition gate.
- Calibration storage мигрирован на versioning с уникальностью `(raw_query_id, calibration_version)`; существующие 44 V1 сохранены, рядом добавлены 44 V2.
- Единственный V2 run на GigaChat-3-Ultra использовал 7 из 8 taxonomy clusters; распределение disposition: 4 opportunity, 16 watch, 24 ignore. Новых Wordstat-запросов не выполнялось.
- Добавлены repository-based SitePageInventory, idempotent `POST /api/opportunities/build`, фильтруемый `GET /api/opportunities` и `GET /api/site-inventory`.
- Первый V2-only Opportunity Build создал 5 агрегированных advisory opportunities; IGNORE не создаёт активных записей, исходные evidence не изменяются.
- Технический `/ai` дополнен блоком Growth Opportunities с priority, coverage, evidence, action и явным sample-scope disclaimer.
