import asyncio
from typing import List, Optional


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
