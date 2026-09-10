# AI Growth Engine

AI Growth Engine помогает бизнесу адаптироваться к актуальному рыночному спросу. Цикл: данные рынка → search intent → semantic clustering → trends → opportunities → предложение действия → approval → публикация → измерение → обратная связь.

Допустимые будущие действия: `CREATE_ARTICLE`, `CREATE_SERVICE`, `CREATE_LANDING`, `CREATE_FAQ`, `PROMOTE_HOME`, `UPDATE_SERVICE`, `UPDATE_CTA`, `ADD_INTERNAL_LINKS`, `WATCH`, `DO_NOTHING`.

Текущая стадия — MARKET_SCAN_ADVISORY. Реализован scan-scoped путь Wordstat evidence → semantic deduplication → production V2 intelligence → dynamic repository coverage → guarded Opportunity. Частотности могут пересекаться и служат только evidence. Автоматическое изменение production отсутствует; все действия требуют approval.

Первая выборка Wordstat показала, что частотные результаты содержат коммерческий спрос вместе с DIY, информационными и нерелевантными значениями. Поэтому LLM классифицирует смысл, а частотность остаётся evidence, но не самостоятельным opportunity score.
# Phase 5: Service-Line Intelligence

Semantic taxonomy не дробится под каждую услугу. Детерминированный слой добавляет `service_line` (`GENERAL_WEBSITE`, `CORPORATE_WEBSITE`, `ECOMMERCE`, `WEB_APPLICATION`, `PERSONAL_ACCOUNT`, `BUSINESS_AUTOMATION`, `UX_UI`, `REDESIGN`, `OTHER`) и независимую `platform` (`YANDEX_KIT`, `BITRIX`, `TILDA`, `WORDPRESS`, `CUSTOM`, `UNSPECIFIED`, `OTHER`).

`POST /api/opportunities/build/{scan_id}/v2` создаёт новую service-line build version из сохранённого intelligence. `GET /api/strategy/hypotheses` возвращает отдельно стратегические направления; `GET /api/strategy/seed-packs/yandex-kit` показывает подготовленный, но не запущенный seed pack.

Любая будущая `CREATE_SERVICE_PAGE` или `CREATE_ARTICLE` обязана пройти `project/design/SITE_DESIGN_CONTRACT.json` и состояния `PROPOSED → CONTENT_APPROVED → GENERATED_PREVIEW → VISUAL_REVIEW → SEO_REVIEW → APPROVED_FOR_MERGE`. Недостающий визуальный primitive требует явного approval через `DESIGN_EXTENSION_REQUIRED`.
