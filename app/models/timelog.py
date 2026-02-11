from sqlalchemy import Column, Integer, ForeignKey, DateTime
from app.db.session import Base
from sqlalchemy.orm import relationship

class TimeLog(Base):
    __tablename__ = "time_logs"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"))
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=True) # Null means currently running
    duration_minutes = Column(Integer, default=0)

    task = relationship("Task", back_populates="time_logs")