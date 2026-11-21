import { useMemo } from 'react';
import axios from 'axios';

export function useApi() {
  const instance = useMemo(() => {
    const api = axios.create({
      baseURL: '/api',
      headers: { 'Content-Type': 'application/json' },
    });

    api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    api.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(err);
      }
    );

    return api;
  }, []);

  return instance;
}
