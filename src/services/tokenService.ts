import jwt from 'jsonwebtoken';
import { TokenPayload, TokenPair } from '../types/auth';

export class TokenService {
  private static getJwtSecret(): string {
    return process.env.JWT_SECRET || 'your-secret-key';
  }

  private static getJwtExpiresIn(): string {
    return process.env.JWT_EXPIRES_IN || '15m';
  }

  /**
   * Generate both access and refresh tokens for a user
   * @param userId - User ID to include in token payload
   * @returns Object containing both access and refresh tokens
   */
  static generateTokens(userId: string): TokenPair {
    const jwtSecret = this.getJwtSecret();
    const jwtExpiresIn = this.getJwtExpiresIn();
    
    const accessToken = jwt.sign({ userId }, jwtSecret, { expiresIn: jwtExpiresIn } as jwt.SignOptions);
    const refreshToken = jwt.sign({ userId, type: 'refresh' }, jwtSecret, { expiresIn: '7d' } as jwt.SignOptions);
    
    return { accessToken, refreshToken };
  }

  /**
   * Generate a new access token
   * @param userId - User ID to include in token payload
   * @returns Access token string
   */
  static generateAccessToken(userId: string): string {
    const jwtSecret = this.getJwtSecret();
    const jwtExpiresIn = this.getJwtExpiresIn();
    
    return jwt.sign({ userId }, jwtSecret, { expiresIn: jwtExpiresIn } as jwt.SignOptions);
  }

  /**
   * Verify and decode a JWT token
   * @param token - JWT token to verify
   * @returns Decoded token payload
   * @throws Error if token is invalid or expired
   */
  static verifyToken(token: string): TokenPayload {
    const jwtSecret = this.getJwtSecret();
    
    try {
      const payload = jwt.verify(token, jwtSecret) as any;
      return {
        userId: payload.userId,
        type: payload.type
      };
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Verify a refresh token specifically
   * @param refreshToken - Refresh token to verify
   * @returns Decoded token payload
   * @throws Error if token is invalid, expired, or not a refresh token
   */
  static verifyRefreshToken(refreshToken: string): TokenPayload {
    const payload = this.verifyToken(refreshToken);
    
    if (payload.type !== 'refresh') {
      throw new Error('Token is not a refresh token');
    }
    
    return payload;
  }
}