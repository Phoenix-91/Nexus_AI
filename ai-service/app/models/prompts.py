import json
from typing import List, Dict, Any


def get_interview_system_prompt(job_role: str, experience_level: str, resume_data: dict) -> str:
    """Generate the interview system prompt based on role and resume."""
    skills = ", ".join(resume_data.get("skills", [])[:10]) or "general skills"
    name = resume_data.get("name", "the candidate")
    projects = resume_data.get("projects", [])
    project_names = ", ".join(p.get("name", "") for p in projects[:3] if p.get("name"))

    return f"""You are an expert technical interviewer at a top tech company conducting a {experience_level}-level {job_role} interview.

Candidate: {name}
Key Skills: {skills}
{"Notable Projects: " + project_names if project_names else ""}

Your role:
- Ask one focused, relevant interview question at a time
- Tailor questions to their actual resume experience
- Progress from introductory → technical → behavioral → situational
- Keep questions concise and specific
- Do NOT provide answers, hints, or feedback during the interview
- If an answer is vague, ask one follow-up question to dig deeper
- After 12-15 questions, conclude professionally

Interview style: professional, encouraging, and realistic."""


def get_evaluation_prompt(
    job_role: str,
    experience_level: str,
    resume_data: dict,
    qa_history: List[Any],
) -> str:
    """Generate the evaluation prompt for report generation."""
    qa_text = "\n\n".join(
        f"Q{i+1}: {qa.get('question', '') if isinstance(qa, dict) else qa.question}\n"
        f"A{i+1}: {qa.get('answer', '') if isinstance(qa, dict) else qa.answer}"
        for i, qa in enumerate(qa_history)
    )

    skills = ", ".join(resume_data.get("skills", [])[:15]) or "not specified"

    return f"""You are an expert interview evaluator. Analyze this {experience_level}-level {job_role} interview and return a JSON report.

Candidate Skills: {skills}

Interview Transcript:
{qa_text}

Return ONLY valid JSON in this exact structure (no markdown, no extra text):
{{
  "overall_score": <0-100 integer>,
  "category_scores": {{
    "technical": <0-100>,
    "communication": <0-100>,
    "problemSolving": <0-100>,
    "projectKnowledge": <0-100>,
    "behavioral": <0-100>
  }},
  "question_analysis": [
    {{
      "question": "<question text>",
      "answer": "<answer text>",
      "score": <0-10>,
      "strengths": ["<strength1>", "<strength2>"],
      "improvements": ["<improvement1>"],
      "better_answer": "<brief ideal answer hint>"
    }}
  ],
  "strengths": ["<strength1>", "<strength2>", "<strength3>", "<strength4>", "<strength5>"],
  "weaknesses": [
    {{"area": "<area>", "description": "<what went wrong>", "tip": "<how to improve>"}},
    {{"area": "<area>", "description": "<what went wrong>", "tip": "<how to improve>"}}
  ],
  "percentile": <0-100 estimated percentile vs other candidates>,
  "action_plan": {{
    "week1": ["<action1>", "<action2>", "<action3>"],
    "week2": ["<action1>", "<action2>", "<action3>"],
    "week3": ["<action1>", "<action2>", "<action3>"],
    "week4": ["<action1>", "<action2>", "<action3>"]
  }}
}}"""
