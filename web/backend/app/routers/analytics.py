import asyncio
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from app.deps import get_analytics_tools, get_data_service
from app.models.common import ApiResponse

router = APIRouter()


@router.get("/trending")
async def trending_topics(
    top_n: int = Query(10, ge=1, le=100),
    mode: str = Query("current", pattern="^(daily|current)$"),
    extract_mode: str = Query("keywords", pattern="^(keywords|auto_extract)$"),
    ds=Depends(get_data_service),
):
    result = await asyncio.to_thread(
        ds.get_trending_topics, top_n, mode, extract_mode
    )
    return ApiResponse(data=result)


@router.get("/trend")
async def topic_trend(
    topic: str = Query(..., min_length=1),
    analysis_type: str = Query("trend", pattern="^(trend|lifecycle|viral|predict)$"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    granularity: str = Query("day"),
    threshold: float = Query(3.0),
    time_window: int = Query(24),
    lookahead_hours: int = Query(6),
    confidence_threshold: float = Query(0.7),
    at=Depends(get_analytics_tools),
):
    date_range = None
    if start_date and end_date:
        date_range = {"start": start_date, "end": end_date}
    result = await asyncio.to_thread(
        at.analyze_topic_trend_unified,
        topic, analysis_type, date_range, granularity,
        threshold, time_window, lookahead_hours, confidence_threshold,
    )
    return ApiResponse(data=result)


@router.get("/insights")
async def data_insights(
    insight_type: str = Query("platform_compare", pattern="^(platform_compare|platform_activity|keyword_cooccur)$"),
    topic: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    min_frequency: int = Query(3, ge=1),
    top_n: int = Query(20, ge=1, le=100),
    at=Depends(get_analytics_tools),
):
    date_range = None
    if start_date and end_date:
        date_range = {"start": start_date, "end": end_date}
    result = await asyncio.to_thread(
        at.analyze_data_insights_unified,
        insight_type, topic, date_range, min_frequency, top_n,
    )
    return ApiResponse(data=result)


@router.get("/sentiment")
async def sentiment_analysis(
    topic: Optional[str] = Query(None),
    platforms: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    sort_by_weight: bool = Query(True),
    include_url: bool = Query(False),
    at=Depends(get_analytics_tools),
):
    platform_list = platforms.split(",") if platforms else None
    date_range = None
    if start_date and end_date:
        date_range = {"start": start_date, "end": end_date}
    result = await asyncio.to_thread(
        at.analyze_sentiment,
        topic, platform_list, date_range, limit, sort_by_weight, include_url,
    )
    return ApiResponse(data=result)


@router.get("/aggregate")
async def aggregate_news(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    platforms: Optional[str] = Query(None),
    similarity_threshold: float = Query(0.7, ge=0, le=1),
    limit: int = Query(50, ge=1, le=200),
    include_url: bool = Query(False),
    at=Depends(get_analytics_tools),
):
    platform_list = platforms.split(",") if platforms else None
    date_range = None
    if start_date and end_date:
        date_range = {"start": start_date, "end": end_date}
    result = await asyncio.to_thread(
        at.aggregate_news,
        date_range, platform_list, similarity_threshold, limit, include_url,
    )
    return ApiResponse(data=result)


@router.get("/compare")
async def compare_periods(
    period1_start: str = Query(...),
    period1_end: str = Query(...),
    period2_start: str = Query(...),
    period2_end: str = Query(...),
    topic: Optional[str] = Query(None),
    compare_type: str = Query("overview", pattern="^(overview|topic_shift|platform_activity)$"),
    platforms: Optional[str] = Query(None),
    top_n: int = Query(10, ge=1, le=50),
    at=Depends(get_analytics_tools),
):
    platform_list = platforms.split(",") if platforms else None
    result = await asyncio.to_thread(
        at.compare_periods,
        {"start": period1_start, "end": period1_end},
        {"start": period2_start, "end": period2_end},
        topic, compare_type, platform_list, top_n,
    )
    return ApiResponse(data=result)


@router.get("/report")
async def summary_report(
    report_type: str = Query("daily", pattern="^(daily|weekly)$"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    at=Depends(get_analytics_tools),
):
    date_range = None
    if start_date and end_date:
        date_range = {"start": start_date, "end": end_date}
    result = await asyncio.to_thread(
        at.generate_summary_report, report_type, date_range,
    )
    return ApiResponse(data=result)
