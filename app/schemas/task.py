from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.task import TaskPriority

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: TaskPriority = TaskPriority.LOW
    deadline: Optional[datetime] = None
    is_completed: bool = False
    is_locked: bool = False

class TaskCreate(TaskBase):
    pass

class TaskResponse(TaskBase):
    id: int
    owner_id: int
    class Config:
        from_attributes = True