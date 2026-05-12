import asyncio
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from app.deps import get_data_service
from app.models.common import ApiResponse
from app.models.rss import RSSListResponse

router = APIRouter()


@router.get("/latest")
async def latest_rss(
    feeds: Optional[str] = Query(None, description="逗号分隔的RSS源ID列表"),
    days: int = Query(1, ge=1, le=30),
    limit: int = Query(50, ge=1, le=500),
    include_summary: bool = Query(False),
    ds=Depends(get_data_service),
):
    feed_list = feeds.split(",") if feeds else None
    result = await asyncio.to_thread(
        ds.get_latest_rss, feed_list, days, limit, include_summary
    )
    return ApiResponse(data=RSSListResponse(items=result, total=len(result)))


@router.get("/search")
async def search_rss(
    keyword: str = Query(..., min_length=1),
    feeds: Optional[str] = Query(None),
    days: int = Query(7, ge=1, le=30),
    limit: int = Query(50, ge=1, le=500),
    include_summary: bool = Query(False),
    ds=Depends(get_data_service),
):
    feed_list = feeds.split(",") if feeds else None
    result = await asyncio.to_thread(
        ds.search_rss, keyword, feed_list, days, limit, include_summary
    )
    return ApiResponse(data=RSSListResponse(items=result, total=len(result)))


@router.get("/feeds/status")
async def rss_feeds_status(ds=Depends(get_data_service)):
    result = await asyncio.to_thread(ds.get_rss_feeds_status)
    return ApiResponse(data=result)
