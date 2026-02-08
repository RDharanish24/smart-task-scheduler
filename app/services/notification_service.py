import logging

# Setup basic logging to simulate notifications
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("SchedulerWorker")

class NotificationService:
    @staticmethod
    def log_overdue_alert(task_title: str, email: str):
        # This simulates an email/push notification
        logger.info(f"--- [NOTIFICATION SENT] --- Target: {email} | Msg: '{task_title}' is past due!")