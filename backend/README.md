# Briefcase - Secure Document Delivery System (Backend)

A secure internal document delivery API built with TypeScript, Express, PostgreSQL, and JWT authentication.

## Features

- JWT-based authentication with access and refresh tokens
- User registration and login
- Password hashing with bcrypt
- TypeORM for database management
- Rate limiting for security
- Request validation
- Comprehensive error handling
- Docker support

## Tech Stack

- **Runtime**: Node.js 20
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL 16
- **ORM**: TypeORM
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: express-validator
- **Security**: helmet, bcryptjs, express-rate-limit
- **Logging**: Winston

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files (database, env)
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # TypeORM entities
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   ├── app.ts           # Express app setup
│   └── index.ts         # Server entry point
├── sql/                 # Database initialization scripts
├── uploads/             # File uploads directory
└── logs/                # Application logs
```

## Getting Started

### Prerequisites

- Docker and Docker Compose (recommended)
- OR Node.js 20+ and PostgreSQL 16+

### Installation with Docker (Recommended)

1. **Navigate to project root:**
   ```bash
   cd document_delivery_system
   ```

2. **Start the services:**
   ```bash
   docker-compose up -d
   ```

3. **Check the logs:**
   ```bash
   docker-compose logs -f backend
   ```

4. **The API will be available at:**
   - API: http://localhost:3000
   - Health check: http://localhost:3000/health
   - pgAdmin: http://localhost:5050 (admin@briefcase.local / admin)

### Installation without Docker

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start PostgreSQL** (ensure it's running on port 5432)

4. **Run the development server:**
   ```bash
   npm run dev
   ```

## API Endpoints

### Health Check
- `GET /health` - Check API status

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user (requires auth)
- `GET /api/auth/me` - Get current user profile (requires auth)

## Testing the API

### 1. Register a new user

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "Test123!"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

### 3. Use the access token for authenticated requests

```bash
# Save the token from login response
TOKEN="your_access_token_here"

curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

## Environment Variables

See `.env.example` for all available configuration options.

Key variables:
- `PORT` - Server port (default: 3000)
- `DB_*` - Database connection settings
- `JWT_SECRET` - Secret for JWT tokens
- `JWT_EXPIRES_IN` - Access token expiration (default: 15m)
- `JWT_REFRESH_EXPIRES_IN` - Refresh token expiration (default: 7d)

## Development

### Running in development mode
```bash
npm run dev
```

### Building for production
```bash
npm run build
npm start
```

### TypeORM Commands
```bash
# Generate migration
npm run migration:generate -- src/migrations/MigrationName

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

## Docker Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f backend

# Rebuild after changes
docker-compose up -d --build

# Access backend container
docker exec -it briefcase_backend sh

# Access PostgreSQL
docker exec -it briefcase_postgres psql -U briefcase_user -d briefcase_db
```

## Security Notes

- All passwords are hashed using bcrypt (10 salt rounds)
- JWT tokens expire after 15 minutes (access) and 7 days (refresh)
- Rate limiting is applied to prevent brute force attacks
- CORS is configured for specific origins
- Helmet is used for basic security headers

## License

MIT
