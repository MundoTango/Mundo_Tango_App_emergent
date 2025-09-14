// ESA LIFE CEO 61x21 - Phase 13: API Security
// API key management, request signing, and enhanced security

import { Request, Response, NextFunction } from 'express';
import { createHmac, randomBytes } from 'crypto';
import { db } from '../db';
import { apiKeys, apiKeyUsage } from '../../shared/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import Redis from 'ioredis';

// Redis client for rate limiting (optional)
let redis: Redis | null = null;

// Only initialize Redis if explicitly enabled
if (process.env.ENABLE_REDIS === 'true') {
  try {
    redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: 0,
      retryStrategy: (times) => {
        if (times > 3) {
          console.warn('Redis connection failed after 3 attempts, disabling Redis rate limiting');
          return null;
        }
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });
    
    redis.on('error', (err) => {
      console.warn('Redis error, falling back to in-memory rate limiting:', err.message);
      redis = null;
    });
  } catch (error) {
    console.warn('Failed to initialize Redis, using in-memory rate limiting');
    redis = null;
  }
}

// In-memory fallback for rate limiting
const inMemoryRateLimits = new Map<string, { count: number; resetTime: number }>();

// API key configuration
const API_KEY_LENGTH = 32;
const API_SECRET_LENGTH = 64;
const SIGNATURE_HEADER = 'x-api-signature';
const TIMESTAMP_HEADER = 'x-api-timestamp';
const API_KEY_HEADER = 'x-api-key';
const REQUEST_TIMEOUT = 300000; // 5 minutes

// API key scopes
export enum APIScope {
  READ = 'read',
  WRITE = 'write',
  DELETE = 'delete',
  ADMIN = 'admin',
  ANALYTICS = 'analytics',
  WEBHOOKS = 'webhooks',
}

// Generate API key and secret
export function generateAPICredentials() {
  return {
    key: `esa_${randomBytes(API_KEY_LENGTH).toString('hex')}`,
    secret: randomBytes(API_SECRET_LENGTH).toString('hex'),
  };
}

// Create API key for user
export async function createAPIKey(
  userId: number,
  name: string,
  scopes: APIScope[],
  expiresAt?: Date
) {
  try {
    const { key, secret } = generateAPICredentials();
    const hashedSecret = createHmac('sha256', process.env.JWT_SECRET || 'secret')
      .update(secret)
      .digest('hex');
    
    const result = await db.insert(apiKeys).values({
      userId,
      name,
      key,
      secret: hashedSecret,
      scopes: scopes.join(','),
      expiresAt,
      lastUsedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    
    return {
      id: result[0].id,
      key,
      secret, // Return unhashed secret only once
      scopes,
      expiresAt,
    };
  } catch (error) {
    console.error('Error creating API key:', error);
    throw error;
  }
}

// Validate API key
export async function validateAPIKey(key: string): Promise<any> {
  try {
    const apiKey = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.key, key))
      .limit(1);
    
    if (!apiKey[0]) {
      return null;
    }
    
    // Check if expired
    if (apiKey[0].expiresAt && new Date() > apiKey[0].expiresAt) {
      return null;
    }
    
    // Update last used timestamp
    await db
      .update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.id, apiKey[0].id));
    
    // Log usage
    await logAPIUsage(apiKey[0].id, 'validation');
    
    return {
      id: apiKey[0].id,
      userId: apiKey[0].userId,
      scopes: apiKey[0].scopes.split(','),
      secret: apiKey[0].secret,
    };
  } catch (error) {
    console.error('Error validating API key:', error);
    return null;
  }
}

// Generate request signature
export function generateRequestSignature(
  method: string,
  path: string,
  timestamp: number,
  body: any,
  secret: string
): string {
  const data = `${method}:${path}:${timestamp}:${JSON.stringify(body || {})}`;
  return createHmac('sha256', secret).update(data).digest('hex');
}

// Verify request signature
export function verifyRequestSignature(
  req: Request,
  secret: string
): boolean {
  const signature = req.headers[SIGNATURE_HEADER] as string;
  const timestamp = parseInt(req.headers[TIMESTAMP_HEADER] as string);
  
  if (!signature || !timestamp) {
    return false;
  }
  
  // Check timestamp (prevent replay attacks)
  const now = Date.now();
  if (Math.abs(now - timestamp) > REQUEST_TIMEOUT) {
    return false;
  }
  
  // Generate expected signature
  const expectedSignature = generateRequestSignature(
    req.method,
    req.path,
    timestamp,
    req.body,
    secret
  );
  
  // Constant-time comparison
  return timingSafeEqual(signature, expectedSignature);
}

// Timing-safe string comparison
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}

// API authentication middleware
export const apiAuthentication = (requiredScopes?: APIScope[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers[API_KEY_HEADER] as string;
    
    if (!apiKey) {
      return res.status(401).json({
        error: 'Missing API key',
        message: 'API key is required for this endpoint',
      });
    }
    
    // Validate API key
    const keyData = await validateAPIKey(apiKey);
    
    if (!keyData) {
      return res.status(401).json({
        error: 'Invalid API key',
        message: 'The provided API key is invalid or expired',
      });
    }
    
    // Check scopes
    if (requiredScopes && requiredScopes.length > 0) {
      const hasRequiredScopes = requiredScopes.every(scope =>
        keyData.scopes.includes(scope)
      );
      
      if (!hasRequiredScopes) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          message: `This endpoint requires the following scopes: ${requiredScopes.join(', ')}`,
        });
      }
    }
    
    // Verify request signature
    if (!verifyRequestSignature(req, keyData.secret)) {
      return res.status(401).json({
        error: 'Invalid request signature',
        message: 'Request signature verification failed',
      });
    }
    
    // Add API key data to request
    (req as any).apiKey = keyData;
    
    next();
  };
};

