from typing import List, Dict
from app.models.task import Task

class StatsService:
    @staticmethod
    def get_productivity_report(tasks: List[Task]) -> Dict:
        total = len(tasks)
        if total == 0:
            return {"completion_rate": 0, "status": "No tasks available"}
        
        completed = len([t for t in tasks if t.is_completed])
        rate = (completed / total) * 100
        
        return {
            "total_tasks": total,
            "completed": completed,
            "completion_rate": f"{rate:.1f}%",
            "efficiency_status": "Optimal" if rate >= 70 else "Low Productivity"
        }