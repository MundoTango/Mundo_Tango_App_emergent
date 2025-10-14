/**
 * Token Bucket Rate Limiter
 * MB.MD Phase 4: Burst-friendly rate limiting
 * 
 * Research Source: Token bucket algorithm (industry standard)
 * Handles traffic bursts gracefully while maintaining overall rate limits
 */

import type { Request, Response, NextFunction } from 'express';

interface TokenBucketConfig {
  capacity: number;        // Maximum tokens (allows burst)
  refillRate: number;      // Tokens added per second
  initialTokens?: number;  // Starting tokens
}

class TokenBucket {
  private capacity: number;
  private tokens: number;
  private refillRate: number;
  private lastRefill: number;

  constructor(config: TokenBucketConfig) {
    this.capacity = config.capacity;
    this.tokens = config.initialTokens ?? config.capacity;
    this.refillRate = config.refillRate;
    this.lastRefill = Date.now();
  }

  /**
   * Refill tokens based on time elapsed
   */
  private refill(): void {
    const now = Date.now();
    const timePassed = (now - this.lastRefill) / 1000; // Convert to seconds
    
    const tokensToAdd = timePassed * this.refillRate;
    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  /**
   * Try to consume tokens
   * @returns true if tokens available, false otherwise
   */
  tryConsume(count: number = 1): boolean {
    this.refill();

    if (this.tokens >= count) {
      this.tokens -= count;
      return true;
    }

    return false;
  }

  /**
   * Get current token count
   */
  getAvailableTokens(): number {
    this.refill();
    return Math.floor(this.tokens);
  }

  /**
   * Get time until next token available (in ms)
   */
  getRetryAfter(): number {
    if (this.tokens >= 1) {
      return 0;
    }

    const tokensNeeded = 1 - this.tokens;
    const timeNeeded = (tokensNeeded / this.refillRate) * 1000; // ms
    return Math.ceil(timeNeeded);
  }
}

/**
 * Per-client token bucket store
 */
class TokenBucketStore {
  private buckets: Map<string, TokenBucket> = new Map();
  private config: TokenBucketConfig;

  constructor(config: TokenBucketConfig) {
    this.config = config;
  }

  getBucket(clientId: string): TokenBucket {
    if (!this.buckets.has(clientId)) {
      this.buckets.set(clientId, new TokenBucket(this.config));
    }
    return this.buckets.get(clientId)!;
  }

  /**
   * Clean up old buckets periodically
   */
  cleanup(): void {
    // Remove buckets that have been full for >1 hour (inactive clients)
    const now = Date.now();
    for (const [clientId, bucket] of this.buckets.entries()) {
      if (bucket.getAvailableTokens() === this.config.capacity) {
        this.buckets.delete(clientId);
      }
    }
  }
}

/**
 * Rate limiter configurations by endpoint
 */
const RATE_LIMIT_CONFIGS: Record<string, TokenBucketConfig> = {
  '/api/ai/status': {
    capacity: 50,          // Allow burst of 50 requests
    refillRate: 5,         // 5 requests per second (300 req/min)
    initialTokens: 50
  },
  '/api/ai/metrics': {
    capacity: 20,          // Allow burst of 20 requests
    refillRate: 1,         // 1 request per second (60 req/min)
    initialTokens: 20
  },
  '/api/ai/route': {
    capacity: 10,          // Allow burst of 10 requests
    refillRate: 1.67,      // ~1.67 requests per second (100 req/min)
    initialTokens: 10
  },
  '/api/ai/ensemble': {
    capacity: 5,           // Allow burst of 5 requests
    refillRate: 0.33,      // ~0.33 requests per second (20 req/min)
    initialTokens: 5
  },
  'default': {
    capacity: 30,
    refillRate: 2,         // 2 requests per second (120 req/min)
    initialTokens: 30
  }
};

// Store instances per endpoint
const stores: Map<string, TokenBucketStore> = new Map();

function getStore(endpoint: string): TokenBucketStore {
  if (!stores.has(endpoint)) {
    const config = RATE_LIMIT_CONFIGS[endpoint] || RATE_LIMIT_CONFIGS['default'];
    stores.set(endpoint, new TokenBucketStore(config));
  }
  return stores.get(endpoint)!;
}

/**
 * Token Bucket Rate Limiting Middleware
 */
export function tokenBucketRateLimiter(req: Request, res: Response, next: NextFunction): void {
  const clientId = (req.user as any)?.id?.toString() || req.ip || 'anonymous';
  const endpoint = req.path;

  // Get or create bucket for this client
  const store = getStore(endpoint);
  const bucket = store.getBucket(clientId);

  // Try to consume a token
  if (bucket.tryConsume(1)) {
    // Request allowed
    const remaining = bucket.getAvailableTokens();
    
    // Add rate limit headers
    const config = RATE_LIMIT_CONFIGS[endpoint] || RATE_LIMIT_CONFIGS['default'];
    res.setHeader('X-RateLimit-Limit', config.capacity);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Date.now() + 1000); // Reset in 1 second

    next();
  } else {
    // Rate limited
    const retryAfter = Math.ceil(bucket.getRetryAfter() / 1000); // Convert to seconds

    res.setHeader('Retry-After', retryAfter);
    res.setHeader('X-RateLimit-Limit', (RATE_LIMIT_CONFIGS[endpoint] || RATE_LIMIT_CONFIGS['default']).capacity);
    res.setHeader('X-RateLimit-Remaining', 0);

    res.status(429).json({
      error: 'Rate limit exceeded',
      message: `Too many requests. Please try again in ${retryAfter} second(s).`,
      retry_after: retryAfter
    });
  }
}

/**
 * Cleanup old buckets periodically (every 1 hour)
 */
setInterval(() => {
  for (const store of stores.values()) {
    store.cleanup();
  }
}, 60 * 60 * 1000); // 1 hour

/**
 * Export for testing
 */
export { TokenBucket, TokenBucketStore, RATE_LIMIT_CONFIGS };
