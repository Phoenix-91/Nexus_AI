from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    InterviewStartRequest, InterviewStartResponse,
    NextQuestionRequest, NextQuestionResponse
)
from app.services.interview_engine import InterviewEngine

router = APIRouter(prefix="/ai/interview", tags=["interview"])

interview_engine = InterviewEngine()

@router.post("/start", response_model=InterviewStartResponse)
async def start_interview(request: InterviewStartRequest):
    """Start a new interview session"""
    try:
        result = interview_engine.start_interview(
            resume_data=request.resumeData.dict(),
            job_role=request.jobRole,
            experience_level=request.experienceLevel
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start interview: {str(e)}")

@router.post("/next-question", response_model=NextQuestionResponse)
async def next_question(request: NextQuestionRequest):
    """Get next interview question"""
    try:
        result = interview_engine.next_question(
            session_id=request.sessionId,
            user_answer=request.userAnswer
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get next question: {str(e)}")
