import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import joblib
import os

# 1. Generate Dummy Training Data
# Features: [priority_level (1=Low, 2=Med, 3=High), title_length, is_weekend]
# Target: duration_minutes
data = [
    [1, 10, 0, 30],   # Low priority, short title, weekday -> 30 mins
    [2, 15, 0, 60],   # Med priority, medium title, weekday -> 60 mins
    [3, 20, 0, 120],  # High priority, long title, weekday -> 120 mins
    [3, 10, 1, 90],   # High priority, short title, weekend -> 90 mins
    [1, 50, 0, 45],   # Low priority, long description -> 45 mins
    [2, 30, 0, 75],   # Med priority, medium desc -> 75 mins
]

df = pd.DataFrame(data, columns=['priority', 'title_len', 'is_weekend', 'duration'])

# 2. Train Model
X = df[['priority', 'title_len', 'is_weekend']]
y = df['duration']

model = RandomForestRegressor(n_estimators=10, random_state=42)
model.fit(X, y)

# 3. Save Model
os.makedirs("app/ml/models", exist_ok=True)
joblib.dump(model, "app/ml/models/duration_predictor.pkl")
print("✅ Model trained and saved to app/ml/models/duration_predictor.pkl")