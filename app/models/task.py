from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, DateTime, Enum
import enum
from app.db.session import Base

class TaskPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, nullable=True)
    priority = Column(String, default=TaskPriority.LOW) # Store as string
    deadline = Column(DateTime, nullable=True)
    is_completed = Column(Boolean, default=False)
    is_locked = Column(Boolean, default=False) # Requirement 5
    owner_id = Column(Integer, ForeignKey("users.id"))