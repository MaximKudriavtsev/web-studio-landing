# Состояние проекта

- Название: **КОТ ДЕЛА**
- Repository: `MaximKudriavtsev/web-studio-landing`
- AI Growth Engine stage: `MARKET_DATA`
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

## Текущие услуги

- Сайты для бизнеса
- Приложения и кабинеты
- UX/UI и дизайн-системы
- Редизайн и развитие

## Интеграции

- GigaChat — `NOT_CONFIGURED`
- Wordstat — `NOT_CONFIGURED`
- Webmaster — `NOT_CONFIGURED`
- Metrika — `NOT_CONFIGURED_FOR_AI_ENGINE`

Frontend-код Метрики не является готовой backend-интеграцией AI Growth Engine.

Wordstat credentials в текущей среде отсутствуют. Scheduler не выполняет Wordstat-запросы; все платные обращения запускаются явно.
