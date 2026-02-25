import os
import shutil
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services.ats_analyzer import ATSAnalyzerService

router = APIRouter(prefix="/ai", tags=["ats"])

analyzer = ATSAnalyzerService()


@router.post("/analyze-ats")
async def analyze_ats(
    file: UploadFile = File(...),
    jobRole: str = Form(...),
):
    """
    Analyze uploaded resume PDF against a target job role.
    Returns full ATS analysis with scores, keywords, and AI suggestions.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    temp_path = os.path.join(os.getenv("TEMP", "."), file.filename)

    try:
        # Save temp file
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        print(f"📄 Received: {file.filename} | Role: {jobRole}")

        # Extract text
        resume_text = analyzer.extract_text_from_pdf(temp_path)

        if not resume_text.strip():
            raise HTTPException(status_code=422, detail="Could not extract text from PDF. Ensure it is not scanned/image-based.")

        # Run analysis
        result = analyzer.analyze(resume_text, jobRole)

        return {"success": True, "analysis": result}

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ ATS analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
