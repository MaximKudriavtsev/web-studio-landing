import base64
import json
from uuid import uuid4

import httpx
from pydantic import ValidationError

from app.schemas.intelligence import IntelligenceBatch, QueryInput


class GigaChatError(Exception):
    """Credential-safe provider error."""


class GigaChatStructuredOutputError(GigaChatError):
    pass


SYSTEM_PROMPT = """Ты классификатор поискового спроса digital-агентства «КОТ ДЕЛА».
Направления бизнеса: сайты для бизнеса; приложения и личные кабинеты; UX/UI и дизайн-системы; редизайн и развитие.
Различай коммерческий спрос, информационный интерес, DIY/бесплатные инструменты, нерелевантные значения и смежный спрос.
Высокая частотность не означает коммерческую ценность. Не выполняй математические или трендовые расчёты.
Используй общие устойчивые cluster_name, не создавай отдельный кластер для каждой фразы.
Шум (игры, фото-инструменты, карточки, r34, история интернета) помечай IGNORE.
Бесплатные/DIY запросы обычно WATCH или IGNORE, но не OPPORTUNITY_CANDIDATE.
Верни ровно один объект по переданной JSON Schema и сохрани каждый raw_query_id без изменений."""


class GigaChatClient:
    TOKEN_URL = "https://ngw.devices.sberbank.ru:9443/api/v2/oauth"
    API_URL = "https://api.giga.chat/v1"

    def __init__(
        self,
        client_id: str,
        client_secret: str,
        *,
        scope: str,
        model: str,
        transport: httpx.BaseTransport | None = None,
    ) -> None:
        credentials = base64.b64encode(f"{client_id}:{client_secret}".encode()).decode()
        self._basic_authorization = f"Basic {credentials}"
        self.scope = scope
        self.model = model
        self._token: str | None = None
        self._client = httpx.Client(timeout=httpx.Timeout(60.0, connect=10.0), transport=transport)

    def close(self) -> None:
        self._client.close()

    def _request_token(self) -> str:
        try:
            response = self._client.post(
                self.TOKEN_URL,
                headers={"Authorization": self._basic_authorization, "RqUID": str(uuid4())},
                data={"scope": self.scope},
            )
        except httpx.TimeoutException as exc:
            raise GigaChatError("GigaChat authentication timed out") from exc
        except httpx.RequestError as exc:
            raise GigaChatError("GigaChat authentication connection failed") from exc
        if response.status_code in (401, 403):
            raise GigaChatError("GigaChat authentication or access denied")
        if response.is_error:
            raise GigaChatError(f"GigaChat authentication failed with HTTP {response.status_code}")
        token = response.json().get("access_token")
        if not token:
            raise GigaChatError("GigaChat authentication returned an unexpected response")
        self._token = str(token)
        return self._token

    def _headers(self) -> dict[str, str]:
        token = self._token or self._request_token()
        return {"Authorization": f"Bearer {token}", "Content-Type": "application/json", "Accept": "application/json"}

    def check(self) -> list[str]:
        try:
            response = self._client.get(f"{self.API_URL}/models", headers=self._headers())
        except httpx.TimeoutException as exc:
            raise GigaChatError("GigaChat check timed out") from exc
        except httpx.RequestError as exc:
            raise GigaChatError("GigaChat connection failed") from exc
        if response.status_code in (401, 403):
            raise GigaChatError("GigaChat authentication or access denied")
        if response.is_error:
            raise GigaChatError(f"GigaChat check failed with HTTP {response.status_code}")
        try:
            models = response.json()["data"]
            model_ids = [str(item["id"]) for item in models]
        except (KeyError, TypeError, ValueError) as exc:
            raise GigaChatError("GigaChat models returned an unexpected response") from exc
        return model_ids

    def analyze_batch(self, queries: list[QueryInput]) -> IntelligenceBatch:
        schema = IntelligenceBatch.model_json_schema()
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": json.dumps([item.model_dump() for item in queries], ensure_ascii=False)},
            ],
            "response_format": {"type": "json_schema", "schema": schema, "strict": True},
            "temperature": 0.1,
        }
        last_error: Exception | None = None
        for _ in range(2):
            try:
                response = self._client.post(f"{self.API_URL}/chat/completions", headers=self._headers(), json=payload)
            except httpx.TimeoutException as exc:
                raise GigaChatError("GigaChat analysis timed out") from exc
            except httpx.RequestError as exc:
                raise GigaChatError("GigaChat connection failed") from exc
            if response.status_code in (401, 403):
                raise GigaChatError("GigaChat authentication or access denied")
            if response.status_code == 429:
                raise GigaChatError("GigaChat rate limit exceeded")
            if response.is_error:
                raise GigaChatError(f"GigaChat analysis failed with HTTP {response.status_code}")
            try:
                content = response.json()["choices"][0]["message"]["content"]
                parsed = IntelligenceBatch.model_validate_json(content)
                expected_ids = {item.raw_query_id for item in queries}
                actual_ids = {item.raw_query_id for item in parsed.items}
                if expected_ids != actual_ids or len(parsed.items) != len(queries):
                    raise ValueError("response IDs do not match the batch")
                return parsed
            except (KeyError, IndexError, TypeError, ValueError, ValidationError) as exc:
                last_error = exc
                payload["messages"].append({"role": "user", "content": "Исправь ответ: верни валидный JSON строго по схеме и ровно для всех raw_query_id."})
        raise GigaChatStructuredOutputError("GigaChat returned invalid structured output after one retry") from last_error
