from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class RSSItem(BaseModel):
    title: str
    url: Optional[str] = None
    feed_id: Optional[str] = None
    feed_name: Optional[str] = None
    published: Optional[str] = None
    summary: Optional[str] = None


class RSSListResponse(BaseModel):
    items: List[Dict[str, Any]]
    total: int


class RSSFeedStatus(BaseModel):
    feeds: Dict[str, Any]
    available_dates: List[str]
    total_items: int
