import os
from sqlalchemy.orm import Session
from app.models.case import ProjectBrain
from google import genai
from google.genai import types

def update_brain_memory(project_id: str, new_event: str, db: Session):
    try:
        # Fetch existing brain
        brain = db.query(ProjectBrain).filter(ProjectBrain.project_id == project_id).first()
        if not brain:
            print(f"Error: Brain not found for project {project_id}")
            return
            
        gemini_key = os.getenv("GEMINI_API_KEY")
        if not gemini_key:
            print("Error: GEMINI_API_KEY not configured")
            return
            
        client = genai.Client(api_key=gemini_key)
        
        system_instruction = '''You are a meticulous paralegal managing a Case Memory document (brain.md).
Your goal is to carefully merge a NEW EVENT into the existing Case Memory. 
- Keep it structured under "Key Facts", "Documents Uploaded", and "Current Legal Strategy".
- Do not lose old important facts.
- Output ONLY the raw markdown of the updated brain.md.'''

        prompt = f'''Existing Brain:
{brain.brain_md}

NEW EVENT TO MERGE:
{new_event}

Please output the fully updated brain.md:'''

        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.3
            )
        )
        
        # Clean up output
        new_md = response.text.strip()
        if new_md.startswith('`markdown'):
            new_md = new_md[11:-3].strip()
            
        brain.brain_md = new_md
        db.commit()
        print(f"Project {project_id} brain.md successfully updated in background.")
        
    except Exception as e:
        print(f"Failed to update brain memory: {e}")
        db.rollback()
