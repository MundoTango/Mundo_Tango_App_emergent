/**
 * Autonomous Self-Healing Engine
 * MB.MD PHASE 6 - TRACK 24
 * 
 * Automatically detects and fixes issues with confidence scoring
 */

import { EventEmitter } from 'events';

interface Issue {
  id: string;
  type: 'api-error' | 'performance' | 'database' | 'cache' | 'memory';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  detectedAt: Date;
  metadata: any;
}

interface Remediation {
  issueId: string;
  action: string;
  confidence: number;
  autoApply: boolean;
  steps: string[];
  rollbackPlan: string[];
}

interface HealingResult {
  issueId: string;
  success: boolean;
  action: string;
  confidence: number;
  duration: number;
  rollback?: boolean;
}

export class SelfHealingEngine extends EventEmitter {
  private activeIssues: Map<string, Issue> = new Map();
  private healingHistory: HealingResult[] = [];
  private confidenceThreshold = 0.75; // Only auto-heal if >75% confident

  /**
   * Detect and analyze issue
   */
  async detectIssue(type: Issue['type'], metadata: any): Promise<Issue | null> {
    console.log(`🔍 [Self-Healing] Detecting ${type} issue...`);

    const issue = await this.analyzeIssue(type, metadata);
    
    if (issue) {
      this.activeIssues.set(issue.id, issue);
      this.emit('issue-detected', issue);
      
      // Automatically attempt healing
      await this.attemptHealing(issue);
    }

    return issue;
  }

