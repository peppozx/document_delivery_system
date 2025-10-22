import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AuthService } from '../services/authService';
import { UserService } from '../services/userService';
import { logger } from '../utils/logger';
import { AuthenticatedRequest } from '../types';

export class AuthController {
  private authService = new AuthService();
  private userService = new UserService();

  /**
   * Register a new user
   * POST /api/auth/register
   */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { email, username, password } = req.body;

      // Check if email already exists
      const emailExists = await this.userService.emailExists(email);
      if (emailExists) {
        return res.status(409).json({
          success: false,
          error: 'Email already registered'
        });
      }

      // Check if username already exists
      const usernameExists = await this.userService.usernameExists(username);
      if (usernameExists) {
        return res.status(409).json({
          success: false,
          error: 'Username already taken'
        });
      }

      // Hash password
      const passwordHash = await this.authService.hashPassword(password);

      // Create user
      const user = await this.userService.create({
        email,
        username,
        password_hash: passwordHash,
        role: 'user'
      });

      // Generate tokens
      const tokens = this.authService.generateTokenPair(user);

      // Save refresh token
      await this.userService.updateRefreshToken(user.id, tokens.refreshToken);

      logger.info(`New user registered: ${user.email}`);

      // Send response
      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role
          },
          tokens
        }
      });
    } catch (error) {
      logger.error('Registration error:', error);
      next(error);
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { email, password } = req.body;

      // Find user
      const user = await this.userService.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Check if user is active
      if (!user.is_active) {
        return res.status(403).json({
          success: false,
          error: 'Account is deactivated'
        });
      }

      // Verify password
      const isValidPassword = await this.authService.verifyPassword(
        password,
        user.password_hash
      );

      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Generate tokens
      const tokens = this.authService.generateTokenPair(user);

      // Save refresh token
      await this.userService.updateRefreshToken(user.id, tokens.refreshToken);

      logger.info(`User logged in: ${user.email}`);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role
          },
          tokens
        }
      });
    } catch (error) {
      logger.error('Login error:', error);
      next(error);
    }
  }

  /**
   * Refresh access token
   * POST /api/auth/refresh
   */
  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          error: 'Refresh token is required'
        });
      }

      // Verify refresh token
      const decoded = this.authService.verifyRefreshToken(refreshToken);
      if (!decoded) {
        return res.status(401).json({
          success: false,
          error: 'Invalid refresh token'
        });
      }

      // Find user and verify stored refresh token
      const user = await this.userService.findById(decoded.userId);
      if (!user || user.refresh_token !== refreshToken) {
        return res.status(401).json({
          success: false,
          error: 'Invalid refresh token'
        });
      }

      // Generate new token pair
      const tokens = this.authService.generateTokenPair(user);

      // Update refresh token in database
      await this.userService.updateRefreshToken(user.id, tokens.refreshToken);

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: { tokens }
      });
    } catch (error) {
      logger.error('Token refresh error:', error);
      next(error);
    }
  }

  /**
   * Logout user
   * POST /api/auth/logout
   */
  async logout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (userId) {
        // Remove refresh token from database
        await this.userService.updateRefreshToken(userId, null);
        logger.info(`User logged out: ${req.user?.email}`);
      }

      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      logger.error('Logout error:', error);
      next(error);
    }
  }

  /**
   * Get current user profile
   * GET /api/auth/me
   */
  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated'
        });
      }

      const user = await this.userService.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            created_at: user.created_at
          }
        }
      });
    } catch (error) {
      logger.error('Get profile error:', error);
      next(error);
    }
  }
}
