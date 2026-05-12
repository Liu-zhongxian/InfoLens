from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class SearchRequest(BaseModel):
    query: str
    search_mode: str = "keyword"
    date_range: Optional[Dict[str, str]] = None
    platforms: Optional[List[str]] = None
    limit: int = 50
    sort_by: str = "relevance"
    threshold: float = 0.6
    include_url: bool = False
    include_rss: bool = False
    rss_limit: int = 20


class RelatedNewsRequest(BaseModel):
    reference_title: str
    date_range: Optional[Dict[str, str]] = None
    threshold: float = 0.5
    limit: int = 20
    include_url: bool = False


class SearchResultItem(BaseModel):
    title: str
    platform: str
    platform_name: str
    rank: int
    score: Optional[float] = None
    url: Optional[str] = None
    date: Optional[str] = None


class SearchResponse(BaseModel):
    results: List[Dict[str, Any]]
    total: int
    query: str
    search_mode: str
