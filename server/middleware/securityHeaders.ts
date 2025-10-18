/**
 * Mundo Tango ESA LIFE CEO - Security Headers Middleware
 * Phase 11 Parallel: Enhanced security headers for production
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Apply comprehensive security headers to all responses
 * Protects against common web vulnerabilities
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Prevent clickjacking attacks
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection (legacy but still useful)
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy - control referrer information
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy (CSP) - Start with permissive, tighten in production
  const csp = process.env.NODE_ENV === 'production'
    ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' https: wss:; frame-ancestors 'self';"
    : "default-src 'self' 'unsafe-inline' 'unsafe-eval'; img-src 'self' data: https: blob:; connect-src 'self' https: wss: ws:;";
  
  res.setHeader('Content-Security-Policy', csp);
  
  // Permissions Policy (Feature Policy replacement)
  res.setHeader('Permissions-Policy', 
    'camera=(), microphone=(), geolocation=(self), payment=()'
  );
  
  // Force HTTPS in production
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  // Remove powered-by header (don't advertise Express)
  res.removeHeader('X-Powered-By');
  
  next();
};

/**
 * CORS configuration for WebSocket and API
 * More permissive for development, strict for production
 */
export const corsConfig = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // In development, allow all origins
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // In production, check against allowed origins
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      process.env.REPLIT_DEV_DOMAIN,
      'https://mundotango.com',
      'https://www.mundotango.com'
    ].filter(Boolean);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation: Origin not allowed'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With'],
  exposedHeaders: ['X-Response-Time', 'X-Request-Id'],
  maxAge: 86400 // 24 hours
};

/**
 * Add request ID for tracing
 */
export const requestId = (req: Request, res: Response, next: NextFunction) => {
  const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-Id', requestId);
  next();
};
