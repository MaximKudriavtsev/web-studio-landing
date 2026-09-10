# AI Growth Engine

AI Growth Engine помогает бизнесу адаптироваться к актуальному рыночному спросу. Цикл: данные рынка → search intent → semantic clustering → trends → opportunities → предложение действия → approval → публикация → измерение → обратная связь.

Допустимые будущие действия: `CREATE_ARTICLE`, `CREATE_SERVICE`, `CREATE_LANDING`, `CREATE_FAQ`, `PROMOTE_HOME`, `UPDATE_SERVICE`, `UPDATE_CTA`, `ADD_INTERNAL_LINKS`, `WATCH`, `DO_NOTHING`.

Текущая стадия — MARKET_SCAN_ADVISORY. Реализован scan-scoped путь Wordstat evidence → semantic deduplication → production V2 intelligence → dynamic repository coverage → guarded Opportunity. Частотности могут пересекаться и служат только evidence. Автоматическое изменение production отсутствует; все действия требуют approval.

Первая выборка Wordstat показала, что частотные результаты содержат коммерческий спрос вместе с DIY, информационными и нерелевантными значениями. Поэтому LLM классифицирует смысл, а частотность остаётся evidence, но не самостоятельным opportunity score.
