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

## GigaChat

- Credentials: только локальные `GIGACHAT_CLIENT_ID` и `GIGACHAT_CLIENT_SECRET`.
- Config: `AI_GIGACHAT_SCOPE`, `AI_GIGACHAT_MODEL`, `AI_GIGACHAT_BATCH_SIZE`.
- TLS config: `AI_GIGACHAT_CA_BUNDLE` — абсолютный путь к локальному CA certificate. Файл хранится вне Git; verification остаётся включённой.
- OAuth token хранится только в памяти provider instance и не логируется.
- OAuth token endpoint: `https://ngw.devices.sberbank.ru:9443/api/v2/oauth`; model API: `https://api.giga.chat/v1`.
- `AI_GIGACHAT_SCOPE` должен совпадать с проектом GigaChat Studio: `GIGACHAT_API_PERS` — физлица; `GIGACHAT_API_B2B` — ИП/юрлица с пакетами; `GIGACHAT_API_CORP` — ИП/юрлица pay-as-you-go.
- States: `NOT_CONFIGURED`, `CONFIGURED`, `CONNECTED`, `ERROR`; credentials сами по себе дают только `CONFIGURED`.
- Connection check возвращает только ID доступных моделей. Если `AI_GIGACHAT_MODEL` отсутствует в списке, backend предупреждает об этом и не меняет модель автоматически. Analysis использует JSON Schema structured output с Pydantic validation.
- Реальный status: `NOT_CONFIGURED`; API-вызовы не выполнялись.
