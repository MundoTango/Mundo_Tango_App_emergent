/**
 * Phase 10 - Track C2: Database Connection Pooling
 * Optimizes database connections for better performance
 */

import { Pool, PoolConfig } from 'pg';

export interface ConnectionPoolConfig {
  max?: number; // Maximum connections (default: 20)
  min?: number; // Minimum connections (default: 2)
  idleTimeoutMillis?: number; // Idle timeout (default: 30000)
  connectionTimeoutMillis?: number; // Connection timeout (default: 5000)
  maxLifetimeSeconds?: number; // Max connection lifetime (default: 1800 = 30 min)
}

export class DatabaseConnectionPool {
  private pool: Pool | null = null;
  private stats = {
    totalConnections: 0,
    idleConnections: 0,
    activeQueries: 0,
    errors: 0
  };

  /**
   * Initialize connection pool
   */
  initialize(config: ConnectionPoolConfig = {}): Pool {
    const poolConfig: PoolConfig = {
      connectionString: process.env.DATABASE_URL,
      max: config.max || 20,
      min: config.min || 2,
      idleTimeoutMillis: config.idleTimeoutMillis || 30000,
      connectionTimeoutMillis: config.connectionTimeoutMillis || 5000,
      // PostgreSQL doesn't have maxLifetime, we'll handle cleanup manually
    };

    this.pool = new Pool(poolConfig);

    // Event handlers
    this.pool.on('connect', () => {
      this.stats.totalConnections++;
      console.log(`🔌 [Connection Pool] New connection (total: ${this.stats.totalConnections})`);
    });

    this.pool.on('remove', () => {
      this.stats.totalConnections--;
      console.log(`🔌 [Connection Pool] Connection removed (total: ${this.stats.totalConnections})`);
    });

    this.pool.on('error', (err) => {
      this.stats.errors++;
      console.error('❌ [Connection Pool] Error:', err);
    });

    console.log(`✅ [Connection Pool] Initialized (max: ${poolConfig.max}, min: ${poolConfig.min})`);

    return this.pool;
  }

  /**
   * Get pool instance
   */
  getPool(): Pool {
    if (!this.pool) {
      return this.initialize();
    }
    return this.pool;
  }

  /**
   * Get pool statistics
   */
  async getStats(): Promise<{
    totalConnections: number;
    idleConnections: number;
    waitingCount: number;
    maxConnections: number;
    errors: number;
  }> {
    if (!this.pool) {
      return {
        totalConnections: 0,
        idleConnections: 0,
        waitingCount: 0,
        maxConnections: 0,
        errors: 0
      };
    }

    return {
      totalConnections: this.pool.totalCount,
      idleConnections: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
      maxConnections: this.pool.options.max || 20,
      errors: this.stats.errors
    };
  }

  /**
   * Test connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const pool = this.getPool();
      const result = await pool.query('SELECT NOW()');
      console.log('✅ [Connection Pool] Test query successful');
      return true;
    } catch (error) {
      console.error('❌ [Connection Pool] Test query failed:', error);
      return false;
    }
  }

  /**
   * Gracefully shutdown pool
   */
  async shutdown(): Promise<void> {
    if (this.pool) {
      console.log('🛑 [Connection Pool] Shutting down...');
      await this.pool.end();
      this.pool = null;
      console.log('✅ [Connection Pool] Shutdown complete');
    }
  }

  /**
   * Monitor pool health
   */
  startMonitoring(intervalMs: number = 60000): NodeJS.Timeout {
    console.log(`✅ [Connection Pool] Started monitoring (interval: ${intervalMs}ms)`);

    return setInterval(async () => {
      const stats = await this.getStats();
      const usage = (stats.totalConnections / stats.maxConnections) * 100;

      if (usage > 80) {
        console.warn(`⚠️  [Connection Pool] High usage: ${usage.toFixed(1)}% (${stats.totalConnections}/${stats.maxConnections})`);
      } else {
        console.log(`✅ [Connection Pool] Healthy - ${stats.totalConnections}/${stats.maxConnections} connections (${stats.idleConnections} idle, ${stats.waitingCount} waiting)`);
      }
    }, intervalMs);
  }
}

// Singleton instance
export const dbConnectionPool = new DatabaseConnectionPool();
