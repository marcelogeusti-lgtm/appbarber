import axios from 'axios';
import { safeGetItem } from './storage';

const getBaseUrl = () => {
    let url;
    // Priority 1: Environment variable
    if (process.env.NEXT_PUBLIC_API_URL) {
        url = process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '') + '/api';
        console.log('[DEBUG] getBaseUrl Priority 1:', url);
        return url;
    }

    // Priority 2: Runtime detection (Vercel vs Local)
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
            // Point to the dedicated Vercel backend (Verified Active Project)
            url = 'https://appbarber-api.vercel.app/api';
            console.log('[DEBUG] getBaseUrl Dedicated Vercel:', url);
            return url;
        }
    }

    // Priority 3: Default Local
    url = 'http://localhost:3001/api';
    console.log('[DEBUG] getBaseUrl Priority 3:', url);
    return url;
};

const api = axios.create({
    baseURL: getBaseUrl().replace(/\/$/, '') + '/', // Ensure trailing slash
});

api.interceptors.request.use((config) => {
    // Fix: Remove leading slash from URL to prevent Axios from dropping the /api prefix
    if (config.url && config.url.startsWith('/')) {
        config.url = config.url.substring(1);
    }

    if (typeof window !== 'undefined') {
        const token = safeGetItem('token') || safeGetItem('clientToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export default api;
