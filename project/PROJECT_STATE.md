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
- В Phase 2 добавлен GigaChat intelligence layer, но реальный анализ не запускался: credentials отсутствуют.

## Текущие услуги

- Сайты для бизнеса
- Приложения и кабинеты
- UX/UI и дизайн-системы
- Редизайн и развитие

## Интеграции

- GigaChat — `NOT_CONFIGURED`
- Wordstat — `CONNECTED` (проверен вручную)
- Webmaster — `NOT_CONFIGURED`
- Metrika — `NOT_CONFIGURED_FOR_AI_ENGINE`

Frontend-код Метрики не является готовой backend-интеграцией AI Growth Engine.

Scheduler не выполняет Wordstat или GigaChat jobs; все внешние обращения запускаются явно.
