from pydantic import BaseModel
from typing import Optional, List, Dict, Any


# ── Resume schemas ──────────────────────────────────────────────────────────

class ResumeData(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    skills: List[str] = []
    experience: List[Dict[str, Any]] = []
    education: List[Dict[str, Any]] = []
    projects: List[Dict[str, Any]] = []
    summary: Optional[str] = None


# ── Interview schemas ───────────────────────────────────────────────────────

class InterviewStartRequest(BaseModel):
    resumeData: ResumeData
    jobRole: str
    experienceLevel: str = "mid"


class InterviewStartResponse(BaseModel):
    sessionId: str
    question: str


class NextQuestionRequest(BaseModel):
    sessionId: str
    userAnswer: str


class NextQuestionResponse(BaseModel):
    question: str
    shouldEnd: bool = False


# ── Report schemas ──────────────────────────────────────────────────────────

class QAItem(BaseModel):
    question: str
    answer: str


class ReportRequest(BaseModel):
    sessionId: str
    qaHistory: List[QAItem]
    resumeData: ResumeData
    jobRole: str
    experienceLevel: str = "mid"


class WeaknessItem(BaseModel):
    area: str
    description: Optional[str] = None
    tip: str


class CategoryScores(BaseModel):
    technical: float = 0
    communication: float = 0
    problemSolving: float = 0
    projectKnowledge: float = 0
    behavioral: float = 0


class QuestionAnalysis(BaseModel):
    question: str
    answer: str
    score: float
    strengths: List[str] = []
    improvements: List[str] = []
    betterAnswer: str = ""


class ActionPlan(BaseModel):
    week1: List[str] = []
    week2: List[str] = []
    week3: List[str] = []
    week4: List[str] = []


class ReportResponse(BaseModel):
    overallScore: float
    categoryScores: CategoryScores
    questionAnalysis: List[QuestionAnalysis] = []
    strengths: List[str] = []
    weaknesses: List[Any] = []
    percentile: float = 50
    actionPlan: ActionPlan
