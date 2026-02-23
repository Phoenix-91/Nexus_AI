import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { getReport } from '../controllers/report.controller.js';

const router = express.Router();

router.get('/:sessionId', requireAuth, getReport);

export default router;
