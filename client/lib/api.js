import axios from 'axios';

const getBaseUrl = () => {
    // Priority 1: Environment variable
    if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '') + '/api';
    }

    // Priority 2: Runtime detection (Vercel vs Local)
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
            return 'https://barber-api-uz05.onrender.com/api';
        }
    }

    // Priority 3: Default Local
    return 'http://localhost:3001/api';
};

const api = axios.create({
    baseURL: getBaseUrl(),
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token') || localStorage.getItem('clientToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export default api;
