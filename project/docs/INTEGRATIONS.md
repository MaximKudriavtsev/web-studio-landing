# Интеграции

| Интеграция | Текущий статус | Планируемая роль |
|---|---|---|
| GigaChat | `NOT_CONFIGURED` | Семантика и ограниченные AI-решения |
| Wordstat | `NOT_CONFIGURED` | Рыночный и поисковый спрос |
| Webmaster | `NOT_CONFIGURED` | Search performance feedback |
| Metrika | `NOT_CONFIGURED` | Поведение и конверсии |

Credentials хранятся только в локальном `backend/.env`.

## Wordstat

- Base URL: `https://searchapi.api.cloud.yandex.net/v2/wordstat`.
- Authentication: `Authorization: Api-key <key>`; `folderId` передаётся в JSON body.
- Локальные variables: `AI_WORDSTAT_API_KEY`, `AI_YANDEX_FOLDER_ID`, `AI_WORDSTAT_MAX_REQUESTS_PER_RUN`.
- States: `NOT_CONFIGURED`, `CONFIGURED`, `CONNECTED`, `ERROR`. Наличие credentials даёт только `CONFIGURED`; `CONNECTED` устанавливается после успешного `getRegionsTree`.
- `getRegionsTree` используется лишь для проверки подключения. Бизнес-данные поступают через GetTop и GetDynamics.
- Таймауты, 429 и временные 5xx имеют ограниченный retry; 401/403 и сообщения наружу не содержат credentials.
- Автоматические и фоновые запросы на Phase 1 запрещены.

GigaChat, Webmaster и Metrika API не подключены.
