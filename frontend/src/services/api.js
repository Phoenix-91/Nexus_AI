import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// This will be set by the auth provider
let getToken = null;

export const setAuthTokenGetter = (tokenGetter) => {
    getToken = tokenGetter;
};

// Add auth token to requests
api.interceptors.request.use(async (config) => {
    if (getToken) {
        const token = await getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export default api;
