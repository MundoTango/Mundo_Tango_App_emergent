/**
 * Phase 9 - Track C1: Predictive Cache Warming
 * Intelligently pre-load cache based on access patterns
 */

import { cache, RedisCache } from './RedisCache';
import { CacheKeys } from './CacheKeys';
import Redis from 'ioredis';

interface AccessPattern {
  key: string;
  accessCount: number;
  lastAccess: Date;
  predictedNextAccess: Date;
}

export class PredictiveCacheWarmer {
  private accessPatterns: Map<string, AccessPattern>;
  private warmingEnabled: boolean;
  private warmingInterval: NodeJS.Timeout | null;
  private redis: Redis | null;
  private lockKey = 'cache:warming:lock';
  private lockTTL = 60; // 60 seconds

  constructor() {
    this.accessPatterns = new Map();
    this.warmingEnabled = true;
    this.warmingInterval = null;

    // Try to connect to Redis for distributed locking
    this.redis = process.env.REDIS_URL 
      ? new Redis(process.env.REDIS_URL)
      : null;

    if (!this.redis) {
      console.log('📝 [Cache Warmer] No Redis - using single-instance mode');
    }
  }

  /**
   * Start predictive cache warming
   */
  start(intervalMs: number = 10 * 60 * 1000): void {
    if (this.warmingInterval) {
      console.warn('[Cache Warmer] Already running');
      return;
    }

    console.log(`🔥 [Cache Warmer] Started (interval: ${intervalMs}ms)`);

    this.warmingInterval = setInterval(async () => {
      await this.warmCache();
    }, intervalMs);

    // Initial warm-up
    setTimeout(() => this.warmCache(), 5000);
  }

  /**
   * Stop cache warming
   */
  stop(): void {
    if (this.warmingInterval) {
      clearInterval(this.warmingInterval);
      this.warmingInterval = null;
      console.log('🛑 [Cache Warmer] Stopped');
    }
  }

  /**
   * Record an access pattern
   */
  recordAccess(key: string): void {
    const pattern = this.accessPatterns.get(key);

    if (pattern) {
      pattern.accessCount++;
      pattern.lastAccess = new Date();
      pattern.predictedNextAccess = this.predictNextAccess(pattern);
    } else {
      this.accessPatterns.set(key, {
        key,
        accessCount: 1,
        lastAccess: new Date(),
        predictedNextAccess: new Date(Date.now() + 60 * 60 * 1000) // Predict 1hr ahead
      });
    }
  }

  /**
   * Warm cache with predicted hot data
   */
  private async warmCache(): Promise<void> {
    if (!this.warmingEnabled) return;

    // Try to acquire distributed lock
    const lockAcquired = await this.acquireLock();
    if (!lockAcquired) {
      console.log('[Cache Warmer] Another instance is warming cache, skipping');
      return;
    }

    try {
      console.log('🔥 [Cache Warmer] Starting cache warm-up...');
      const startTime = Date.now();

      // Get top predicted keys
      const hotKeys = this.predictHotKeys(20);

      console.log(`📊 [Cache Warmer] Warming ${hotKeys.length} predicted hot keys`);

      // Warm each key
      let warmedCount = 0;
      for (const pattern of hotKeys) {
        const warmed = await this.warmKey(pattern.key);
        if (warmed) warmedCount++;
      }

      const duration = Date.now() - startTime;
      console.log(`✅ [Cache Warmer] Warmed ${warmedCount}/${hotKeys.length} keys in ${duration}ms`);

    } finally {
      await this.releaseLock();
    }
  }

  /**
   * Predict next access time based on historical pattern
   */
  private predictNextAccess(pattern: AccessPattern): Date {
    // Simple prediction: Average access frequency
    // If accessed 10 times in last hour, predict next access in 6 minutes
    const avgIntervalMs = (60 * 60 * 1000) / Math.max(pattern.accessCount, 1);
    return new Date(Date.now() + avgIntervalMs);
  }

