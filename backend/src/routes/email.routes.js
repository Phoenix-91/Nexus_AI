import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { generateEmail, sendEmail } from '../controllers/email.controller.js';

const router = express.Router();

router.post('/generate', requireAuth, generateEmail);
router.post('/send', requireAuth, sendEmail);

export default router;
