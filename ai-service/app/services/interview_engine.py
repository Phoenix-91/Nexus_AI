import uuid
import json
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain
from langchain.prompts import PromptTemplate
from app.utils.llm_client import get_llm_client
from app.models.prompts import get_interview_system_prompt

class InterviewEngine:
    def __init__(self):
        self.llm = get_llm_client()
        self.sessions = {}
    
    def start_interview(self, resume_data: dict, job_role: str, experience_level: str) -> dict:
        """Start a new interview session"""
        session_id = str(uuid.uuid4())
        
        # Create conversation memory
        memory = ConversationBufferMemory()
        
        # Store resume context in memory
        resume_summary = json.dumps(resume_data, indent=2)
        memory.save_context(
            {"input": "Resume data"},
            {"output": resume_summary}
        )
        
        # Create conversation chain
        system_prompt = get_interview_system_prompt(job_role, experience_level, resume_data)
        
        prompt_template = PromptTemplate(
            input_variables=["history", "input"],
            template=f"""{system_prompt}

Conversation history:
{{history}}

Current input: {{input}}

Your response (one question only):"""
        )
        
        chain = ConversationChain(
            llm=self.llm,
            memory=memory,
            prompt=prompt_template,
            verbose=False
        )
        
        # Store session
        self.sessions[session_id] = {
            "chain": chain,
            "resume": resume_data,
            "role": job_role,
            "level": experience_level,
            "question_count": 0
        }
        
        # Generate first question
        first_question = chain.predict(input="Start the interview with an introduction question.")
        self.sessions[session_id]["question_count"] = 1
        
        return {
            "sessionId": session_id,
            "question": first_question
        }
    
    def next_question(self, session_id: str, user_answer: str) -> dict:
        """Get next question based on user's answer"""
        if session_id not in self.sessions:
            raise ValueError(f"Session {session_id} not found")
        
        session = self.sessions[session_id]
        chain = session["chain"]
        session["question_count"] += 1
        
        # Check if we should end
        should_end = session["question_count"] >= 15
        
        if should_end:
            return {
                "question": "Thank you for your time. That concludes our interview.",
                "shouldEnd": True
            }
        
        # Generate next question
        next_q = chain.predict(input=user_answer)
        
        return {
            "question": next_q,
            "shouldEnd": False
        }
    
    def get_session(self, session_id: str) -> dict:
        """Get session data"""
        return self.sessions.get(session_id)
    
    def cleanup_session(self, session_id: str):
        """Remove session from memory"""
        if session_id in self.sessions:
            del self.sessions[session_id]
