from celery import Celery
from app.config import settings

app = Celery(
    "jurista_worker",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.tasks"]
)

if __name__ == "__main__":
    app.start()
