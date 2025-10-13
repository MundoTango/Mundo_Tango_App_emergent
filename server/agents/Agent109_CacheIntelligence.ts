/**
 * ESA AGENT #109: Cache Intelligence
 * MB.MD TRACK 8.4 - Performance Optimization
 * 
 * Purpose: Auto-invalidate cache and predict stale data
 * Prevents: Serving outdated cached data to users
 * Runs: Real-time monitoring + predictive analysis
 */

import { db } from '../db';
import { agentJobs } from '../../shared/schema';
import { eq } from 'drizzle-orm';

interface CachePattern {
  key: string;
  hitRate: number;
  staleRate: number;
  avgAge: number;
  recommendation: 'keep' | 'invalidate' | 'shorten_ttl' | 'remove';
}

interface CacheAnalysis {
  timestamp: string;
  totalKeys: number;
  hitRate: number;
  staleDetected: number;
  recommendations: CachePattern[];
  optimizationPotential: string;
}

export class Agent109_CacheIntelligence {
  private agentId = 109;
  private agentName = 'Cache Intelligence';
  private cacheLog: Map<string, {
    hits: number;
    misses: number;
    invalidations: number;
    lastAccessed: Date;
  }> = new Map();
  
  /**
   * Analyze cache patterns and predict stale data
   */
  async analyze(): Promise<CacheAnalysis> {
    console.log(`[Agent #${this.agentId}] Analyzing cache patterns...`);
    
    const jobId = await this.createJob();
    
    try {
      // Get cache statistics
      const patterns = await this.analyzeCachePatterns();
      
      // Detect stale data
      const staleKeys = this.detectStaleData(patterns);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(patterns);
      
      // Calculate optimization potential
      const optimization = this.calculateOptimization(recommendations);
      
      const result: CacheAnalysis = {
        timestamp: new Date().toISOString(),
        totalKeys: patterns.length,
        hitRate: this.calculateOverallHitRate(patterns),
        staleDetected: staleKeys.length,
        recommendations,
        optimizationPotential: optimization
      };
      
      await this.completeJob(jobId, 'completed', result);
      
      // Auto-invalidate stale data
      await this.autoInvalidateStale(staleKeys);
      
      console.log(`[Agent #${this.agentId}] Analysis complete:`, {
        hitRate: result.hitRate,
        staleDetected: staleKeys.length,
        optimization: optimization
      });
      
      return result;
      
    } catch (error) {
      console.error(`[Agent #${this.agentId}] Analysis failed:`, error);
      await this.completeJob(jobId, 'failed', { error: (error as Error).message });
      throw error;
    }
  }
  
  /**
   * Analyze cache access patterns
   */
  private async analyzeCachePatterns(): Promise<CachePattern[]> {
    const patterns: CachePattern[] = [];
    
    this.cacheLog.forEach((stats, key) => {
      const total = stats.hits + stats.misses;
      const hitRate = total > 0 ? (stats.hits / total) * 100 : 0;
      const staleRate = total > 0 ? (stats.invalidations / total) * 100 : 0;
      const avgAge = Date.now() - stats.lastAccessed.getTime();
      
      patterns.push({
        key,
        hitRate,
        staleRate,
        avgAge,
        recommendation: 'keep'
      });
    });
    
    return patterns;
  }
  
  /**
   * Detect stale data based on mutation patterns
   */
  private detectStaleData(patterns: CachePattern[]): string[] {
    const staleKeys: string[] = [];
    
    patterns.forEach(pattern => {
      // High stale rate indicates frequent invalidations
      if (pattern.staleRate > 30) {
        staleKeys.push(pattern.key);
      }
      
      // Very old cache entries
      if (pattern.avgAge > 3600000) { // 1 hour
        staleKeys.push(pattern.key);
      }
    });
    
    return [...new Set(staleKeys)]; // Remove duplicates
  }
  
  /**
   * Generate cache optimization recommendations
   */
  private generateRecommendations(patterns: CachePattern[]): CachePattern[] {
    return patterns.map(pattern => {
      let recommendation: 'keep' | 'invalidate' | 'shorten_ttl' | 'remove' = 'keep';
      
      if (pattern.hitRate < 10) {
        recommendation = 'remove'; // Low hit rate, not worth caching
      } else if (pattern.staleRate > 50) {
        recommendation = 'shorten_ttl'; // Frequently stale, reduce TTL
      } else if (pattern.staleRate > 30) {
        recommendation = 'invalidate'; // Moderately stale, invalidate now
      }
      
      return {
        ...pattern,
        recommendation
      };
    });
  }
  
