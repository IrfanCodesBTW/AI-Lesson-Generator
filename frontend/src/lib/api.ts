import axios, { AxiosInstance } from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:4000';

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 15_000,
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
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Lesson {
  id: string;
  userId: string;
  ageGroup: '2-3' | '3-4' | '4-5' | '5-6';
  theme: string;
  lessonContent: {
    objective: string;
    activity: string;
    rhyme: string;
    worksheet: string;
    materials: string[];
  };
  source: 'gemini' | 'fallback';
  createdAt: string;
}

export async function fetchHealth(): Promise<{
  ok: boolean;
  service: string;
  gemini: 'configured' | 'fallback';
}> {
  const res = await api.get('/health');
  return res.data;
}
