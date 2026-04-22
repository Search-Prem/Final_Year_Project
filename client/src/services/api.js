import axios from 'axios';

// In production (Vercel), use relative path since frontend and API are on the same domain
// In development, use localhost:5000
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');

const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.accessToken) {
            config.headers['x-access-token'] = user.accessToken;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
