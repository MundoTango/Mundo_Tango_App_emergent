/**
 * MB.MD COST TRACKING UTILITY
 * Estimates Replit AI Agent costs for Visual Editor & Mr Blue
 * 
 * Methodology:
 * - Plan Mode: ~$0.50-$2 per research session
 * - Build Mode: ~$2-$15 per checkpoint (complexity-based)
 * - Token counting for accurate estimates
 */

export interface CostEstimate {
  estimated: number;
  confidence: 'low' | 'medium' | 'high';
  breakdown: {
    tokens: number;
    complexity: 'simple' | 'medium' | 'complex';
    mode: 'plan' | 'build';
  };
}

export interface CostLog {
  timestamp: Date;
  feature: string;
  estimated: number;
  actual?: number;
  variance?: number;
}

// Complexity scoring based on change types
const COMPLEXITY_WEIGHTS = {
  simple: 1.0,    // $0.10 - $0.50 base
  medium: 2.5,    // $1.00 - $3.00 base
  complex: 5.0,   // $5.00 - $15.00 base
};

// Mode multipliers
const MODE_MULTIPLIERS = {
  plan: 0.3,      // Plan mode cheaper (30% of build)
  build: 1.0,     // Build mode baseline
};

/**
 * Estimate cost for Visual Editor operation
 */
export function estimateVisualEditorCost(
  changeType: 'position' | 'size' | 'style' | 'text' | 'structure',
  filesAffected: number = 1
): CostEstimate {
  let complexity: 'simple' | 'medium' | 'complex' = 'simple';
  
  // Determine complexity
  if (changeType === 'structure' || filesAffected > 3) {
    complexity = 'complex';
  } else if (changeType === 'style' && filesAffected > 1) {
    complexity = 'medium';
  }
  
  const baseTokens = filesAffected * 500; // Estimated tokens per file
  const baseCost = 0.10; // Minimum checkpoint cost
  
  const estimated = baseCost * COMPLEXITY_WEIGHTS[complexity] * filesAffected;
  
  return {
    estimated,
    confidence: filesAffected > 5 ? 'low' : 'high',
    breakdown: {
      tokens: baseTokens,
      complexity,
      mode: 'build'
    }
  };
}

/**
 * Estimate cost for Mr Blue conversation
 */
export function estimateMrBlueCost(
  messageLength: number,
  includesESAContext: boolean = false,
  includesVectorSearch: boolean = false
): CostEstimate {
  let tokens = messageLength * 1.3; // Rough token estimate
  
  // ESA context adds ~50k tokens
  if (includesESAContext) {
    tokens += 50000;
  }
  
  // Vector search adds ~10k tokens
  if (includesVectorSearch) {
    tokens += 10000;
  }
  
  let complexity: 'simple' | 'medium' | 'complex' = 'simple';
  if (tokens > 60000) complexity = 'complex';
  else if (tokens > 20000) complexity = 'medium';
  
  const baseCost = 0.50; // Base conversation cost
  const estimated = baseCost * (tokens / 10000) * 0.3; // Plan mode cheaper
  
  return {
    estimated,
    confidence: 'medium',
    breakdown: {
      tokens: Math.round(tokens),
      complexity,
      mode: 'plan'
    }
  };
}

/**
 * Track actual vs estimated costs
 */
class CostTracker {
  private logs: CostLog[] = [];
  
  log(feature: string, estimated: number, actual?: number) {
    const entry: CostLog = {
      timestamp: new Date(),
      feature,
      estimated,
      actual,
      variance: actual ? ((actual - estimated) / estimated) * 100 : undefined
    };
    
    this.logs.push(entry);
    
    // Save to localStorage for analysis
    if (typeof window !== 'undefined') {
      localStorage.setItem('mbmd_cost_logs', JSON.stringify(this.logs));
    }
  }
  
  getLogs(): CostLog[] {
    return this.logs;
  }
  
  getTotalEstimated(): number {
    return this.logs.reduce((sum, log) => sum + log.estimated, 0);
  }
  
  getTotalActual(): number {
    return this.logs.reduce((sum, log) => sum + (log.actual || 0), 0);
  }
  
  getAccuracy(): number {
    const withActuals = this.logs.filter(log => log.actual !== undefined);
    if (withActuals.length === 0) return 0;
    
    const avgVariance = withActuals.reduce((sum, log) => 
      sum + Math.abs(log.variance || 0), 0
    ) / withActuals.length;
    
    return Math.max(0, 100 - avgVariance);
  }
}

export const costTracker = new CostTracker();

/**
 * Display cost estimate in UI
 */
export function formatCostEstimate(estimate: CostEstimate): string {
  const { estimated, confidence, breakdown } = estimate;
  
  return `~$${estimated.toFixed(2)} (${breakdown.complexity}, ${confidence} confidence)`;
}

/**
 * Load historical data from localStorage
 */
export function loadCostHistory(): CostLog[] {
  if (typeof window === 'undefined') return [];
  
  const data = localStorage.getItem('mbmd_cost_logs');
  return data ? JSON.parse(data) : [];
}
