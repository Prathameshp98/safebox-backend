/**
 * Authentication related types and interfaces
 */

export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface UserData {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
  files: any[];
  permissions: any[];
  sessions: any[];
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  user: UserData;
  tokens: TokenPair;
}

export interface TokenPayload {
  userId: string;
  type?: 'refresh';
}

// API Response Types
export interface AuthApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
  message?: string;
}

export interface RegisterResponse extends AuthApiResponse<AuthResult> {}
export interface LoginResponse extends AuthApiResponse<AuthResult> {}
export interface RefreshResponse extends AuthApiResponse<AuthResult> {}
export interface LogoutResponse extends AuthApiResponse {
  message: string;
}

// Validation Error Types
export interface ValidationError {
  success: false;
  error: string;
  details: string;
}