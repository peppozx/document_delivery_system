import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface EnvConfig {
  // Server
  NODE_ENV: string;
  PORT: number;

  // Database
  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;

  // JWT
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;

  // File Upload
  MAX_FILE_SIZE: number;
  UPLOAD_DIR: string;
  ALLOWED_FILE_TYPES: string[];

  // Encryption
  ENCRYPTION_ALGORITHM: string;

  // CORS
  ALLOWED_ORIGINS: string[];

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;

  // Logging
  LOG_LEVEL: string;
}

const getEnvConfig = (): EnvConfig => {
  return {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '3000'),

    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: parseInt(process.env.DB_PORT || '5432'),
    DB_USER: process.env.DB_USER || 'briefcase_user',
    DB_PASSWORD: process.env.DB_PASSWORD || 'briefcase_password',
    DB_NAME: process.env.DB_NAME || 'briefcase_db',

    JWT_SECRET: process.env.JWT_SECRET || 'change_this_secret',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'change_this_refresh_secret',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

    MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '10485760'),
    UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
    ALLOWED_FILE_TYPES: process.env.ALLOWED_FILE_TYPES?.split(',') || [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ],

    ENCRYPTION_ALGORITHM: process.env.ENCRYPTION_ALGORITHM || 'aes-256-gcm',

    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3001'],

    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),

    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  };
};

export const config = getEnvConfig();
