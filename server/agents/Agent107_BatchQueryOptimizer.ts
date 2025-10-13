/**
 * ESA AGENT #107: Batch Query Optimizer
 * MB.MD TRACK 8.2 - Performance Optimization
 * 
 * Purpose: Detect N+1 query problems and suggest batch optimizations
 * Prevents: Performance degradation from inefficient database queries
 * Runs: Real-time monitoring + daily analysis
 */

import { db } from '../db';
import { agentJobs } from '../../shared/schema';
import { eq } from 'drizzle-orm';

interface QueryPattern {
  pattern: string;
  count: number;
  avgDuration: number;
  isN1Problem: boolean;
  suggestion: string;
}

interface OptimizationResult {
  timestamp: string;
  queriesAnalyzed: number;
  n1ProblemsDetected: number;
  optimizationSuggestions: QueryPattern[];
  potentialSpeedup: string;
}

export class Agent107_BatchQueryOptimizer {
  private agentId = 107;
  private agentName = 'Batch Query Optimizer';
  private queryLog: Array<{ query: string; duration: number; timestamp: Date }> = [];
  
  /**
   * Analyze query patterns for N+1 problems
   */
  async analyze(): Promise<OptimizationResult> {
    console.log(`[Agent #${this.agentId}] Analyzing query patterns...`);
    
    const jobId = await this.createJob();
    
    try {
      // Get recent query logs
      const queries = await this.getRecentQueries();
      
      // Detect N+1 patterns
      const n1Patterns = this.detectN1Patterns(queries);
      
      // Generate optimization suggestions
      const suggestions = this.generateSuggestions(n1Patterns);
      
      // Calculate potential speedup
      const speedup = this.calculateSpeedup(suggestions);
      
      const result: OptimizationResult = {
        timestamp: new Date().toISOString(),
        queriesAnalyzed: queries.length,
        n1ProblemsDetected: n1Patterns.length,
        optimizationSuggestions: suggestions,
        potentialSpeedup: speedup
      };
      
      await this.completeJob(jobId, 'completed', result);
      
      // Alert if critical issues found
      if (n1Patterns.length > 0) {
        await this.alertN1Problems(n1Patterns);
      }
      
      console.log(`[Agent #${this.agentId}] Analysis complete:`, {
        n1Problems: n1Patterns.length,
        potentialSpeedup: speedup
      });
      
      return result;
      
    } catch (error) {
      console.error(`[Agent #${this.agentId}] Analysis failed:`, error);
      await this.completeJob(jobId, 'failed', { error: (error as Error).message });
      throw error;
    }
  }
  
  /**
   * Get recent query logs from database
   */
  private async getRecentQueries(): Promise<Array<{ query: string; duration: number; timestamp: Date }>> {
    // In production, this would read from actual query logs
    // For now, return sample data from in-memory log
    return this.queryLog.slice(-1000); // Last 1000 queries
  }
  
  /**
   * Detect N+1 query patterns
   */
  private detectN1Patterns(queries: Array<{ query: string; duration: number; timestamp: Date }>): QueryPattern[] {
    const patterns: Map<string, QueryPattern> = new Map();
    
    // Group similar queries
    queries.forEach(q => {
      // Normalize query (remove specific IDs/values)
      const normalized = this.normalizeQuery(q.query);
      
      if (!patterns.has(normalized)) {
        patterns.set(normalized, {
          pattern: normalized,
          count: 0,
          avgDuration: 0,
          isN1Problem: false,
          suggestion: ''
        });
      }
      
      const pattern = patterns.get(normalized)!;
      pattern.count++;
      pattern.avgDuration = (pattern.avgDuration + q.duration) / 2;
    });
    
    // Identify N+1 problems (queries repeated >10 times in short time)
    const n1Patterns: QueryPattern[] = [];
    
    patterns.forEach(pattern => {
      if (pattern.count > 10) {
        pattern.isN1Problem = true;
        n1Patterns.push(pattern);
      }
    });
    
    return n1Patterns;
  }
  
