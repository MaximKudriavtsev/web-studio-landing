from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field, field_validator


class Device(str, Enum):
    ALL = "DEVICE_ALL"
    DESKTOP = "DEVICE_DESKTOP"
    PHONE = "DEVICE_PHONE"
    TABLET = "DEVICE_TABLET"


class Period(str, Enum):
    MONTHLY = "PERIOD_MONTHLY"
    WEEKLY = "PERIOD_WEEKLY"
    DAILY = "PERIOD_DAILY"


class RegionLevel(str, Enum):
    ALL = "REGION_ALL"
    CITIES = "REGION_CITIES"
    REGIONS = "REGION_REGIONS"


class WordstatModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True)


class TopRequest(WordstatModel):
    phrase: str = Field(min_length=1, max_length=400)
    num_phrases: int = Field(default=100, ge=1, le=2000, alias="numPhrases")
    regions: list[str] = Field(default_factory=list, max_length=100)
    devices: list[Device] = Field(default_factory=lambda: [Device.ALL], max_length=3)


class PhraseInfo(BaseModel):
    phrase: str
    count: int

    @field_validator("count", mode="before")
    @classmethod
    def normalize_count(cls, value: object) -> int:
        return int(str(value))


class TopResponse(WordstatModel):
    seed_phrase: str | None = Field(default=None, alias="seedPhrase")
    total_count: int = Field(alias="totalCount")
    results: list[PhraseInfo] = Field(default_factory=list)
    associations: list[PhraseInfo] = Field(default_factory=list)

    @field_validator("total_count", mode="before")
    @classmethod
    def normalize_total_count(cls, value: object) -> int:
        return int(str(value))


class DynamicsRequest(WordstatModel):
    phrase: str = Field(min_length=1, max_length=400)
    period: Period
    from_date: datetime = Field(alias="fromDate")
    to_date: datetime | None = Field(default=None, alias="toDate")
    regions: list[str] = Field(default_factory=list, max_length=100)
    devices: list[Device] = Field(default_factory=lambda: [Device.ALL], max_length=3)


class DynamicsInfo(BaseModel):
    date: datetime
    count: int
    share: float

    @field_validator("count", mode="before")
    @classmethod
    def normalize_count(cls, value: object) -> int:
        return int(str(value))

    @field_validator("share", mode="before")
    @classmethod
    def normalize_share(cls, value: object) -> float:
        return float(str(value))


class DynamicsResponse(BaseModel):
    results: list[DynamicsInfo] = Field(default_factory=list)


class RegionsDistributionRequest(WordstatModel):
    phrase: str = Field(min_length=1, max_length=400)
    region: RegionLevel = RegionLevel.ALL
    devices: list[Device] = Field(default_factory=lambda: [Device.ALL], max_length=3)


class RegionDistributionInfo(WordstatModel):
    region: str
    count: int
    share: float
    affinity_index: float | None = Field(default=None, alias="affinityIndex")

    @field_validator("count", mode="before")
    @classmethod
    def normalize_count(cls, value: object) -> int:
        return int(str(value))

    @field_validator("share", "affinity_index", mode="before")
    @classmethod
    def normalize_float(cls, value: object) -> float | None:
        return None if value is None else float(str(value))


class RegionsDistributionResponse(BaseModel):
    results: list[RegionDistributionInfo] = Field(default_factory=list)


class RegionInfo(BaseModel):
    id: str
    label: str
    children: list["RegionInfo"] = Field(default_factory=list)


class RegionsTreeResponse(BaseModel):
    regions: list[RegionInfo] = Field(default_factory=list)
