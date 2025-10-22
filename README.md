# Briefcase - Secure Document Delivery System

A full-stack secure document delivery system built with modern web technologies. This system allows users to securely upload, encrypt, and share documents with specific recipients while maintaining end-to-end security.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd document_delivery_system
   ```

2. **Start all services:**
   ```bash
   docker-compose up -d
   ```

3. **Access the applications:**
   - **Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:3000

## 🏗️ Architecture

This project consists of three main components:

### Frontend (`/frontend`)
- **Technology**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Features**: User authentication, document upload, secure sharing interface
- **Port**: 5173

### Backend (`/backend`)
- **Technology**: Node.js + Express + TypeScript
- **Database**: PostgreSQL 16
- **Authentication**: JWT with refresh tokens
- **Features**: RESTful API, file encryption, user management
- **Port**: 3000

### Database
- **Technology**: PostgreSQL 16
- **Port**: 5432 (PostgreSQL)

## 🔧 Development

### Start Development Environment
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Individual Service Management
```bash
# Start only backend
docker-compose up -d postgres backend

# Start only frontend
docker-compose up -d frontend

# Rebuild after changes
docker-compose up -d --build
```

## 📚 Documentation

- [Backend Documentation](./backend/README.md) - API endpoints, database schema, and backend services
- [Frontend Documentation](./frontend/README.md) - React components, state management, and UI features

## 🔐 Security Features

- **End-to-End Encryption**: Files are encrypted before upload
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Configured for specific origins
- **Password Hashing**: bcrypt with salt rounds

## 🎯 Key Features

### User Management
- User registration and authentication
- JWT-based session management
- Role-based access control

### Document Security
- Client-side file encryption
- Secure file storage
- Time-limited access
- View count tracking
- Automatic expiration

### User Interface
- Modern, responsive design
- Real-time feedback
- Mobile-friendly interface
- Intuitive navigation

## 🗄️ Database Schema

The system uses PostgreSQL with the following main entities:
- **Users**: Authentication and user management
- **Documents**: File metadata and encryption details
- **Relationships**: Many-to-one (Documents → Users)

## 🚀 Deployment

### Production Build
```bash
# Build frontend
cd frontend && npm run build

# Build backend
cd backend && npm run build

# Start production
docker-compose up -d
```

### Environment Variables
See individual service documentation for required environment variables:
- [Backend Environment](./backend/README.md#environment-variables)
- [Frontend Environment](./frontend/README.md#environment-variables)

## 🧪 Testing

### API Testing
```bash
# Test authentication
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "username": "testuser", "password": "Test123!"}'

# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "Test123!"}'
```

### Frontend Testing
Access http://localhost:5173 and test the user interface.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check the individual service documentation
2. Review the Docker logs: `docker-compose logs -f`
3. Check the database connection: `docker exec -it briefcase_postgres psql -U briefcase_user -d briefcase_db`
