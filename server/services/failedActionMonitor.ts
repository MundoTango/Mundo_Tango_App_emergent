/**
 * Failed Action Monitor - REAL IMPLEMENTATION
 * Database persistence, real pattern analysis, and alert system
 * MB.MD Phase 3 REAL - Oct 21, 2025
 */

import { db } from '../db';
import { failedActions, failurePatterns, type InsertFailedAction, type FailurePattern } from '../../shared/multiAgentSchemas';
import { eq, desc, and, gte, sql, count } from 'drizzle-orm';

interface FailureAlert {
  severity: 'low' | 'medium' | 'high' | 'critical';
  action: string;
  frequency: number;
  message: string;
  recommendedActions: string[];
}

export class FailedActionMonitor {
  /**
   * Record a failure with REAL persistence and pattern analysis
   */
  async recordFailure(userId: number, action: string, error: any, context: any): Promise<void> {
    const severity = this.calculateSeverity(error, context);
    
    // Store in database
    const failureRecord: InsertFailedAction = {
      userId,
      action,
      errorType: error.type || error.name || 'UnknownError',
      errorMessage: error.message || String(error),
      context,
      stackTrace: error.stack,
      severity,
    };

    const [inserted] = await db.insert(failedActions)
      .values(failureRecord)
      .returning();

    console.log(`[Monitor] Recorded failure ${inserted.id}: ${action} (severity: ${severity})`);

    // Update pattern analysis
    await this.updatePattern(action, error.type || 'UnknownError', userId);

    // Send alert if critical
    if (severity === 'critical') {
      await this.sendAlert({
        severity,
        action,
        frequency: 1,
        message: `CRITICAL FAILURE: ${action} failed for user ${userId}`,
        recommendedActions: ['Investigate immediately', 'Check error logs', 'Notify on-call engineer'],
      });
    }
  }

  /**
   * Calculate severity based on error type and context
   */
  private calculateSeverity(error: any, context: any): 'low' | 'medium' | 'high' | 'critical' {
    const errorType = (error.type || error.name || '').toLowerCase();
    
    // Critical errors
    if (errorType.includes('database') || errorType.includes('crash') || errorType.includes('fatal')) {
      return 'critical';
    }
    
    // High severity
    if (errorType.includes('payment') || errorType.includes('auth') || errorType.includes('security')) {
      return 'high';
    }
    
    // Medium severity
    if (errorType.includes('validation') || errorType.includes('network') || errorType.includes('timeout')) {
      return 'medium';
    }
    
    // Low severity (UI, formatting, non-critical)
    return 'low';
  }

