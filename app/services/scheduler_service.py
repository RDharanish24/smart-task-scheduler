from datetime import datetime
from typing import List
from app.models.task import Task, TaskPriority  # Ensure this import works now

def calculate_score(task: Task) -> float:
    """
    Calculates a 'urgency score' for a task.
    Higher score = Higher position in the list.
    """
    score = 0.0
    
    # 1. Priority Weight
    # We use the Enum we just fixed in the Model
    priority_weights = {
        TaskPriority.HIGH.value: 100,    # "high"
        TaskPriority.MEDIUM.value: 50,   # "medium"
        TaskPriority.LOW.value: 10       # "low"
    }
    
    # Get weight, default to 10 if unknown
    score += priority_weights.get(task.priority, 10)

    # 2. Deadline Urgency
    if task.deadline:
        time_remaining = (task.deadline - datetime.now()).total_seconds() / 3600 # Hours
        if time_remaining < 0:
            score += 150  # Overdue is super urgent!
        elif time_remaining < 24:
            score += 80   # Due within 24 hours
        elif time_remaining < 48:
            score += 40   # Due within 2 days
    
    return score

def smart_sort_tasks(tasks: List[Task]) -> List[Task]:
    """
    The function your API is looking for!
    Sorts tasks based on the calculated score.
    """
    # Sort by score (descending), then by deadline
    return sorted(
        tasks, 
        key=lambda t: calculate_score(t), 
        reverse=True
    )