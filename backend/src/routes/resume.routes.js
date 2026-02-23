import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import { uploadResume, getResume } from '../controllers/resume.controller.js';

const router = express.Router();

router.post('/upload', requireAuth, upload.single('resume'), uploadResume);
router.get('/:id', requireAuth, getResume);

export default router;
