import asyncio
from fastapi import APIRouter, Depends, Query
from app.deps import get_data_service, get_app_context
from app.models.common import ApiResponse

router = APIRouter()


@router.get("")
async def get_config(
    section: str = Query("all", pattern="^(all|crawler|push|keywords|weights)$"),
    ds=Depends(get_data_service),
):
    result = await asyncio.to_thread(ds.get_current_config, section)
    return ApiResponse(data=result)


@router.get("/scheduler")
async def get_scheduler_status():
    ctx = get_app_context()
    scheduler = ctx.create_scheduler()
    schedule = scheduler.resolve()
    return ApiResponse(data={
        "period_key": schedule.period_key,
        "period_name": schedule.period_name,
        "day_plan": schedule.day_plan,
        "collect": schedule.collect,
        "analyze": schedule.analyze,
        "push": schedule.push,
        "report_mode": schedule.report_mode,
        "ai_mode": schedule.ai_mode,
        "filter_method": schedule.filter_method,
        "frequency_file": schedule.frequency_file,
        "interests_file": schedule.interests_file,
    })
