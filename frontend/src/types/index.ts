export interface User {
  id: string;
  email: string;
  username: string;
  role: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    user: User;
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
  error?: string;
}

export interface Document {
  id: string;
  filename: string;
  size: string | number;
  mime_type: string;
  sender?: {
    id: string;
    username: string;
    email: string;
  };
  recipient?: {
    id: string;
    username: string;
    email: string;
  };
  view_count: number;
  view_limit: number | null;
  expires_at: string | null;
  created_at: string;
}

export interface DocumentsResponse {
  success: boolean;
  data: {
    documents: Document[];
  };
  error?: string;
}

export interface UploadResponse {
  success: boolean;
  message?: string;
  data?: {
    document: Document;
  };
  error?: string;
}

export interface ApiError {
  success: false;
  error: string;
  errors?: Array<{
    msg: string;
    path: string;
  }>;
}

export interface UsersResponse {
  success: boolean;
  data?: {
    users: User[];
  };
  error?: string;
}
