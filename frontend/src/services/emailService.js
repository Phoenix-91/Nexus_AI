import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const emailService = {
    async generateEmail(context) {
        const response = await axios.post(`${API_URL}/email/generate`, { context });
        return response.data;
    },

    async sendEmail(recipient, subject, body) {
        const response = await axios.post(`${API_URL}/email/send`, {
            recipient,
            subject,
            body
        });
        return response.data;
    }
};
