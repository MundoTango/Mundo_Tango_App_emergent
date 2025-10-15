/**
 * Phase 9 - Track B2: Anomaly Detection System
 * Detects performance regressions and system anomalies
 */

import { db } from '../../db';
import { agentAutoFixes } from '../../../shared/schema';
import { gte, sql } from 'drizzle-orm';

export interface AnomalyAlert {
  type: 'performance' | 'success_rate' | 'error_spike' | 'latency';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metric: string;
  currentValue: number;
  expectedValue: number;
  deviation: number;  // Percentage deviation
  timestamp: Date;
}

export class AnomalyDetector {
  private baselines: Map<string, number>;
  private alerts: AnomalyAlert[];

  constructor() {
    this.baselines = new Map();
    this.alerts = [];
  }

  /**
   * Detect anomalies in agent auto-fix success rate
   */
  async detectSuccessRateAnomaly(): Promise<AnomalyAlert[]> {
    const alerts: AnomalyAlert[] = [];

    try {
      // Get recent fixes (last hour)
      const recentFixes = await db
        .select()
        .from(agentAutoFixes)
        .where(gte(agentAutoFixes.fixedAt, new Date(Date.now() - 60 * 60 * 1000)));

      if (recentFixes.length === 0) {
        return alerts;
      }

      const successCount = recentFixes.filter(f => f.success).length;
      const currentSuccessRate = successCount / recentFixes.length;

      // Expected baseline: 85%
      const expectedRate = 0.85;
      const deviation = ((currentSuccessRate - expectedRate) / expectedRate) * 100;

      // Alert if success rate drops below 75%
      if (currentSuccessRate < 0.75) {
        alerts.push({
          type: 'success_rate',
          severity: currentSuccessRate < 0.60 ? 'critical' : 'high',
          message: `Auto-fix success rate dropped to ${(currentSuccessRate * 100).toFixed(1)}% (expected: 85%)`,
          metric: 'agent_fixes_success_rate',
          currentValue: currentSuccessRate,
          expectedValue: expectedRate,
          deviation,
          timestamp: new Date()
        });
      }

      return alerts;
    } catch (error) {
      console.error('Error detecting success rate anomaly:', error);
      return alerts;
    }
  }

  /**
   * Detect performance regression using Z-score
   */
  async detectPerformanceRegression(): Promise<AnomalyAlert[]> {
    const alerts: AnomalyAlert[] = [];

    try {
      // Get execution times from last 100 fixes
      const fixes = await db
        .select({ executionTime: agentAutoFixes.executionTime })
        .from(agentAutoFixes)
        .where(sql`${agentAutoFixes.executionTime} IS NOT NULL`)
        .orderBy(sql`${agentAutoFixes.fixedAt} DESC`)
        .limit(100);

      if (fixes.length < 10) {
        return alerts; // Not enough data
      }

      const times = fixes.map(f => f.executionTime || 0);
      const mean = times.reduce((a, b) => a + b, 0) / times.length;
      const stdDev = Math.sqrt(
        times.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / times.length
      );

      // Get most recent fix
      const latest = times[0];
      const zScore = (latest - mean) / stdDev;

      // Alert if Z-score > 3 (statistically significant outlier)
      if (Math.abs(zScore) > 3) {
        const deviation = ((latest - mean) / mean) * 100;

        alerts.push({
          type: 'performance',
          severity: Math.abs(zScore) > 5 ? 'critical' : 'high',
          message: `Execution time anomaly detected: ${latest}ms (mean: ${mean.toFixed(0)}ms, z-score: ${zScore.toFixed(2)})`,
          metric: 'execution_time_ms',
          currentValue: latest,
          expectedValue: mean,
          deviation,
          timestamp: new Date()
        });
      }

      return alerts;
    } catch (error) {
      console.error('Error detecting performance regression:', error);
      return alerts;
    }
  }

  /**
   * Detect latency spikes using IQR (Interquartile Range) method
   */
  detectLatencySpike(latencies: number[]): AnomalyAlert | null {
    if (latencies.length < 10) return null;

    // Sort latencies
    const sorted = [...latencies].sort((a, b) => a - b);
    
    // Calculate Q1, Q3, IQR
    const q1Index = Math.floor(sorted.length * 0.25);
    const q3Index = Math.floor(sorted.length * 0.75);
    const q1 = sorted[q1Index];
    const q3 = sorted[q3Index];
    const iqr = q3 - q1;

    // Outlier threshold: Q3 + 1.5 * IQR
    const threshold = q3 + 1.5 * iqr;
    const latestLatency = latencies[latencies.length - 1];

    if (latestLatency > threshold) {
      const deviation = ((latestLatency - threshold) / threshold) * 100;

      return {
        type: 'latency',
        severity: latestLatency > threshold * 2 ? 'critical' : 'high',
        message: `Latency spike detected: ${latestLatency.toFixed(0)}ms (threshold: ${threshold.toFixed(0)}ms)`,
        metric: 'api_latency_ms',
        currentValue: latestLatency,
        expectedValue: threshold,
        deviation,
        timestamp: new Date()
      };
    }

    return null;
  }

  /**
   * Run all anomaly detections
   */
  async detectAll(): Promise<AnomalyAlert[]> {
    const allAlerts: AnomalyAlert[] = [];

    // Run detections in parallel
    const [successRateAlerts, performanceAlerts] = await Promise.all([
      this.detectSuccessRateAnomaly(),
      this.detectPerformanceRegression()
    ]);

    allAlerts.push(...successRateAlerts, ...performanceAlerts);

    // Store alerts
    this.alerts.push(...allAlerts);

    return allAlerts;
  }

  /**
   * Get recent alerts
   */
  getRecentAlerts(limit: number = 10): AnomalyAlert[] {
    return this.alerts
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Clear old alerts
   */
  clearOldAlerts(hoursOld: number = 24): void {
    const cutoff = new Date(Date.now() - hoursOld * 60 * 60 * 1000);
    this.alerts = this.alerts.filter(a => a.timestamp > cutoff);
  }

  /**
   * Calculate baseline metrics from historical data
   */
  async calculateBaselines(): Promise<void> {
    try {
      // Get historical success rate (last 7 days)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const historicalFixes = await db
        .select()
        .from(agentAutoFixes)
        .where(gte(agentAutoFixes.fixedAt, weekAgo));

      if (historicalFixes.length > 0) {
        const successCount = historicalFixes.filter(f => f.success).length;
        const successRate = successCount / historicalFixes.length;
        this.baselines.set('success_rate', successRate);

        const avgExecutionTime = historicalFixes
          .filter(f => f.executionTime)
          .reduce((sum, f) => sum + (f.executionTime || 0), 0) / historicalFixes.length;
        this.baselines.set('execution_time', avgExecutionTime);

        console.log(`✅ [Anomaly Detector] Baselines calculated - Success Rate: ${(successRate * 100).toFixed(1)}%, Avg Execution: ${avgExecutionTime.toFixed(0)}ms`);
      }
    } catch (error) {
      console.error('Error calculating baselines:', error);
    }
  }

  /**
   * Get baseline metrics
   */
  getBaselines(): Map<string, number> {
    return this.baselines;
  }
}

// Singleton instance
export const anomalyDetector = new AnomalyDetector();
