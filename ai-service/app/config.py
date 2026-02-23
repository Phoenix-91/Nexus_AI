import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY")
    # Groq models change over time; allow override via env.
    # Default chosen to avoid known decommissioned model.
    MODEL_NAME: str = os.getenv("GROQ_MODEL_NAME") or "llama-3.3-70b-versatile"
    TEMPERATURE: float = 0.7

settings = Settings()
