import os
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# Use PostgreSQL (or fallback to SQLite for local testing)
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://jurista:jurista_pass@localhost:5432/jurista")

# For sync operations (Celery, etc.)
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Case(Base):
    __tablename__ = "cases"
    id = Column(Integer, primary_key=True, index=True)
    case_number = Column(String, unique=True, index=True)
    parties = Column(String)
    court = Column(String)
    judge = Column(String)
    hearing_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Deadline(Base):
    __tablename__ = "deadlines"
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, index=True)
    deadline_type = Column(String)
    due_date = Column(DateTime)
    alert_sent = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, index=True)
    message = Column(Text)
    sent_via = Column(String)
    sent_at = Column(DateTime, default=datetime.utcnow)

# Create tables if they don't exist (for first run)
Base.metadata.create_all(bind=engine)
print("? PostgreSQL tables ready (or already exist).")
