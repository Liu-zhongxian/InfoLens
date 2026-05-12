import asyncio
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from app.deps import get_data_service, get_task_manager, get_ws_manager
from app.models.common import ApiResponse
from app.models.news import NewsItem, NewsListResponse, TrendingResponse
from app.tasks.worker import run_crawl
from mcp_server.utils.errors import DataNotFoundError

router = APIRouter()


@router.get("/latest")
async def latest_news(
    platforms: Optional[str] = Query(None, description="逗号分隔的平台ID列表"),
    limit: int = Query(50, ge=1, le=500),
    include_url: bool = Query(False),
    ds=Depends(get_data_service),
):
    platform_list = platforms.split(",") if platforms else None
    try:
        result = await asyncio.to_thread(
            ds.get_latest_news, platform_list, limit, include_url
        )
    except DataNotFoundError:
        return ApiResponse(data=NewsListResponse(
            items=[], total=0, platform=platforms
        ))
    items = [NewsItem(**item) for item in result]
    return ApiResponse(data=NewsListResponse(
        items=items, total=len(items), platform=platforms
    ))


@router.get("/date/{date}")
async def news_by_date(
    date: str,
    platforms: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=500),
    include_url: bool = Query(False),
    ds=Depends(get_data_service),
):
    try:
        target_date = datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        return ApiResponse(success=False, error="日期格式错误，请使用 YYYY-MM-DD")
    platform_list = platforms.split(",") if platforms else None
    try:
        result = await asyncio.to_thread(
            ds.get_news_by_date, target_date, platform_list, limit, include_url
        )
    except DataNotFoundError:
        return ApiResponse(data=NewsListResponse(items=[], total=0))
    items = [NewsItem(**item) for item in result]
    return ApiResponse(data=NewsListResponse(items=items, total=len(items)))


@router.get("/trending")
async def trending_topics(
    top_n: int = Query(10, ge=1, le=100),
    mode: str = Query("current", pattern="^(daily|current)$"),
    extract_mode: str = Query("keywords", pattern="^(keywords|auto_extract)$"),
    ds=Depends(get_data_service),
):
    try:
        result = await asyncio.to_thread(
            ds.get_trending_topics, top_n, mode, extract_mode
        )
    except DataNotFoundError:
        return ApiResponse(data=TrendingResponse(
            topics=[],
            generated_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            mode=mode,
            extract_mode=extract_mode,
            total_keywords=0,
            description=f"暂无{mode}模式数据"
        ))
    return ApiResponse(data=TrendingResponse(**result))


@router.post("/crawl")
async def trigger_crawl(
    platforms: Optional[str] = Query(None, description="逗号分隔的平台ID列表"),
    save_to_local: bool = Query(False),
    include_url: bool = Query(False),
    tm=Depends(get_task_manager),
    ws=Depends(get_ws_manager),
):
    platform_list = platforms.split(",") if platforms else None

    async def _run():
        return await run_crawl(
            platform_list, save_to_local, include_url,
            progress_callback=lambda p, m: tm.update_progress(task_id, p, m),
        )

    task_id = tm.submit("crawl", _run())
    await ws.broadcast("tasks", {
        "type": "task_created",
        "task_id": task_id,
        "task_type": "crawl",
    })
    return ApiResponse(data={"task_id": task_id, "status": "pending"})
