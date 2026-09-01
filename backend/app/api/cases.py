import os
from pydantic import BaseModel
from typing import List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.case import Project, ProjectFeature, ProjectBrain

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class ProjectCreate(BaseModel):
    title: str
    active_modules: List[str]

class ProjectResponse(BaseModel):
    id: str
    title: str
    status: str
    active_modules: List[str]
    brain_md: str

@router.post("/", response_model=ProjectResponse)
def create_project(req: ProjectCreate, db: Session = Depends(get_db)):
    project = Project(title=req.title)
    db.add(project)
    db.flush() # to get project.id
    
    feature = ProjectFeature(project_id=project.id, active_modules=req.active_modules)
    brain = ProjectBrain(project_id=project.id, brain_md="# Case: " + req.title + "\\n\\n**Key Facts:**\\n- No facts established yet.\\n\\n**Documents Uploaded:**\\n- None.\\n\\n**Current Legal Strategy:**\\n- Pending analysis.")
    
    db.add(feature)
    db.add(brain)
    db.commit()
    db.refresh(project)
    db.refresh(feature)
    db.refresh(brain)
    
    return {
        "id": project.id,
        "title": project.title,
        "status": project.status,
        "active_modules": feature.active_modules,
        "brain_md": brain.brain_md
    }

@router.get("/", response_model=List[ProjectResponse])
def get_projects(db: Session = Depends(get_db)):
    projects = db.query(Project).all()
    res = []
    for p in projects:
        features = p.features.active_modules if p.features else []
        brain_md = p.brain.brain_md if p.brain else ""
        res.append({
            "id": p.id,
            "title": p.title,
            "status": p.status,
            "active_modules": features,
            "brain_md": brain_md
        })
    return res

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: str, db: Session = Depends(get_db)):
    p = db.query(Project).filter(Project.id == project_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    
    features = p.features.active_modules if p.features else []
    brain_md = p.brain.brain_md if p.brain else ""
    return {
        "id": p.id,
        "title": p.title,
        "status": p.status,
        "active_modules": features,
        "brain_md": brain_md
    }



class ProjectUpdate(BaseModel):
    title: str

@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(project_id: str, req: ProjectUpdate, db: Session = Depends(get_db)):
    p = db.query(Project).filter(Project.id == project_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    
    p.title = req.title
    db.commit()
    db.refresh(p)
    
    features = p.features.active_modules if p.features else []
    brain_md = p.brain.brain_md if p.brain else ""
    return {
        "id": p.id,
        "title": p.title,
        "status": p.status,
        "active_modules": features,
        "brain_md": brain_md
    }

@router.delete("/{project_id}")
def delete_project(project_id: str, db: Session = Depends(get_db)):
    p = db.query(Project).filter(Project.id == project_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Delete associated features and brain first (or let CASCADE handle it, but explicit is safer)
    if p.features:
        db.delete(p.features)
    if p.brain:
        db.delete(p.brain)
        
    db.delete(p)
    db.commit()
    return {"message": "Project deleted successfully"}
