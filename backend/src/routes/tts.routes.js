import express from 'express';
import { speakText } from '../controllers/tts.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

// POST /api/speak - Generate speech from text using Thalia voice
router.post('/speak', requireAuth, speakText);

export default router;
