/**
 * Mundo Tango ESA LIFE CEO - Authentication Middleware
 * Phase 11 Task 4: Hardened authentication with improved security
 */

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { storage } from "../storage";
import { InvalidTokenError, AuthenticationError } from "./errorHandler";

// JWT_SECRET is REQUIRED - no fallback for security
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET) {
  console.error('❌ FATAL: JWT_SECRET environment variable is not set');
  console.error('   Add JWT_SECRET to your .env file');
  process.exit(1);
}

if (!JWT_REFRESH_SECRET) {
  console.warn('⚠️  JWT_REFRESH_SECRET not set, using JWT_SECRET for refresh tokens (not recommended)');
}

interface JWTPayload {
  userId: number;
  type?: 'access' | 'refresh';
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        username: string;
        name: string;
        bio?: string | null;
        firstName?: string | null;
        lastName?: string | null;
        mobileNo?: string | null;
        profileImage?: string | null;
        backgroundImage?: string | null;
        country?: string | null;
        city?: string | null;
        facebookUrl?: string | null;
        isVerified?: boolean | null;
        isActive?: boolean | null;
        apiToken?: string | null;
        createdAt?: Date | null;
        updatedAt?: Date | null;
      };
    }
  }
}

/**
 * Generate JWT access token (short-lived)
 * @param userId - User ID
 * @param expiresIn - Token expiration (default: 15 minutes)
 */
export function generateAccessToken(userId: number, expiresIn: string = '15m'): string {
  const payload: JWTPayload = { userId, type: 'access' };
  return jwt.sign(payload, JWT_SECRET!, { expiresIn });
}

/**
 * Generate JWT refresh token (long-lived)
 * @param userId - User ID
 * @param expiresIn - Token expiration (default: 7 days)
 */
export function generateRefreshToken(userId: number, expiresIn: string = '7d'): string {
  const secret = JWT_REFRESH_SECRET || JWT_SECRET!;
  const payload: JWTPayload = { userId, type: 'refresh' };
  return jwt.sign(payload, secret, { expiresIn });
}

/**
 * Verify and decode JWT token
 * @param token - JWT token string
 * @param type - Token type ('access' or 'refresh')
 */
export function verifyToken(token: string, type: 'access' | 'refresh' = 'access'): JWTPayload {
  try {
    const secret = type === 'refresh' && JWT_REFRESH_SECRET ? JWT_REFRESH_SECRET : JWT_SECRET!;
    const decoded = jwt.verify(token, secret) as JWTPayload;

    // Verify token type matches expected type
    if (decoded.type && decoded.type !== type) {
      throw new InvalidTokenError(`Invalid token type: expected ${type}, got ${decoded.type}`);
    }

    return decoded;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new InvalidTokenError('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new InvalidTokenError('Invalid token');
    }
    throw error;
  }
}

/**
 * Authentication middleware - validates JWT access token
 */
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1]; // Bearer token

    if (!token) {
      throw new AuthenticationError('No authentication token provided');
    }

    // Verify and decode token
    const decoded = verifyToken(token, 'access');
    const user = await storage.getUser(decoded.userId);

    if (!user) {
      throw new InvalidTokenError('User not found');
    }

    // Check if user is active
    if (user.isActive === false) {
      throw new AuthenticationError('User account is inactive');
    }

    // Attach user to request (convert null to undefined for type compatibility)
    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      bio: user.bio ?? undefined,
      firstName: user.firstName ?? undefined,
      lastName: user.lastName ?? undefined,
      mobileNo: user.mobileNo ?? undefined,
      profileImage: user.profileImage ?? undefined,
      backgroundImage: user.backgroundImage ?? undefined,
      country: user.country ?? undefined,
      city: user.city ?? undefined,
      facebookUrl: user.facebookUrl ?? undefined,
      isVerified: user.isVerified ?? undefined,
      isActive: user.isActive ?? undefined,
      apiToken: user.apiToken ?? undefined,
      createdAt: user.createdAt ?? undefined,
      updatedAt: user.updatedAt ?? undefined,
    };

    next();
  } catch (error) {
    // Pass to global error handler
    next(error);
  }
};

/**
 * Optional authentication middleware - doesn't fail if no token
 * Useful for endpoints that work for both authenticated and anonymous users
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      // No token provided - continue without user
      return next();
    }

    // Try to authenticate, but don't fail if invalid
    try {
      const decoded = verifyToken(token, 'access');
      const user = await storage.getUser(decoded.userId);

      if (user && user.isActive !== false) {
        req.user = {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
          bio: user.bio ?? undefined,
          firstName: user.firstName ?? undefined,
          lastName: user.lastName ?? undefined,
          mobileNo: user.mobileNo ?? undefined,
          profileImage: user.profileImage ?? undefined,
          backgroundImage: user.backgroundImage ?? undefined,
          country: user.country ?? undefined,
          city: user.city ?? undefined,
          facebookUrl: user.facebookUrl ?? undefined,
          isVerified: user.isVerified ?? undefined,
          isActive: user.isActive ?? undefined,
          apiToken: user.apiToken ?? undefined,
          createdAt: user.createdAt ?? undefined,
          updatedAt: user.updatedAt ?? undefined,
        };
      }
    } catch {
      // Invalid token - continue without user (don't throw error)
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Export isAuthenticated as an alias for authMiddleware for compatibility
export const isAuthenticated = authMiddleware;
