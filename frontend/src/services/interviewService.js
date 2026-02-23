import api from './api';

export const resumeService = {
    upload: async (file) => {
        const formData = new FormData();
        formData.append('resume', file);

        const response = await api.post('/resume/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/resume/${id}`);
        return response.data;
    },
};

export const interviewService = {
    start: async (resumeId, jobRole, experienceLevel) => {
        const response = await api.post('/interviews/start', {
            resumeId,
            jobRole,
            experienceLevel,
        });
        return response.data;
    },

    sendMessage: async (sessionId, userAnswer) => {
        const response = await api.post('/interviews/message', {
            sessionId,
            userAnswer,
        });
        return response.data;
    },

    endInterview: async (sessionId) => {
        const response = await api.post('/interviews/end', { sessionId });
        return response.data;
    },

    getHistory: async () => {
        const response = await api.get('/interviews/history');
        return response.data;
    },
};

export const reportService = {
    getReport: async (sessionId) => {
        const response = await api.get(`/report/${sessionId}`);
        return response.data;
    },
};
