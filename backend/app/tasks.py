from celery import Celery
from app.core.tracker import CauseListTracker
from datetime import datetime

# Initialize Celery
app = Celery(
    "jurista_tasks",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0"
)

app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Karachi",
    enable_utc=True,
    beat_schedule={
        "daily-cause-list-scrape": {
            "task": "app.tasks.daily_scrape",
            "schedule": 60.0,  # run every 60 seconds for testing ? change to 86400 for daily
            "args": (),
        },
    },
)

@app.task
def daily_scrape():
    print(f"? Running daily scrape at {datetime.now()}")
    tracker = CauseListTracker()
    result = tracker.process_daily_cause_list()
    return f"Processed {len(result) if result else 0} cases"

from celery import Celery
from app.services.ingestor import DataIngestor

app = Celery(
    "jurista_tasks",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0"
)

app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Karachi",
    enable_utc=True,
    beat_schedule={
        "auto-index-statutes": {
            "task": "app.tasks.auto_index_statutes",
            "schedule": 3600.0,  # every hour
            "args": (),
        },
    },
)

@app.task
def auto_index_statutes():
    """Scan the statutes/pending folder and index new files."""
    ingestor = DataIngestor()
    return ingestor.scan_and_index("statutes")

@app.task
def auto_index_case_law():
    """Scan the case_law/pending folder and index new files."""
    ingestor = DataIngestor()
    return ingestor.scan_and_index("case_law")
