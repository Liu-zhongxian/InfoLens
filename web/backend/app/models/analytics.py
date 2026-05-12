from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class TopicTrendRequest(BaseModel):
    topic: str
    analysis_type: str = "trend"
    date_range: Optional[Dict[str, str]] = None
    granularity: str = "day"
    threshold: float = 3.0
    time_window: int = 24
    lookahead_hours: int = 6
    confidence_threshold: float = 0.7


class DataInsightsRequest(BaseModel):
    insight_type: str = "platform_compare"
    topic: Optional[str] = None
    date_range: Optional[Dict[str, str]] = None
    min_frequency: int = 3
    top_n: int = 20


class SentimentRequest(BaseModel):
    topic: Optional[str] = None
    platforms: Optional[List[str]] = None
    date_range: Optional[Dict[str, str]] = None
    limit: int = 50
    sort_by_weight: bool = True
    include_url: bool = False


class AggregateRequest(BaseModel):
    date_range: Optional[Dict[str, str]] = None
    platforms: Optional[List[str]] = None
    similarity_threshold: float = 0.7
    limit: int = 50
    include_url: bool = False


class ComparePeriodsRequest(BaseModel):
    period1: Dict[str, str]
    period2: Dict[str, str]
    topic: Optional[str] = None
    compare_type: str = "overview"
    platforms: Optional[List[str]] = None
    top_n: int = 10


class ReportRequest(BaseModel):
    report_type: str = "daily"
    date_range: Optional[Dict[str, str]] = None


class AnalyticsResponse(BaseModel):
    result: Dict[str, Any]
    analysis_type: str
