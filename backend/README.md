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

API: `GET /health`, `GET /api/integrations`. Документация: `http://localhost:8000/docs`.

## Проверки

```powershell
pytest
```

SQLite-файл создаётся в `backend/data/` и исключён из Git.
