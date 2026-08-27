from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import re
import os
from typing import List, Optional
from app.core.overrule_graph import OverruleGraph
from google import genai
from google.genai import types
import json

router = APIRouter()
graph = OverruleGraph()

class AnalyzeRequest(BaseModel):
    document_text: str

class CitationStatus(BaseModel):
    citation: str
    status: str
    message: str
    snippet: str

class AnalyzeResponse(BaseModel):
    citations: List[CitationStatus]

class ContradictionRequest(BaseModel):
    doc_a_text: str
    doc_a_label: str
    doc_b_text: str
    doc_b_label: str

class ContradictionItem(BaseModel):
    topic: str
    doc_a_claims: str
    doc_b_claims: str
    suggested_question: str

class ContradictionResponse(BaseModel):
    contradictions: List[ContradictionItem]

# Regex for Pakistani legal citations
CITATION_REGEX = re.compile(r'\b(?:PLD|SCMR|YLR|CLC|PCrLJ|MLD)\s+\d{4}\s+(?:SC|LHC|IHC|SHC|PHC|BHC)?\s*\d+\b|\b\d{4}\s+(?:PLD|SCMR|YLR|CLC|PCrLJ|MLD)\s+(?:SC|LHC|IHC|SHC|PHC|BHC)?\s*\d+\b', re.IGNORECASE)

@router.post("/analyze-opponent", response_model=AnalyzeResponse)
async def analyze_opponent(req: AnalyzeRequest):
    try:
        text = req.document_text
        matches = set(CITATION_REGEX.findall(text))
        
        results = []
        for match in matches:
            normalized = " ".join(match.upper().split())
            status_data = graph.get_case_status(normalized)
            is_valid, msg = graph.is_citable(normalized)
            
            idx = text.upper().find(normalized)
            snippet = ""
            if idx != -1:
                start = max(0, idx - 40)
                end = min(len(text), idx + len(normalized) + 40)
                snippet = "..." + text[start:end].replace('\n', ' ') + "..."
            
            results.append(CitationStatus(
                citation=normalized,
                status=status_data.get("status", "UNKNOWN"),
                message=msg,
                snippet=snippet
            ))
            
        return AnalyzeResponse(citations=results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze-contradictions", response_model=ContradictionResponse)
async def analyze_contradictions(req: ContradictionRequest):
    gemini_key = os.getenv("GEMINI_API_KEY")
    if not gemini_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not configured.")
        
    client = genai.Client(api_key=gemini_key)
    
    system_instruction = """
    You are an elite Pakistani defense attorney. 
    Your job is to cross-reference two documents (e.g. an FIR and a Medical Report, or two witness statements) 
    and identify strict logical contradictions, timeline mismatches, or physical impossibilities between them.
    
    You MUST output valid JSON only. No markdown formatting around it.
    Format:
    {
      "contradictions": [
        {
          "topic": "Time of Incident",
          "doc_a_claims": "...",
          "doc_b_claims": "...",
          "suggested_question": "..."
        }
      ]
    }
    """
    
    prompt = f"""
    Document A [{req.doc_a_label}]:
    {req.doc_a_text}
    
    Document B [{req.doc_b_label}]:
    {req.doc_b_text}
    
    Identify the contradictions.
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.2,
                response_mime_type="application/json"
            )
        )
        
        data = json.loads(response.text)
        return ContradictionResponse(contradictions=data.get("contradictions", []))
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
