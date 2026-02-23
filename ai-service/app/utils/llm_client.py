from langchain_groq import ChatGroq
from app.config import settings

def get_llm_client(temperature: float = None):
    """Get Groq LLM client"""
    return ChatGroq(
        groq_api_key=settings.GROQ_API_KEY,
        model_name=settings.MODEL_NAME,
        temperature=temperature or settings.TEMPERATURE,
    )
