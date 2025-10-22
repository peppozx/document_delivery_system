import { Request } from 'express';

// Extend Express Request interface to include user property
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// JWT Token Payload
export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

// User registration data
export interface RegisterUserDto {
  email: string;
  username: string;
  password: string;
}

// User login data
export interface LoginUserDto {
  email: string;
  password: string;
}

// Token response
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
