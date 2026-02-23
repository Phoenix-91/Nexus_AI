import Report from '../models/Report.model.js';
import InterviewSession from '../models/InterviewSession.model.js';
import Resume from '../models/Resume.model.js';
import { aiService } from '../services/aiService.js';

export const getReport = async (req, res) => {
    try {
        const { sessionId } = req.params;
        console.log('📊 getReport called for sessionId:', sessionId);

        // Check if report already exists
        let report = await Report.findOne({ sessionId });
        console.log('Report exists in DB:', !!report);

        if (!report) {
            console.log('Generating new report...');

            // Generate new report
            const session = await InterviewSession.findOne({
                _id: sessionId,
                userId: req.userId,
            });
            console.log('Session found:', !!session);

            if (!session) {
                console.log('❌ Session not found for ID:', sessionId);
                return res.status(404).json({ message: 'Session not found' });
            }

            console.log('Session data:', {
                id: session._id,
                resumeId: session.resumeId,
                aiSessionId: session.aiSessionId,
                jobRole: session.jobRole,
                qaHistoryLength: session.qaHistory?.length
            });

            const resume = await Resume.findById(session.resumeId);
            console.log('Resume found:', !!resume);

            if (!resume) {
                console.log('❌ Resume not found for ID:', session.resumeId);
                return res.status(404).json({ message: 'Resume not found' });
            }

            console.log('Calling AI service to generate report...');
            console.log('AI Service URL:', process.env.PYTHON_AI_SERVICE_URL);

            // Generate report with AI
            const aiReport = await aiService.generateReport(
                session.aiSessionId,
                session.qaHistory,
                resume.structuredData,
                session.jobRole,
                session.experienceLevel
            );

            console.log('✅ AI report generated successfully');

            // Save report
            report = await Report.create({
                sessionId: session._id,
                ...aiReport,
            });

            console.log('✅ Report saved to database');
        }

        res.json(report);
    } catch (error) {
        console.error('❌ Get report error:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);

        if (error.response) {
            console.error('AI Service error response:', {
                status: error.response.status,
                data: error.response.data
            });
        }

        res.status(500).json({ message: 'Failed to retrieve report' });
    }
};
