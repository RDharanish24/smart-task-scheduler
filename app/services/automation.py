from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.task import Task, TaskPriority
from app.services.notification_service import NotificationService # Reusing from previous step context

class AutomationService:
    @staticmethod
    def process_missed_tasks(db: Session):
        """
        Finds tasks that are past their deadline and not completed.
        If not locked, auto-reschedule them to the next day.
        """
        now = datetime.now()
        # Find missed tasks (Deadline passed, Not Completed, Not Locked)
        missed_tasks = db.query(Task).filter(
            Task.deadline < now,
            Task.is_completed == False,
            Task.is_locked == False
        ).all()

        processed_count = 0
        for task in missed_tasks:
            # Smart Logic: Auto-reschedule based on priority
            # High Priority -> Move to +24 hours (Urgent rescheduling)
            # Low/Med -> Move to +48 hours (De-prioritize slightly)
            days_to_add = 1 if task.priority == TaskPriority.HIGH else 2
            
            new_deadline = now + timedelta(days=days_to_add)
            
            print(f"[AUTO-RESCHEDULE] Task '{task.title}' missed! Moving from {task.deadline} to {new_deadline}")
            
            task.deadline = new_deadline
            processed_count += 1
            
            # Notify user about the change
            NotificationService.log_overdue_alert(task.title, "Auto-Rescheduled")

        db.commit()
        return processed_count

    @staticmethod
    def check_reminders(db: Session):
        """
        Finds tasks with deadlines approaching in the next 30 minutes.
        """
        now = datetime.now()
        reminder_window = now + timedelta(minutes=30)
        
        upcoming_tasks = db.query(Task).filter(
            Task.deadline >= now,
            Task.deadline <= reminder_window,
            Task.is_completed == False
        ).all()
        
        for task in upcoming_tasks:
            print(f"[REMINDER] Task '{task.title}' is due in < 30 mins!")
            