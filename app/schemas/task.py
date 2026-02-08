from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TaskBase(BaseModel):
    title: str
    priority: Optional[str] = "medium"
    deadline: Optional[datetime] = None
    is_locked: Optional[bool] = False

class TaskCreate(TaskBase):
    pass

class Task(TaskBase):
    id: int
    is_completed: bool

    class Config:
        from_attributes = True