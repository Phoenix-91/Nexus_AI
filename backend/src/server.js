import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import resumeRoutes from './routes/resume.routes.js';
import interviewRoutes from './routes/interview.routes.js';
import reportRoutes from './routes/report.routes.js';
import emailRoutes from './routes/email.routes.js';
import transcriptionRoutes from './routes/transcription.routes.js';
import ttsRoutes from './routes/tts.routes.js';
import atsRoutes from './routes/ats.routes.js';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Clerk authentication middleware - DISABLED for testing
// app.use(clerkAuth);

// Routes
app.use('/api/resume', resumeRoutes);
app.use('/api/interviews', interviewRoutes);  // Fixed: plural to match frontend
app.use('/api/report', reportRoutes);
app.use('/api/email', emailRoutes);
app.use('/api', transcriptionRoutes); // Transcription routes
app.use('/api', ttsRoutes); // Text-to-speech routes (Thalia voice)
app.use('/api/ats', atsRoutes); // ATS Score Checker routes

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'NEXUS.AI Backend is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});
