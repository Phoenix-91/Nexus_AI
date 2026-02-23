import json
from app.utils.llm_client import get_llm_client
from app.models.prompts import get_evaluation_prompt

class ReportGenerator:
    def __init__(self):
        self.llm = get_llm_client(temperature=0.5)
    
    def generate(self, session_id: str, qa_history: list, resume_data: dict, 
                 job_role: str, experience_level: str) -> dict:
        """Generate comprehensive interview report"""
        
        prompt = get_evaluation_prompt(job_role, experience_level, resume_data, qa_history)
        
        try:
            response = self.llm.invoke(prompt)
            content = response.content.strip()
            
            # Remove markdown code blocks if present
            if content.startswith("```"):
                content = content.split("```")[1]
                if content.startswith("json"):
                    content = content[4:]
            
            report_data = json.loads(content)
            
            # Transform strengths: convert objects to simple strings if needed
            strengths = report_data.get("strengths", [])
            transformed_strengths = []
            for strength in strengths:
                if isinstance(strength, dict):
                    # AI returned object, extract description or example
                    desc = strength.get('description', strength.get('strength', strength.get('name', '')))
                    example = strength.get('example', '')
                    if desc and example:
                        transformed_strengths.append(f"{desc}: {example}")
                    elif desc:
                        transformed_strengths.append(desc)
                    else:
                        transformed_strengths.append(str(strength))
                else:
                    # Already a string
                    transformed_strengths.append(str(strength))
            
            # Transform weaknesses: ensure proper structure with area, description, tip
            weaknesses = report_data.get("weaknesses", [])
            transformed_weaknesses = []
            for weakness in weaknesses:
                if isinstance(weakness, dict):
                    # Extract fields, handling various naming conventions
                    area = weakness.get('area', weakness.get('weakness', weakness.get('name', weakness.get('description', 'General'))))
                    description = weakness.get('description', weakness.get('weakness', ''))
                    tip = weakness.get('tip', weakness.get('improvement', weakness.get('suggestion', 'Focus on improvement in this area')))
                    
                    transformed_weaknesses.append({
                        "area": str(area),
                        "description": str(description) if description else None,
                        "tip": str(tip)
                    })
                else:
                    # Convert string to proper object
                    transformed_weaknesses.append({
                        "area": "General",
                        "description": str(weakness),
                        "tip": "Focus on improvement in this area"
                    })
            
            # Convert snake_case to camelCase for consistency with frontend
            formatted_report = {
                "overallScore": report_data.get("overall_score", 0),
                "categoryScores": {
                    "technical": report_data.get("category_scores", {}).get("technical", 0),
                    "communication": report_data.get("category_scores", {}).get("communication", 0),
                    "problemSolving": report_data.get("category_scores", {}).get("problemSolving", 0),
                    "projectKnowledge": report_data.get("category_scores", {}).get("projectKnowledge", 0),
                    "behavioral": report_data.get("category_scores", {}).get("behavioral", 0),
                },
                "questionAnalysis": [
                    {
                        "question": qa.get("question", ""),
                        "answer": qa.get("answer", ""),
                        "score": qa.get("score", 0),
                        "strengths": qa.get("strengths", []),
                        "improvements": qa.get("improvements", []),
                        "betterAnswer": qa.get("better_answer", "")
                    }
                    for qa in report_data.get("question_analysis", [])
                ],
                "strengths": transformed_strengths,
                "weaknesses": transformed_weaknesses,
                "percentile": report_data.get("percentile", 50),
                "actionPlan": {
                    "week1": report_data.get("action_plan", {}).get("week1", []),
                    "week2": report_data.get("action_plan", {}).get("week2", []),
                    "week3": report_data.get("action_plan", {}).get("week3", []),
                    "week4": report_data.get("action_plan", {}).get("week4", []),
                }
            }
            
            return formatted_report
            
        except json.JSONDecodeError as e:
            # Fallback report if LLM doesn't return valid JSON
            return self._generate_fallback_report(qa_history)
        except Exception as e:
            raise Exception(f"Failed to generate report: {str(e)}")
    
    def _generate_fallback_report(self, qa_history: list) -> dict:
        """Generate a basic fallback report"""
        return {
            "overallScore": 70,
            "categoryScores": {
                "technical": 70,
                "communication": 75,
                "problemSolving": 68,
                "projectKnowledge": 72,
                "behavioral": 70,
            },
            "questionAnalysis": [
                {
                    "question": qa.get("question", ""),
                    "answer": qa.get("answer", ""),
                    "score": 7,
                    "strengths": ["Clear communication"],
                    "improvements": ["Provide more specific examples"],
                    "betterAnswer": ""
                }
                for qa in qa_history
            ],
            "strengths": [
                "Good communication skills",
                "Relevant experience",
                "Technical knowledge",
                "Problem-solving approach",
                "Professional demeanor"
            ],
            "weaknesses": [
                "Could provide more specific examples",
                "Expand on technical details",
                "Discuss challenges faced",
                "Elaborate on project outcomes",
                "Demonstrate leadership skills"
            ],
            "percentile": 65,
            "actionPlan": {
                "week1": [
                    "Review core technical concepts",
                    "Practice STAR method for behavioral questions",
                    "Prepare project examples with metrics"
                ],
                "week2": [
                    "Deep dive into system design",
                    "Practice coding problems",
                    "Review company research techniques"
                ],
                "week3": [
                    "Mock interviews with peers",
                    "Refine elevator pitch",
                    "Study industry trends"
                ],
                "week4": [
                    "Final mock interviews",
                    "Review all prepared examples",
                    "Mental preparation and confidence building"
                ]
            }
        }
