from fastapi import FastAPI
from app.db.session import engine, Base
from app.api import auth, tasks

# Create Tables (In production, use Alembic)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Smart Task Scheduler")

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(tasks.router, prefix="/tasks", tags=["Tasks"])

@app.get("/")
def root():
    return {"message": "Task Scheduler API is running"}