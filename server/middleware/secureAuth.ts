// ESA LIFE CEO 61x21 - Phase 2: Comprehensive Authentication Middleware
// Secure authentication with proper JWT validation, CSRF, and role checks

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { storage } from "../storage";
import { defineAbilitiesFor, checkAbility, canAccessPage } from "../auth/abilities";
import { authService } from "../services/authService";

const JWT_SECRET = process.env.JWT_SECRET || "mundo-tango-secret-key";
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
const AUTH_BYPASS_ENABLED = process.env.AUTH_BYPASS === 'true' && IS_DEVELOPMENT;

interface JWTPayload {
  userId: number;
  email?: string;
  role?: string;
  iat?: number;
  exp?: number;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        username: string;
        name: string;
        role: string;
        bio?: string;
        firstName?: string;
        lastName?: string;
        mobileNo?: string;
        profileImage?: string;
        backgroundImage?: string;
        country?: string;
        city?: string;
        facebookUrl?: string;
        isVerified?: boolean;
        isActive?: boolean;
        apiToken?: string;
        createdAt?: Date;
        updatedAt?: Date;
      };
      ability?: any;
      csrfToken?: string;
    }
  }
}

// Helper to extract JWT from various sources
function extractToken(req: Request): string | null {
  // 1. Check Authorization header (Bearer token)
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // 2. Check cookies
  if (req.cookies?.jwt) {
    return req.cookies.jwt;
  }

  // 3. Check session
  if ((req.session as any)?.token) {
    return (req.session as any).token;
  }

  // 4. Check query params (only for download endpoints)
  if (req.query.token && req.path.includes('/download')) {
    return req.query.token as string;
  }

  return null;
}

// Core authentication middleware
export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Development bypass - ONLY in development mode
    if (AUTH_BYPASS_ENABLED) {
      console.log('🔧 [DEV ONLY] Auth bypass enabled - using default admin user');
      const defaultUser = await storage.getUser(7); // Scott Boddye's admin ID
      if (defaultUser) {
        req.user = {
          id: defaultUser.id,
          email: defaultUser.email,
          username: defaultUser.username,
          name: defaultUser.name,
          role: 'admin',
          bio: defaultUser.bio ?? undefined,
          firstName: defaultUser.firstName ?? undefined,
          lastName: defaultUser.lastName ?? undefined,
          mobileNo: defaultUser.mobileNo ?? undefined,
          profileImage: defaultUser.profileImage ?? undefined,
          backgroundImage: defaultUser.backgroundImage ?? undefined,
          country: defaultUser.country ?? undefined,
          city: defaultUser.city ?? undefined,
          facebookUrl: defaultUser.facebookUrl ?? undefined,
          isVerified: defaultUser.isVerified ?? undefined,
          isActive: defaultUser.isActive ?? undefined,
          apiToken: defaultUser.apiToken ?? undefined,
          createdAt: defaultUser.createdAt ?? undefined,
          updatedAt: defaultUser.updatedAt ?? undefined,
        };
        req.ability = defineAbilitiesFor({ id: defaultUser.id, role: 'admin' });
        return next();
      }
    }

    // Extract token
    const token = extractToken(req);
    
    if (!token) {
      // No token - user is not authenticated
      req.user = undefined;
      req.ability = defineAbilitiesFor(null);
      return next();
    }

    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    // Check token expiration
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      throw new Error('Token expired');
    }

    // Fetch user from database
    const user = await storage.getUser(decoded.userId);
    
    if (!user || !user.id) {
      throw new Error('User not found');
    }

    // Check if user is active
    if (user.isActive === false) {
      throw new Error('Account deactivated');
    }

    // Get user role
    const userWithRole = await authService.getUserWithRole(user.id);
    const role = userWithRole?.role || 'user';

    // Set user on request
    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      role: role,
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
      isActive: user.isActive === null ? undefined : user.isActive,
      apiToken: user.apiToken ?? undefined,
      createdAt: user.createdAt ?? undefined,
      updatedAt: user.updatedAt ?? undefined,
    };

    // Set abilities
    req.ability = defineAbilitiesFor({ id: user.id, role });

    next();
  } catch (error: any) {
    // Token verification failed - clear user
    req.user = undefined;
    req.ability = defineAbilitiesFor(null);
    
    // Log error in development
    if (IS_DEVELOPMENT) {
      console.error('Auth error:', error.message);
    }
    
    // Continue - let route handlers decide if auth is required
    next();
  }
};

