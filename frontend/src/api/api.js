import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
});

let getToken = () => null;
let onUnauthorized = () => { };

export const injectTokenSource = (fn) => {
    getToken = fn;
};

export const injectUnauthorizedHandler = (fn) => {
    onUnauthorized = fn;
};

api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn('Session expired or unauthorized. Redirecting to login...');
            onUnauthorized();
        }
        return Promise.reject(error);
    }
);

export default api;
