import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { config } from '../config/env';

/**
 * General API rate limiter
 * Applied to all /api routes
 */
export const apiRateLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS, // 15 minutes default
  max: config.RATE_LIMIT_MAX_REQUESTS, // 100 requests default
  message: {
    success: false,
    error: 'Too many requests, please try again later'
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: 'Too many requests',
      message: 'You have exceeded the rate limit. Please try again later.'
    });
  }
});

/**
 * Strict rate limiter for authentication endpoints
 * More restrictive to prevent brute force attacks
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: {
    success: false,
    error: 'Too many authentication attempts'
  },
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: 'Too many authentication attempts',
      message: 'Please wait before trying again.'
    });
  }
});

/**
 * Rate limiter for file upload endpoints
 * Prevents abuse of upload functionality
 */
export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 uploads per hour
  message: {
    success: false,
    error: 'Upload limit exceeded'
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: 'Upload limit exceeded',
      message: 'You have reached the maximum number of uploads per hour.'
    });
  }
});
