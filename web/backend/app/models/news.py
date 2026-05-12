from typing import List, Optional
from pydantic import BaseModel


class NewsItem(BaseModel):
    title: str
    platform: str
    platform_name: str
    rank: int
    timestamp: Optional[str] = None
    url: Optional[str] = None
    mobile_url: Optional[str] = None
    avg_rank: Optional[float] = None
    count: Optional[int] = None
    date: Optional[str] = None


class NewsListResponse(BaseModel):
    items: List[NewsItem]
    total: int
    platform: Optional[str] = None


class TrendingTopic(BaseModel):
    keyword: str
    frequency: int
    matched_news: int
    trend: str = "stable"
    weight_score: float = 0.0


class TrendingResponse(BaseModel):
    topics: List[TrendingTopic]
    generated_at: str
    mode: str
    extract_mode: str
    total_keywords: int
    description: str
