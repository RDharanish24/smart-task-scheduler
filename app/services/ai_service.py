import joblib
import os
from datetime import datetime

# Load model globally to avoid reloading on every request
MODEL_PATH = "app/ml/models/duration_predictor.pkl"
model = None

if os.path.exists(MODEL_PATH):
    model = joblib.load(MODEL_PATH)

def predict_task_duration(title: str, priority: str) -> int:
    """
    Returns estimated duration in minutes.
    """
    if not model:
        return 60  # Fallback default

    # 1. Preprocess Input
    priority_map = {"low": 1, "medium": 2, "high": 3}
    p_val = priority_map.get(priority.lower(), 2)
    title_len = len(title)
    is_weekend = 1 if datetime.now().weekday() >= 5 else 0

    # 2. Predict
    prediction = model.predict([[p_val, title_len, is_weekend]])
    return int(prediction[0])

def check_deadline_risk(deadline: datetime, estimated_minutes: int) -> str:
    """
    Returns risk level: 'Safe', 'Moderate', 'High Risk'
    """
    if not deadline:
        return "Safe"
    
    time_left = (deadline - datetime.now()).total_seconds() / 60
    if time_left < estimated_minutes:
        return "High Risk 🚨"
    elif time_left < estimated_minutes * 1.5:
        return "Moderate ⚠️"
    return "Safe ✅"