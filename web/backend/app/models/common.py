from datetime import datetime
from typing import Any, Generic, Optional, TypeVar
from pydantic import BaseModel

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    success: bool = True
    data: Optional[T] = None
    error: Optional[str] = None
    message: Optional[str] = None


class PaginationParams(BaseModel):
    page: int = 1
    page_size: int = 50


class DateRange(BaseModel):
    start_date: str
    end_date: str


class TaskResponse(BaseModel):
    task_id: str
    status: str
    message: str


class TaskStatus(BaseModel):
    id: str
    type: str
    status: str  # pending, running, completed, failed
    progress: int = 0
    message: str = ""
    result: Optional[Any] = None
    error: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
