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
@router.get("/worklog")
def get_worklog(db: Session = Depends(get_db)):
    # Fetch all completed tasks ordered by newest first
    completed_tasks = db.query(Task).filter(
        Task.is_completed == True,
        Task.completed_at != None
    ).order_by(Task.completed_at.desc()).all()
    
    worklog_dict = {}
    for task in completed_tasks:
        date_str = task.completed_at.strftime("%Y-%m-%d")
        display_date = task.completed_at.strftime("%A, %b %d, %Y") # e.g., Monday, Feb 16, 2026
        
        if date_str not in worklog_dict:
            worklog_dict[date_str] = {
                "date": date_str,
                "display_date": display_date,
                "total_time": 0,
                "tasks_count": 0,
                "tasks": []
            }
        
        worklog_dict[date_str]["total_time"] += task.actual_duration
        worklog_dict[date_str]["tasks_count"] += 1
        worklog_dict[date_str]["tasks"].append({
            "id": task.id,
            "title": task.title,
            "time_spent": task.actual_duration,
            "priority": task.priority
        })
        
    return list(worklog_dict.values())