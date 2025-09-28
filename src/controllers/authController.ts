import { Request, Response } from 'express';
import Joi from 'joi';
import { AuthService } from '../services/authService';
import { RegisterInput, LoginInput, RefreshTokenInput } from '../types/auth';

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().optional().required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required()
});

// POST /auth/register
export const register = async (req: Request, res: Response) => {
  try {
    // Validate input
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message
      });
    }

    // Register user using service
    const result = await AuthService.register(value);

    res.status(201).json({
      success: true,
      data: result
    });

  } catch (error: any) {
    console.error('Register error:', error);
    
    if (error.message === 'User already exists with this email') {
      return res.status(409).json({
        success: false,
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// POST /auth/login
export const login = async (req: Request, res: Response) => {
  try {
    // Validate input
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message
      });
    }

    // Login user using service
    const result = await AuthService.login(value);

    res.json({
      success: true,
      data: result
    });

  } catch (error: any) {
    console.error('Login error:', error);
    
    if (error.message === 'Invalid email or password') {
      return res.status(401).json({
        success: false,
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// POST /auth/refresh
export const refresh = async (req: Request, res: Response) => {
  try {
    // Validate input
    const { error, value } = refreshSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message
      });
    }

    // Refresh token using service
    const result = await AuthService.refreshToken(value.refreshToken);

    res.json({
      success: true,
      data: result
    });

  } catch (error: any) {
    console.error('Refresh error:', error);
    
    if (error.message === 'Invalid or expired refresh token') {
      return res.status(401).json({
        success: false,
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// POST /auth/logout
export const logout = async (req: Request, res: Response) => {
  try {
    // Validate input
    const { error, value } = refreshSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message
      });
    }

    // Logout user using service
    await AuthService.logout(value.refreshToken);

    res.json({
      success: true,
      message: 'Successfully logged out'
    });

  } catch (error: any) {
    console.error('Logout error:', error);
    
    if (error.message === 'Refresh token not found') {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export default {
  register,
  login,
  refresh,
  logout
};