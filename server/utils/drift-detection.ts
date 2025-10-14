/**
 * Data Drift Detection Implementation
 * MB.MD Phase 4: K-S Test and PSI for production monitoring
 * 
 * Research Source: scipy.stats, PSI algorithm (mwburke/population-stability-index)
 */

/**
 * Kolmogorov-Smirnov Two-Sample Test
 * Tests if two samples come from different distributions
 */
export function kolmogorovSmirnovTest(sample1: number[], sample2: number[]): {
  statistic: number;
  pValue: number;
  significant: boolean;
} {
  const n1 = sample1.length;
  const n2 = sample2.length;

  // Sort both samples
  const sorted1 = [...sample1].sort((a, b) => a - b);
  const sorted2 = [...sample2].sort((a, b) => a - b);

  // Combine and sort all values
  const combined = [...sorted1, ...sorted2].sort((a, b) => a - b);
  const unique = [...new Set(combined)];

  let maxDiff = 0;

  // Calculate empirical CDFs and find max difference
  for (const value of unique) {
    const cdf1 = sorted1.filter(x => x <= value).length / n1;
    const cdf2 = sorted2.filter(x => x <= value).length / n2;
    const diff = Math.abs(cdf1 - cdf2);
    maxDiff = Math.max(maxDiff, diff);
  }

  // KS statistic
  const ks_statistic = maxDiff;

  // Calculate p-value using asymptotic approximation
  const n = (n1 * n2) / (n1 + n2);
  const lambda = (Math.sqrt(n) + 0.12 + 0.11 / Math.sqrt(n)) * ks_statistic;
  
  // Approximate p-value (two-tailed test)
  let pValue = 0;
  for (let i = 1; i <= 100; i++) {
    pValue += Math.pow(-1, i - 1) * Math.exp(-2 * i * i * lambda * lambda);
  }
  pValue = 2 * pValue;
  pValue = Math.max(0, Math.min(1, pValue));

  return {
    statistic: ks_statistic,
    pValue,
    significant: pValue < 0.05  // α = 0.05 significance level
  };
}

/**
 * Population Stability Index (PSI)
 * Measures distribution shift between baseline and current data
 */
export function calculatePSI(
  expected: number[], 
  actual: number[], 
  bins: number = 10
): {
  psi: number;
  interpretation: 'no_change' | 'small_change' | 'significant_change';
  binDetails: {
    bin: number;
    expectedPct: number;
    actualPct: number;
    contribution: number;
  }[];
} {
  // Create bins based on expected (baseline) data
  const min = Math.min(...expected);
  const max = Math.max(...expected);
  const binWidth = (max - min) / bins;

  const breakpoints: number[] = [];
  for (let i = 0; i <= bins; i++) {
    breakpoints.push(min + i * binWidth);
  }
  breakpoints[breakpoints.length - 1] = max + 0.0001; // Ensure max value is included

  // Calculate percentages in each bin
  const expectedCounts = new Array(bins).fill(0);
  const actualCounts = new Array(bins).fill(0);

  for (const value of expected) {
    for (let i = 0; i < bins; i++) {
      if (value >= breakpoints[i] && value < breakpoints[i + 1]) {
        expectedCounts[i]++;
        break;
      }
    }
  }

  for (const value of actual) {
    for (let i = 0; i < bins; i++) {
      if (value >= breakpoints[i] && value < breakpoints[i + 1]) {
        actualCounts[i]++;
        break;
      }
    }
  }

  // Convert to percentages
  const expectedPcts = expectedCounts.map(c => c / expected.length);
  const actualPcts = actualCounts.map(c => c / actual.length);

  // Calculate PSI
  let psi = 0;
  const binDetails = [];

  for (let i = 0; i < bins; i++) {
    let expPct = expectedPcts[i];
    let actPct = actualPcts[i];

    // Avoid log(0) errors
    if (expPct === 0) expPct = 0.0001;
    if (actPct === 0) actPct = 0.0001;

    const contribution = (actPct - expPct) * Math.log(actPct / expPct);
    psi += contribution;

    binDetails.push({
      bin: i + 1,
      expectedPct: expPct,
      actualPct: actPct,
      contribution
    });
  }

  // Interpret PSI value
  let interpretation: 'no_change' | 'small_change' | 'significant_change';
  if (psi < 0.1) {
    interpretation = 'no_change';
  } else if (psi < 0.2) {
    interpretation = 'small_change';
  } else {
    interpretation = 'significant_change';
  }

  return {
    psi,
    interpretation,
    binDetails
  };
}

/**
 * Combined drift monitoring function
 */
export function monitorDrift(
  baseline: number[],
  current: number[],
  featureName: string
): {
  featureName: string;
  ks: {
    statistic: number;
    pValue: number;
    significant: boolean;
  };
  psi: {
    value: number;
    interpretation: string;
  };
  alert: boolean;
  alertLevel: 'none' | 'warning' | 'critical';
  recommendation: string;
} {
  const ksResult = kolmogorovSmirnovTest(baseline, current);
  const psiResult = calculatePSI(baseline, current);

  // Determine alert level
  let alert = false;
  let alertLevel: 'none' | 'warning' | 'critical' = 'none';
  let recommendation = 'No significant drift detected. Continue monitoring.';

  if (ksResult.significant || psiResult.psi >= 0.2) {
    alert = true;
    alertLevel = 'critical';
    recommendation = 'CRITICAL: Significant drift detected. Investigate immediately and consider model retraining.';
  } else if (psiResult.psi >= 0.1) {
    alert = true;
    alertLevel = 'warning';
    recommendation = 'WARNING: Minor drift detected. Monitor closely and investigate if trend continues.';
  }

  return {
    featureName,
    ks: {
      statistic: ksResult.statistic,
      pValue: ksResult.pValue,
      significant: ksResult.significant
    },
    psi: {
      value: psiResult.psi,
      interpretation: psiResult.interpretation
    },
    alert,
    alertLevel,
    recommendation
  };
}

/**
 * Track baseline feature distributions for comparison
 */
export class BaselineTracker {
  private baselines: Map<string, number[]> = new Map();

  setBaseline(featureName: string, data: number[]): void {
    this.baselines.set(featureName, [...data]);
  }

  getBaseline(featureName: string): number[] | null {
    return this.baselines.get(featureName) || null;
  }

  checkDrift(featureName: string, currentData: number[]): ReturnType<typeof monitorDrift> | null {
    const baseline = this.getBaseline(featureName);
    if (!baseline) {
      return null;
    }

    return monitorDrift(baseline, currentData, featureName);
  }

  hasBaseline(featureName: string): boolean {
    return this.baselines.has(featureName);
  }
}

// Singleton instance
let baselineTrackerInstance: BaselineTracker | null = null;

export function getBaselineTracker(): BaselineTracker {
  if (!baselineTrackerInstance) {
    baselineTrackerInstance = new BaselineTracker();
  }
  return baselineTrackerInstance;
}
