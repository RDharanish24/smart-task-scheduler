from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.db.session import engine, Base
from app.api import auth, tasks
from app.core.worker import start_scheduler, stop_scheduler

# Create Tables
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Start the background worker
    start_scheduler()
    yield
    # Shutdown: Stop the worker
    stop_scheduler()

app = FastAPI(
    title="Smart Task Scheduler",
    lifespan=lifespan
)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(tasks.router, prefix="/tasks", tags=["Tasks"])

@app.get("/")
def root():
    return {"message": "Task Scheduler API is running with Automation"}