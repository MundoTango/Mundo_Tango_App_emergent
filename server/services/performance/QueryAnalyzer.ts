/**
 * Phase 10 - Track C1: Query Optimization Analyzer
 * Detects slow queries and suggests optimizations
 */

import { db } from '../../db';
import { sql } from 'drizzle-orm';

export interface SlowQuery {
  query: string;
  executionTime: number;
  timestamp: Date;
  suggestions: string[];
}

export interface QueryStats {
  query: string;
  calls: number;
  totalTime: number;
  meanTime: number;
  maxTime: number;
  minTime: number;
}

export class QueryAnalyzer {
  private slowQueryThreshold = 100; // milliseconds
  private slowQueries: SlowQuery[] = [];
  private queryStats: Map<string, QueryStats> = new Map();

  /**
   * Log a query execution for analysis
   */
  logQuery(query: string, executionTime: number): void {
    // Update stats
    const normalized = this.normalizeQuery(query);
    const stats = this.queryStats.get(normalized) || {
      query: normalized,
      calls: 0,
      totalTime: 0,
      meanTime: 0,
      maxTime: 0,
      minTime: Infinity
    };

    stats.calls++;
    stats.totalTime += executionTime;
    stats.meanTime = stats.totalTime / stats.calls;
    stats.maxTime = Math.max(stats.maxTime, executionTime);
    stats.minTime = Math.min(stats.minTime, executionTime);

    this.queryStats.set(normalized, stats);

    // Log slow queries
    if (executionTime > this.slowQueryThreshold) {
      const suggestions = this.analyzeQuery(query, executionTime);

      this.slowQueries.push({
        query,
        executionTime,
        timestamp: new Date(),
        suggestions
      });

      console.warn(`🐢 [Query Analyzer] Slow query detected (${executionTime}ms): ${query.substring(0, 100)}...`);
      if (suggestions.length > 0) {
        console.warn(`💡 [Query Analyzer] Suggestions:`, suggestions);
      }

      // Keep only last 100 slow queries
      if (this.slowQueries.length > 100) {
        this.slowQueries.shift();
      }
    }
  }

  /**
   * Normalize query for pattern matching
   */
  private normalizeQuery(query: string): string {
    return query
      .replace(/\s+/g, ' ')
      .replace(/\$\d+/g, '$?') // Replace params $1, $2 with $?
      .replace(/'[^']*'/g, "'?'") // Replace string literals
      .replace(/\b\d+\b/g, '?') // Replace numbers
      .trim();
  }

  /**
   * Analyze query and suggest optimizations
   */
  private analyzeQuery(query: string, executionTime: number): string[] {
    const suggestions: string[] = [];
    const lowerQuery = query.toLowerCase();

    // Sequential scan detection
    if (lowerQuery.includes('seq scan') || (!lowerQuery.includes('index') && lowerQuery.includes('where'))) {
      suggestions.push('Consider adding an index on WHERE clause columns');
    }

    // Missing JOIN index
    if (lowerQuery.includes('join') && !lowerQuery.includes('index')) {
      suggestions.push('Consider adding index on JOIN columns for better performance');
    }

    // SELECT * detection
    if (lowerQuery.includes('select *')) {
      suggestions.push('Avoid SELECT * - specify only needed columns to reduce data transfer');
    }

    // N+1 query pattern (multiple similar queries)
    const normalized = this.normalizeQuery(query);
    const stats = this.queryStats.get(normalized);
    if (stats && stats.calls > 10 && stats.meanTime > 50) {
      suggestions.push('High frequency query - consider caching or eager loading');
    }

    // Large result set
    if (!lowerQuery.includes('limit') && executionTime > 200) {
      suggestions.push('Add LIMIT clause to paginate results');
    }

    // Missing ORDER BY index
    if (lowerQuery.includes('order by') && !lowerQuery.includes('index')) {
      suggestions.push('Consider adding index on ORDER BY columns');
    }

    return suggestions;
  }

  /**
   * Get top slow queries
   */
  getSlowQueries(limit: number = 10): SlowQuery[] {
    return this.slowQueries
      .sort((a, b) => b.executionTime - a.executionTime)
      .slice(0, limit);
  }

  /**
   * Get query statistics
   */
  getQueryStats(): QueryStats[] {
    return Array.from(this.queryStats.values())
      .sort((a, b) => b.totalTime - a.totalTime);
  }

  /**
   * Get optimization recommendations
   */
  async getOptimizationRecommendations(): Promise<{
    query: string;
    problem: string;
    recommendation: string;
  }[]> {
    const recommendations: {
      query: string;
      problem: string;
      recommendation: string;
    }[] = [];

    // Check for missing indexes using pg_stat_statements
    try {
      const result = await db.execute(sql`
        SELECT 
          query,
          calls,
          mean_exec_time,
          total_exec_time
        FROM pg_stat_statements
        WHERE mean_exec_time > 100
        ORDER BY total_exec_time DESC
        LIMIT 10
      `);

      for (const row of result.rows as any[]) {
        recommendations.push({
          query: row.query,
          problem: `High execution time: ${Math.round(row.mean_exec_time)}ms average over ${row.calls} calls`,
          recommendation: 'Run EXPLAIN ANALYZE to identify bottlenecks'
        });
      }
    } catch (error) {
      // pg_stat_statements might not be enabled
      console.log('[Query Analyzer] pg_stat_statements not available');
    }

    // Analyze slow queries from our log
    for (const slowQuery of this.getSlowQueries(5)) {
      if (slowQuery.suggestions.length > 0) {
        recommendations.push({
          query: slowQuery.query.substring(0, 200),
          problem: `Slow query: ${slowQuery.executionTime}ms`,
          recommendation: slowQuery.suggestions.join('; ')
        });
      }
    }

    return recommendations;
  }

  /**
   * Check for unused indexes
   */
  async getUnusedIndexes(): Promise<{
    schema: string;
    table: string;
    index: string;
    size: string;
  }[]> {
    try {
      const result = await db.execute(sql`
        SELECT 
          schemaname as schema,
          tablename as table,
          indexname as index,
          pg_size_pretty(pg_relation_size(indexrelid)) as size
        FROM pg_stat_user_indexes
        WHERE idx_scan = 0
          AND indexrelname NOT LIKE 'pg_%'
        ORDER BY pg_relation_size(indexrelid) DESC
      `);

      return result.rows as any[];
    } catch (error) {
      console.error('[Query Analyzer] Error checking unused indexes:', error);
      return [];
    }
  }

  /**
   * Clear old statistics
   */
  clearOldStats(hoursOld: number = 24): void {
    const cutoff = new Date(Date.now() - hoursOld * 60 * 60 * 1000);
    this.slowQueries = this.slowQueries.filter(q => q.timestamp > cutoff);
    console.log(`🧹 [Query Analyzer] Cleared slow queries older than ${hoursOld} hours`);
  }

  /**
   * Get summary report
   */
  getSummary(): {
    totalSlowQueries: number;
    avgSlowQueryTime: number;
    topSlowQuery: SlowQuery | null;
    recommendations: number;
  } {
    const slowQueries = this.getSlowQueries();

    return {
      totalSlowQueries: slowQueries.length,
      avgSlowQueryTime: slowQueries.length > 0
        ? Math.round(slowQueries.reduce((sum, q) => sum + q.executionTime, 0) / slowQueries.length)
        : 0,
      topSlowQuery: slowQueries[0] || null,
      recommendations: slowQueries.reduce((sum, q) => sum + q.suggestions.length, 0)
    };
  }
}

// Singleton instance
export const queryAnalyzer = new QueryAnalyzer();
