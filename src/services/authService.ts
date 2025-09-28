import { PrismaClient } from '@prisma/client';
import { PasswordService } from './passwordService';
import { TokenService } from './tokenService';
import { RegisterInput, LoginInput, UserData, AuthResult, TokenPair } from '../types/auth';

const prisma = new PrismaClient();

export class AuthService {
  /**
   * Register a new user
   * @param input - Registration data
   * @returns User data and tokens
   * @throws Error if user already exists
   */
  static async register(input: RegisterInput): Promise<AuthResult> {
    const { email, password, name } = input;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Hash password
    const hashedPassword = await PasswordService.hash(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        files: true,
        permissions: true,
        sessions: true
      }
    });

    // Generate tokens
    const tokens = TokenService.generateTokens(user.id);

    // Store refresh token in session
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return { user, tokens };
  }

  /**
   * Login a user
   * @param input - Login credentials
   * @returns User data and tokens
   * @throws Error if credentials are invalid
   */
  static async login(input: LoginInput): Promise<AuthResult> {
    const { email, password } = input;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await PasswordService.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate tokens
    const tokens = TokenService.generateTokens(user.id);

    // Remove old sessions and store new refresh token
    await prisma.session.deleteMany({
      where: { userId: user.id }
    });

    await this.storeRefreshToken(user.id, tokens.refreshToken);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, tokens };
  }

  /**
   * Refresh access token using refresh token
   * @param refreshToken - Valid refresh token
   * @returns User data and new tokens
   * @throws Error if refresh token is invalid or expired
   */
  static async refreshToken(refreshToken: string): Promise<AuthResult> {
    // Verify refresh token (includes expiration check)
    let payload;
    try {
      payload = TokenService.verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }

    // Check if refresh token exists in database
    const session = await prisma.session.findFirst({
      where: {
        refreshToken,
        userId: payload.userId
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            updatedAt: true,
            files: true,
            permissions: true,
            sessions: true
          }
        }
      }
    });

    if (!session) {
      throw new Error('Refresh token not found');
    }

    // Generate new access token (keep same refresh token)
    const accessToken = TokenService.generateAccessToken(session.userId);

    return {
      user: session.user,
      tokens: {
        accessToken,
        refreshToken // Keep the same refresh token
      }
    };
  }

  /**
   * Logout user by revoking refresh token
   * @param refreshToken - Refresh token to revoke
   * @returns True if successful
   * @throws Error if refresh token not found
   */
  static async logout(refreshToken: string): Promise<boolean> {
    const deletedSession = await prisma.session.deleteMany({
      where: { refreshToken }
    });

    if (deletedSession.count === 0) {
      throw new Error('Refresh token not found');
    }

    return true;
  }

  /**
   * Store refresh token in database session
   * @param userId - User ID
   * @param refreshToken - Refresh token to store
   * @private
   */
  private static async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    await prisma.session.create({
      data: {
        userId,
        refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    });
  }

  /**
   * Get user by ID (without password)
   * @param userId - User ID
   * @returns User data without password
   * @throws Error if user not found
   */
  static async getUserById(userId: string): Promise<UserData> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        files: true,
        permissions: true,
        sessions: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}