from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import resume, interview, report, ats

app = FastAPI(
    title="NEXUS.AI - AI Interview Service",
    description="AI-powered interview preparation service using LangChain and Groq",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(resume.router)
app.include_router(interview.router)
app.include_router(report.router)
app.include_router(ats.router)

@app.get("/")
async def root():
    return {
        "message": "NEXUS.AI Interview Service",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
