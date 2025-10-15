/**
 * Phase 10 - Track A1: Data Drift Detection
 * Detects distribution changes using PSI and Kolmogorov-Smirnov tests
 */

import { db } from '../../db';
import { agentLearnings } from '../../../shared/schema';
import { gte, sql } from 'drizzle-orm';

export interface DriftDetectionResult {
  hasDrift: boolean;
  psi: number;
  ksStatistic: number;
  pValue: number;
  severity: 'none' | 'moderate' | 'significant' | 'critical';
  recommendation: string;
  timestamp: Date;
}

export class DataDriftDetector {
  /**
   * Calculate Population Stability Index (PSI)
   * PSI < 0.1: No significant change
   * PSI 0.1-0.25: Moderate drift - monitor
   * PSI >= 0.25: Significant drift - retrain
   */
  calculatePSI(baseline: number[], current: number[], numBins: number = 10): number {
    if (baseline.length === 0 || current.length === 0) {
      throw new Error('Cannot calculate PSI: empty dataset');
    }

    // Create bins based on baseline quantiles
    const baselineSorted = [...baseline].sort((a, b) => a - b);
    const bins: number[] = [];
    
    for (let i = 0; i <= numBins; i++) {
      const percentile = i / numBins;
      const index = Math.floor(percentile * (baselineSorted.length - 1));
      bins.push(baselineSorted[index]);
    }

    // Remove duplicates and ensure unique bins
    const uniqueBins = Array.from(new Set(bins)).sort((a, b) => a - b);

    // Count observations in each bin
    const baselineCounts = this.binData(baseline, uniqueBins);
    const currentCounts = this.binData(current, uniqueBins);

    // Calculate PSI
    let psi = 0;
    for (let i = 0; i < baselineCounts.length; i++) {
      const baselinePercent = baselineCounts[i] / baseline.length;
      const currentPercent = currentCounts[i] / current.length;

      // Avoid log(0) by adding small epsilon
      const epsilon = 0.0001;
      const safeCurrent = currentPercent + epsilon;
      const safeBaseline = baselinePercent + epsilon;

      psi += (safeCurrent - safeBaseline) * Math.log(safeCurrent / safeBaseline);
    }

    return psi;
  }

  /**
   * Bin data into histogram buckets
   */
  private binData(data: number[], bins: number[]): number[] {
    const counts = new Array(bins.length - 1).fill(0);

    for (const value of data) {
      for (let i = 0; i < bins.length - 1; i++) {
        if (value >= bins[i] && value < bins[i + 1]) {
          counts[i]++;
          break;
        }
        // Handle last bin (inclusive upper bound)
        if (i === bins.length - 2 && value >= bins[i + 1]) {
          counts[i]++;
          break;
        }
      }
    }

    return counts;
  }

  /**
   * Kolmogorov-Smirnov Test
   * Tests if two samples come from the same distribution
   * Returns statistic and p-value
   */
  calculateKS(baseline: number[], current: number[]): { statistic: number; pValue: number } {
    if (baseline.length === 0 || current.length === 0) {
      throw new Error('Cannot calculate KS: empty dataset');
    }

    // Sort both arrays
    const baselineSorted = [...baseline].sort((a, b) => a - b);
    const currentSorted = [...current].sort((a, b) => a - b);

    // Compute ECDFs (Empirical Cumulative Distribution Functions)
    const n1 = baselineSorted.length;
    const n2 = currentSorted.length;

    // Merge and compute CDFs at each unique point
    const allValues = Array.from(new Set([...baselineSorted, ...currentSorted])).sort((a, b) => a - b);

    let maxDiff = 0;
    let baselineIndex = 0;
    let currentIndex = 0;

    for (const value of allValues) {
      // Advance baseline index
      while (baselineIndex < n1 && baselineSorted[baselineIndex] <= value) {
        baselineIndex++;
      }

      // Advance current index
      while (currentIndex < n2 && currentSorted[currentIndex] <= value) {
        currentIndex++;
      }

      const cdf1 = baselineIndex / n1;
      const cdf2 = currentIndex / n2;

      const diff = Math.abs(cdf1 - cdf2);
      maxDiff = Math.max(maxDiff, diff);
    }

    // Calculate p-value using Kolmogorov distribution approximation
    const n = (n1 * n2) / (n1 + n2);
    const lambda = (Math.sqrt(n) + 0.12 + 0.11 / Math.sqrt(n)) * maxDiff;

    // Approximate p-value (simplified)
    const pValue = this.kolmogorovPValue(lambda);

    return {
      statistic: maxDiff,
      pValue
    };
  }

