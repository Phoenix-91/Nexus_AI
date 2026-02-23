from fastapi import APIRouter, UploadFile, File, HTTPException
import os
import shutil
from app.services.resume_parser import ResumeParser

router = APIRouter(prefix="/ai", tags=["resume"])

resume_parser = ResumeParser()

@router.post("/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    """Parse uploaded resume PDF"""
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    # Save uploaded file temporarily (cross-platform)
    temp_path = os.path.join(os.getenv("TEMP", "."), file.filename)
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Parse resume
        structured_data = resume_parser.parse(temp_path)
        
        return structured_data
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse resume: {str(e)}")
    
    finally:
        # Clean up temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)
