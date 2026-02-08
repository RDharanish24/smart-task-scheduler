from apscheduler.schedulers.background import BackgroundScheduler
from app.db.session import SessionLocal
from app.services.automation import AutomationService

# Create the scheduler instance
scheduler = BackgroundScheduler()

def run_auto_rescheduler():
    """Wrapper to provide DB session to the service"""
    db = SessionLocal()
    try:
        AutomationService.process_missed_tasks(db)
    finally:
        db.close()

def run_deadline_reminders():
    """Wrapper to provide DB session to the reminder service"""
    db = SessionLocal()
    try:
        AutomationService.check_reminders(db)
    finally:
        db.close()

def start_scheduler():
    # Job 1: Check for missed tasks every 1 minute (Aggressive for demo purposes)
    scheduler.add_job(run_auto_rescheduler, 'interval', minutes=1, id='auto_reschedule')
    
    # Job 2: Check for reminders every 30 seconds
    scheduler.add_job(run_deadline_reminders, 'interval', seconds=30, id='reminders')
    
    scheduler.start()
    print("--- 🚀 Background Scheduler Started ---")

def stop_scheduler():
    scheduler.shutdown()
    print("--- 🛑 Background Scheduler Stopped ---")