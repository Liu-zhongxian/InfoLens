import asyncio
import logging
from typing import List, Optional

logger = logging.getLogger(__name__)


async def run_scheduler_tick(task_manager=None) -> dict:
    """Run one scheduler resolution cycle. Enqueues crawl if scheduled."""
    def _resolve():
        from trendradar.core.loader import load_config
        from trendradar.context import AppContext
        config = load_config()
        ctx = AppContext(config)
        scheduler = ctx.create_scheduler()
        return scheduler.resolve()

    schedule = await asyncio.to_thread(_resolve)
    result = {
        "period_key": schedule.period_key,
        "period_name": schedule.period_name,
        "collect": schedule.collect,
        "analyze": schedule.analyze,
        "push": schedule.push,
    }

    if schedule.collect and task_manager:
        task_id = task_manager.submit("crawl", run_crawl())
        result["enqueued_task"] = task_id
        logger.info("Auto-scheduler: enqueued crawl task %s", task_id)

    return result


async def run_crawl(
    platforms: Optional[List[str]] = None,
    save_to_local: bool = False,
    include_url: bool = False,
    progress_callback=None,
) -> dict:
    def _crawl():
        from mcp_server.tools.system import SystemManagementTools
        tools = SystemManagementTools()
        return tools.trigger_crawl(platforms, save_to_local, include_url)

    if progress_callback:
        progress_callback(10, "正在爬取...")
    result = await asyncio.to_thread(_crawl)
    if progress_callback:
        progress_callback(100, "爬取完成")
    return result


async def run_notification_test(
    channels: Optional[List[str]] = None,
    progress_callback=None,
) -> dict:
    def _notify():
        from mcp_server.tools.notification import NotificationTools
        tools = NotificationTools()
        return tools.send_notification(
            message="这是一条来自 InfoLens 的测试通知。",
            title="InfoLens 测试通知",
            channels=channels,
        )

    if progress_callback:
        progress_callback(10, "正在发送...")
    result = await asyncio.to_thread(_notify)
    if progress_callback:
        progress_callback(100, "发送完成")
    return result