  /**
   * Predict hot keys likely to be requested soon
   */
  private predictHotKeys(limit: number = 20): AccessPattern[] {
    const now = Date.now();
    const patterns = Array.from(this.accessPatterns.values());

    // Score each pattern: Recent access + high frequency + predicted soon
    return patterns
      .map(p => ({
        ...p,
        score: this.calculateHotScore(p, now)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Calculate hotness score for a key
   */
  private calculateHotScore(pattern: AccessPattern, now: number): number {
    const recency = now - pattern.lastAccess.getTime();
    const recencyScore = Math.max(0, 1 - recency / (60 * 60 * 1000)); // Decay over 1 hour

    const frequencyScore = Math.min(pattern.accessCount / 100, 1); // Normalize to 0-1

    const timeToPredicted = pattern.predictedNextAccess.getTime() - now;
    const urgencyScore = timeToPredicted < 5 * 60 * 1000 ? 1 : 0; // High if predicted within 5 min

    return recencyScore * 0.3 + frequencyScore * 0.4 + urgencyScore * 0.3;
  }

  /**
   * Warm a specific cache key
   */
  private async warmKey(key: string): Promise<boolean> {
    try {
      // Check if already in cache
      const exists = await cache.exists(key);
      if (exists) {
        return false; // Already cached
      }

      // Determine data source based on key pattern
      if (key.startsWith(CacheKeys.LEARNINGS)) {
        return await this.warmLearnings(key);
      } else if (key.startsWith(CacheKeys.AUTO_FIXES)) {
        return await this.warmAutoFixes(key);
      } else if (key.startsWith(CacheKeys.PATTERNS)) {
        return await this.warmPatterns(key);
      }

      return false;
    } catch (error) {
      console.error(`Error warming key ${key}:`, error);
      return false;
    }
  }

  /**
   * Warm learnings data
   */
  private async warmLearnings(key: string): Promise<boolean> {
    // Extract agentId from key format: "learnings:agent-1-1"
    const agentId = key.replace(CacheKeys.LEARNINGS, '');
    
    // Fetch from database (this would normally be in a service)
    // For now, just set a placeholder
    await cache.set(key, { warmed: true, agentId }, 3600);
    return true;
  }

  /**
   * Warm auto-fixes data
   */
  private async warmAutoFixes(key: string): Promise<boolean> {
    const agentId = key.replace(CacheKeys.AUTO_FIXES, '');
    await cache.set(key, { warmed: true, agentId }, 1800);
    return true;
  }

  /**
   * Warm patterns data
   */
  private async warmPatterns(key: string): Promise<boolean> {
    const domain = key.replace(CacheKeys.PATTERNS, '');
    await cache.set(key, { warmed: true, domain }, 3600);
    return true;
  }

  /**
   * Acquire distributed lock using Redlock pattern
   */
  private async acquireLock(): Promise<boolean> {
    if (!this.redis) {
      return true; // Single instance mode - always acquire
    }

    try {
      // SET key value NX EX seconds
      const result = await this.redis.set(
        this.lockKey,
        'locked',
        'NX',
        'EX',
        this.lockTTL
      );

      return result === 'OK';
    } catch (error) {
      console.error('Lock acquisition error:', error);
      return false;
    }
  }

  /**
   * Release distributed lock
   */
  private async releaseLock(): Promise<void> {
    if (!this.redis) return;

    try {
      await this.redis.del(this.lockKey);
    } catch (error) {
      console.error('Lock release error:', error);
    }
  }

  /**
   * Get warming statistics
   */
  getStats(): {
    trackedKeys: number;
    warmingEnabled: boolean;
    topHotKeys: AccessPattern[];
  } {
    return {
      trackedKeys: this.accessPatterns.size,
      warmingEnabled: this.warmingEnabled,
      topHotKeys: this.predictHotKeys(10)
    };
  }

  /**
   * Enable/disable warming
   */
  setEnabled(enabled: boolean): void {
    this.warmingEnabled = enabled;
    console.log(`[Cache Warmer] ${enabled ? 'Enabled' : 'Disabled'}`);
  }
}

// Singleton instance
export const predictiveCacheWarmer = new PredictiveCacheWarmer();