  /**
   * Normalize query for pattern matching
   */
  private normalizeQuery(query: string): string {
    return query
      .replace(/\d+/g, ':id')           // Replace numbers with :id
      .replace(/'[^']*'/g, ':value')    // Replace string values
      .replace(/\s+/g, ' ')             // Normalize whitespace
      .trim();
  }
  
  /**
   * Generate optimization suggestions
   */
  private generateSuggestions(n1Patterns: QueryPattern[]): QueryPattern[] {
    return n1Patterns.map(pattern => {
      let suggestion = '';
      
      if (pattern.pattern.includes('SELECT') && pattern.pattern.includes('WHERE id = :id')) {
        suggestion = `Use batch query with IN clause: SELECT * FROM table WHERE id IN (:ids)`;
      } else if (pattern.pattern.includes('JOIN')) {
        suggestion = `Optimize JOIN with proper indexing or eager loading`;
      } else {
        suggestion = `Consider caching or batch loading for this repeated query`;
      }
      
      return {
        ...pattern,
        suggestion
      };
    });
  }
  
  /**
   * Calculate potential speedup from optimizations
   */
  private calculateSpeedup(suggestions: QueryPattern[]): string {
    const totalRepeats = suggestions.reduce((sum, s) => sum + s.count, 0);
    const avgDuration = suggestions.reduce((sum, s) => sum + s.avgDuration, 0) / suggestions.length;
    
    const currentTime = totalRepeats * avgDuration;
    const optimizedTime = suggestions.length * avgDuration; // 1 batch query per pattern
    
    const speedup = ((currentTime - optimizedTime) / currentTime * 100).toFixed(1);
    
    return `${speedup}% faster (${currentTime.toFixed(0)}ms → ${optimizedTime.toFixed(0)}ms)`;
  }
  
  /**
   * Alert about N+1 problems
   */
  private async alertN1Problems(patterns: QueryPattern[]): Promise<void> {
    console.warn(`[Agent #${this.agentId}] 🐌 N+1 QUERY PROBLEMS DETECTED:`, patterns.length);
    
    patterns.forEach(pattern => {
      console.warn(`  - Pattern: ${pattern.pattern}`);
      console.warn(`    Repeated: ${pattern.count} times`);
      console.warn(`    Suggestion: ${pattern.suggestion}`);
    });
    
    // TODO: Notify Agent #48 (Performance Expert) and Agent #80 (Learning Coordinator)
  }
  
  /**
   * Log query for analysis
   */
  logQuery(query: string, duration: number): void {
    this.queryLog.push({
      query,
      duration,
      timestamp: new Date()
    });
    
    // Keep only last 10000 queries in memory
    if (this.queryLog.length > 10000) {
      this.queryLog.shift();
    }
  }
  
  /**
   * Create agent job record
   */
  private async createJob(): Promise<number> {
    try {
      const [job] = await db.insert(agentJobs).values({
        agentId: this.agentId,
        agentName: this.agentName,
        jobType: 'query_optimization',
        status: 'running',
        priority: 'high',
        startedAt: new Date(),
        metadata: {
          trigger: 'scheduled',
          focus: 'n1_detection'
        }
      }).returning();
      
      return job.id;
    } catch (error) {
      console.error('[Agent #107] Failed to create job:', error);
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
      console.error('[Agent #107] Failed to update job:', error);
    }
  }
  
  /**
   * Auto-optimize detected N+1 queries
   */
  async autoOptimize(): Promise<{optimized: number, failed: number}> {
    console.log(`[Agent #${this.agentId}] AUTO-OPTIMIZE not yet implemented`);
    // TODO: Implement automated query refactoring
    return { optimized: 0, failed: 0 };
  }
}

// Export singleton instance
export const agent107 = new Agent107_BatchQueryOptimizer();
