import fs from 'fs';
import Resume from '../models/Resume.model.js';
import { aiService } from '../services/aiService.js';

export const uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        let structuredData;
        try {
            // Try to parse resume with AI service
            structuredData = await aiService.parseResume(req.file.path);
        } catch (aiError) {
            // Log full AI error but don't block the request
            console.error('AI resume parsing failed, using fallback data:', {
                message: aiError.message,
                response: aiError.response?.data,
            });

            // Fallback minimal structured data so the app can continue to work
            structuredData = {
                name: req.file.originalname.replace('.pdf', ''),
                email: '',
                skills: [],
                experience: [],
                projects: [],
                education: [],
            };
        }

        // Save to database
        const resume = await Resume.create({
            userId: req.userId,
            filename: req.file.originalname,
            filepath: req.file.path,
            structuredData,
        });

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        res.status(201).json({
            resumeId: resume._id,
            structuredData,
        });
    } catch (error) {
        console.error('Resume upload error:', error);
        console.error('Error stack:', error.stack);
        console.error('Error message:', error.message);
        res.status(500).json({
            message: 'Failed to upload resume',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const getResume = async (req, res) => {
    try {
        const resume = await Resume.findOne({
            _id: req.params.id,
            userId: req.userId,
        });

        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        res.json(resume);
    } catch (error) {
        console.error('Get resume error:', error);
        res.status(500).json({ message: 'Failed to retrieve resume' });
    }
};
