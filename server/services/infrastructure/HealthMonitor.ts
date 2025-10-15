/**
 * Phase 10 - Track B1: Health Check & Auto-Restart System
 * Monitors system health and triggers auto-recovery
 */

import { db } from '../../db';
import { sql } from 'drizzle-orm';

export interface HealthCheckResult {
  healthy: boolean;
  checks: {
    database: { status: 'healthy' | 'unhealthy'; latency?: number; error?: string };
    memory: { status: 'healthy' | 'unhealthy'; usage: number; limit: number };
    uptime: { status: 'healthy' | 'unhealthy'; seconds: number };
    errorRate: { status: 'healthy' | 'unhealthy'; rate: number };
  };
  timestamp: Date;
}

export class HealthMonitor {
  private lastErrorCount = 0;
  private requestCount = 0;
  private memoryLimit = 0.9; // 90% memory usage threshold
  private uptimeThreshold = 30; // Minimum healthy uptime (seconds)

  /**
   * Liveness probe - is the process alive?
   */
  async checkLiveness(): Promise<boolean> {
    // Simple check - if we can respond, we're alive
    return Promise.resolve(true);
  }

  /**
   * Readiness probe - can we handle traffic?
   */
  async checkReadiness(): Promise<HealthCheckResult> {
    const checks = {
      database: await this.checkDatabase(),
      memory: this.checkMemory(),
      uptime: this.checkUptime(),
      errorRate: this.checkErrorRate()
    };

    const healthy = Object.values(checks).every(check => check.status === 'healthy');

    return {
      healthy,
      checks,
      timestamp: new Date()
    };
  }

  /**
   * Check database connectivity
   */
  private async checkDatabase(): Promise<HealthCheckResult['checks']['database']> {
    try {
      const start = Date.now();
      await db.execute(sql`SELECT 1`);
      const latency = Date.now() - start;

      if (latency > 5000) {
        return {
          status: 'unhealthy',
          latency,
          error: `Database latency too high: ${latency}ms`
        };
      }

      return { status: 'healthy', latency };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check memory usage
   */
  private checkMemory(): HealthCheckResult['checks']['memory'] {
    const usage = process.memoryUsage();
    const heapUsed = usage.heapUsed;
    const heapTotal = usage.heapTotal;
    const usageRatio = heapUsed / heapTotal;

    return {
      status: usageRatio < this.memoryLimit ? 'healthy' : 'unhealthy',
      usage: Math.round((usageRatio) * 100),
      limit: this.memoryLimit * 100
    };
  }

  /**
   * Check uptime
   */
  private checkUptime(): HealthCheckResult['checks']['uptime'] {
    const uptime = process.uptime();

    return {
      status: uptime >= this.uptimeThreshold ? 'healthy' : 'unhealthy',
      seconds: Math.round(uptime)
    };
  }

  /**
   * Check error rate
   */
  private checkErrorRate(): HealthCheckResult['checks']['errorRate'] {
    const errorRate = this.requestCount > 0 ? this.lastErrorCount / this.requestCount : 0;

    return {
      status: errorRate < 0.1 ? 'healthy' : 'unhealthy', // 10% error threshold
      rate: Math.round(errorRate * 100)
    };
  }

  /**
   * Track request error
   */
  trackError(): void {
    this.lastErrorCount++;
    this.requestCount++;
  }

  /**
   * Track successful request
   */
  trackSuccess(): void {
    this.requestCount++;
  }

  /**
   * Reset error tracking (called periodically)
   */
  resetErrorTracking(): void {
    this.lastErrorCount = 0;
    this.requestCount = 0;
  }

  /**
   * Start periodic health monitoring
   */
  startMonitoring(intervalMs: number = 30000): NodeJS.Timeout {
    console.log(`✅ [Health Monitor] Started (interval: ${intervalMs}ms)`);

    return setInterval(async () => {
      const result = await this.checkReadiness();

      if (!result.healthy) {
        console.error(`⚠️  [Health Monitor] Unhealthy:`, JSON.stringify(result.checks, null, 2));
        
        // Trigger alert or auto-recovery
        this.handleUnhealthyState(result);
      } else {
        console.log(`✅ [Health Monitor] Healthy - DB: ${result.checks.database.latency}ms, Memory: ${result.checks.memory.usage}%`);
      }

      // Reset error tracking every interval
      this.resetErrorTracking();
    }, intervalMs);
  }

  /**
   * Handle unhealthy state
   */
  private handleUnhealthyState(result: HealthCheckResult): void {
    // Log unhealthy checks
    const unhealthyChecks = Object.entries(result.checks)
      .filter(([_, check]) => check.status === 'unhealthy')
      .map(([name, _]) => name);

    console.error(`🚨 [Health Monitor] Unhealthy checks: ${unhealthyChecks.join(', ')}`);

    // Send alert (integrate with Slack, PagerDuty, etc.)
    // For now, just log
    if (result.checks.database.status === 'unhealthy') {
      console.error('🚨 [ALERT] Database connectivity issue detected');
    }

    if (result.checks.memory.status === 'unhealthy') {
      console.error(`🚨 [ALERT] Memory usage critical: ${result.checks.memory.usage}%`);
      // Trigger garbage collection
      if (global.gc) {
        global.gc();
        console.log('♻️  Triggered garbage collection');
      }
    }
  }

  /**
   * Get health status for HTTP endpoint
   */
  async getHealthStatus(): Promise<{
    status: 'healthy' | 'unhealthy';
    uptime: number;
    memory: {
      heapUsed: number;
      heapTotal: number;
      rss: number;
    };
    timestamp: Date;
  }> {
    const result = await this.checkReadiness();

    return {
      status: result.healthy ? 'healthy' : 'unhealthy',
      uptime: process.uptime(),
      memory: {
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
      },
      timestamp: new Date()
    };
  }
}

// Singleton instance
export const healthMonitor = new HealthMonitor();
