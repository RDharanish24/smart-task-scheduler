from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.models.task import Task
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/dashboard")
def get_dashboard_stats(db: Session = Depends(get_db)):
    # 1. Basic Counters
    total = db.query(Task).count()
    completed = db.query(Task).filter(Task.is_completed == True).count()
    pending = total - completed
    
    # 2. Priority Distribution (Pie Chart)
    # Result: [{"priority": "high", "count": 5}, ...]
    priority_dist = db.query(
        Task.priority, func.count(Task.id)
    ).group_by(Task.priority).all()
    
    formatted_dist = [{"name": p[0], "value": p[1]} for p in priority_dist]

    # 3. Weekly Productivity (Bar Chart)
    # Get completed tasks from last 7 days
    seven_days_ago = datetime.now() - timedelta(days=7)
    daily_stats = db.query(
        func.date(Task.completed_at), func.count(Task.id)
    ).filter(
        Task.is_completed == True,
        Task.completed_at >= seven_days_ago
    ).group_by(func.date(Task.completed_at)).all()

    # Format for Recharts (e.g., "Mon", "Tue")
    productivity_trend = [
        {"date": str(day[0]), "count": day[1]} for day in daily_stats
    ]

    return {
        "total": total,
        "completed": completed,
        "pending": pending,
        "priority_distribution": formatted_dist,
        "productivity_trend": productivity_trend
    }