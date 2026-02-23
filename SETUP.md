# NEXUS.AI - Quick Start Guide

## 🚀 Getting Started

### Step 1: Install Dependencies

```powershell
# Frontend
cd "c:\Users\sarth\OneDrive\Documents\Desktop\2nd Major\nexus-ai\frontend"
npm install

# Backend
cd "c:\Users\sarth\OneDrive\Documents\Desktop\2nd Major\nexus-ai\backend"
npm install

# AI Service
cd "c:\Users\sarth\OneDrive\Documents\Desktop\2nd Major\nexus-ai\ai-service"
pip install -r requirements.txt
```

### Step 2: Configure Environment Variables

You need to obtain API keys before running the application:

**Required API Keys:**
1. **Clerk** (Authentication): https://clerk.com
   - Sign up and create a new application
   - Get `CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`

2. **Groq** (AI/LLM): https://console.groq.com
   - Sign up and generate an API key
   - Get `GROQ_API_KEY`

3. **MongoDB**: 
   - Use local MongoDB: `mongodb://localhost:27017/nexusai`
   - OR use MongoDB Atlas (free tier): https://www.mongodb.com/cloud/atlas

**Update .env files:**

`frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_CLERK_PUBLISHABLE_KEY=<your_clerk_publishable_key>
```

`backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nexusai
CLERK_SECRET_KEY=<your_clerk_secret_key>
PYTHON_AI_SERVICE_URL=http://localhost:8000
```

`ai-service/.env`:
```env
GROQ_API_KEY=<your_groq_api_key>
```

### Step 3: Start All Services

Open **3 separate terminals**:

**Terminal 1 - AI Service (Python)**
```powershell
cd "c:\Users\sarth\OneDrive\Documents\Desktop\2nd Major\nexus-ai\ai-service"
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Backend (Node.js)**
```powershell
cd "c:\Users\sarth\OneDrive\Documents\Desktop\2nd Major\nexus-ai\backend"
npm run dev
```

**Terminal 3 - Frontend (React)**
```powershell
cd "c:\Users\sarth\OneDrive\Documents\Desktop\2nd Major\nexus-ai\frontend"
npm run dev
```

### Step 4: Access the Application

Open your browser (Chrome or Edge recommended) and go to:
**http://localhost:5173**

## 📝 First Time Setup

1. Click "Get Started" or "Sign Up"
2. Create an account with Clerk
3. You'll be redirected to the Dashboard
4. Click "Start New Interview"
5. Upload a PDF resume
6. Select job role and experience level
7. Allow microphone access when prompted
8. Start the voice interview!

## 🎤 Using Voice Features

- **Chrome/Edge**: Full support for Web Speech API
- **Firefox/Safari**: Limited support
- Click the microphone button to start speaking
- Your speech will be transcribed in real-time
- Click again to stop and send your answer
- The AI will speak the next question (can be muted)

## 🔍 Troubleshooting

**MongoDB Connection Error:**
- Make sure MongoDB is running locally
- OR update `MONGODB_URI` in backend/.env with Atlas connection string

**Clerk Authentication Error:**
- Verify your API keys are correct
- Check that keys match (publishable in frontend, secret in backend)

**Groq API Error:**
- Verify your API key is valid
- Check you have API credits available

**Voice Not Working:**
- Use Chrome or Edge browser
- Allow microphone permissions
- Check browser console for errors

**Port Already in Use:**
- Change ports in .env files if needed
- Make sure no other services are using ports 5173, 5000, or 8000

## 📚 Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Groq API Docs](https://console.groq.com/docs)
- [MongoDB Atlas Setup](https://www.mongodb.com/docs/atlas/getting-started/)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

## ✅ Verification

All services running correctly when you see:

- **AI Service**: `INFO: Application startup complete` on port 8000
- **Backend**: `🚀 Server running on port 5000` and `MongoDB Connected`
- **Frontend**: `Local: http://localhost:5173/`

## 🎯 Next Steps

1. Complete a practice interview
2. Review your performance report
3. Follow the 30-day action plan
4. Track your progress over time

Enjoy using NEXUS.AI! 🚀
