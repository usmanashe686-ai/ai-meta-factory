// ============================================================================
// AI Meta Factory – JWT Authentication Middleware
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email?: string;
    username?: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-do-not-use-in-production';
const JWT_ALGORITHM = 'HS256';

/**
 * Extract JWT token from Authorization header or cookie
 */
const extractToken = (req: Request): string | null => {
  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Check cookie (if using cookies)
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  
  return null;
};

/**
 * Authentication middleware – verifies JWT and attaches user to request
 */
export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided',
      });
      return;
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: [JWT_ALGORITHM],
    }) as { id: string; email?: string; username?: string };
    
    // Attach user to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      username: decoded.username,
    };
    
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Token expired',
      });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token',
      });
    } else {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Authentication failed',
      });
    }
  }
};

/**
 * Optional authentication – doesn't fail if no token, but attaches user if present
 */
export const optionalAuthMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);
    
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET, {
        algorithms: [JWT_ALGORITHM],
      }) as { id: string; email?: string; username?: string };
      
      req.user = {
        id: decoded.id,
        email: decoded.email,
        username: decoded.username,
      };
    }
    
    next();
  } catch (error) {
    // If token is invalid, just proceed without user
    next();
  }
};