  /**
   * Calculate overall cache hit rate
   */
  private calculateOverallHitRate(patterns: CachePattern[]): number {
    const totalHitRate = patterns.reduce((sum, p) => sum + p.hitRate, 0);
    return patterns.length > 0 ? totalHitRate / patterns.length : 0;
  }
  
  /**
   * Calculate optimization potential
   */
  private calculateOptimization(recommendations: CachePattern[]): string {
    const toRemove = recommendations.filter(r => r.recommendation === 'remove').length;
    const toInvalidate = recommendations.filter(r => r.recommendation === 'invalidate').length;
    const toShorten = recommendations.filter(r => r.recommendation === 'shorten_ttl').length;
    
    const totalOptimizations = toRemove + toInvalidate + toShorten;
    const percentOptimizable = (totalOptimizations / recommendations.length * 100).toFixed(1);
    
    return `${percentOptimizable}% (${toRemove} remove, ${toInvalidate} invalidate, ${toShorten} shorten TTL)`;
  }
  
  /**
   * Auto-invalidate stale cache entries
   */
  private async autoInvalidateStale(staleKeys: string[]): Promise<void> {
    if (staleKeys.length === 0) return;
    
    console.log(`[Agent #${this.agentId}] Auto-invalidating ${staleKeys.length} stale cache entries...`);
    
    staleKeys.forEach(key => {
      // In production, this would call Redis/cache service
      console.log(`[Agent #${this.agentId}]   - Invalidated: ${key}`);
      
      // Update log
      const stats = this.cacheLog.get(key);
      if (stats) {
        stats.invalidations++;
      }
    });
  }
  
  /**
   * Track cache access
   */
  trackAccess(key: string, hit: boolean): void {
    if (!this.cacheLog.has(key)) {
      this.cacheLog.set(key, {
        hits: 0,
        misses: 0,
        invalidations: 0,
        lastAccessed: new Date()
      });
    }
    
    const stats = this.cacheLog.get(key)!;
    if (hit) {
      stats.hits++;
    } else {
      stats.misses++;
    }
    stats.lastAccessed = new Date();
  }
  
  /**
   * Predict when cache will become stale (ML-powered in future)
   */
  predictStaleness(key: string): { willBeStale: boolean; timeUntilStale: number } {
    const stats = this.cacheLog.get(key);
    
    if (!stats) {
      return { willBeStale: false, timeUntilStale: 0 };
    }
    
    const total = stats.hits + stats.misses;
    const staleRate = total > 0 ? stats.invalidations / total : 0;
    
    // Simple heuristic (in future, use ML model)
    const willBeStale = staleRate > 0.3;
    const avgInvalidationInterval = 3600000; // 1 hour default
    const timeUntilStale = willBeStale ? avgInvalidationInterval : 0;
    
    return { willBeStale, timeUntilStale };
  }
  
  /**
   * Create agent job record
   */
  private async createJob(): Promise<number> {
    try {
      const [job] = await db.insert(agentJobs).values({
        agentId: this.agentId,
        agentName: this.agentName,
        jobType: 'cache_analysis',
        status: 'running',
        priority: 'medium',
        startedAt: new Date(),
        metadata: {
          trigger: 'scheduled',
          focus: 'stale_detection'
        }
      }).returning();
      
      return job.id;
    } catch (error) {
      console.error('[Agent #109] Failed to create job:', error);
      return -1;
    }
  }
  
  /**
   * Complete agent job
   */
  private async completeJob(jobId: number, status: 'completed' | 'failed', result: any): Promise<void> {
    if (jobId === -1) return;
    
    try {
      await db.update(agentJobs)
        .set({
          status,
          completedAt: new Date(),
          result
        })
        .where(eq(agentJobs.id, jobId));
    } catch (error) {
      console.error('[Agent #109] Failed to update job:', error);
    }
  }
}

// Export singleton instance
export const agent109 = new Agent109_CacheIntelligence();
