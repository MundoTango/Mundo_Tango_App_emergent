// ESA LIFE CEO 61x21 - Phase 13: CSRF Protection
// Cross-Site Request Forgery protection implementation

import { Request, Response, NextFunction } from 'express';
import { randomBytes } from 'crypto';
import { createHash } from 'crypto';

// CSRF token configuration
const TOKEN_LENGTH = 32;
const TOKEN_EXPIRY = 3600000; // 1 hour in milliseconds
const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];
const CSRF_HEADER = 'x-csrf-token';
const CSRF_COOKIE = 'csrf-token';
const CSRF_FORM_FIELD = '_csrf';

// Token storage (in production, use Redis or similar)
const tokenStore = new Map<string, { token: string; expires: number; userId?: number }>();

// Generate CSRF token
export function generateCSRFToken(): string {
  return randomBytes(TOKEN_LENGTH).toString('hex');
}

// Hash token for storage
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

// Create and store CSRF token
export function createCSRFToken(sessionId: string, userId?: number): string {
  const token = generateCSRFToken();
  const hashedToken = hashToken(token);
  const expires = Date.now() + TOKEN_EXPIRY;
  
  tokenStore.set(sessionId, {
    token: hashedToken,
    expires,
    userId,
  });
  
  // Clean up expired tokens periodically
  cleanupExpiredTokens();
  
  return token;
}

// Validate CSRF token
export function validateCSRFToken(sessionId: string, token: string): boolean {
  const stored = tokenStore.get(sessionId);
  
  if (!stored) {
    return false;
  }
  
  // Check if token has expired
  if (Date.now() > stored.expires) {
    tokenStore.delete(sessionId);
    return false;
  }
  
  // Compare hashed tokens
  const hashedToken = hashToken(token);
  return stored.token === hashedToken;
}

// Clean up expired tokens
function cleanupExpiredTokens(): void {
  const now = Date.now();
  for (const [sessionId, data] of tokenStore.entries()) {
    if (now > data.expires) {
      tokenStore.delete(sessionId);
    }
  }
}

// CSRF middleware
export const csrfProtection = (options?: {
  skipPaths?: string[];
  skipOrigins?: string[];
  cookieName?: string;
  headerName?: string;
}) => {
  const config = {
    skipPaths: options?.skipPaths || ['/api/webhook', '/api/stripe/webhook'],
    skipOrigins: options?.skipOrigins || [],
    cookieName: options?.cookieName || CSRF_COOKIE,
    headerName: options?.headerName || CSRF_HEADER,
  };
  
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip CSRF for safe methods
    if (SAFE_METHODS.includes(req.method)) {
      // Generate token for GET requests if not exists
      if (!req.session) {
        req.session = {} as any;
      }
      
      const session = req.session as any;
      if (!session.csrfToken) {
        const sessionId = session.id || generateSessionId(req);
        const token = createCSRFToken(sessionId, (req as any).user?.id);
        session.csrfToken = token;
        
        // Set CSRF token in cookie for double submit pattern
        res.cookie(config.cookieName, token, {
          httpOnly: false, // Allow JavaScript to read for inclusion in requests
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: TOKEN_EXPIRY,
        });
      }
      
      return next();
    }
    
    // Skip CSRF for configured paths
    if (config.skipPaths.some(path => req.path.startsWith(path))) {
      return next();
    }
    
    // Skip CSRF for configured origins (webhooks, etc.)
    const origin = req.headers.origin || req.headers.referer;
    if (origin && config.skipOrigins.some(allowed => origin.includes(allowed))) {
      return next();
    }
    
    // Get CSRF token from request
    const token = 
      req.headers[config.headerName] as string ||
      req.body?.[CSRF_FORM_FIELD] ||
      req.query?._csrf as string;
    
    // Get session ID
    const sessionId = (req.session as any)?.id || generateSessionId(req);
    
    // Validate token
    if (!token || !validateCSRFToken(sessionId, token)) {
      return res.status(403).json({
        error: 'CSRF token validation failed',
        message: 'Invalid or missing CSRF token. Please refresh and try again.',
      });
    }
    
    // Double submit cookie validation
    const cookieToken = req.cookies?.[config.cookieName];
    if (cookieToken !== token) {
      return res.status(403).json({
        error: 'CSRF double submit validation failed',
        message: 'CSRF token mismatch. Please refresh and try again.',
      });
    }
    
    // Origin header validation
    if (origin) {
      const allowedOrigins = [
        process.env.CLIENT_URL,
        process.env.REPLIT_DOMAINS?.split(',').map(d => `https://${d}`),
      ].flat().filter(Boolean);
      
      const isValidOrigin = allowedOrigins.some(allowed => 
        origin.startsWith(allowed as string)
      );
      
      if (!isValidOrigin) {
        return res.status(403).json({
          error: 'Origin validation failed',
          message: 'Request origin not allowed.',
        });
      }
    }
    
    // Rotate token after successful validation (optional, for extra security)
    if (Math.random() < 0.1) { // 10% chance to rotate
      const newToken = createCSRFToken(sessionId, (req as any).user?.id);
      (req.session as any).csrfToken = newToken;
      
      res.cookie(config.cookieName, newToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: TOKEN_EXPIRY,
      });
    }
    
    next();
  };
};