// Rate limiting for API keys
export async function checkAPIRateLimit(
  apiKeyId: number,
  limit: number = 100,
  window: number = 60
): Promise<boolean> {
  const key = `api_rate_limit:${apiKeyId}`;
  
  // Use Redis if available
  if (redis) {
    try {
      const current = await redis.incr(key);
      
      if (current === 1) {
        await redis.expire(key, window);
      }
      
      return current <= limit;
    } catch (error) {
      console.error('Redis error:', error);
      // Fall through to in-memory implementation
    }
  }
  
  // In-memory fallback
  const now = Date.now();
  const windowMs = window * 1000;
  const rateLimit = inMemoryRateLimits.get(key);
  
  if (!rateLimit || now > rateLimit.resetTime) {
    inMemoryRateLimits.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }
  
  if (rateLimit.count >= limit) {
    return false;
  }
  
  rateLimit.count++;
  return true;
}

// API rate limiting middleware
export const apiRateLimiting = (limit?: number, window?: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const apiKeyData = (req as any).apiKey;
    
    if (!apiKeyData) {
      return next();
    }
    
    const allowed = await checkAPIRateLimit(apiKeyData.id, limit, window);
    
    if (!allowed) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.',
        retryAfter: window,
      });
    }
    
    next();
  };
};

// Log API usage
async function logAPIUsage(
  apiKeyId: number,
  action: string,
  metadata?: any
) {
  try {
    await db.insert(apiKeyUsage).values({
      apiKeyId,
      action,
      metadata: metadata ? JSON.stringify(metadata) : null,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error logging API usage:', error);
  }
}

// Rotate API key
export async function rotateAPIKey(apiKeyId: number, userId: number) {
  try {
    // Verify ownership
    const existingKey = await db
      .select()
      .from(apiKeys)
      .where(and(
        eq(apiKeys.id, apiKeyId),
        eq(apiKeys.userId, userId)
      ))
      .limit(1);
    
    if (!existingKey[0]) {
      throw new Error('API key not found or unauthorized');
    }
    
    // Generate new credentials
    const { key, secret } = generateAPICredentials();
    const hashedSecret = createHmac('sha256', process.env.JWT_SECRET || 'secret')
      .update(secret)
      .digest('hex');
    
    // Update key
    await db
      .update(apiKeys)
      .set({
        key,
        secret: hashedSecret,
        updatedAt: new Date(),
      })
      .where(eq(apiKeys.id, apiKeyId));
    
    // Log rotation
    await logAPIUsage(apiKeyId, 'rotation', { oldKey: existingKey[0].key });
    
    return {
      key,
      secret,
    };
  } catch (error) {
    console.error('Error rotating API key:', error);
    throw error;
  }
}

// Revoke API key
export async function revokeAPIKey(apiKeyId: number, userId: number) {
  try {
    const result = await db
      .delete(apiKeys)
      .where(and(
        eq(apiKeys.id, apiKeyId),
        eq(apiKeys.userId, userId)
      ));
    
    return true;
  } catch (error) {
    console.error('Error revoking API key:', error);
    return false;
  }
}

// API versioning middleware
export const apiVersioning = (supportedVersions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const version = req.headers['api-version'] as string || 'v1';
    
    if (!supportedVersions.includes(version)) {
      return res.status(400).json({
        error: 'Unsupported API version',
        message: `Supported versions: ${supportedVersions.join(', ')}`,
        current: version,
      });
    }
    
    (req as any).apiVersion = version;
    next();
  };
};

// Request size limiting
export const requestSizeLimit = (maxSize: number = 10485760) => {
  return (req: Request, res: Response, next: NextFunction) => {
    let size = 0;
    
    req.on('data', (chunk) => {
      size += chunk.length;
      
      if (size > maxSize) {
        res.status(413).json({
          error: 'Request too large',
          message: `Request body exceeds maximum size of ${maxSize} bytes`,
        });
        req.connection.destroy();
      }
    });
    
    next();
  };
};

// API key statistics
export async function getAPIKeyStatistics(apiKeyId: number, days: number = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const usage = await db
      .select()
      .from(apiKeyUsage)
      .where(and(
        eq(apiKeyUsage.apiKeyId, apiKeyId),
        gte(apiKeyUsage.timestamp, startDate)
      ));
    
    const stats = {
      totalRequests: usage.length,
      byAction: {} as Record<string, number>,
      byDay: {} as Record<string, number>,
    };
    
    for (const record of usage) {
      // Count by action
      stats.byAction[record.action] = (stats.byAction[record.action] || 0) + 1;
      
      // Count by day
      const day = record.timestamp.toISOString().split('T')[0];
      stats.byDay[day] = (stats.byDay[day] || 0) + 1;
    }
    
    return stats;
  } catch (error) {
    console.error('Error getting API key statistics:', error);
    return null;
  }
}

export default {
  generateAPICredentials,
  createAPIKey,
  validateAPIKey,
  generateRequestSignature,
  verifyRequestSignature,
  apiAuthentication,
  apiRateLimiting,
  rotateAPIKey,
  revokeAPIKey,
  apiVersioning,
  requestSizeLimit,
  getAPIKeyStatistics,
  checkAPIRateLimit,
  APIScope,
};