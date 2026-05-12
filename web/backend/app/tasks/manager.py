import asyncio
import uuid
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Callable, Coroutine, Dict, Optional


@dataclass
class TaskInfo:
    id: str
    type: str
    status: str = "pending"  # pending, running, completed, failed
    progress: int = 0
    message: str = ""
    result: Any = None
    error: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.now)
    completed_at: Optional[datetime] = None


class TaskManager:
    def __init__(self):
        self._tasks: Dict[str, TaskInfo] = {}
        self._running: Dict[str, asyncio.Task] = {}
        self._progress_callback: Optional[Callable] = None

    def set_progress_callback(self, callback: Callable):
        self._progress_callback = callback

    def submit(self, task_type: str, coro: Coroutine) -> str:
        task_id = str(uuid.uuid4())[:8]
        self._tasks[task_id] = TaskInfo(id=task_id, type=task_type)
        async_task = asyncio.create_task(self._run(task_id, coro))
        self._running[task_id] = async_task
        return task_id

    async def _run(self, task_id: str, coro: Coroutine):
        task = self._tasks[task_id]
        task.status = "running"
        await self._notify(task)
        try:
            result = await coro
            task.status = "completed"
            task.result = result
            task.progress = 100
        except Exception as e:
            task.status = "failed"
            task.error = str(e)
        finally:
            task.completed_at = datetime.now()
            self._running.pop(task_id, None)
            await self._notify(task)

    def get(self, task_id: str) -> Optional[TaskInfo]:
        return self._tasks.get(task_id)

    def list_all(self) -> list:
        return list(self._tasks.values())

    def update_progress(self, task_id: str, progress: int, message: str = ""):
        if task_id in self._tasks:
            self._tasks[task_id].progress = progress
            if message:
                self._tasks[task_id].message = message
            asyncio.create_task(self._notify(self._tasks[task_id]))

    async def _notify(self, task: TaskInfo):
        if self._progress_callback:
            try:
                await self._progress_callback(task)
            except Exception:
                pass

    def cancel_all(self):
        for t in self._running.values():
            t.cancel()
        self._running.clear()
