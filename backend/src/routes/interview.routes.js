import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { startInterview, sendMessage, endInterview, getHistory } from '../controllers/interview.controller.js';

const router = express.Router();

router.post('/start', requireAuth, startInterview);
router.post('/message', requireAuth, sendMessage);
router.post('/end', requireAuth, endInterview);
router.get('/history', requireAuth, getHistory);

export default router;
