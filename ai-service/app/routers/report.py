from fastapi import APIRouter, HTTPException
from app.models.schemas import ReportRequest, ReportResponse
from app.services.report_generator import ReportGenerator

router = APIRouter(prefix="/ai/report", tags=["report"])

report_generator = ReportGenerator()

@router.post("/generate", response_model=ReportResponse)
async def generate_report(request: ReportRequest):
    """Generate comprehensive interview report"""
    try:
        report = report_generator.generate(
            session_id=request.sessionId,
            qa_history=request.qaHistory,
            resume_data=request.resumeData.dict(),
            job_role=request.jobRole,
            experience_level=request.experienceLevel
        )
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate report: {str(e)}")
