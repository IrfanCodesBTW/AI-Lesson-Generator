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

export type AgeGroup = '2-3' | '3-4' | '4-5' | '5-6';

export const AGE_GROUPS: AgeGroup[] = ['2-3', '3-4', '4-5', '5-6'];

export const THEMES = [
  'Animals',
  'Colors',
  'Numbers & Counting',
  'Family & Friends',
  'Seasons & Weather',
  'Plants & Gardens',
  'Transport & Vehicles',
  'Water & Bubbles',
  'Shapes',
  'My Body',
] as const;

export type Theme = (typeof THEMES)[number];

export interface LessonContent {
  objective: string;
  activity: string;
  rhyme: string;
  worksheet: string;
  materials: string[];
}

export interface Lesson {
  id: string;
  userId: string;
  ageGroup: AgeGroup;
  theme: string;
  lessonContent: LessonContent;
  source: 'gemini' | 'fallback';
  createdAt: string;
}

export interface LessonListResponse {
  items: Lesson[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export function getApiError(err: unknown): ApiError {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: ApiError } | undefined;
    if (data?.error) return data.error;
    return {
      code: 'NETWORK_ERROR',
      message: err.message || 'Request failed',
    };
  }
  return {
    code: 'UNKNOWN',
    message: err instanceof Error ? err.message : 'Unknown error',
  };
}

export async function fetchHealth(): Promise<{
  ok: boolean;
  service: string;
  gemini: 'configured' | 'fallback';
}> {
  const res = await api.get('/health');
  return res.data;
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await api.post('/api/auth/register', input);
  return res.data;
}

export async function loginUser(input: { email: string; password: string }): Promise<AuthResponse> {
  const res = await api.post('/api/auth/login', input);
  return res.data;
}

export async function fetchLessons(
  params: {
    theme?: string;
    page?: number;
    limit?: number;
  } = {},
): Promise<LessonListResponse> {
  const res = await api.get('/api/lessons', { params });
  return res.data;
}

export async function fetchLesson(id: string): Promise<Lesson> {
  const res = await api.get(`/api/lessons/${id}`);
  return res.data.lesson as Lesson;
}

export async function deleteLesson(id: string): Promise<void> {
  await api.delete(`/api/lessons/${id}`);
}

export async function generateLesson(input: {
  ageGroup: AgeGroup;
  theme: string;
  date?: string;
}): Promise<Lesson> {
  const res = await api.post('/api/lessons/generate', input);
  return res.data.lesson as Lesson;
}

export async function downloadLessonPdf(id: string, suggestedFilename: string): Promise<void> {
  const res = await api.get(`/api/export/pdf/${id}`, { responseType: 'blob' });
  const blob = new Blob([res.data], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = suggestedFilename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
