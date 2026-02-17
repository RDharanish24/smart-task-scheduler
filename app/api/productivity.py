from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.db.session import get_db
from app.models.task import Task
from app.models.timelog import TimeLog
from app.services.productivity import ProductivityService
from app.models.task import Task
from app.models.timelog import TimeLog

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

@router.post("/tasks/{task_id}/finish-focus")
def finish_focus_session(task_id: int, db: Session = Depends(get_db)):
    # 1. Stop any running timer
    active_log = db.query(TimeLog).filter(
        TimeLog.task_id == task_id, 
        TimeLog.end_time == None
    ).first()

    duration_added = 0
    if active_log:
        end_time = datetime.now()
        duration_added = int((end_time - active_log.start_time).total_seconds() / 60)
        active_log.end_time = end_time
        active_log.duration_minutes = duration_added

    # 2. Update Task
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.actual_duration += duration_added
    task.is_completed = True
    task.completed_at = datetime.now()
    
    # 3. GAMIFICATION LOGIC 🎮
    points = 50 # Base points for finishing
    message = "Task Completed!"
    type = "neutral"

    # Efficiency Bonus (Finished faster than estimate)
    if task.actual_duration < task.estimated_duration:
        bonus = 20
        points += bonus
        message = f"🚀 Speed Demon! You saved {task.estimated_duration - task.actual_duration} mins."
        type = "success"
    
    # Planning Penalty (Took way longer than estimate)
    elif task.actual_duration > (task.estimated_duration * 1.2):
        penalty = 10
        points -= penalty
        message = f"⚠️ Overtime! You exceeded estimate by {task.actual_duration - task.estimated_duration} mins."
        type = "warning"
    
    else:
        message = "✅ On Target! Great planning."
        type = "success"

    db.commit()
    
    return {
        "status": "completed",
        "points_earned": points,
        "message": message,
        "type": type,
        "final_duration": task.actual_duration
    }