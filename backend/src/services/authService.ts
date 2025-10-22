import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/env';
import { TokenPayload, TokenResponse } from '../types';
import { User } from '../models/User';

export class AuthService {
  private readonly accessTokenSecret = config.JWT_SECRET;
  private readonly refreshTokenSecret = config.JWT_REFRESH_SECRET;
  private readonly accessTokenExpiry = config.JWT_EXPIRES_IN;
  private readonly refreshTokenExpiry = config.JWT_REFRESH_EXPIRES_IN;

  /**
   * Hash a password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify a password against a hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate an access token
   */
  generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiry as any,
      issuer: 'briefcase-api',
      audience: 'briefcase-users'
    } as SignOptions);
  }

  /**
   * Generate a refresh token
   */
  generateRefreshToken(userId: string): string {
    const tokenId = uuidv4();
    return jwt.sign(
      { userId, tokenId },
      this.refreshTokenSecret,
      { expiresIn: this.refreshTokenExpiry as any } as SignOptions
    );
  }

  /**
   * Generate both access and refresh tokens
   */
  generateTokenPair(user: User): TokenResponse {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(user.id)
    };
  }

  /**
   * Verify an access token
   */
  verifyAccessToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.accessTokenSecret) as any;
      return {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Verify a refresh token
   */
  verifyRefreshToken(token: string): { userId: string; tokenId: string } | null {
    try {
      const decoded = jwt.verify(token, this.refreshTokenSecret) as any;
      return {
        userId: decoded.userId,
        tokenId: decoded.tokenId
      };
    } catch (error) {
      return null;
    }
  }
}
