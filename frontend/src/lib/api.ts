import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Secure HttpOnly cookies transmission
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError<ApiResponse>) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        // Dispatch custom session expired event
        window.dispatchEvent(new CustomEvent('auth:session_expired'));
      }
    }
    return Promise.reject(error);
  }
);

export function handleApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data?.error || error.response?.data?.message;
    if (apiError) return apiError;
    if (error.code === 'ERR_NETWORK') {
      return 'Network connection error. Operating in offline demo mode.';
    }
    return error.message || 'An unexpected error occurred.';
  }
  return error instanceof Error ? error.message : 'Unknown error';
}

export default apiClient;

