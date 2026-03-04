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

const clientApi = axios.create({
    baseURL: getBaseUrl().replace(/\/$/, '') + '/', // Ensure trailing slash
});

clientApi.interceptors.request.use((config) => {
    // Fix: Remove leading slash from URL to prevent Axios from dropping the /api prefix
    if (config.url && config.url.startsWith('/')) {
        config.url = config.url.substring(1);
    }

    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('clientToken') || localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export default clientApi;
