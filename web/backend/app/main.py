import asyncio
import logging
import sys
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

logger = logging.getLogger(__name__)

# 确保项目根目录和后端目录在 sys.path 中
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent
BACKEND_DIR = Path(__file__).resolve().parent.parent
for p in [str(PROJECT_ROOT), str(BACKEND_DIR)]:
    if p not in sys.path:
        sys.path.insert(0, p)

from app.deps import get_config, get_data_service
from app.routers import system, news, config as config_router, rss, search, analytics, tasks, notification
from app.tasks.manager import TaskManager
from app.ws.manager import ConnectionManager
from app.ws.handlers import create_ws_router

task_manager = TaskManager()
ws_manager = ConnectionManager()


async def _task_progress_callback(task):
    await ws_manager.broadcast("tasks", {
        "type": "task_progress",
        "task_id": task.id,
        "task_type": task.type,
        "status": task.status,
        "progress": task.progress,
        "message": task.message,
        "error": task.error,
    })


task_manager.set_progress_callback(_task_progress_callback)


async def _auto_scheduler_loop():
    """Background loop: resolve scheduler every 60s and enqueue tasks."""
    from app.tasks.worker import run_scheduler_tick
    while True:
        try:
            result = await run_scheduler_tick(task_manager=task_manager)
            logger.debug("Scheduler tick: %s", result)
        except Exception as e:
            logger.warning("Scheduler tick error: %s", e)
        await asyncio.sleep(60)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup
    scheduler_task = asyncio.create_task(_auto_scheduler_loop())
    yield
    # shutdown
    scheduler_task.cancel()
    try:
        await scheduler_task
    except asyncio.CancelledError:
        pass
    task_manager.cancel_all()


app = FastAPI(
    title="InfoLens API",
    description="AI 驱动的多平台新闻聚合与分析 Web 平台",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(system.router, prefix="/api/system", tags=["system"])
app.include_router(news.router, prefix="/api/news", tags=["news"])
app.include_router(config_router.router, prefix="/api/config", tags=["config"])
app.include_router(rss.router, prefix="/api/rss", tags=["rss"])
app.include_router(search.router, prefix="/api/search", tags=["search"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(notification.router, prefix="/api/notification", tags=["notification"])

ws_router = create_ws_router(ws_manager)
app.include_router(ws_router)


@app.get("/")
async def root():
    return {"name": "InfoLens API", "version": "0.1.0"}