  /**
   * Update failure pattern with REAL statistical analysis
   */
  private async updatePattern(action: string, errorType: string, userId: number): Promise<void> {
    // Get existing pattern
    const existing = await db.select()
      .from(failurePatterns)
      .where(eq(failurePatterns.action, action))
      .limit(1);

    if (existing.length > 0) {
      const pattern = existing[0];
      const commonErrors = Array.isArray(pattern.commonErrors) ? pattern.commonErrors : [];
      
      // Add error type if not already in list
      if (!commonErrors.includes(errorType)) {
        commonErrors.push(errorType);
      }

      // Calculate average resolution time (if we have resolved failures)
      const resolvedFailures = await db.select()
        .from(failedActions)
        .where(and(
          eq(failedActions.action, action),
          eq(failedActions.resolved, true)
        ));

      let avgResolutionTime = pattern.avgResolutionTime;
      if (resolvedFailures.length > 0) {
        const totalMinutes = resolvedFailures.reduce((sum, f) => {
          if (f.resolvedAt && f.createdAt) {
            const diff = f.resolvedAt.getTime() - f.createdAt.getTime();
            return sum + (diff / 60000); // Convert to minutes
          }
          return sum;
        }, 0);
        avgResolutionTime = Math.round(totalMinutes / resolvedFailures.length);
      }

      // Generate recommendations based on frequency
      const recommendations = this.generateRecommendations(pattern.frequency + 1, commonErrors);

      // Update pattern
      await db.update(failurePatterns)
        .set({
          frequency: pattern.frequency + 1,
          commonErrors,
          affectedUsers: pattern.affectedUsers + 1,
          avgResolutionTime,
          recommendations,
          lastOccurrence: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(failurePatterns.id, pattern.id));
    } else {
      // Create new pattern
      await db.insert(failurePatterns).values({
        action,
        frequency: 1,
        commonErrors: [errorType],
        affectedUsers: 1,
        recommendations: this.generateRecommendations(1, [errorType]),
        lastOccurrence: new Date(),
      });
    }
  }

  /**
   * Generate actionable recommendations based on REAL pattern analysis
   */
  private generateRecommendations(frequency: number, errorTypes: string[]): string[] {
    const recommendations: string[] = [];

    // High frequency recommendations
    if (frequency > 10) {
      recommendations.push('⚠️ HIGH FREQUENCY: This action fails often - prioritize a permanent fix');
      recommendations.push('Consider adding input validation or improving error handling');
    } else if (frequency > 5) {
      recommendations.push('MODERATE FREQUENCY: Monitor this action closely');
    }

    // Error type specific recommendations
    if (errorTypes.includes('ValidationError')) {
      recommendations.push('Add client-side validation to catch errors before submission');
      recommendations.push('Improve error messages to guide users');
    }

    if (errorTypes.includes('NetworkError') || errorTypes.includes('TimeoutError')) {
      recommendations.push('Implement retry logic with exponential backoff');
      recommendations.push('Add offline detection and user notification');
    }

    if (errorTypes.includes('AuthenticationError')) {
      recommendations.push('Check token expiration handling');
      recommendations.push('Improve session management');
    }

    // Default recommendation
    if (recommendations.length === 0) {
      recommendations.push('Monitor for additional occurrences');
      recommendations.push('Consider adding more detailed logging');
    }

    return recommendations;
  }

  /**
   * Get failure report with REAL data from database
   */
  async getFailureReport(userId?: number): Promise<any> {
    let query = db.select().from(failedActions);
    
    if (userId) {
      query = query.where(eq(failedActions.userId, userId));
    }

    const failures = await query.orderBy(desc(failedActions.createdAt)).limit(100);

    const unresolved = failures.filter(f => !f.resolved);
    
    // Get top failed actions
    const topActions = await this.getTopFailedActions();

    return {
      totalFailures: failures.length,
      unresolvedFailures: unresolved.length,
      topFailedActions: topActions,
      recentFailures: failures.slice(0, 10).map(f => ({
        id: f.id,
        action: f.action,
        errorType: f.errorType,
        severity: f.severity,
        createdAt: f.createdAt,
        resolved: f.resolved,
      })),
      severityBreakdown: {
        critical: failures.filter(f => f.severity === 'critical').length,
        high: failures.filter(f => f.severity === 'high').length,
        medium: failures.filter(f => f.severity === 'medium').length,
        low: failures.filter(f => f.severity === 'low').length,
      },
    };
  }

  /**
   * Get failure patterns with REAL statistical analysis
   */
  async getFailurePatterns(): Promise<FailurePattern[]> {
    return await db.select()
      .from(failurePatterns)
      .orderBy(desc(failurePatterns.frequency))
      .limit(20);
  }

  /**
   * Get top failed actions from database
   */
  private async getTopFailedActions(): Promise<Array<{ action: string; count: number }>> {
    const result = await db.select({
      action: failedActions.action,
      count: count(failedActions.id),
    })
    .from(failedActions)
    .groupBy(failedActions.action)
    .orderBy(desc(count(failedActions.id)))
    .limit(5);

    return result.map(r => ({ action: r.action, count: Number(r.count) }));
  }

  /**
   * Resolve a failure
   */
  async resolveFailure(failureId: string, resolution: string): Promise<void> {
    await db.update(failedActions)
      .set({
        resolved: true,
        resolution,
        resolvedAt: new Date(),
      })
      .where(eq(failedActions.id, parseInt(failureId)));

    console.log(`[Monitor] Resolved failure ${failureId}: ${resolution}`);
  }

  /**
   * Send alert (integrate with notification system)
   */
  async sendAlert(alert: FailureAlert): Promise<void> {
    // In production, this would integrate with:
    // - Slack/Discord webhooks
    // - PagerDuty
    // - Email notifications
    // - SMS alerts
    
    console.error(`[ALERT] ${alert.severity.toUpperCase()}: ${alert.message}`);
    console.error(`[ALERT] Recommendations:`, alert.recommendedActions);

    // TODO: Integrate with RealTimeNotificationService
    // await RealTimeNotificationService.sendSystemAlert(alert);
  }

  /**
   * Get recommendations for a specific action
   */
  async getRecommendations(action: string): Promise<string[]> {
    const patterns = await db.select()
      .from(failurePatterns)
      .where(eq(failurePatterns.action, action))
      .limit(1);

    if (patterns.length > 0) {
      return Array.isArray(patterns[0].recommendations) ? patterns[0].recommendations : [];
    }

    return [
      'No specific recommendations yet - this is a new failure pattern',
      'Continue monitoring for additional occurrences',
      'Review error logs and stack traces',
    ];
  }

  /**
   * Get analytics dashboard data
   */
  async getAnalytics(days: number = 7): Promise<any> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const failures = await db.select()
      .from(failedActions)
      .where(gte(failedActions.createdAt, since));

    // Calculate daily failure rate
    const dailyRates = new Map<string, number>();
    for (const failure of failures) {
      const date = failure.createdAt.toISOString().split('T')[0];
      dailyRates.set(date, (dailyRates.get(date) || 0) + 1);
    }

    // Calculate resolution rate
    const resolved = failures.filter(f => f.resolved).length;
    const resolutionRate = failures.length > 0 
      ? Math.round((resolved / failures.length) * 100)
      : 0;

    return {
      totalFailures: failures.length,
      resolvedFailures: resolved,
      resolutionRate,
      avgFailuresPerDay: Math.round(failures.length / days),
      dailyBreakdown: Array.from(dailyRates.entries()).map(([date, count]) => ({ date, count })),
      topErrorTypes: this.getTopErrorTypes(failures),
    };
  }

  /**
   * Get top error types
   */
  private getTopErrorTypes(failures: any[]): Array<{ type: string; count: number }> {
    const typeCounts = new Map<string, number>();
    for (const failure of failures) {
      typeCounts.set(failure.errorType, (typeCounts.get(failure.errorType) || 0) + 1);
    }

    return Array.from(typeCounts.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }
}

export const failedActionMonitor = new FailedActionMonitor();
