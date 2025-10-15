/**
 * Phase 9 - Track A3: A/B Testing Framework
 * Compare ML ensemble vs heuristic confidence scoring
 */

import crypto from 'crypto';
import { db } from '../../db';
import { agentAutoFixes } from '../../../shared/schema';
import { eq } from 'drizzle-orm';

export interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  weight: number;  // 0-1, e.g., 0.5 = 50% traffic
}

export interface ABTestResult {
  variant: string;
  successRate: number;
  averageConfidence: number;
  averageLatency: number;
  sampleCount: number;
}

export interface ABTest {
  id: string;
  name: string;
  variants: ABTestVariant[];
  startDate: Date;
  endDate?: Date;
  status: 'running' | 'paused' | 'completed';
}

export class ABTestingFramework {
  private tests: Map<string, ABTest>;
  private assignments: Map<string, string>; // userId -> variant
  private results: Map<string, Map<string, any[]>>; // testId -> variant -> results

  constructor() {
    this.tests = new Map();
    this.assignments = new Map();
    this.results = new Map();

    // Initialize ML vs Heuristic test
    this.initializeMLTest();
  }

  /**
   * Initialize the ML vs Heuristic A/B test
   */
  private initializeMLTest(): void {
    const mlTest: ABTest = {
      id: 'ml-vs-heuristic',
      name: 'ML Ensemble vs Heuristic Confidence Scoring',
      variants: [
        {
          id: 'ml-ensemble',
          name: 'ML Ensemble',
          description: 'Random Forest + XGBoost + Baseline ensemble',
          weight: 0.5
        },
        {
          id: 'heuristic',
          name: 'Heuristic Baseline',
          description: 'Simple rule-based confidence scoring',
          weight: 0.5
        }
      ],
      startDate: new Date(),
      status: 'running'
    };

    this.tests.set(mlTest.id, mlTest);
    this.results.set(mlTest.id, new Map([
      ['ml-ensemble', []],
      ['heuristic', []]
    ]));

    console.log('✅ [A/B Testing] ML vs Heuristic test initialized (50/50 split)');
  }

  /**
   * Assign a user to a variant
   */
  assignVariant(testId: string, userId: string): string {
    const cacheKey = `${testId}:${userId}`;
    
    // Check if already assigned
    if (this.assignments.has(cacheKey)) {
      return this.assignments.get(cacheKey)!;
    }

    const test = this.tests.get(testId);
    if (!test) {
      throw new Error(`Test ${testId} not found`);
    }

    // Deterministic assignment based on user ID hash
    const variant = this.hashBasedAssignment(userId, test.variants);
    this.assignments.set(cacheKey, variant.id);

    return variant.id;
  }

  /**
   * Hash-based variant assignment (consistent per user)
   */
  private hashBasedAssignment(
    userId: string,
    variants: ABTestVariant[]
  ): ABTestVariant {
    // Create hash from user ID
    const hash = crypto
      .createHash('sha256')
      .update(userId)
      .digest('hex');

    // Convert first 8 chars to number (0-1)
    const hashValue = parseInt(hash.slice(0, 8), 16) / 0xffffffff;

    // Assign based on weight distribution
    let cumulativeWeight = 0;
    for (const variant of variants) {
      cumulativeWeight += variant.weight;
      if (hashValue <= cumulativeWeight) {
        return variant;
      }
    }

    // Fallback to first variant
    return variants[0];
  }

  /**
   * Track a result for a variant
   */
  trackResult(
    testId: string,
    variant: string,
    result: {
      success: boolean;
      confidence: number;
      latency: number;
      agentId?: string;
    }
  ): void {
    const variantResults = this.results.get(testId)?.get(variant);
    if (!variantResults) {
      console.warn(`Variant ${variant} not found for test ${testId}`);
      return;
    }

    variantResults.push({
      ...result,
      timestamp: new Date()
    });
  }

