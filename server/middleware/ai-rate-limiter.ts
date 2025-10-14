/**
 * AI Rate Limiter - Production hardening
 * Prevents abuse and ensures fair usage of AI resources
 */

import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible';

interface RateLimitConfig {
  points: number; // Number of requests
  duration: number; // Time window in seconds
  blockDuration?: number; // Block duration in seconds
}

// Different limits for different endpoints
const rateLimits: Record<string, RateLimitConfig> = {
  status: {
    points: 300, // 300 requests
    duration: 60, // per minute
  },
  metrics: {
    points: 60, // 60 requests
    duration: 60, // per minute
  },
  route: {
    points: 100, // 100 requests
    duration: 60, // per minute
    blockDuration: 120, // Block for 2 minutes if exceeded
  },
  ensemble: {
    points: 20, // 20 requests (expensive)
    duration: 60, // per minute
    blockDuration: 300, // Block for 5 minutes if exceeded
  },
};

// Create rate limiters
const limiters: Record<string, RateLimiterMemory> = {};

Object.entries(rateLimits).forEach(([key, config]) => {
  limiters[key] = new RateLimiterMemory({
    points: config.points,
    duration: config.duration,
    blockDuration: config.blockDuration,
  });
});

/**
 * Get rate limiter key from user
 */
function getRateLimitKey(req: Request): string {
  // Use user ID if authenticated
  if (req.user && (req.user as any).id) {
    return `user:${(req.user as any).id}`;
  }
  
  // Fallback to IP address
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  return `ip:${ip}`;
}

/**
 * Determine which limiter to use based on endpoint
 */
function getLimiterType(path: string): string {
  if (path.includes('/status')) return 'status';
  if (path.includes('/metrics')) return 'metrics';
  if (path.includes('/ensemble') || path.includes('/consult')) return 'ensemble';
  if (path.includes('/route')) return 'route';
  return 'route'; // Default to route limiter
}

/**
 * Rate limiting middleware for AI endpoints
 */
export function aiRateLimiter(req: Request, res: Response, next: NextFunction): void {
  const key = getRateLimitKey(req);
  const limiterType = getLimiterType(req.path);
  const limiter = limiters[limiterType];

  if (!limiter) {
    // No rate limit configured for this endpoint
    return next();
  }

  limiter.consume(key)
    .then((rateLimiterRes: RateLimiterRes) => {
      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', limiter.points);
      res.setHeader('X-RateLimit-Remaining', rateLimiterRes.remainingPoints);
      res.setHeader('X-RateLimit-Reset', new Date(Date.now() + rateLimiterRes.msBeforeNext).toISOString());

      next();
    })
    .catch((rateLimiterRes: RateLimiterRes) => {
      // Rate limit exceeded
      const retryAfter = Math.ceil(rateLimiterRes.msBeforeNext / 1000);

      res.setHeader('Retry-After', retryAfter.toString());
      res.setHeader('X-RateLimit-Limit', limiter.points);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', new Date(Date.now() + rateLimiterRes.msBeforeNext).toISOString());

      console.warn(`[AI Rate Limiter] Rate limit exceeded for ${key} on ${req.path}`);

      res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
        retryAfter,
        limit: limiter.points,
        window: rateLimits[limiterType].duration,
      });
    });
}

/**
 * Get current rate limit status for a user
 */
export async function getRateLimitStatus(req: Request): Promise<Record<string, {
  limit: number;
  remaining: number;
  reset: Date;
}>> {
  const key = getRateLimitKey(req);
  const status: Record<string, any> = {};

  for (const [type, limiter] of Object.entries(limiters)) {
    try {
      const res = await limiter.get(key);
      
      status[type] = {
        limit: limiter.points,
        remaining: res ? limiter.points - res.consumedPoints : limiter.points,
        reset: res ? new Date(Date.now() + res.msBeforeNext) : new Date(),
      };
    } catch (error) {
      status[type] = {
        limit: limiter.points,
        remaining: limiter.points,
        reset: new Date(),
      };
    }
  }

  return status;
}

/**
 * Admin function to reset rate limits for a specific user/IP
 */
export async function resetRateLimit(key: string): Promise<void> {
  for (const limiter of Object.values(limiters)) {
    await limiter.delete(key);
  }
  console.log(`[AI Rate Limiter] Reset rate limits for ${key}`);
}

/**
 * Admin function to block a specific user/IP
 */
export async function blockUser(key: string, durationSeconds: number): Promise<void> {
  for (const limiter of Object.values(limiters)) {
    await limiter.block(key, durationSeconds);
  }
  console.log(`[AI Rate Limiter] Blocked ${key} for ${durationSeconds} seconds`);
}
