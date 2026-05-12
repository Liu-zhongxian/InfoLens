import sys
from pathlib import Path
from functools import lru_cache

from fastapi import Depends

# 确保项目根目录在 sys.path 中
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from trendradar.context import AppContext
from trendradar.core.loader import load_config
from mcp_server.services.data_service import DataService
from mcp_server.tools.analytics import AnalyticsTools
from mcp_server.tools.search_tools import SearchTools


@lru_cache
def get_config() -> dict:
    return load_config()


def get_app_context() -> AppContext:
    config = get_config()
    return AppContext(config)


@lru_cache
def get_data_service() -> DataService:
    return DataService()


@lru_cache
def get_analytics_tools() -> AnalyticsTools:
    return AnalyticsTools()


@lru_cache
def get_search_tools() -> SearchTools:
    return SearchTools()


def get_task_manager():
    from app.main import task_manager
    return task_manager


def get_ws_manager():
    from app.main import ws_manager
    return ws_manager
