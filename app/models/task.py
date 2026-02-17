import enum
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.db.session import Base

class TaskPriority(str, enum.Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    priority = Column(String, default="medium") 
    deadline = Column(DateTime, nullable=True)
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    
    # --- THIS WAS MISSING, PUT IT BACK ---
    is_locked = Column(Boolean, default=False) 
    # -------------------------------------

    # --- PRODUCTIVITY FIELDS ---
    estimated_duration = Column(Integer, default=60) # In minutes
    actual_duration = Column(Integer, default=0)     # Auto-calculated

    # Relationship to TimeLog
    time_logs = relationship("TimeLog", back_populates="task", cascade="all, delete-orphan")