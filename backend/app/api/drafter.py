from datetime import datetime
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Optional
import json

from app.core.draft_engine import DraftEngine

router = APIRouter(prefix="/api/v1/drafter", tags=["Drafter"])
engine = DraftEngine()

class DraftRequest(BaseModel):
    petition_type: str = "CRPC_497_BAIL"
    court: str = "High Court of Sindh"
    case_number: str = "______/2025"
    petitioner: str = "Muhammad Ali"
    respondent: str = "The State"
    facts: str = "The petitioner was arrested on allegations of...\n\nHe respectfully submits that the allegations are baseless and false."
    prayer: str = "Grant bail to the petitioner pending trial.\nPass any other order deemed fit."
    party_type: str = "Petitioner"
    bar_license_no: str = "1234/SC"

@router.post("/generate")
async def generate_draft(request: DraftRequest):
    try:
        file_stream = engine.generate_petition(request.dict())
        
        # Prepare filename
        filename = f"Petition_{request.petition_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.docx"
        
        headers = {
            'Content-Disposition': f'attachment; filename="{filename}"'
        }
        
        return Response(
            content=file_stream.getvalue(),
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers=headers
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate_html")
async def generate_draft_html(request: DraftRequest):
    try:
        html_content = engine.generate_petition_html(request.dict())
        return Response(content=html_content, media_type="text/html")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class LLMDraftRequest(BaseModel):
    document_type: str = "Pre-emption Plaint"
    context_text: str

@router.post("/generate_json")
async def generate_draft_json_endpoint(request: LLMDraftRequest):
    try:
        draft_json = engine.generate_draft_json(request.context_text, request.document_type)
        return draft_json
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
