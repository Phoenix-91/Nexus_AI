<div align="center">

# NEXUS.AI

### AI-Powered Interview Preparation Platform

![Version](https://img.shields.io/badge/Version-2.1-8b5cf6?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Production-22c55e?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-3b82f6?style=for-the-badge)

A full-stack AI interview simulator with real-time voice conversation, resume-aware questioning, ATS analysis, and a glassmorphism UI.

[Features](#features) · [Architecture](#architecture) · [Quick Start](#quick-start) · [API Reference](#api-reference) · [Contributing](#contributing)

---

</div>

## Features

| Feature | Description |
|---|---|
| **Conversational Voice AI** | Real-time voice interviews powered by Deepgram STT + TTS |
| **Resume-Aware Questions** | AI extracts skills from your resume and tailors every question to your background |
| **Multi-LLM Backend** | Supports Groq (Llama 3.3), Claude, and Gemini models |
| **Smart Analytics** | Scores across Technical, Communication, and Problem-Solving dimensions |
| **30-Day Action Plan** | Auto-generated personalized improvement roadmap |
| **ATS Score Checker** | Upload a resume, select a job role, and receive an AI-powered ATS score with keyword gap analysis and improvement tips |
| **Secure Authentication** | Clerk-powered auth with JWT token verification on all protected routes |
| **Auto-Flow Interview** | Silence detection triggers auto-stop and auto-transcription — no manual controls needed |

---

## Screenshots

### Landing Page

<p align="center">
  <img src="./screenshots/LandingPage.png" width="800" />
</p>

---

### Interview Interface

<p align="center">
  <img src="./screenshots/InterviewInterface.png" width="800" />
</p>

---

### ATS Checker Report

<p align="center">
  <img src="./screenshots/EmailAutomationPage.png" width="800" />
</p>

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    NEXUS.AI Platform                     │
├────────────────┬───────────────────┬─────────────────────┤
│   Frontend     │     Backend       │    AI Service        │
│   React 18     │   Node.js 20      │   Python / FastAPI   │
│   Vite 5       │   Express 5       │   LangChain + Groq   │
│   Tailwind CSS │   MongoDB         │   Deepgram SDK       │
│   Clerk Auth   │   Clerk Auth      │   PyPDF2             │
│   Port: 5173   │   Port: 5000      │   Port: 8000         │
└────────────────┴───────────────────┴─────────────────────┘
          │                │                   │
          └────────────────┴───────────────────┘
                     HTTP / REST API
```

### Request Flow

```
User (Browser) ──► Frontend (React)
                        │
                        ├──► Backend /api/resume     ──► MongoDB
                        ├──► Backend /api/interview  ──► AI Service (FastAPI)
                        ├──► Backend /api/transcribe ──► Deepgram STT
                        ├──► Backend /api/speak      ──► Deepgram TTS
                        └──► Backend /api/ats        ──► AI Service /ai/analyze-ats
```

---

## Project Structure

```
nexus-ai/
├── frontend/                    # React + Vite SPA
│   └── src/
│       ├── components/
│       │   ├── aceternity/      # AuroraBackground, MovingBorder, SpotlightCard
│       │   ├── common/          # GlassCard, Loader, FileUpload
│       │   └── ui/              # shadcn/ui primitives
│       ├── hooks/
│       │   ├── useConversationalRecorder.js   # Auto-flow: silence detect + transcribe
│       │   ├── useThaliaSpeech.js             # Deepgram TTS hook
│       │   └── useAudioRecorder.js            # MediaRecorder wrapper
│       ├── pages/
│       │   ├── Landing.jsx
│       │   ├── Dashboard.jsx
│       │   ├── InterviewSetup.jsx
│       │   ├── InterviewSession.jsx
│       │   ├── Report.jsx
│       │   └── ATSChecker/
│       │       ├── Upload.jsx
│       │       └── Report.jsx
│       ├── services/            # Axios API clients
│       ├── store/               # Zustand global state
│       └── utils/
│
├── backend/                     # Node.js Express API
│   └── src/
│       ├── controllers/
│       ├── routes/
│       ├── models/              # Mongoose schemas
│       ├── middleware/          # Clerk auth, Multer upload
│       └── services/
│           ├── deepgramService.js
│           ├── aiService.js     # FastAPI bridge
│           └── ats.service.js
│
├── ai-service/                  # Python FastAPI AI Engine
│   └── app/
│       ├── routers/
│       │   ├── interview.py
│       │   ├── resume.py
│       │   ├── report.py
│       │   └── ats.py
│       ├── services/
│       │   ├── interview_engine.py
│       │   ├── resume_parser.py
│       │   ├── report_generator.py
│       │   └── ats_analyzer.py
│       ├── models/              # Pydantic schemas
│       ├── utils/llm_client.py
│       ├── config.py
│       └── main.py
│
├── README.md
└── SETUP.md
```

---

## Quick Start

### Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Node.js | `18+` | Frontend and backend |
| Python | `3.9+` | AI service |
| MongoDB | `6+` | Local or Atlas |
| Clerk Account | — | [clerk.com](https://clerk.com) — free tier |
| Groq API Key | — | [console.groq.com](https://console.groq.com) — free |
| Deepgram API Key | — | [deepgram.com](https://deepgram.com) — required for voice |

### 1. Clone the Repository

```bash
git clone https://github.com/Phoenix-91/Nexus_AI.git
cd Nexus_AI
```

### 2. Install Dependencies

```bash
# Frontend
cd frontend && npm install

# Backend
cd ../backend && npm install

# AI Service
cd ../ai-service && pip install -r requirements.txt
```

### 3. Configure Environment Variables

**`frontend/.env`**
```env
VITE_API_URL=http://localhost:5000/api
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
```

**`backend/.env`**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nexusai
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
DEEPGRAM_API_KEY=your_deepgram_api_key
PYTHON_AI_SERVICE_URL=http://localhost:8000
```

**`ai-service/.env`**
```env
GROQ_API_KEY=your_groq_api_key
```

### 4. Start All Services

Open three separate terminals:

```bash
# Terminal 1 — AI Service
cd ai-service
py -m uvicorn app.main:app --reload --port 8000
```

```bash
# Terminal 2 — Backend
cd backend
npm run dev
```

```bash
# Terminal 3 — Frontend
cd frontend
npm run dev
```

Open **http://localhost:5173** in Chrome or Edge.

---

## Usage

### Interview Flow

```
1. Sign up or log in        →  Clerk authentication
2. Upload resume            →  PDF, max 5 MB, auto-parsed by AI
3. Select role              →  Frontend / Backend / Full Stack / ML / DevOps
4. Live interview           →  AI speaks question
                               Microphone auto-starts (600 ms delay)
                               Silence detected → auto-stops (4 s threshold)
                               Audio transcribed → sent to AI → next question
5. View report              →  Scores, strengths, weaknesses, 30-day plan
```

### ATS Score Checker Flow

```
1. Dashboard → Tools → ATS Score Checker
2. Upload resume            →  PDF, max 5 MB
3. Select job role          →  15 roles available
4. AI analysis              →  PyPDF2 extracts text
                               Groq Llama 3.3 scores the resume
                               Rule-based keyword matching
5. View report              →  Overall ATS score (0–100)
                               Category scores (Keywords, Format, Experience, Skills)
                               Skills radar chart
                               Missing and found keywords
                               AI-powered suggestions
                               Downloadable PDF report
```

---

## API Reference

### Backend REST API — `http://localhost:5000/api`

#### Resume

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/resume/upload` | Upload a PDF resume |
| `GET` | `/resume/:userId` | Retrieve a parsed resume |

#### Interview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/interview/start` | Create an interview session |
| `POST` | `/interview/:id/message` | Send an answer and receive the next question |
| `POST` | `/interview/:id/end` | End the session |

#### Voice

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/transcribe` | Transcribe audio (Deepgram STT) |
| `POST` | `/speak` | Convert text to speech (Deepgram TTS) |

#### Report

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/report/:sessionId` | Retrieve a full interview report |

#### ATS Score Checker

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/ats/analyze` | Analyze a resume PDF against a job role |
| `GET` | `/ats/report/:reportId` | Fetch a stored ATS report |
| `GET` | `/ats/download/:reportId` | Download an ATS report as PDF |

---

### AI Service — `http://localhost:8000`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/ai/interview/start` | Generate an opening interview question |
| `POST` | `/ai/interview/message` | Process an answer and return the next question |
| `POST` | `/ai/parse-resume` | Extract structured data from a resume |
| `POST` | `/ai/report/generate` | Generate analytics and a 30-day action plan |
| `POST` | `/ai/analyze-ats` | Run ATS analysis via PyPDF2 + Groq |

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| React 18 + Vite 5 | SPA framework |
| Tailwind CSS | Utility-first styling |
| shadcn/ui | Accessible component primitives |
| Aceternity UI | AuroraBackground, MovingBorder, SpotlightCard |
| Recharts | ATS score charts (Pie, Bar, Radar) |
| Zustand | Global state management |
| Clerk | Authentication UI and session management |
| Axios | HTTP client |

### Backend

| Technology | Purpose |
|---|---|
| Express.js 5 | REST API framework |
| MongoDB + Mongoose | Document database |
| Clerk SDK | JWT token verification |
| Multer | Resume file uploads |
| pdf-parse | PDF text extraction (Node.js fallback) |
| pdfkit | ATS report PDF generation |
| Deepgram SDK | Speech-to-text and text-to-speech |
| Helmet.js | Security headers |

### AI Service

| Technology | Purpose |
|---|---|
| FastAPI | High-performance Python API |
| LangChain | Conversation chain management |
| Groq (Llama 3.3 70B) | Primary LLM inference |
| PyPDF2 | Resume PDF parsing and ATS text extraction |
| Pydantic | Schema validation |

---

## Security

- **Authentication**: Clerk JWT verified on every protected route
- **Headers**: Helmet.js (CSP, XSS protection, HSTS)
- **CORS**: Configured per environment
- **File Uploads**: PDF-only, 5 MB limit, sandboxed `/uploads` directory
- **Secrets**: All API keys stored in `.env` files, excluded from version control

---

## Browser Compatibility

| Browser | Voice Support | Notes |
|---|---|---|
| Chrome 90+ | ✅ Full | Recommended |
| Edge 90+ | ✅ Full | Recommended |
| Firefox | ⚠️ Partial | Deepgram TTS works; STT is limited |
| Safari | ⚠️ Partial | WebRTC behaviour differs from Chromium |

---

## Contributing

Contributions are welcome. Please follow [Conventional Commits](https://www.conventionalcommits.org/) for all commit messages.

```bash
# 1. Fork the repository
# 2. Create a feature branch
git checkout -b feature/your-feature-name

# 3. Commit your changes
git commit -m "feat: add your feature"

# 4. Push and open a pull request
git push origin feature/your-feature-name
```

---

## License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

---

<div align="center">

Built by **Phoenix-91**

If this project was useful to you, consider leaving a star on the repository.

</div>
