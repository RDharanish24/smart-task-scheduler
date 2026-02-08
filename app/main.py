from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.session import engine, Base
from app.api import tasks
from app.core.worker import start_scheduler, stop_scheduler

# Create Tables
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("--- 🚀 STARTING SCHEDULER ---")
    start_scheduler()
    yield
    print("--- 🛑 STOPPING SCHEDULER ---")
    stop_scheduler()

app = FastAPI(
    title="Smart Task Scheduler",
    lifespan=lifespan
)

# --- NUCLEAR CORS CONFIGURATION ---
# We explicitly list the frontend URLs. This is safer and works better than "*"
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ----------------------------------

app.include_router(tasks.router, prefix="/tasks", tags=["Tasks"])

@app.get("/")
def root():
    return {"message": "CORS is fixed and API is running!"}