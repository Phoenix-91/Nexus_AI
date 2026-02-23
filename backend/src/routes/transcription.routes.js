import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { transcribeAudioFile } from '../controllers/transcription.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads', 'audio');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for audio file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename with timestamp
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const ext = path.extname(file.originalname);
        cb(null, `audio-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 25 * 1024 * 1024, // 25MB max file size
    },
    fileFilter: (req, file, cb) => {
        // Accept audio files only
        const allowedMimeTypes = [
            'audio/webm',
            'audio/wav',
            'audio/wave',
            'audio/x-wav',
            'audio/mpeg',
            'audio/mp3',
            'audio/ogg',
            'audio/opus'
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Invalid file type: ${file.mimetype}. Only audio files are allowed.`));
        }
    }
});

// POST /api/transcribe-audio - Transcribe audio file
router.post('/transcribe-audio', requireAuth, upload.single('audio'), transcribeAudioFile);

export default router;