// Middleware: Require authentication (blocks unauthenticated users)
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'You must be logged in to access this resource'
    });
  }
  next();
};

// Middleware: Optional authentication (adds user if authenticated, continues if not)
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  // authenticateUser already handles this - just continue
  next();
};

// Middleware: Require specific role
export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'You must be logged in to access this resource'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: `This resource requires one of these roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

// Middleware: Require admin role
export const requireAdmin = requireRole('admin', 'super_admin');

// Middleware: Require moderator or higher
export const requireModerator = requireRole('moderator', 'admin', 'super_admin');

// Middleware: Require organizer or higher
export const requireOrganizer = requireRole('organizer', 'teacher', 'moderator', 'admin', 'super_admin');

// Middleware: Check specific ability using CASL
export const requireAbility = (action: string, subject: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.ability) {
      req.ability = defineAbilitiesFor(req.user || null);
    }

    if (!req.ability.can(action, subject)) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: `You don't have permission to ${action} ${typeof subject === 'string' ? subject : subject.type}`
      });
    }

    next();
  };
};

// Middleware: Check page access
export const checkPageAccess = (path: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user ? { id: req.user.id, role: req.user.role } : null;
    
    if (!canAccessPage(user, path)) {
      if (!user) {
        return res.status(401).json({ 
          error: 'Authentication required',
          message: 'Please log in to access this page'
        });
      } else {
        return res.status(403).json({ 
          error: 'Forbidden',
          message: 'You don\'t have permission to access this page'
        });
      }
    }

    next();
  };
};

// CSRF Protection Middleware
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF for development with bypass
  if (AUTH_BYPASS_ENABLED) {
    return next();
  }

  // Skip CSRF for GET requests and safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip for specific paths (webhooks, etc)
  const skipPaths = [
    '/api/webhook',
    '/api/stripe/webhook',
    '/api/upload', // File uploads handle CSRF differently
  ];

  if (skipPaths.some(path => req.path.startsWith(path))) {
    return next();
  }

  // Get CSRF token from request
  const csrfToken = req.headers['x-csrf-token'] || 
                   req.body?._csrf || 
                   req.query?._csrf;

  // Get session CSRF token
  const sessionToken = (req.session as any)?.csrfToken;

  if (!csrfToken || !sessionToken || csrfToken !== sessionToken) {
    return res.status(403).json({ 
      error: 'Invalid CSRF token',
      message: 'Your request could not be verified. Please refresh and try again.'
    });
  }

  next();
};

// Rate limiting helper
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const rateLimit = (maxRequests: number = 100, windowMs: number = 60000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const identifier = req.user?.id || req.ip;
    const now = Date.now();
    
    const userLimit = requestCounts.get(identifier);
    
    if (!userLimit || now > userLimit.resetTime) {
      // Reset window
      requestCounts.set(identifier, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }

    if (userLimit.count >= maxRequests) {
      return res.status(429).json({ 
        error: 'Too many requests',
        message: 'Please wait before making more requests',
        retryAfter: Math.ceil((userLimit.resetTime - now) / 1000)
      });
    }

    userLimit.count++;
    next();
  };
};

// Apply authentication to all routes (should be early in middleware chain)
export const setupSecureAuth = (app: any) => {
  // Apply to all routes
  app.use(authenticateUser);
  
  // Apply CSRF to all state-changing routes
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return csrfProtection(req, res, next);
    }
    next();
  });
  
  // Apply rate limiting
  app.use('/api', rateLimit(100, 60000)); // 100 requests per minute for API
  
  console.log('✅ Secure authentication middleware configured');
};

// Export all middleware
export default {
  authenticateUser,
  requireAuth,
  optionalAuth,
  requireRole,
  requireAdmin,
  requireModerator,
  requireOrganizer,
  requireAbility,
  checkPageAccess,
  csrfProtection,
  rateLimit,
  setupSecureAuth,
};