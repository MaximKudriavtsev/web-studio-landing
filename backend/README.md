# КОТ ДЕЛА AI Growth Engine backend

Локальный FOUNDATION-каркас. Он не обращается к GigaChat или сервисам Яндекса и не изменяет production.

## Запуск на Windows PowerShell

```powershell
cd backend
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload --port 8000
```

API: `GET /health`, `GET /api/integrations`, `POST /api/integrations/wordstat/check`, `POST /api/wordstat/top`, `POST /api/wordstat/dynamics`. Документация: `http://localhost:8000/docs`.

Wordstat по умолчанию имеет статус `NOT_CONFIGURED`. После подготовки доступа заполните только локальный `.env`: `AI_WORDSTAT_API_KEY`, `AI_YANDEX_FOLDER_ID`. Лимит одного ручного запуска задаётся `AI_WORDSTAT_MAX_REQUESTS_PER_RUN` (по умолчанию 5). Scheduler не запускает Wordstat jobs.

Для GigaChat сохраните доверенный сертификат локально в `backend/certs/` и укажите абсолютный путь в `AI_GIGACHAT_CA_BUNDLE`. Provider сохраняет системное хранилище доверия и добавляет этот CA через `ssl.create_default_context()`; отключение TLS verification запрещено.

## Проверки

```powershell
pytest
```

SQLite-файл создаётся в `backend/data/` и исключён из Git.
