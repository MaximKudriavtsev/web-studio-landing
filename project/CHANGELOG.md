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
