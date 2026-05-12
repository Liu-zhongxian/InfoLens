from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class PlatformConfig(BaseModel):
    id: str
    name: str
    enabled: bool = True


class RSSFeedConfig(BaseModel):
    id: str
    name: str
    url: str
    enabled: bool = True


class CrawlerConfig(BaseModel):
    enable_crawler: bool = True
    use_proxy: bool = False
    request_interval: int = 1
    retry_times: int = 3
    platforms: List[str] = []


class PushConfig(BaseModel):
    enable_notification: bool = True
    enabled_channels: List[str] = []
    message_batch_size: int = 4000


class KeywordsConfig(BaseModel):
    word_groups: List[Dict[str, Any]] = []
    total_groups: int = 0


class WeightsConfig(BaseModel):
    rank_weight: float = 0.6
    frequency_weight: float = 0.3
    hotness_weight: float = 0.1


class FullConfig(BaseModel):
    crawler: CrawlerConfig
    push: PushConfig
    keywords: KeywordsConfig
    weights: WeightsConfig
