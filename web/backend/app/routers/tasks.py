from dataclasses import asdict
from typing import List
from fastapi import APIRouter, Depends
from app.deps import get_task_manager
from app.models.common import ApiResponse

router = APIRouter()


@router.get("")
async def list_tasks(tm=Depends(get_task_manager)):
    tasks = tm.list_all()
    return ApiResponse(data=[asdict(t) for t in tasks])


@router.get("/{task_id}")
async def get_task(task_id: str, tm=Depends(get_task_manager)):
    task = tm.get(task_id)
    if not task:
        return ApiResponse(success=False, error="任务不存在")
    return ApiResponse(data=asdict(task))
