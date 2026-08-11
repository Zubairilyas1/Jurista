from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import os
import tempfile
from app.core.ocr_pipeline import OCRPipeline
from pydantic import BaseModel
from groq import AsyncGroq

router = APIRouter(prefix="/api/v1/ocr", tags=["OCR"])
pipeline = OCRPipeline()

@router.post("/process")
async def process_ocr(file: UploadFile = File(...)):
    # Validate file type
    allowed = ["image/jpeg", "image/png", "application/pdf"]
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="Only PDF, JPEG, PNG allowed")
    
    # Read file bytes
    try:
        contents = await file.read()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading file: {str(e)}")

    # Process
    try:
        result = pipeline.process_file(contents, file.filename)
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {str(e)}")

class TranslateRequest(BaseModel):
    text: str

@router.post("/translate")
async def translate_text(req: TranslateRequest):
    if not req.text or not req.text.strip():
        raise HTTPException(status_code=400, detail="No text provided for translation.")

    api_key = os.getenv("LLM_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="LLM_API_KEY not configured in settings.")
    
    model_name = os.getenv("LLM_MODEL_NAME", "llama-3.3-70b-versatile")
    client = AsyncGroq(api_key=api_key)

    system_prompt = (
        "You are an expert legal translator specializing in Pakistani law. "
        "Your task is to accurately translate Urdu legal text (often containing Persian/Arabic terminology) into professional legal English. "
        "Preserve the original legal meaning. Do not summarize or add commentary. "
        "Ensure terms like 'FIR' (First Information Report), 'Taftish' (Investigation), 'Musamma' (Named), 'Mustaghis' (Complainant), 'Mudda Aliha' (Defendant) are translated accurately."
    )

    try:
        completion = await client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": req.text}
            ],
            temperature=0.1,
            max_tokens=4000
        )
        translated_text = completion.choices[0].message.content
        return {"translated_text": translated_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")
