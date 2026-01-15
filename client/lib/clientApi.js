import axios from 'axios';

const getBaseUrl = () => {
    let url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

    // Remove trailing slash if present before appending /api
    url = url.replace(/\/$/, '');

    if (!url.endsWith('/api') && !url.includes('localhost')) {
        url += '/api';
    }

    return url;
};

const clientApi = axios.create({
    baseURL: getBaseUrl(),
});

clientApi.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('clientToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export default clientApi;
