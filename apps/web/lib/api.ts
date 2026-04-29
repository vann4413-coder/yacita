import axios from 'axios';

const BASE_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// Inyectar token desde localStorage en cada request (solo cliente)
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('yacita_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('yacita_token');
      window.location.href = '/clinic/login';
    }
    return Promise.reject(err);
  },
);
