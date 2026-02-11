from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.db.session import get_db
from app.models.task import Task
from app.models.timelog import TimeLog
from app.services.productivity import ProductivityService

router = APIRouter()

# --- TIMER ENDPOINTS ---

@router.post("/timer/{task_id}/start")
def start_timer(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Check if already running
    active_log = db.query(TimeLog).filter(
        TimeLog.task_id == task_id, 
        TimeLog.end_time == None
    ).first()
    
    if active_log:
        return {"status": "already_running", "start_time": active_log.start_time}

    # Start new log
    new_log = TimeLog(task_id=task_id, start_time=datetime.now())
    db.add(new_log)
    db.commit()
    return {"status": "started", "start_time": new_log.start_time}

@router.post("/timer/{task_id}/stop")
def stop_timer(task_id: int, db: Session = Depends(get_db)):
    # Find active log
    active_log = db.query(TimeLog).filter(
        TimeLog.task_id == task_id, 
        TimeLog.end_time == None
    ).first()

    if not active_log:
        raise HTTPException(status_code=400, detail="No timer running for this task")

    # Calculate duration
    end_time = datetime.now()
    duration = int((end_time - active_log.start_time).total_seconds() / 60) # Minutes

    # Update Log
    active_log.end_time = end_time
    active_log.duration_minutes = duration
    
    # Update Task Total
    task = db.query(Task).filter(Task.id == task_id).first()
    task.actual_duration += duration

    # --- SMART ADJUSTMENT LOGIC ---
    # If actual > estimated by 50%, flag it
    estimation_alert = None
    if task.actual_duration > (task.estimated_duration * 1.5):
        estimation_alert = "Task took 50% longer than expected. Adjust future estimates?"

    db.commit()
    return {
        "status": "stopped", 
        "duration_session": duration,
        "total_actual": task.actual_duration,
        "alert": estimation_alert
    }

# --- ANALYTICS ENDPOINTS ---

@router.get("/dashboard")
def get_productivity_dashboard(db: Session = Depends(get_db)):
    score = ProductivityService.calculate_score(db)
    burnout = ProductivityService.check_burnout(db)
    times = ProductivityService.get_time_stats(db)

    return {
        "productivity_score": score,
        "burnout_risk": burnout,
        "time_stats": times
    }