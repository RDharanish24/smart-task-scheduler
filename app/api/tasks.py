from app.services.ai_service import predict_task_duration, check_deadline_risk # Import
# ... existing imports ...

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