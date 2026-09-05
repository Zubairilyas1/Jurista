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

import os
from google import genai
from google.genai import types

class AssemblyRequest(BaseModel):
    template_type: str
    client_context: str

class AssemblyResponse(BaseModel):
    html_document: str
    missing_variables: list[str]

TEMPLATES = {
    "Rental Agreement": """
    <h2 style="text-align: center;">TENANCY AGREEMENT</h2>
    <p>This Tenancy Agreement is made at <strong>{{CITY}}</strong> on this <strong>{{DATE}}</strong>.</p>
    <h3>BETWEEN</h3>
    <p><strong>{{LANDLORD_NAME}}</strong> holding CNIC No. <strong>{{LANDLORD_CNIC}}</strong> (hereinafter referred to as the "Landlord").</p>
    <h3>AND</h3>
    <p><strong>{{TENANT_NAME}}</strong> holding CNIC No. <strong>{{TENANT_CNIC}}</strong> (hereinafter referred to as the "Tenant").</p>
    <h3>TERMS & CONDITIONS:</h3>
    <ol>
        <li>The monthly rent of the premises located at <strong>{{PROPERTY_ADDRESS}}</strong> is fixed at Rs. <strong>{{RENT_AMOUNT}}</strong>/-.</li>
        <li>The tenancy shall be for a period of <strong>{{TENANCY_PERIOD}}</strong> months commencing from <strong>{{START_DATE}}</strong>.</li>
        <li>The Tenant has paid a security deposit of Rs. <strong>{{SECURITY_DEPOSIT}}</strong>/- to the Landlord.</li>
    </ol>
    """,
    "Legal Notice": """
    <h2 style="text-align: center;">LEGAL NOTICE</h2>
    <p style="text-align: right;">Date: <strong>{{DATE}}</strong></p>
    <p>To,<br/><strong>{{OPPONENT_NAME}}</strong><br/>{{OPPONENT_ADDRESS}}</p>
    <p><strong>SUBJECT: LEGAL NOTICE FOR {{SUBJECT_MATTER}}</strong></p>
    <p>Dear Sir/Madam,</p>
    <p>Under the instructions of my client, <strong>{{CLIENT_NAME}}</strong>, I hereby serve you with the following legal notice:</p>
    <p>{{NOTICE_DETAILS}}</p>
    <p>You are hereby called upon to comply within <strong>{{NOTICE_PERIOD}}</strong> days, failing which my client shall be constrained to initiate legal proceedings against you.</p>
    <br/><br/>
    <p>Yours sincerely,</p>
    <p><strong>{{LAWYER_NAME}}</strong><br/>Advocate High Court</p>
    """
}

@router.post("/assemble", response_model=AssemblyResponse)
async def assemble_document(req: AssemblyRequest):
    gemini_key = os.getenv("GEMINI_API_KEY")
    if not gemini_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not configured.")
        
    client = genai.Client(api_key=gemini_key)
    
    template = TEMPLATES.get(req.template_type, TEMPLATES["Rental Agreement"])
    
    system_instruction = """
    You are a precise Legal Document Assembly AI. 
    You are given a raw HTML template with {{VARIABLES}} and an unstructured client email/notes.
    Your job is to extract the facts from the client notes, replace the {{VARIABLES}} in the HTML with the extracted data, and return a JSON object.
    If a variable is not mentioned in the client notes, replace it with "[MISSING: Variable Name]" and add it to the missing_variables list.
    
    Output strictly as JSON:
    {
       "html_document": "<h2...",
       "missing_variables": ["TENANT_CNIC", "SECURITY_DEPOSIT"]
    }
    """
    
    prompt = f"""
    TEMPLATE:
    {template}
    
    CLIENT NOTES:
    {req.client_context}
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.1,
                response_mime_type="application/json"
            )
        )
        
        data = json.loads(response.text)
        return AssemblyResponse(
            html_document=data.get("html_document", ""),
            missing_variables=data.get("missing_variables", [])
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
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
        import traceback
        print(f"DRAFTER 500 ERROR: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
