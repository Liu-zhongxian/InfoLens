import asyncio
import shutil
from pathlib import Path

import yaml
from fastapi import APIRouter, Depends, HTTPException, Query

from app.deps import get_config, get_data_service, get_app_context
from app.models.common import ApiResponse
from app.models.config import ConfigUpdateRequest

router = APIRouter()

CONFIG_PATH = Path(__file__).resolve().parent.parent.parent.parent / "config" / "config.yaml"


@router.get("/raw")
async def get_config_raw():
    try:
        content = await asyncio.to_thread(CONFIG_PATH.read_text, encoding="utf-8")
        return ApiResponse(data={"yaml": content})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("")
async def get_config(
    section: str = Query("all", pattern="^(all|crawler|push|keywords|weights)$"),
    ds=Depends(get_data_service),
):
    result = await asyncio.to_thread(ds.get_current_config, section)
    return ApiResponse(data=result)


@router.put("")
async def update_config(body: ConfigUpdateRequest):
    # Validate YAML syntax
    try:
        parsed = await asyncio.to_thread(yaml.safe_load, body.yaml_content)
    except yaml.YAMLError as e:
        raise HTTPException(status_code=400, detail=f"YAML 语法错误: {e}")

    if not isinstance(parsed, dict):
        raise HTTPException(status_code=400, detail="YAML 内容必须是一个字典结构")

    # Backup existing config
    backup_path = CONFIG_PATH.with_suffix(".yaml.bak")
    try:
        await asyncio.to_thread(shutil.copy2, CONFIG_PATH, backup_path)
    except Exception:
        pass  # backup failure is non-fatal

    # Write new config
    try:
        await asyncio.to_thread(CONFIG_PATH.write_text, body.yaml_content, encoding="utf-8")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"写入配置失败: {e}")

    # Clear cached config so next request picks up new values
    get_config.cache_clear()

    return ApiResponse(data={"message": "配置已更新", "path": str(CONFIG_PATH)})


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
