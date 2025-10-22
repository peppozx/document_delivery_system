import axios, { AxiosError } from 'axios';
import type { AuthResponse, DocumentsResponse, UploadResponse, UsersResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired, logout user
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  async register(
    email: string,
    username: string,
    password: string
  ): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/register', {
      email,
      username,
      password,
    });
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/api/auth/logout');
  },

  async getProfile(): Promise<AuthResponse> {
    const response = await api.get<AuthResponse>('/api/auth/me');
    return response.data;
  },
};

export const documentsApi = {
  async getSentDocuments(): Promise<DocumentsResponse> {
    const response = await api.get<DocumentsResponse>('/api/documents/sent');
    return response.data;
  },

  async getReceivedDocuments(): Promise<DocumentsResponse> {
    const response = await api.get<DocumentsResponse>('/api/documents/received');
    return response.data;
  },

  async uploadDocument(
    file: File,
    recipientId: string,
    viewLimit?: number,
    expiresAt?: string
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('recipient_id', recipientId);
    if (viewLimit) {
      formData.append('view_limit', viewLimit.toString());
    }
    if (expiresAt) {
      formData.append('expires_at', expiresAt);
    }

    const response = await api.post<UploadResponse>(
      '/api/documents/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  async downloadDocument(documentId: string): Promise<Blob> {
    const response = await api.get(`/api/documents/download/${documentId}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  async deleteDocument(documentId: string): Promise<void> {
    await api.delete(`/api/documents/${documentId}`);
  },
};

export const usersApi = {
  async getUsers(): Promise<UsersResponse> {
    const response = await api.get<UsersResponse>('/api/users');
    return response.data;
  },
};

export default api;
