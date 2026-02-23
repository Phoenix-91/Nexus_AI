import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

const AI_SERVICE_URL = process.env.PYTHON_AI_SERVICE_URL || 'http://localhost:8000';

export const aiService = {
    parseResume: async (filePath) => {
        const formData = new FormData();
        // File stream directly bhejo - path nahi
        formData.append('file', fs.createReadStream(filePath), {
            filename: 'resume.pdf',
            contentType: 'application/pdf',
        });

        const response = await axios.post(`${AI_SERVICE_URL}/ai/parse-resume`, formData, {
            headers: {
                ...formData.getHeaders(),
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
        });
        return response.data;
    },

    startInterview: async (resumeData, jobRole, experienceLevel) => {
        const response = await axios.post(`${AI_SERVICE_URL}/ai/interview/start`, {
            resumeData,
            jobRole,
            experienceLevel,
        });
        return response.data;
    },

    nextQuestion: async (sessionId, userAnswer) => {
        const response = await axios.post(`${AI_SERVICE_URL}/ai/interview/next-question`, {
            sessionId,
            userAnswer,
        });
        return response.data;
    },

    generateReport: async (sessionId, qaHistory, resumeData, jobRole, experienceLevel) => {
        const response = await axios.post(`${AI_SERVICE_URL}/ai/report/generate`, {
            sessionId,
            qaHistory,
            resumeData,
            jobRole,
            experienceLevel,
        });
        return response.data;
    },
};