  /**
   * Approximate Kolmogorov distribution p-value
   */
  private kolmogorovPValue(lambda: number): number {
    if (lambda <= 0) return 1;
    if (lambda >= 4) return 0;

    // Simplified approximation
    const x = -2 * lambda * lambda;
    let pValue = 0;

    for (let k = 1; k <= 10; k++) {
      pValue += Math.pow(-1, k - 1) * Math.exp(x * k * k);
    }

    return Math.min(1, Math.max(0, 2 * pValue));
  }

  /**
   * Detect drift in agent performance data
   */
  async detectDrift(): Promise<DriftDetectionResult> {
    try {
      // Get baseline data (7-30 days ago)
      const baselineStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const baselineEnd = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      // Get current data (last 7 days)
      const currentStart = baselineEnd;

      const baselineData = await db
        .select({ confidence: agentLearnings.confidence })
        .from(agentLearnings)
        .where(sql`${agentLearnings.learnedAt} >= ${baselineStart} AND ${agentLearnings.learnedAt} < ${baselineEnd}`)
        .limit(1000);

      const currentData = await db
        .select({ confidence: agentLearnings.confidence })
        .from(agentLearnings)
        .where(gte(agentLearnings.learnedAt, currentStart))
        .limit(1000);

      if (baselineData.length < 30 || currentData.length < 30) {
        return {
          hasDrift: false,
          psi: 0,
          ksStatistic: 0,
          pValue: 1,
          severity: 'none',
          recommendation: 'Insufficient data for drift detection (need 30+ samples per period)',
          timestamp: new Date()
        };
      }

      // Extract confidence values
      const baselineValues = baselineData.map(d => d.confidence);
      const currentValues = currentData.map(d => d.confidence);

      // Calculate drift metrics
      const psi = this.calculatePSI(baselineValues, currentValues);
      const ks = this.calculateKS(baselineValues, currentValues);

      // Determine severity and recommendation
      let severity: DriftDetectionResult['severity'] = 'none';
      let hasDrift = false;
      let recommendation = '';

      if (psi >= 0.25 || ks.pValue < 0.01) {
        severity = 'critical';
        hasDrift = true;
        recommendation = 'Critical drift detected - immediate model retraining required';
      } else if (psi >= 0.1 || ks.pValue < 0.05) {
        severity = 'moderate';
        hasDrift = true;
        recommendation = 'Moderate drift detected - schedule model retraining within 48 hours';
      } else if (psi >= 0.05) {
        severity = 'significant';
        recommendation = 'Minor drift detected - monitor closely, consider retraining if trend continues';
      } else {
        recommendation = 'No significant drift detected - model performance stable';
      }

      console.log(`🔍 [Drift Detector] PSI: ${psi.toFixed(4)}, KS: ${ks.statistic.toFixed(4)} (p=${ks.pValue.toFixed(4)}) - ${severity}`);

      return {
        hasDrift,
        psi,
        ksStatistic: ks.statistic,
        pValue: ks.pValue,
        severity,
        recommendation,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error detecting drift:', error);
      throw error;
    }
  }

  /**
   * Get drift status summary
   */
  getDriftSummary(result: DriftDetectionResult): string {
    return `Drift Detection: ${result.severity} (PSI: ${result.psi.toFixed(3)}, KS p-value: ${result.pValue.toFixed(3)}) - ${result.recommendation}`;
  }
}

// Singleton instance
export const dataDriftDetector = new DataDriftDetector();
