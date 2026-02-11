from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.db.session import get_db
from app.models.task import Task
from app.schemas.task import TaskCreate, Task as TaskSchema
from app.services.scheduler_service import smart_sort_tasks # Make sure you have this file from Step 2!

router = APIRouter()

from app.services.ai_service import predict_task_duration, check_deadline_risk # Import


@router.post("/", response_model=TaskSchema)
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    # 1. AI Duration Prediction
    predicted_duration = predict_task_duration(task.title, task.priority)
    
    # 2. Risk Analysis
    risk = "Unknown"
    if task.deadline:
        risk = check_deadline_risk(task.deadline, predicted_duration)

    print(f"🤖 AI Prediction: {predicted_duration} mins | Risk: {risk}")

    # Create task normally...
    db_task = Task(**task.model_dump())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

# 2. Get All Tasks (No Auth)
@router.get("/", response_model=List[TaskSchema])
def read_tasks(db: Session = Depends(get_db)):
    return db.query(Task).filter(Task.is_completed == False).all()

# 3. Get Smart Sorted Tasks (No Auth)
@router.get("/smart-order", response_model=List[TaskSchema])
def get_smart_sorted_tasks(db: Session = Depends(get_db)):
    tasks = db.query(Task).filter(Task.is_completed == False).all()
    # If you haven't created services/scheduler_service.py yet,
    # just return 'tasks' here to prevent a crash.
    return smart_sort_tasks(tasks)

# 4. Mark Complete
@router.post("/{task_id}/complete")
def complete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.is_completed = True
    task.completed_at = datetime.now()
    db.commit()
    return {"status": "success"}

# 5. Delete Task
@router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return {"status": "success"}

# 6. Stats Endpoint (Fixes the 404 on Dashboard)
@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    total = db.query(Task).count()
    completed = db.query(Task).filter(Task.is_completed == True).count()
    rate = int((completed / total * 100)) if total > 0 else 0
    return {
        "total_tasks": total,
        "completed": completed,
        "completion_rate": f"{rate}%"
    }