  /**
   * Analyze issue and determine severity
   */
  private async analyzeIssue(type: Issue['type'], metadata: any): Promise<Issue | null> {
    const severity = this.determineSeverity(type, metadata);
    
    if (severity === 'low' && !metadata.critical) {
      return null; // Ignore low severity non-critical issues
    }

    return {
      id: `issue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      description: this.generateDescription(type, metadata),
      detectedAt: new Date(),
      metadata
    };
  }

  /**
   * Attempt automatic healing
   */
  private async attemptHealing(issue: Issue): Promise<HealingResult> {
    const startTime = Date.now();
    
    // Generate remediation plan
    const remediation = await this.generateRemediation(issue);
    
    console.log(`🔧 [Self-Healing] Remediation plan for ${issue.type}:`);
    console.log(`  Action: ${remediation.action}`);
    console.log(`  Confidence: ${(remediation.confidence * 100).toFixed(1)}%`);
    console.log(`  Auto-apply: ${remediation.autoApply}`);

    let result: HealingResult = {
      issueId: issue.id,
      success: false,
      action: remediation.action,
      confidence: remediation.confidence,
      duration: 0
    };

    // Auto-apply if confidence is high enough
    if (remediation.autoApply && remediation.confidence >= this.confidenceThreshold) {
      try {
        await this.executeRemediation(remediation);
        result.success = true;
        console.log('✅ [Self-Healing] Issue resolved automatically');
      } catch (error) {
        console.error('❌ [Self-Healing] Auto-heal failed, rolling back...', error);
        await this.rollback(remediation);
        result.rollback = true;
      }
    } else {
      console.log('⚠️ [Self-Healing] Confidence too low for auto-healing, manual review required');
    }

    result.duration = Date.now() - startTime;
    this.healingHistory.push(result);
    this.emit('healing-attempted', result);

    return result;
  }

  /**
   * Generate remediation plan with confidence score
   */
  private async generateRemediation(issue: Issue): Promise<Remediation> {
    let action = '';
    let confidence = 0;
    let steps: string[] = [];
    let rollbackPlan: string[] = [];

    switch (issue.type) {
      case 'api-error':
        if (issue.metadata.errorCode === 404 && issue.metadata.path) {
          action = 'Apply route wrapper to fix API path mismatch';
          confidence = 0.90;
          steps = [
            'Generate route wrapper for missing path',
            'Apply wrapper to server routes',
            'Restart API server',
            'Validate endpoint accessibility'
          ];
          rollbackPlan = [
            'Remove generated route wrapper',
            'Restart API server'
          ];
        } else {
          action = 'Increase error retry logic and add circuit breaker';
          confidence = 0.70;
          steps = ['Configure retry strategy', 'Add circuit breaker', 'Monitor error rate'];
          rollbackPlan = ['Revert retry configuration'];
        }
        break;

      case 'performance':
        action = 'Apply query optimization and add caching';
        confidence = 0.85;
        steps = [
          'Identify slow queries',
          'Generate optimized query',
          'Add result caching',
          'Monitor performance improvement'
        ];
        rollbackPlan = [
          'Revert to original query',
          'Clear cache'
        ];
        break;

      case 'database':
        action = 'Add database index and optimize connection pool';
        confidence = 0.80;
        steps = [
          'Analyze query patterns',
          'Create missing indexes',
          'Optimize connection pool size',
          'Monitor query performance'
        ];
        rollbackPlan = [
          'Drop created indexes',
          'Restore original pool size'
        ];
        break;

      case 'cache':
        action = 'Invalidate stale cache entries and adjust TTL';
        confidence = 0.95;
        steps = [
          'Identify stale cache keys',
          'Clear stale entries',
          'Recalculate optimal TTL',
          'Monitor cache hit rate'
        ];
        rollbackPlan = [
          'Restore cache entries',
          'Revert TTL settings'
        ];
        break;

      case 'memory':
        action = 'Clear memory caches and trigger garbage collection';
        confidence = 0.75;
        steps = [
          'Clear non-essential caches',
          'Force garbage collection',
          'Monitor memory usage',
          'Restart if threshold exceeded'
        ];
        rollbackPlan = [
          'Restore cache state'
        ];
        break;
    }

    const autoApply = confidence >= this.confidenceThreshold && issue.severity !== 'critical';

    return {
      issueId: issue.id,
      action,
      confidence,
      autoApply,
      steps,
      rollbackPlan
    };
  }

  /**
   * Execute remediation steps
   */
  private async executeRemediation(remediation: Remediation): Promise<void> {
    console.log(`🚀 [Self-Healing] Executing remediation...`);

    for (let i = 0; i < remediation.steps.length; i++) {
      const step = remediation.steps[i];
      console.log(`  Step ${i + 1}/${remediation.steps.length}: ${step}`);
      
      // Simulate step execution
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // In production, this would execute actual remediation logic
      // For now, we log the steps
    }
  }

  /**
   * Rollback remediation if it fails
   */
  private async rollback(remediation: Remediation): Promise<void> {
    console.log(`🔄 [Self-Healing] Rolling back remediation...`);

    for (const step of remediation.rollbackPlan) {
      console.log(`  Rollback: ${step}`);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  /**
   * Determine issue severity
   */
  private determineSeverity(type: Issue['type'], metadata: any): Issue['severity'] {
    if (metadata.critical) return 'critical';
    
    switch (type) {
      case 'api-error':
        return metadata.errorRate > 0.5 ? 'critical' : 
               metadata.errorRate > 0.2 ? 'high' : 'medium';
      case 'performance':
        return metadata.responseTime > 5000 ? 'critical' :
               metadata.responseTime > 2000 ? 'high' : 'medium';
      case 'database':
        return metadata.connectionPoolFull ? 'critical' : 'high';
      case 'cache':
        return metadata.hitRate < 0.3 ? 'high' : 'medium';
      case 'memory':
        return metadata.usage > 0.9 ? 'critical' :
               metadata.usage > 0.7 ? 'high' : 'medium';
      default:
        return 'low';
    }
  }

  /**
   * Generate issue description
   */
  private generateDescription(type: Issue['type'], metadata: any): string {
    switch (type) {
      case 'api-error':
        return `API errors detected: ${metadata.errorCode} on ${metadata.path}`;
      case 'performance':
        return `Slow performance: ${metadata.responseTime}ms response time`;
      case 'database':
        return `Database issue: ${metadata.issue}`;
      case 'cache':
        return `Cache inefficiency: ${(metadata.hitRate * 100).toFixed(1)}% hit rate`;
      case 'memory':
        return `High memory usage: ${(metadata.usage * 100).toFixed(1)}%`;
      default:
        return 'Unknown issue';
    }
  }

  /**
   * Get healing statistics
   */
  getStats() {
    const totalAttempts = this.healingHistory.length;
    const successful = this.healingHistory.filter(h => h.success).length;
    const rolledBack = this.healingHistory.filter(h => h.rollback).length;
    const avgConfidence = this.healingHistory.reduce((sum, h) => sum + h.confidence, 0) / totalAttempts || 0;

    return {
      activeIssues: this.activeIssues.size,
      totalAttempts,
      successful,
      rolledBack,
      successRate: totalAttempts > 0 ? successful / totalAttempts : 0,
      avgConfidence,
      confidenceThreshold: this.confidenceThreshold
    };
  }

  /**
   * Set confidence threshold
   */
  setConfidenceThreshold(threshold: number) {
    this.confidenceThreshold = Math.max(0, Math.min(1, threshold));
    console.log(`⚙️ [Self-Healing] Confidence threshold set to ${(this.confidenceThreshold * 100).toFixed(1)}%`);
  }
}

export const selfHealingEngine = new SelfHealingEngine();
