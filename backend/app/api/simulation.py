from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import json
from typing import List, Optional
from google import genai
from google.genai import types

router = APIRouter(prefix="/api/v1/simulation", tags=["Simulation"])

class ChatMessage(BaseModel):
    role: str # "user" or "opponent"
    content: str

class SimulationTurnRequest(BaseModel):
    scenario: str
    difficulty: str
    history: List[ChatMessage]
    user_argument: str

class SimulationTurnResponse(BaseModel):
    opponent_reply: str
    judge_feedback: str
    points_awarded: int
    points_deducted: int
    current_score: int

class SimulationReportRequest(BaseModel):
    scenario: str
    history: List[ChatMessage]

class SimulationReportResponse(BaseModel):
    strategic_missteps: List[str]
    strongest_arguments: List[str]
    missed_opportunities: List[str]
    final_verdict: str

@router.post("/turn", response_model=SimulationTurnResponse)
async def simulation_turn(req: SimulationTurnRequest):
    gemini_key = os.getenv("GEMINI_API_KEY")
    if not gemini_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not configured.")
        
    client = genai.Client(api_key=gemini_key)
    
    difficulty_profiles = {
        "Junior Associate": "You make obvious mistakes, cite basic law, and are easy to overpower. You are slightly intimidated.",
        "Senior Counsel": "You are aggressive, use solid precedents, quickly object to hearsay or weak facts, and maintain a commanding tone.",
        "Supreme Court Advocate": "You are ruthless and elite. You trap the user in logical contradictions, cite highly technical Pakistani law, and aggressively attack procedural flaws."
    }
    
    profile = difficulty_profiles.get(req.difficulty, difficulty_profiles["Senior Counsel"])
    
    system_instruction = f"""
    You are a dual-entity acting in a Pakistani Moot Court Simulator.
    Entity 1: The Opposing Counsel. {profile}
    Entity 2: The Judge (who silently scores the user's argument).
    
    The user is Lawyer A. You are Lawyer B (Opposing Counsel).
    Analyze the user's latest argument based on the scenario.
    You MUST output valid JSON ONLY.
    
    Format:
    {{
      "opponent_reply": "Your honor, my learned friend's argument is...",
      "judge_feedback": "Short private feedback: e.g., Valid point on Article 114 QSO, but missed the timeline issue.",
      "points_awarded": (integer 0 to 20 based on strength),
      "points_deducted": (integer 0 to 10 based on flaws/weaknesses),
      "current_score": 0
    }}
    Note: 'current_score' field in JSON is a dummy, the frontend calculates total.
    """
    
    # Build history context
    history_text = ""
    for msg in req.history[-6:]: # Keep context bounded
        history_text += f"{msg.role.upper()}: {msg.content}\n"
        
    prompt = f"""
    SCENARIO: {req.scenario}
    
    RECENT HISTORY:
    {history_text}
    
    USER'S LATEST ARGUMENT:
    {req.user_argument}
    
    Generate your JSON response.
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.7,
                response_mime_type="application/json"
            )
        )
        
        data = json.loads(response.text)
        return SimulationTurnResponse(
            opponent_reply=data.get("opponent_reply", "I have no further arguments."),
            judge_feedback=data.get("judge_feedback", "No feedback."),
            points_awarded=data.get("points_awarded", 0),
            points_deducted=data.get("points_deducted", 0),
            current_score=0 # Let frontend manage total score state
        )
    except Exception as e:
        print("Error in simulation turn:", e)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/report", response_model=SimulationReportResponse)
async def simulation_report(req: SimulationReportRequest):
    gemini_key = os.getenv("GEMINI_API_KEY")
    if not gemini_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not configured.")
        
    client = genai.Client(api_key=gemini_key)
    
    system_instruction = """
    You are a Senior Managing Partner at a top-tier Pakistani law firm reviewing a junior's moot court transcript.
    Analyze the transcript and provide a JSON report on their performance.
    
    Format:
    {
      "strategic_missteps": ["List item 1", "List item 2"],
      "strongest_arguments": ["List item 1", "List item 2"],
      "missed_opportunities": ["List item 1", "List item 2"],
      "final_verdict": "Overall summary of their performance..."
    }
    """
    
    transcript = ""
    for msg in req.history:
        transcript += f"{msg.role.upper()}: {msg.content}\n"
        
    prompt = f"""
    SCENARIO: {req.scenario}
    
    TRANSCRIPT:
    {transcript}
    
    Generate the performance report JSON.
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.4,
                response_mime_type="application/json"
            )
        )
        
        data = json.loads(response.text)
        return SimulationReportResponse(
            strategic_missteps=data.get("strategic_missteps", []),
            strongest_arguments=data.get("strongest_arguments", []),
            missed_opportunities=data.get("missed_opportunities", []),
            final_verdict=data.get("final_verdict", "End of simulation.")
        )
    except Exception as e:
        print("Error in simulation report:", e)
        raise HTTPException(status_code=500, detail=str(e))
