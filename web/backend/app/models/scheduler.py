from typing import Optional
from pydantic import BaseModel


class SchedulerStatus(BaseModel):
    period_key: Optional[str] = None
    period_name: Optional[str] = None
    day_plan: Optional[str] = None
    collect: bool = False
    analyze: bool = False
    push: bool = False
    report_mode: str = "current"
    ai_mode: str = "off"
    filter_method: str = "keyword"
    frequency_file: Optional[str] = None
    interests_file: Optional[str] = None
