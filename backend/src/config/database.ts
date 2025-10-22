import { DataSource } from 'typeorm';
import { User } from '../models/User';
import { Document } from '../models/Document';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'briefcase_user',
  password: process.env.DB_PASSWORD || 'briefcase_password',
  database: process.env.DB_NAME || 'briefcase_db',
  synchronize: process.env.NODE_ENV === 'development', // Auto-sync schema in dev only
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Document],
  migrations: ['src/migrations/*.ts'],
  subscribers: [],
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});
