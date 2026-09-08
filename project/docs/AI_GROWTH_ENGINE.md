# AI Growth Engine

AI Growth Engine помогает бизнесу адаптироваться к актуальному рыночному спросу. Цикл: данные рынка → search intent → semantic clustering → trends → opportunities → предложение действия → approval → публикация → измерение → обратная связь.

Допустимые будущие действия: `CREATE_ARTICLE`, `CREATE_SERVICE`, `CREATE_LANDING`, `CREATE_FAQ`, `PROMOTE_HOME`, `UPDATE_SERVICE`, `UPDATE_CTA`, `ADD_INTERNAL_LINKS`, `WATCH`, `DO_NOTHING`.

Текущая стадия — AI_INTELLIGENCE_READY. Реализован ручной путь RawSearchQuery → GigaChat batch → intent/relevance/commerciality/cluster/disposition → SearchIntent. Реальный запуск ожидает credentials. Trend Engine, Decision Engine и автоматическое изменение production отсутствуют.

Первая выборка Wordstat показала, что частотные результаты содержат коммерческий спрос вместе с DIY, информационными и нерелевантными значениями. Поэтому LLM классифицирует смысл, а частотность остаётся evidence, но не самостоятельным opportunity score.
