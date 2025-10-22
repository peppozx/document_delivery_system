# Briefcase - Secure Document Delivery System (Frontend)

A modern React-based frontend for the Briefcase secure document delivery system, built with TypeScript, Vite, and Tailwind CSS.

## Features

- Modern React 18 with TypeScript
- Responsive design with Tailwind CSS
- JWT-based authentication
- Document upload and management
- Real-time file encryption
- User dashboard with document history
- Secure file sharing interface
- Mobile-friendly responsive design

## Tech Stack

- **Runtime**: Node.js 18
- **Language**: TypeScript
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **State Management**: React Context API

## Project Structure

```
frontend/
├── src/
│   ├── components/        # React components
│   │   ├── Dashboard.tsx  # Main dashboard component
│   │   ├── DocumentList.tsx # Document listing component
│   │   ├── Login.tsx      # Authentication component
│   │   └── UploadForm.tsx # File upload component
│   ├── context/           # React context providers
│   │   └── AuthContext.tsx # Authentication context
│   ├── services/          # API services
│   │   └── api.ts         # Axios API client
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts       # Shared types
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # React entry point
│   └── index.css          # Global styles
├── public/                # Static assets
├── Dockerfile             # Docker configuration
└── package.json           # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Docker and Docker Compose (recommended)
- OR Node.js 18+ and npm

### Installation with Docker (Recommended)

1. **Navigate to project root:**
   ```bash
   cd document_delivery_system
   ```

2. **Start all services:**
   ```bash
   docker-compose up -d
   ```

3. **The frontend will be available at:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

### Installation without Docker

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **The frontend will be available at:**
   - http://localhost:5173

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment Variables

The frontend uses the following environment variables:

- `VITE_API_URL` - Backend API URL (default: http://localhost:3000)

## Features Overview

### Authentication
- User login and registration
- JWT token management
- Automatic token refresh
- Protected routes

### Document Management
- Secure file upload with encryption
- Document listing and history
- File sharing with recipients
- View count tracking
- Expiration date management

### User Interface
- Clean, modern design
- Responsive layout for all devices
- Real-time feedback and notifications
- Intuitive navigation

## Development

### Running in development mode
```bash
npm run dev
```

### Building for production
```bash
npm run build
```

### Preview production build
```bash
npm run preview
```

## Docker Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View frontend logs
docker-compose logs -f frontend

# Rebuild after changes
docker-compose up -d --build

# Access frontend container
docker exec -it briefcase_frontend sh
```

## API Integration

The frontend communicates with the backend API through:

- **Authentication endpoints**: `/api/auth/*`
- **User management**: `/api/users/*`
- **Document operations**: `/api/documents/*`

All API calls are handled through the centralized `api.ts` service with proper error handling and token management.

## Security Features

- JWT token-based authentication
- Automatic token refresh
- Secure file upload with client-side encryption
- CORS protection
- Input validation and sanitization

## License

MIT
