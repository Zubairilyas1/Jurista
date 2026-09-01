import uuid
from sqlalchemy import Column, String, DateTime, Text, JSON, ForeignKey, Integer, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Project(Base):
    __tablename__ = "projects"
    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    title = Column(String, index=True)
    status = Column(String, default="active")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    features = relationship("ProjectFeature", back_populates="project", uselist=False)
    brain = relationship("ProjectBrain", back_populates="project", uselist=False)

class ProjectFeature(Base):
    __tablename__ = "project_features"
    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    project_id = Column(String, ForeignKey("projects.id"), unique=True)
    active_modules = Column(JSON, default=list)  # e.g. ["ocr", "chat"]
    
    project = relationship("Project", back_populates="features")

class ProjectBrain(Base):
    __tablename__ = "project_brains"
    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    project_id = Column(String, ForeignKey("projects.id"), unique=True)
    brain_md = Column(Text, default="# Case Brain\n\nNo facts established yet.")
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    project = relationship("Project", back_populates="brain")

# Keep the old ones for compatibility with tracker.py temporarily
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