  /**
   * Get results for a test
   */
  getResults(testId: string): Map<string, ABTestResult> {
    const resultsMap = new Map<string, ABTestResult>();
    const testResults = this.results.get(testId);

    if (!testResults) {
      return resultsMap;
    }

    for (const [variant, results] of testResults.entries()) {
      if (results.length === 0) {
        resultsMap.set(variant, {
          variant,
          successRate: 0,
          averageConfidence: 0,
          averageLatency: 0,
          sampleCount: 0
        });
        continue;
      }

      const successCount = results.filter(r => r.success).length;
      const successRate = successCount / results.length;

      const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
      const avgLatency = results.reduce((sum, r) => sum + r.latency, 0) / results.length;

      resultsMap.set(variant, {
        variant,
        successRate,
        averageConfidence: avgConfidence,
        averageLatency: avgLatency,
        sampleCount: results.length
      });
    }

    return resultsMap;
  }

  /**
   * Calculate statistical significance (Chi-square test)
   */
  calculateSignificance(testId: string): {
    isSignificant: boolean;
    pValue: number;
    winner?: string;
  } {
    const results = this.getResults(testId);
    const variants = Array.from(results.values());

    if (variants.length !== 2) {
      return { isSignificant: false, pValue: 1 };
    }

    const [variantA, variantB] = variants;

    // Need at least 30 samples per variant for statistical validity
    if (variantA.sampleCount < 30 || variantB.sampleCount < 30) {
      return { isSignificant: false, pValue: 1 };
    }

    // Chi-square test for success rate difference
    const totalA = variantA.sampleCount;
    const totalB = variantB.sampleCount;
    const successA = Math.round(variantA.successRate * totalA);
    const successB = Math.round(variantB.successRate * totalB);

    const n = totalA + totalB;
    const p = (successA + successB) / n;

    const expectedA = totalA * p;
    const expectedB = totalB * p;

    const chiSquare = (
      Math.pow(successA - expectedA, 2) / expectedA +
      Math.pow(totalA - successA - (totalA - expectedA), 2) / (totalA - expectedA) +
      Math.pow(successB - expectedB, 2) / expectedB +
      Math.pow(totalB - successB - (totalB - expectedB), 2) / (totalB - expectedB)
    );

    // Approximate p-value (degrees of freedom = 1)
    // For chi-square distribution with 1 df:
    // p < 0.05 when chi-square > 3.841
    // p < 0.01 when chi-square > 6.635
    const pValue = chiSquare > 6.635 ? 0.01 : (chiSquare > 3.841 ? 0.05 : 0.1);
    const isSignificant = pValue < 0.05;

    // Determine winner
    let winner: string | undefined;
    if (isSignificant) {
      winner = variantA.successRate > variantB.successRate 
        ? variantA.variant 
        : variantB.variant;
    }

    return { isSignificant, pValue, winner };
  }

  /**
   * Get test summary
   */
  getTestSummary(testId: string): {
    test: ABTest | undefined;
    results: Map<string, ABTestResult>;
    significance: ReturnType<typeof this.calculateSignificance>;
  } {
    const test = this.tests.get(testId);
    const results = this.getResults(testId);
    const significance = this.calculateSignificance(testId);

    return { test, results, significance };
  }

  /**
   * Update variant weights
   */
  updateWeights(testId: string, weights: Record<string, number>): void {
    const test = this.tests.get(testId);
    if (!test) {
      throw new Error(`Test ${testId} not found`);
    }

    // Update weights
    for (const variant of test.variants) {
      if (weights[variant.id] !== undefined) {
        variant.weight = weights[variant.id];
      }
    }

    console.log(`✅ [A/B Testing] Updated weights for test ${testId}`);
  }

  /**
   * End a test
   */
  endTest(testId: string): void {
    const test = this.tests.get(testId);
    if (test) {
      test.status = 'completed';
      test.endDate = new Date();
      console.log(`✅ [A/B Testing] Test ${testId} completed`);
    }
  }

  /**
   * Get active tests
   */
  getActiveTests(): ABTest[] {
    return Array.from(this.tests.values()).filter(t => t.status === 'running');
  }
}

// Singleton instance
export const abTestingFramework = new ABTestingFramework();
