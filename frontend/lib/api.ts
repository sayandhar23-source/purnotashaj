import axios from 'axios';
import Cookies from 'js-cookie';

export const api = axios.create({
  baseURL: (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/+$/, ''),
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const data = err.response?.data;

    // A signed-in request that comes back 401 means the session is no longer valid
    // (expired, or the password was changed elsewhere) — clear it and go to login
    // instead of leaving the user stuck on a page where nothing works.
    const isAuthCall = String(err.config?.url || '').includes('/auth/');
    if (err.response?.status === 401 && Cookies.get('token') && !isAuthCall && typeof window !== 'undefined') {
      Cookies.remove('token');
      if (!window.location.pathname.startsWith('/account/login')) window.location.href = '/account/login';
    }

    // Validation errors arrive as a list of messages — show them as one readable sentence
    if (data && Array.isArray(data.message)) {
      return Promise.reject({ ...data, message: data.message.slice(0, 3).join(' ') });
    }
    return Promise.reject(data || err);
  },
);
