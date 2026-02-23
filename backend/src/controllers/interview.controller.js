import InterviewSession from '../models/InterviewSession.model.js';
import Resume from '../models/Resume.model.js';
import { aiService } from '../services/aiService.js';

export const startInterview = async (req, res) => {
    try {
        const { resumeId, jobRole, experienceLevel } = req.body;

        // Get resume data
        const resume = await Resume.findOne({ _id: resumeId, userId: req.userId });
        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        // Start AI interview
        const aiResponse = await aiService.startInterview(
            resume.structuredData,
            jobRole,
            experienceLevel
        );

        // Create session
        const session = await InterviewSession.create({
            userId: req.userId,
            resumeId,
            jobRole,
            experienceLevel,
            aiSessionId: aiResponse.sessionId,
            qaHistory: [{
                questionNumber: 1,
                question: aiResponse.question,
                answer: '',
                timestamp: new Date(),
            }],
        });

        res.status(201).json({
            sessionId: session._id,
            question: aiResponse.question,
        });
    } catch (error) {
        console.error('Start interview error:', error);
        res.status(500).json({ message: 'Failed to start interview' });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { sessionId, userAnswer } = req.body;

        const session = await InterviewSession.findOne({
            _id: sessionId,
            userId: req.userId,
        });

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Update last answer
        session.qaHistory[session.qaHistory.length - 1].answer = userAnswer;

        // Get next question from AI
        const aiResponse = await aiService.nextQuestion(session.aiSessionId, userAnswer);

        if (!aiResponse.shouldEnd) {
            session.qaHistory.push({
                questionNumber: session.qaHistory.length + 1,
                question: aiResponse.question,
                answer: '',
                timestamp: new Date(),
            });
        }

        await session.save();

        res.json({
            question: aiResponse.question,
            shouldEnd: aiResponse.shouldEnd,
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ message: 'Failed to process message' });
    }
};

export const endInterview = async (req, res) => {
    try {
        const { sessionId } = req.body;

        const session = await InterviewSession.findOne({
            _id: sessionId,
            userId: req.userId,
        });

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        session.status = 'completed';
        session.endedAt = new Date();
        await session.save();

        res.json({ message: 'Interview ended successfully' });
    } catch (error) {
        console.error('End interview error:', error);
        res.status(500).json({ message: 'Failed to end interview' });
    }
};

export const getHistory = async (req, res) => {
    try {
        console.log('getHistory called, userId:', req.userId);
        const sessions = await InterviewSession.find({ userId: req.userId })
            .sort({ createdAt: -1 })
            .limit(10);

        console.log('Found sessions:', sessions.length);
        res.json(sessions);
    } catch (error) {
        console.error('Get history error:', error);
        console.error('Error stack:', error.stack);
        console.error('Error message:', error.message);
        res.status(500).json({
            message: 'Failed to retrieve history',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
