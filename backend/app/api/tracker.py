from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.core.tracker import CauseListTracker
from app.database import SessionLocal, Case, Deadline
from app.api.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/v1/tracker", tags=["Tracker"])
tracker = CauseListTracker()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/cases")
async def get_tracked_cases(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cases = db.query(Case).filter(Case.user_id == current_user.id).all()
    result = []
    for c in cases:
        deadlines = db.query(Deadline).filter(Deadline.case_id == c.id).all()
        for d in deadlines:
            result.append({
                "case_number": c.case_number,
                "parties": c.parties,
                "court": c.court,
                "hearing_date": c.hearing_date.strftime("%Y-%m-%d") if c.hearing_date else "N/A",
                "deadline": d.due_date.strftime("%Y-%m-%d") if d.due_date else "N/A"
            })
    return {"cases": result}

@router.post("/refresh")
async def refresh_cause_list():
    try:
        cases = tracker.process_daily_cause_list()
        return {"status": "success", "cases_processed": len(cases) if cases else 0}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class ManualCase(BaseModel):
    case_number: str
    parties: str
    court: str
    judge: str = "Unknown"
    hearing_date: str

@router.post("/add")
async def add_manual_case(case_data: ManualCase, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        data_dict = {
            "case_number": case_data.case_number,
            "parties": case_data.parties,
            "court": case_data.court,
            "judge": case_data.judge,
            "hearing_date": case_data.hearing_date,
            "user_id": current_user.id
        }
        # Assuming tracker.store_case is updated to handle user_id, 
        # but to be safe we'll create the Case object manually here if it doesn't
        deadline = tracker.compute_deadline(case_data.hearing_date)
        
        # Manually create to ensure user_id is injected correctly
        new_case = Case(
            user_id=current_user.id,
            case_number=case_data.case_number,
            parties=case_data.parties,
            court=case_data.court,
            judge=case_data.judge,
            hearing_date=datetime.strptime(case_data.hearing_date, "%Y-%m-%d") if case_data.hearing_date else None
        )
        db.add(new_case)
        db.commit()
        db.refresh(new_case)
        
        if deadline:
            new_deadline = Deadline(case_id=new_case.id, deadline_type="Next Hearing", due_date=deadline)
            db.add(new_deadline)
            db.commit()
            
        return {"status": "success", "message": f"Case {case_data.case_number} added successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
