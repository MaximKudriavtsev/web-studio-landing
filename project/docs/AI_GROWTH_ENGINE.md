# AI Growth Engine

AI Growth Engine помогает бизнесу адаптироваться к актуальному рыночному спросу. Цикл: данные рынка → search intent → semantic clustering → trends → opportunities → предложение действия → approval → публикация → измерение → обратная связь.

Допустимые будущие действия: `CREATE_ARTICLE`, `CREATE_SERVICE`, `CREATE_LANDING`, `CREATE_FAQ`, `PROMOTE_HOME`, `UPDATE_SERVICE`, `UPDATE_CTA`, `ADD_INTERNAL_LINKS`, `WATCH`, `DO_NOTHING`.

Текущая стадия — MARKET_SCAN_ADVISORY. Реализован scan-scoped путь Wordstat evidence → semantic deduplication → production V2 intelligence → dynamic repository coverage → guarded Opportunity. Частотности могут пересекаться и служат только evidence. Автоматическое изменение production отсутствует; все действия требуют approval.

Первая выборка Wordstat показала, что частотные результаты содержат коммерческий спрос вместе с DIY, информационными и нерелевантными значениями. Поэтому LLM классифицирует смысл, а частотность остаётся evidence, но не самостоятельным opportunity score.
# Phase 5: Service-Line Intelligence

Semantic taxonomy не дробится под каждую услугу. Детерминированный слой добавляет `service_line` (`GENERAL_WEBSITE`, `CORPORATE_WEBSITE`, `ECOMMERCE`, `WEB_APPLICATION`, `PERSONAL_ACCOUNT`, `BUSINESS_AUTOMATION`, `UX_UI`, `REDESIGN`, `OTHER`) и независимую `platform` (`YANDEX_KIT`, `BITRIX`, `TILDA`, `WORDPRESS`, `CUSTOM`, `UNSPECIFIED`, `OTHER`).

`POST /api/opportunities/build/{scan_id}/v2` создаёт новую service-line build version из сохранённого intelligence. `GET /api/strategy/hypotheses` возвращает отдельно стратегические направления; `GET /api/strategy/seed-packs/yandex-kit` показывает подготовленный, но не запущенный seed pack.

Любая будущая `CREATE_SERVICE_PAGE` или `CREATE_ARTICLE` обязана пройти `project/design/SITE_DESIGN_CONTRACT.json` и состояния `PROPOSED → CONTENT_APPROVED → GENERATED_PREVIEW → VISUAL_REVIEW → SEO_REVIEW → APPROVED_FOR_MERGE`. Недостающий визуальный primitive требует явного approval через `DESIGN_EXTENSION_REQUIRED`.

## Phase 6: Yandex KIT Strategic Scan

`POST /api/strategy/hypotheses/{id}/scans` создаёт изолированный strategic scan с максимум пятью Wordstat requests. `/api/strategy/scans/{id}/analyze` обрабатывает только его новые queries моделью GigaChat-3-Ultra, а `/conclude` сохраняет единственный advisory result и обновляет evidence status гипотезы.

Scan 2: 5 seeds, 112 evidence rows, 99 unique queries, 50 direct results, 62 associations и 7 intelligence batches. Intent distribution: LEARN 46, FIND_TOOL 50, BUY_SERVICE 2, OTHER 1. Оба BUY_SERVICE результата оказались нерелевантными самой услуге; достаточных direct commercial service-action signals нет. 16 direct informational signals обосновали `CREATE_ARTICLE / VALIDATED_FOR_CONTENT_RESEARCH`. Частотности Wordstat пересекаются и используются только как evidence signals, не как рынок или unique users.
