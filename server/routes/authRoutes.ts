/**
 * Mundo Tango ESA LIFE CEO - Auth Routes
 * Phase 11 Parallel Batch 2: Updated with secure pattern (direct DB + error handling + Zod validation)
 */

import { Router, Response, NextFunction } from 'express';
import { db } from '../db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { isAuthenticated } from '../replitAuth';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { randomBytes } from 'crypto';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../middleware/auth';
import { InvalidTokenError, ValidationError, AuthenticationError } from '../middleware/errorHandler';
import { success } from '../utils/apiResponse';
import rateLimit from 'express-rate-limit';

// Phase 11 Task 4.3: Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: { 
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts. Please try again in 15 minutes.',
      statusCode: 429
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

// Validation schemas
const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

const passwordResetRequestSchema = z.object({
  email: z.string().email('Invalid email address')
});

const passwordResetSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string()
    .min(12, 'Password must be at least 12 characters')
    .max(100, 'Password too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
});

// User authentication status check
router.get("/auth/user", authLimiter, isAuthenticated, async (req: any, res, next: NextFunction) => {
  try {
    const replitId = req.user.claims.sub;
    
    // Get user by Replit ID (direct DB query)
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.replitId, replitId))
      .limit(1);
    
    if (!userResult[0]) {
      // Auto-create user if doesn't exist (with default password for OAuth users)
      const newUser = await db
        .insert(users)
        .values({
          replitId: replitId,
          email: req.user.claims.email || `${replitId}@replit.user`,
          username: req.user.claims.username || `user_${replitId.substring(0, 8)}`,
          name: req.user.claims.name || 'Tango Dancer',
          password: await bcrypt.hash(randomBytes(32).toString('hex'), 10), // Random password for OAuth
          profileImage: req.user.claims.profile_image_url || '/images/default-avatar.svg',
          isActive: true,
          isVerified: true // OAuth users are pre-verified
        })
        .returning();
      
      return res.json(success(newUser[0], 'User created and authenticated'));
    }
    
    // Check if user is active
    if (!userResult[0].isActive) {
      throw new AuthenticationError('User account is inactive');
    }
    
    res.json(success(userResult[0], 'User authenticated'));
  } catch (error) {
    next(error);
  }
});

// Logout endpoint
router.post("/auth/logout", (req, res, next: NextFunction) => {
  try {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.json(success({ loggedOut: true }, 'Logged out successfully'));
    });
  } catch (error) {
    next(error);
  }
});

// Password reset request
// NOTE: Requires password_reset_tokens table - DISABLED until schema support
router.post("/auth/reset-password-request", authLimiter, async (req, res, next: NextFunction) => {
  try {
    const validated = passwordResetRequestSchema.parse(req.body);
    
    // TODO: Implement password reset when password_reset_tokens table is added to schema
    // For now, return success to prevent account enumeration
    console.log('[Password Reset] Request for:', validated.email);
    
    res.json(success(
      { requested: true },
      'Password reset email sent if account exists'
    ));
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new ValidationError(error.errors[0].message));
    } else {
      next(error);
    }
  }
});

// Password reset
// NOTE: Requires password_reset_tokens table - DISABLED until schema support
router.post("/auth/reset-password", authLimiter, async (req, res, next: NextFunction) => {
  try {
    const validated = passwordResetSchema.parse(req.body);
    
    // TODO: Implement password reset when password_reset_tokens table is added to schema
    console.log('[Password Reset] Attempt with token:', validated.token.substring(0, 8) + '...');
    
    throw new ValidationError('Password reset feature not yet implemented');
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new ValidationError(error.errors[0].message));
    } else {
      next(error);
    }
  }
});

// Phase 11 Task 4.2: Token refresh endpoint
router.post("/auth/refresh", authLimiter, async (req, res, next: NextFunction) => {
  try {
    const validated = refreshTokenSchema.parse(req.body);

    // Verify refresh token
    const decoded = verifyToken(validated.refreshToken, 'refresh');
    
    // Get user to ensure they still exist and are active (direct DB query)
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);
    
    if (!userResult[0]) {
      throw new InvalidTokenError('User not found');
    }

    if (userResult[0].isActive === false) {
      throw new InvalidTokenError('User account is inactive');
    }

    // Generate new token pair
    const newAccessToken = generateAccessToken(userResult[0].id);
    const newRefreshToken = generateRefreshToken(userResult[0].id);

    // TODO: In production, store refresh tokens in database and invalidate old one

    res.json(success({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
    }, 'Tokens refreshed successfully'));
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new ValidationError(error.errors[0].message));
    } else {
      next(error);
    }
  }
});

// Legacy CSRF endpoint - kept for compatibility
router.get("/auth/csrf", (req, res) => {
  // Skip if AUTH_BYPASS is enabled
  if (process.env.AUTH_BYPASS?.toLowerCase() === 'true') {
    return res.json({ csrfToken: 'bypass-mode' });
  }
  
  const session = req.session as any;
  if (!session) {
    return res.json({ csrfToken: 'no-session' });
  }
  
  if (!session.csrfToken) {
    session.csrfToken = randomBytes(32).toString('hex');
  }
  
  res.json({ csrfToken: session.csrfToken });
});

// CSRF token endpoint for frontend security
router.get("/auth/csrf-token", (req, res, next: NextFunction) => {
  try {
    const session = req.session as any;
    
    // Skip if AUTH_BYPASS is enabled
    if (process.env.AUTH_BYPASS?.toLowerCase() === 'true') {
      return res.json(success({ csrfToken: 'bypass-mode' }, 'CSRF token generated'));
    }
    
    if (!session) {
      throw new AuthenticationError('No session available');
    }
    
    // Generate CSRF token if not exists
    if (!session.csrfToken) {
      session.csrfToken = randomBytes(32).toString('hex');
    }
    
    res.json(success({ csrfToken: session.csrfToken }, 'CSRF token generated'));
  } catch (error) {
    next(error);
  }
});

export default router;
