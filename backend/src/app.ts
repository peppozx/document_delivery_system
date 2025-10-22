import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import { config } from './config/env';
import { morganStream } from './utils/logger';

// Import routes
import authRoutes from './routes/authRoutes';

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { apiRateLimiter } from './middleware/rateLimiter';

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" }
    }));

    // CORS configuration
    this.app.use(cors({
      origin: config.ALLOWED_ORIGINS,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Compression middleware
    this.app.use(compression());

    // Logging middleware
    if (config.NODE_ENV === 'development') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined', { stream: morganStream }));
    }

    // Static files for uploads (will be used in Phase 2)
    this.app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

    // Rate limiting for API routes
    this.app.use('/api', apiRateLimiter);
  }

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({
        success: true,
        message: 'Briefcase API is running',
        timestamp: new Date().toISOString(),
        environment: config.NODE_ENV
      });
    });

    // Hello World route for initial testing
    this.app.get('/', (req: Request, res: Response) => {
      res.json({
        success: true,
        message: 'Hello World! Welcome to Briefcase API',
        version: '1.0.0',
        endpoints: {
          health: '/health',
          auth: '/api/auth/*',
          docs: '/api/docs (coming soon)'
        }
      });
    });

    // API routes
    this.app.use('/api/auth', authRoutes);
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler (must be last)
    this.app.use(errorHandler);
  }
}

export default new App().app;
