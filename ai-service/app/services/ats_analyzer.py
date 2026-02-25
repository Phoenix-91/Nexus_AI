import os
import json
import re
from groq import Groq
from PyPDF2 import PdfReader
from typing import Dict, List, Any

# Job role keyword requirements
JOB_REQUIREMENTS: Dict[str, Dict] = {
    'Frontend Developer': {
        'must_have': ['HTML', 'CSS', 'JavaScript', 'React', 'TypeScript'],
        'good_to_have': ['Next.js', 'Redux', 'Webpack', 'Sass', 'Tailwind CSS', 'Vue', 'Angular'],
    },
    'Backend Developer': {
        'must_have': ['Python', 'Node.js', 'SQL', 'REST API', 'Git'],
        'good_to_have': ['Docker', 'Redis', 'MongoDB', 'AWS', 'Microservices', 'Kubernetes'],
    },
    'Full Stack Developer': {
        'must_have': ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'SQL'],
        'good_to_have': ['TypeScript', 'Docker', 'AWS', 'MongoDB', 'Redis', 'Next.js'],
    },
    'Data Scientist': {
        'must_have': ['Python', 'Machine Learning', 'Pandas', 'NumPy', 'SQL'],
        'good_to_have': ['TensorFlow', 'PyTorch', 'Deep Learning', 'NLP', 'Scikit-learn', 'AWS'],
    },
    'DevOps Engineer': {
        'must_have': ['Docker', 'Kubernetes', 'CI/CD', 'Linux', 'Git'],
        'good_to_have': ['AWS', 'Azure', 'Terraform', 'Ansible', 'Jenkins', 'GCP'],
    },
    'Machine Learning Engineer': {
        'must_have': ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'SQL'],
        'good_to_have': ['Deep Learning', 'NLP', 'Computer Vision', 'AWS', 'Kubernetes', 'MLflow'],
    },
    'Mobile Developer': {
        'must_have': ['React Native', 'Swift', 'Kotlin', 'iOS', 'Android'],
        'good_to_have': ['Flutter', 'Firebase', 'REST API', 'Git', 'Xcode', 'Android Studio'],
    },
    'UI/UX Designer': {
        'must_have': ['Figma', 'Wireframing', 'Prototyping', 'User Research', 'Design Systems'],
        'good_to_have': ['Adobe XD', 'Sketch', 'HTML', 'CSS', 'Usability Testing', 'Accessibility'],
    },
    'Product Manager': {
        'must_have': ['Agile', 'Scrum', 'Roadmap', 'Stakeholder Management', 'JIRA'],
        'good_to_have': ['SQL', 'Analytics', 'A/B Testing', 'OKRs', 'Product Strategy', 'User Stories'],
    },
    'Software Architect': {
        'must_have': ['System Design', 'Microservices', 'API Design', 'Cloud', 'Design Patterns'],
        'good_to_have': ['AWS', 'Kubernetes', 'Security', 'Performance', 'Scalability', 'DevOps'],
    },
}


class ATSAnalyzerService:
    """AI-powered ATS resume analyzer using Groq"""

    def __init__(self):
        self.groq = Groq(api_key=os.getenv('GROQ_API_KEY'))

    def extract_text_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF using PyPDF2"""
        try:
            reader = PdfReader(file_path)
            text = ""
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
            return text.strip()
        except Exception as e:
            raise Exception(f"PDF extraction failed: {str(e)}")

    def calculate_keyword_match(self, resume_text: str, job_role: str) -> Dict[str, Any]:
        """Rule-based keyword matching"""
        requirements = JOB_REQUIREMENTS.get(job_role, {'must_have': [], 'good_to_have': []})
        text_lower = resume_text.lower()

        found = []
        missing = []
        all_keywords = requirements['must_have'] + requirements['good_to_have']

        for kw in all_keywords:
            if kw.lower() in text_lower:
                found.append(kw)
            else:
                missing.append(kw)

        score = (len(found) / len(all_keywords) * 100) if all_keywords else 0

        return {
            'score': round(score),
            'found': found,
            'missing': missing,
        }

    def analyze(self, resume_text: str, job_role: str) -> Dict[str, Any]:
        """Full ATS analysis: rule-based keyword match + Groq AI deep analysis"""
        print(f"🔍 Analyzing resume for: {job_role}")

        # Rule-based keyword matching
        keyword_data = self.calculate_keyword_match(resume_text, job_role)

        prompt = f"""You are an expert ATS (Applicant Tracking System) and HR professional.

Analyze this resume for the position of {job_role}.

RESUME TEXT:
{resume_text[:4000]}

TARGET ROLE: {job_role}

Provide a JSON analysis with EXACTLY these fields:

{{
  "atsScore": <number 0-100>,
  "verdict": "<Excellent|Good|Fair|Poor>",
  "keywordScore": <number 0-100>,
  "formatScore": <number 0-100>,
  "experienceScore": <number 0-100>,
  "skillsScore": <number 0-100>,
  "skillsAnalysis": [
    {{"name": "skill1", "score": 85}},
    {{"name": "skill2", "score": 70}},
    {{"name": "skill3", "score": 60}},
    {{"name": "skill4", "score": 80}},
    {{"name": "skill5", "score": 65}}
  ],
  "suggestions": [
    {{"icon": "📝", "title": "Title", "description": "Detailed actionable advice"}},
    {{"icon": "🔑", "title": "Title", "description": "Detailed actionable advice"}},
    {{"icon": "💼", "title": "Title", "description": "Detailed actionable advice"}},
    {{"icon": "📊", "title": "Title", "description": "Detailed actionable advice"}}
  ],
  "detailedAnalysis": "A 3-4 sentence comprehensive paragraph about resume quality, strengths, gaps, and improvement steps specific to {job_role}."
}}

Be specific and actionable for {job_role}. RESPOND ONLY WITH VALID JSON."""

        response = self.groq.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.7,
            max_tokens=2000,
        )

        ai_result = json.loads(response.choices[0].message.content)

        # Merge AI result with rule-based keyword data
        ai_result['foundKeywords'] = keyword_data['found']
        ai_result['missingKeywords'] = keyword_data['missing']
        ai_result['keywordScore'] = keyword_data['score']

        print(f"✅ Analysis complete. ATS Score: {ai_result.get('atsScore')}")
        return ai_result
