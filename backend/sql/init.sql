-- Briefcase Database Initialization Script
-- This script creates the database schema for the Briefcase secure document delivery system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
-- Note: TypeORM will also manage this schema, but this ensures it exists on first run
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    refresh_token TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Seed test users (passwords are hashed with bcrypt)
-- Password for all test users: Test123!
-- Hash generated using bcrypt with 10 salt rounds
INSERT INTO users (email, username, password_hash, role) VALUES
    ('alice@briefcase.com', 'alice', '$2a$10$Kx5YJZ.X9YcG8JZQvXZ.7eYnJN7KvQH3gOXz7hQrXZgJXGvQXvZ7K', 'user'),
    ('bob@briefcase.com', 'bob', '$2a$10$Kx5YJZ.X9YcG8JZQvXZ.7eYnJN7KvQH3gOXz7hQrXZgJXGvQXvZ7K', 'user'),
    ('admin@briefcase.com', 'admin', '$2a$10$Kx5YJZ.X9YcG8JZQvXZ.7eYnJN7KvQH3gOXz7hQrXZgJXGvQXvZ7K', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Database initialization completed successfully';
    RAISE NOTICE 'Test users created:';
    RAISE NOTICE '  - alice@briefcase.com / Test123!';
    RAISE NOTICE '  - bob@briefcase.com / Test123!';
    RAISE NOTICE '  - admin@briefcase.com / Test123! (admin role)';
END $$;
