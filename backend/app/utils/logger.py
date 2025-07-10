from app.models import ActivityLog
from app.extensions import db

def log_event(user_id, event):
    try:
        log = ActivityLog(user_id=user_id, event=event)
        db.session.add(log)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(f"[LogError] Failed to log activity: {e}")
