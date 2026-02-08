from datetime import datetime, timezone
from typing import List
from app.models.task import Task, TaskPriority

class SchedulerService:
    PRIORITY_WEIGHTS = {
        TaskPriority.HIGH: 30,
        TaskPriority.MEDIUM: 20,
        TaskPriority.LOW: 10
    }

    @staticmethod
    def calculate_score(task: Task) -> float:
        if task.is_completed or task.is_locked:
            return -1.0
        
        score = SchedulerService.PRIORITY_WEIGHTS.get(task.priority, 10)
        
        if task.deadline:
            now = datetime.now(timezone.utc).replace(tzinfo=None)
            time_diff = (task.deadline - now).total_seconds() / 3600 # hours
            
            # Deadline Urgency: Smaller time_diff = Higher score
            # If overdue, time_diff is negative, drastically increasing score
            if time_diff > 0:
                score += (100 / (time_diff + 1)) 
            else:
                score += 500 # Overdue penalty
                
        return score

    @staticmethod
    def get_smart_schedule(tasks: List[Task]) -> List[Task]:
        # Filter out locked/completed, then sort by calculated score descending
        active_tasks = [t for t in tasks if not t.is_locked and not t.is_completed]
        return sorted(active_tasks, key=SchedulerService.calculate_score, reverse=True)

    @staticmethod
    def detect_missed_tasks(tasks: List[Task]) -> List[Task]:
        now = datetime.now()
        return [
            t for t in tasks 
            if t.deadline and t.deadline < now and not t.is_completed
        ]
    
    