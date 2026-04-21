import axios from 'axios';

// In development, VITE_API_URL is not set — Vite's proxy handles /api/* requests.
// In production (Vercel), VITE_API_URL must point to your deployed Render backend URL.
const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // Slightly higher for Render free tier cold-start
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests and attach the token
API.interceptors.request.use(
  (config) => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const expenseAPI = {
  getAll: () => API.get('/expenses'),
  create: (data) => API.post('/expenses', data),
  update: (id, data) => API.put(`/expenses/${id}`, data),
  delete: (id) => API.delete(`/expenses/${id}`),
};

export const authAPI = {
  updateBudget: (category, amount) => API.put('/auth/budget', { category, amount }),
  getInsights: () => API.get('/insights'),
  chat: (message) => API.post('/chat', { message }),
};

export default API;