// Generate session ID from request
function generateSessionId(req: Request): string {
  const ip = req.ip || req.connection.remoteAddress || '';
  const userAgent = req.headers['user-agent'] || '';
  const timestamp = Date.now().toString();
  
  return createHash('sha256')
    .update(ip + userAgent + timestamp)
    .digest('hex');
}

// SameSite cookie configuration
export function configureSameSiteCookies(app: any): void {
  app.set('trust proxy', 1);
  
  // Configure session cookies
  if (app.get('session')) {
    app.get('session').cookie = {
      ...app.get('session').cookie,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
    };
  }
}

// CSRF token endpoint
export function setupCSRFEndpoint(app: any): void {
  app.get('/api/security/csrf-token', (req: Request, res: Response) => {
    if (!req.session) {
      req.session = {} as any;
    }
    
    const session = req.session as any;
    const sessionId = session.id || generateSessionId(req);
    
    // Generate new token
    const token = createCSRFToken(sessionId, (req as any).user?.id);
    session.csrfToken = token;
    
    // Set cookie
    res.cookie(CSRF_COOKIE, token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: TOKEN_EXPIRY,
    });
    
    res.json({ token });
  });
}

// Synchronizer token pattern
export class SynchronizerTokenPattern {
  private tokens: Map<string, Set<string>> = new Map();
  
  generateToken(userId: string): string {
    const token = generateCSRFToken();
    
    if (!this.tokens.has(userId)) {
      this.tokens.set(userId, new Set());
    }
    
    this.tokens.get(userId)!.add(token);
    
    // Limit tokens per user
    const userTokens = this.tokens.get(userId)!;
    if (userTokens.size > 10) {
      const tokensArray = Array.from(userTokens);
      userTokens.delete(tokensArray[0]); // Remove oldest
    }
    
    return token;
  }
  
  validateToken(userId: string, token: string): boolean {
    const userTokens = this.tokens.get(userId);
    
    if (!userTokens || !userTokens.has(token)) {
      return false;
    }
    
    // Token is valid, remove it (one-time use)
    userTokens.delete(token);
    
    return true;
  }
  
  clearUserTokens(userId: string): void {
    this.tokens.delete(userId);
  }
}

// Per-request token generation
export function generatePerRequestToken(req: Request): string {
  const requestId = req.headers['x-request-id'] as string || generateCSRFToken();
  const timestamp = Date.now().toString();
  const method = req.method;
  const path = req.path;
  
  const data = `${requestId}:${timestamp}:${method}:${path}`;
  return createHash('sha256').update(data).digest('hex');
}

// Encrypted token pattern
export function createEncryptedToken(data: any, secret: string): string {
  const crypto = require('crypto');
  const algorithm = 'aes-256-gcm';
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secret, 'hex'), iv);
  
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return Buffer.concat([iv, authTag, Buffer.from(encrypted, 'hex')]).toString('base64');
}

export function decryptToken(token: string, secret: string): any {
  const crypto = require('crypto');
  const algorithm = 'aes-256-gcm';
  const buffer = Buffer.from(token, 'base64');
  
  const iv = buffer.slice(0, 16);
  const authTag = buffer.slice(16, 32);
  const encrypted = buffer.slice(32);
  
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secret, 'hex'), iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, null, 'utf8');
  decrypted += decipher.final('utf8');
  
  return JSON.parse(decrypted);
}

export default {
  generateCSRFToken,
  createCSRFToken,
  validateCSRFToken,
  csrfProtection,
  configureSameSiteCookies,
  setupCSRFEndpoint,
  SynchronizerTokenPattern,
  generatePerRequestToken,
  createEncryptedToken,
  decryptToken,
};