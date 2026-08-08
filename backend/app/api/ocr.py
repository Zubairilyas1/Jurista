from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import os
import tempfile
from app.core.ocr_pipeline import OCRPipeline

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
