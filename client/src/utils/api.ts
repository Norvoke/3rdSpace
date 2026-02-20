import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  withCredentials: true,
});

// Attach JWT to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('3rdspace_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global 401 handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('3rdspace_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
