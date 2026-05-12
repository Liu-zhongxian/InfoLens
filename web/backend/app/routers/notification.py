import asyncio
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from app.deps import get_task_manager, get_ws_manager
from app.models.common import ApiResponse
from app.tasks.worker import run_notification_test

router = APIRouter()


@router.get("/channels")
async def notification_channels():
    def _get():
        from mcp_server.tools.notification import NotificationTools
        tools = NotificationTools()
        return tools.get_notification_channels()

    result = await asyncio.to_thread(_get)
    return ApiResponse(data=result)


@router.post("/test")
async def test_notification(
    channels: Optional[List[str]] = None,
    tm=Depends(get_task_manager),
    ws=Depends(get_ws_manager),
):
    async def _progress(task_id, progress, message):
        tm.update_progress(task_id, progress, message)
        await ws.broadcast("tasks", {
            "type": "task_progress",
            "task_id": task_id,
            "progress": progress,
            "message": message,
        })

    async def _run():
        return await run_notification_test(channels)

    task_id = tm.submit("send_notification", _run())
    return ApiResponse(data={"task_id": task_id, "status": "pending"})


@router.post("/send")
async def send_notification(
    message: str,
    title: str = "InfoLens 通知",
    channels: Optional[List[str]] = None,
    tm=Depends(get_task_manager),
    ws=Depends(get_ws_manager),
):
    async def _send():
        def _do():
            from mcp_server.tools.notification import NotificationTools
            tools = NotificationTools()
            return tools.send_notification(message, title, channels)
        return await asyncio.to_thread(_do)

    task_id = tm.submit("send_notification", _send())
    return ApiResponse(data={"task_id": task_id, "status": "pending"})
