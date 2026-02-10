import enum
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from app.db.session import Base

# --- FIXED ENUM (Uppercase Names, Lowercase Values) ---
class TaskPriority(str, enum.Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
# ------------------------------------------------------

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    # Storing as string to keep it simple for the DB
    priority = Column(String, default="medium") 
    deadline = Column(DateTime, nullable=True)
    is_completed = Column(Boolean, default=False)
    is_locked = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)