import axios from 'axios';

const getBaseUrl = () => {
    let url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

    // Remove trailing slash if present before appending /api
    url = url.replace(/\/$/, '');

    if (!url.endsWith('/api') && !url.includes('localhost')) {
        url += '/api';
    }

    console.log('API Base URL:', url);
    return url;
};

const api = axios.create({
    baseURL: getBaseUrl(),
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
