import json
from PyPDF2 import PdfReader
from app.utils.llm_client import get_llm_client

class ResumeParser:
    def __init__(self):
        self.llm = get_llm_client(temperature=0.3)
    
    def extract_text(self, pdf_path: str) -> str:
        """Extract text from PDF"""
        try:
            reader = PdfReader(pdf_path)
            text = ""
            for page in reader.pages:
                text += page.extract_text()
            return text
        except Exception as e:
            raise Exception(f"Failed to extract PDF text: {str(e)}")
    
    def structure_resume(self, text: str) -> dict:
        """Structure resume data using LLM"""
        prompt = f"""Extract structured data from this resume. Return ONLY valid JSON with this exact structure:
{{
  "name": "full name",
  "email": "email address",
  "skills": ["skill1", "skill2", ...],
  "experience": [
    {{
      "company": "company name",
      "role": "job title",
      "duration": "time period",
      "responsibilities": ["responsibility1", "responsibility2"]
    }}
  ],
  "projects": [
    {{
      "name": "project name",
      "description": "brief description",
      "technologies": ["tech1", "tech2"],
      "highlights": ["achievement1", "achievement2"]
    }}
  ],
  "education": [
    {{
      "institution": "school name",
      "degree": "degree name",
      "year": "graduation year"
    }}
  ]
}}

Resume text:
{text}

Return ONLY the JSON, no other text."""

        try:
            response = self.llm.invoke(prompt)
            content = response.content.strip()
            
            # Remove markdown code blocks if present
            if content.startswith("```"):
                content = content.split("```")[1]
                if content.startswith("json"):
                    content = content[4:]
            
            return json.loads(content)
        except json.JSONDecodeError as e:
            raise Exception(f"Failed to parse LLM response as JSON: {str(e)}")
        except Exception as e:
            raise Exception(f"Failed to structure resume: {str(e)}")
    
    def parse(self, pdf_path: str) -> dict:
        """Parse PDF resume and return structured data"""
        text = self.extract_text(pdf_path)
        return self.structure_resume(text)
