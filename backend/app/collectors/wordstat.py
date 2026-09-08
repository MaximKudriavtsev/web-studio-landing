import time
from typing import TypeVar

import httpx
from pydantic import BaseModel

from app.schemas.wordstat import (
    DynamicsRequest,
    DynamicsResponse,
    RegionsDistributionRequest,
    RegionsDistributionResponse,
    RegionsTreeResponse,
    TopRequest,
    TopResponse,
)

ResponseModel = TypeVar("ResponseModel", bound=BaseModel)


class WordstatError(Exception):
    """A credential-safe error returned to the local API."""


class WordstatClient:
    BASE_URL = "https://searchapi.api.cloud.yandex.net/v2/wordstat"

    def __init__(
        self,
        api_key: str,
        folder_id: str,
        *,
        transport: httpx.BaseTransport | None = None,
        max_requests: int = 5,
        max_retries: int = 2,
    ) -> None:
        self.folder_id = folder_id
        self.max_requests = max_requests
        self.max_retries = max_retries
        self.requests_used = 0
        self._client = httpx.Client(
            base_url=self.BASE_URL,
            headers={"Authorization": f"Api-key {api_key}", "Content-Type": "application/json"},
            timeout=httpx.Timeout(20.0, connect=5.0),
            transport=transport,
        )

    def close(self) -> None:
        self._client.close()

    def _post(self, path: str, payload: dict, response_model: type[ResponseModel]) -> ResponseModel:
        payload = {**payload, "folderId": self.folder_id}
        for attempt in range(self.max_retries + 1):
            if self.requests_used >= self.max_requests:
                raise WordstatError("Wordstat request limit for this run has been reached")
            self.requests_used += 1
            try:
                response = self._client.post(path, json=payload)
            except httpx.TimeoutException as exc:
                if attempt < self.max_retries:
                    time.sleep(0.1 * (attempt + 1))
                    continue
                raise WordstatError("Wordstat request timed out") from exc
            except httpx.RequestError as exc:
                raise WordstatError("Wordstat connection failed") from exc

            if response.status_code in (401, 403):
                raise WordstatError("Wordstat authentication or access denied")
            if response.status_code == 429 or response.status_code >= 500:
                if attempt < self.max_retries:
                    time.sleep(0.1 * (attempt + 1))
                    continue
                message = "Wordstat rate limit exceeded" if response.status_code == 429 else "Wordstat service is temporarily unavailable"
                raise WordstatError(message)
            if response.is_error:
                raise WordstatError(f"Wordstat request failed with HTTP {response.status_code}")
            try:
                return response_model.model_validate(response.json())
            except (ValueError, TypeError) as exc:
                raise WordstatError("Wordstat returned an unexpected response") from exc
        raise WordstatError("Wordstat request failed")

    def get_top(self, request: TopRequest) -> TopResponse:
        return self._post("/topRequests", request.model_dump(by_alias=True, mode="json"), TopResponse)

    def get_dynamics(self, request: DynamicsRequest) -> DynamicsResponse:
        return self._post("/dynamics", request.model_dump(by_alias=True, mode="json", exclude_none=True), DynamicsResponse)

    def get_regions_distribution(self, request: RegionsDistributionRequest) -> RegionsDistributionResponse:
        return self._post("/regions", request.model_dump(by_alias=True, mode="json"), RegionsDistributionResponse)

    def get_regions_tree(self) -> RegionsTreeResponse:
        return self._post("/getRegionsTree", {}, RegionsTreeResponse)
