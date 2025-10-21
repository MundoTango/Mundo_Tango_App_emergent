/**
 * Failed Action Monitor - Tracks and learns from user failures
 * MB.MD Phase 3T - Oct 21, 2025
 */

interface FailedAction {
  id: string;
  userId: number;
  action: string;
  context: any;
  errorType: string;
  timestamp: Date;
  resolved: boolean;
}

interface FailurePattern {
  action: string;
  frequency: number;
  commonErrors: string[];
  recommendations: string[];
}

export class FailedActionMonitor {
  private failures: FailedAction[] = [];
  private patterns = new Map<string, FailurePattern>();

  async recordFailure(userId: number, action: string, error: any, context: any): Promise<void> {
    const failure: FailedAction = {
      id: `failure-${Date.now()}`,
      userId,
      action,
      context,
      errorType: error.type || 'unknown',
      timestamp: new Date(),
      resolved: false,
    };

    this.failures.push(failure);
    await this.analyzePattern(action, error);

    console.log(`[Failed Action Monitor] Recorded failure for user ${userId}: ${action}`);
  }

  async analyzePattern(action: string, error: any): Promise<void> {
    const pattern = this.patterns.get(action) || {
      action,
      frequency: 0,
      commonErrors: [],
      recommendations: [],
    };

    pattern.frequency++;
    
    if (!pattern.commonErrors.includes(error.type)) {
      pattern.commonErrors.push(error.type);
    }

    // Generate recommendations based on error patterns
    if (pattern.frequency > 5) {
      pattern.recommendations.push(
        `Action "${action}" fails frequently - consider improving UX`,
        'Add inline help or better error messages',
        'Simplify the workflow'
      );
    }

    this.patterns.set(action, pattern);
  }

  async getFailureReport(userId?: number): Promise<any> {
    const userFailures = userId 
      ? this.failures.filter(f => f.userId === userId)
      : this.failures;

    return {
      totalFailures: userFailures.length,
      unresolvedFailures: userFailures.filter(f => !f.resolved).length,
      topFailedActions: this.getTopFailedActions(),
      recentFailures: userFailures.slice(-10),
    };
  }

  async getFailurePatterns(): Promise<FailurePattern[]> {
    return Array.from(this.patterns.values())
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);
  }

  private getTopFailedActions(): string[] {
    const actionCounts = new Map<string, number>();
    
    for (const failure of this.failures) {
      actionCounts.set(failure.action, (actionCounts.get(failure.action) || 0) + 1);
    }

    return Array.from(actionCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([action]) => action);
  }

  async resolveFailure(failureId: string, resolution: string): Promise<void> {
    const failure = this.failures.find(f => f.id === failureId);
    if (failure) {
      failure.resolved = true;
      console.log(`[Failed Action Monitor] Resolved failure ${failureId}: ${resolution}`);
    }
  }

  async sendAlert(failure: FailedAction): Promise<void> {
    // In production, this would send alerts to monitoring systems
    console.log(`[Failed Action Monitor] ALERT: High-priority failure detected`, {
      userId: failure.userId,
      action: failure.action,
      error: failure.errorType,
    });
  }

  async getRecommendations(action: string): Promise<string[]> {
    const pattern = this.patterns.get(action);
    return pattern?.recommendations || [
      'No specific recommendations yet',
      'Continue monitoring this action',
    ];
  }
}

export const failedActionMonitor = new FailedActionMonitor();
