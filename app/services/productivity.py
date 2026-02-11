from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.models.task import Task
from app.models.timelog import TimeLog

class ProductivityService:
    
    @staticmethod
    def calculate_score(db: Session):
        """
        Generates a 0-100 Productivity Score.
        """
        today = datetime.now().date()
        
        # 1. Completion Rate (Weight: 40%)
        total_tasks = db.query(Task).count()
        completed = db.query(Task).filter(Task.is_completed == True).count()
        completion_rate = (completed / total_tasks * 100) if total_tasks > 0 else 0
        
        # 2. On-Time Percentage (Weight: 30%)
        # Tasks completed before deadline
        on_time = db.query(Task).filter(
            Task.is_completed == True,
            Task.completed_at <= Task.deadline
        ).count()
        on_time_rate = (on_time / completed * 100) if completed > 0 else 100

        # 3. Daily Consistency (Weight: 30%)
        # Did user log at least 1 hour today?
        logs_today = db.query(func.sum(TimeLog.duration_minutes)).filter(
            func.date(TimeLog.start_time) == today
        ).scalar() or 0
        consistency_score = 100 if logs_today >= 60 else (logs_today / 60 * 100)

        # Final Formula
        raw_score = (completion_rate * 0.4) + (on_time_rate * 0.3) + (consistency_score * 0.3)
        return round(min(max(raw_score, 0), 100))

    @staticmethod
    def check_burnout(db: Session):
        """
        Detects overwork patterns.
        """
        # Rule 1: Check if worked > 8 hours (480 mins) for last 5 days
        overwork_streak = 0
        for i in range(5):
            date_check = datetime.now().date() - timedelta(days=i)
            mins = db.query(func.sum(TimeLog.duration_minutes)).filter(
                func.date(TimeLog.start_time) == date_check
            ).scalar() or 0
            if mins > 480: 
                overwork_streak += 1
        
        # Rule 2: Low completion rate despite high hours
        score = ProductivityService.calculate_score(db)
        
        if overwork_streak >= 5:
            return {"detected": True, "reason": "You have worked over 8 hours for 5 days in a row."}
        if score < 40 and overwork_streak > 2:
            return {"detected": True, "reason": "High effort but low completion. Take a break."}
            
        return {"detected": False, "reason": "Healthy"}

    @staticmethod
    def get_time_stats(db: Session):
        today = datetime.now().date()
        
        # Hours Today
        mins_today = db.query(func.sum(TimeLog.duration_minutes)).filter(
            func.date(TimeLog.start_time) == today
        ).scalar() or 0

        # Hours This Week
        week_start = today - timedelta(days=today.weekday())
        mins_week = db.query(func.sum(TimeLog.duration_minutes)).filter(
            TimeLog.start_time >= week_start
        ).scalar() or 0

        return {
            "hours_today": round(mins_today / 60, 1),
            "hours_week": round(mins_week / 60, 1)
        }