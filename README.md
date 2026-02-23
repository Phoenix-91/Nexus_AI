# NEXUS.AI - AI-Powered Interview Preparation Platform

A complete, production-ready AI interview simulator with real-time voice interaction, resume analysis, and comprehensive performance reporting.

## 🚀 Features

- **Real-time Voice Interviews**: Conduct interviews using Web Speech API
- **AI-Powered Questions**: Adaptive questioning based on resume and experience
- **Resume Analysis**: Intelligent PDF parsing and structuring
- **Performance Analytics**: Detailed scoring across multiple categories
- **Glassmorphism UI**: Modern dark theme with stunning visual effects
- **Secure Authentication**: Clerk-based user management

## 🏗️ Architecture

- **Frontend**: React 18 + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express + MongoDB
- **AI Service**: Python + FastAPI + LangChain + Groq LLM

## 📋 Prerequisites

- Node.js 18+
- Python 3.9+
- MongoDB (local or Atlas)
- Clerk account (for authentication)
- Groq API key (for LLM)

## ⚙️ Setup Instructions

### 1. Clone and Install

```bash
cd nexus-ai

# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install

# AI Service
cd ../ai-service
pip install -r requirements.txt
```

### 2. Environment Configuration

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

**Backend** (`backend/.env`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nexusai
CLERK_SECRET_KEY=your_clerk_secret_key
PYTHON_AI_SERVICE_URL=http://localhost:8000
```

**AI Service** (`ai-service/.env`):
```env
GROQ_API_KEY=your_groq_api_key
```

### 3. Start Services

**Terminal 1 - AI Service**:
```bash
cd ai-service
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Backend**:
```bash
cd backend
npm run dev
```

**Terminal 3 - Frontend**:
```bash
cd frontend
npm run dev
```

### 4. Access Application

Open http://localhost:5173 in Chrome or Edge (for best Web Speech API support)

## 🎯 Usage Flow

1. **Sign Up/Login** using Clerk authentication
2. **Upload Resume** (PDF format)
3. **Select Job Role** and Experience Level
4. **Start Interview** - Voice-based conversation
5. **View Report** - Comprehensive performance analysis

## 🛠️ Tech Stack

### Frontend
- React 18 with Vite
- Tailwind CSS + shadcn/ui components
- Aceternity UI for advanced effects
- Zustand for state management
- Web Speech API for voice I/O

### Backend
- Express.js REST API
- MongoDB with Mongoose
- Clerk authentication
- Multer for file uploads

### AI Service
- FastAPI framework
- LangChain for conversation management
- Groq LLM (llama-3.1-70b-versatile)
- PyPDF2 for resume parsing

## 📁 Project Structure

```
nexus-ai/
├── frontend/           # React + Vite application
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── pages/      # Route pages
│   │   ├── hooks/      # Custom hooks (speech, auth)
│   │   ├── services/   # API clients
│   │   └── store/      # Zustand store
│   └── package.json
├── backend/            # Node.js + Express API
│   ├── src/
│   │   ├── routes/     # API routes
│   │   ├── controllers/# Request handlers
│   │   ├── models/     # MongoDB schemas
│   │   ├── middleware/ # Auth, upload
│   │   └── services/   # AI service client
│   └── package.json
└── ai-service/         # Python + FastAPI
    ├── app/
    │   ├── routers/    # API endpoints
    │   ├── services/   # Core logic
    │   └── models/     # Pydantic schemas
    └── requirements.txt
```

## 🔒 Security

- JWT-based authentication via Clerk
- Helmet.js for HTTP security headers
- CORS configuration
- File upload validation (PDF only, 5MB limit)

## 🌐 Browser Compatibility

- **Recommended**: Chrome, Edge (full Web Speech API support)
- **Limited**: Firefox, Safari (partial speech recognition)

## 📝 License

MIT License

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a pull request.
