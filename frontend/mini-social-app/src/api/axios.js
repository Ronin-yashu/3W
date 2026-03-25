import axios from 'axios';

const api = axios.create({
  baseURL: '/',
  withCredentials: true
});

// Only redirect to login on 401 if:
// - NOT already on /login or /signup
// - NOT a /api/auth/me call (that's the initial check, 401 is expected)
api.interceptors.response.use(
  res => res,
  err => {
    const isAuthCheck = err.config?.url?.includes('/api/auth/me');
    const isAuthPage = window.location.pathname === '/login' || window.location.pathname === '/signup';
    if (err.response?.status === 401 && !isAuthCheck && !isAuthPage) {
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
