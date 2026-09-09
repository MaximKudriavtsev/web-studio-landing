# Состояние проекта

- Название: **КОТ ДЕЛА**
- Repository: `MaximKudriavtsev/web-studio-landing`
- AI Growth Engine stage: `AI_INTELLIGENCE_READY`
- Environment: `LOCAL_EXPERIMENT`
- Production AI deployment: `NONE`
- Основной режим: `APPROVAL`

## Frontend

- React 19, TypeScript, Vite 8, React Router 7, Tailwind CSS 4.
- Статическое SPA; основной контент — `src/content/site.ts`.
- Реальные страницы: `/`, `/privacy`, `/consent`; подготовлен локальный технический route `/ai`.

## Архитектура на старте

- Backend, database, CMS и Docker отсутствовали.
- В стадии FOUNDATION добавлен отдельный локальный backend-каркас и SQLite infrastructure.
- В Phase 1 добавлен официальный Wordstat REST adapter, ручная проверка подключения, технические endpoints и SQL-хранение сырых запросов и временного ряда спроса.
- Первый GetTop `создание сайтов` сохранил 44 строки: 30 results и 14 associations. Выборка содержит значительный semantic noise.
- В Phase 2 добавлен GigaChat intelligence layer. OAuth, список моделей и первый controlled analysis подтверждены.
- Первый intelligence baseline обработал 44/44 запросов. Phase 2.1 calibration сохраняется отдельно от baseline: 44/44 строк, 35 старых свободных кластеров сведены к 3 top-level clusters, 15 disposition изменились.
- Calibration устранила почти уникальные названия кластеров, но выявила over-broad routing: 35 из 44 запросов попали в `WEB_DEVELOPMENT_SERVICES`, включая часть DIY/irrelevant cases. До Opportunity Engine нужна следующая итерация правил taxonomy; повторный run не выполнялся.
- Phase 2.2 разделила LLM semantic analysis, deterministic taxonomy routing и disposition gate. V1 и V2 сосуществуют; V2 использовала 7 из 8 taxonomy clusters с распределением 3/6/7/11/7/1/1/8 и больше не имеет доминирующего catch-all cluster.

## Текущие услуги

- Сайты для бизнеса
- Приложения и кабинеты
- UX/UI и дизайн-системы
- Редизайн и развитие

## Интеграции

- GigaChat — `CONNECTED` (OAuth и `/v1/models` проверены вручную)
- Wordstat — `CONNECTED` (проверен вручную)
- Webmaster — `NOT_CONFIGURED`
- Metrika — `NOT_CONFIGURED_FOR_AI_ENGINE`

Frontend-код Метрики не является готовой backend-интеграцией AI Growth Engine.

Scheduler не выполняет Wordstat или GigaChat jobs; все внешние обращения запускаются явно.
