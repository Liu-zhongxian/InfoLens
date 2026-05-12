import asyncio
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from app.deps import get_search_tools
from app.models.common import ApiResponse

router = APIRouter()


@router.get("")
async def search_news(
    query: str = Query(..., min_length=1),
    search_mode: str = Query("keyword", pattern="^(keyword|fuzzy|entity)$"),
    platforms: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=500),
    sort_by: str = Query("relevance", pattern="^(relevance|weight|date)$"),
    threshold: float = Query(0.6, ge=0, le=1),
    include_url: bool = Query(False),
    include_rss: bool = Query(False),
    rss_limit: int = Query(20, ge=1, le=100),
    st=Depends(get_search_tools),
):
    platform_list = platforms.split(",") if platforms else None
    result = await asyncio.to_thread(
        st.search_news_unified,
        query, search_mode, None, platform_list, limit,
        sort_by, threshold, include_url, include_rss, rss_limit,
    )
    return ApiResponse(data=result)


@router.get("/related")
async def related_news(
    reference_title: str = Query(..., min_length=1),
    threshold: float = Query(0.5, ge=0, le=1),
    limit: int = Query(20, ge=1, le=100),
    include_url: bool = Query(False),
    st=Depends(get_search_tools),
):
    result = await asyncio.to_thread(
        st.find_related_news_unified,
        reference_title, None, threshold, limit, include_url,
    )
    return ApiResponse(data=result)
