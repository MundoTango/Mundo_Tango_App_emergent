/**
 * TRACK 3: Component History Tracker
 * Auto-tracks all component changes for self-assessment
 * Integrates with existing ComponentAgent class
 */

import { db } from '../../db';
import { componentHistory, type InsertComponentHistory, type ComponentHistory } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';

export class HistoryTracker {
  /**
   * Track a component change
   */
  async trackChange(params: {
    componentPath: string;
    agentId: string;
    changeType: 'created' | 'modified' | 'deleted' | 'visual_edit' | 'auto_fix';
    changeDescription: string;
    changedBy: string; // user_id or agent_id
    beforeSnapshot?: any;
    afterSnapshot?: any;
  }): Promise<ComponentHistory> {
    const [entry] = await db.insert(componentHistory).values({
      componentPath: params.componentPath,
      agentId: params.agentId,
      changeType: params.changeType,
      changeDescription: params.changeDescription,
      changedBy: params.changedBy,
      beforeSnapshot: params.beforeSnapshot || null,
      afterSnapshot: params.afterSnapshot || null,
    }).returning();

    return entry;
  }

  /**
   * Get component history
   */
  async getHistory(componentPath: string, limit: number = 50): Promise<ComponentHistory[]> {
    return await db
      .select()
      .from(componentHistory)
      .where(eq(componentHistory.componentPath, componentPath))
      .orderBy(desc(componentHistory.timestamp))
      .limit(limit);
  }

  /**
   * Get component development timeline
   */
  async getTimeline(componentPath: string): Promise<{
    created: Date | null;
    totalChanges: number;
    lastModified: Date | null;
    changesByType: Record<string, number>;
    changesByAgent: Record<string, number>;
    recentChanges: ComponentHistory[];
  }> {
    const history = await this.getHistory(componentPath, 100);

    if (history.length === 0) {
      return {
        created: null,
        totalChanges: 0,
        lastModified: null,
        changesByType: {},
        changesByAgent: {},
        recentChanges: [],
      };
    }

    // Calculate stats
    const changesByType: Record<string, number> = {};
    const changesByAgent: Record<string, number> = {};

    history.forEach((entry) => {
      // Count by type
      changesByType[entry.changeType] = (changesByType[entry.changeType] || 0) + 1;
      
      // Count by agent
      changesByAgent[entry.agentId] = (changesByAgent[entry.agentId] || 0) + 1;
    });

    return {
      created: history[history.length - 1].timestamp || null,
      totalChanges: history.length,
      lastModified: history[0].timestamp || null,
      changesByType,
      changesByAgent,
      recentChanges: history.slice(0, 10),
    };
  }

  /**
   * Analyze component maturity based on history
   */
  async analyzeMaturity(componentPath: string): Promise<{
    maturityScore: number; // 0-100
    stabilityScore: number; // 0-100
    qualityTrend: 'improving' | 'stable' | 'declining';
    insights: string[];
  }> {
    const timeline = await this.getTimeline(componentPath);

    if (timeline.totalChanges === 0) {
      return {
        maturityScore: 0,
        stabilityScore: 0,
        qualityTrend: 'stable',
        insights: ['Component has no history - newly created'],
      };
    }

    const insights: string[] = [];

    // Calculate maturity (more changes = more mature, but diminishing returns)
    const maturityScore = Math.min(100, Math.floor(Math.log(timeline.totalChanges + 1) * 30));

    // Calculate stability (fewer recent changes = more stable)
    const recentChanges = timeline.recentChanges.filter((c) => {
      const daysSince = (Date.now() - (c.timestamp?.getTime() || 0)) / (1000 * 60 * 60 * 24);
      return daysSince <= 7;
    }).length;

    const stabilityScore = Math.max(0, 100 - (recentChanges * 15));

    // Analyze quality trend
    const autoFixes = timeline.changesByType['auto_fix'] || 0;
    const visualEdits = timeline.changesByType['visual_edit'] || 0;
    const totalRecent = timeline.recentChanges.length;

    let qualityTrend: 'improving' | 'stable' | 'declining';
    if (autoFixes > totalRecent * 0.5) {
      qualityTrend = 'declining';
      insights.push(`High auto-fix rate (${autoFixes}/${totalRecent}) - quality issues detected`);
    } else if (autoFixes === 0 && visualEdits > 0) {
      qualityTrend = 'stable';
      insights.push('User is actively refining design - normal iteration');
    } else if (autoFixes < totalRecent * 0.2) {
      qualityTrend = 'improving';
      insights.push('Low auto-fix rate - component is stable');
    } else {
      qualityTrend = 'stable';
    }

    // Add maturity insights
    if (maturityScore > 80) {
      insights.push('Highly mature component with extensive history');
    } else if (maturityScore > 50) {
      insights.push('Moderately mature component');
    } else {
      insights.push('Young component still evolving');
    }

    // Add stability insights
    if (stabilityScore > 80) {
      insights.push('Very stable - few recent changes');
    } else if (stabilityScore > 50) {
      insights.push('Moderately stable');
    } else {
      insights.push('Unstable - frequent recent changes');
    }

    return {
      maturityScore,
      stabilityScore,
      qualityTrend,
      insights,
    };
  }

  /**
   * Take snapshot of component code
   */
  async takeSnapshot(componentPath: string): Promise<any> {
    try {
      const fullPath = path.join(process.cwd(), componentPath);
      const code = fs.readFileSync(fullPath, 'utf-8');

      return {
        code,
        lines: code.split('\n').length,
        size: code.length,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Snapshot error:', error);
      return null;
    }
  }

  /**
   * Compare two snapshots
   */
  comparSnapshots(before: any, after: any): {
    linesAdded: number;
    linesRemoved: number;
    linesModified: number;
    sizeChange: number;
  } {
    if (!before || !after) {
      return {
        linesAdded: 0,
        linesRemoved: 0,
        linesModified: 0,
        sizeChange: 0,
      };
    }

    const beforeLines = before.code.split('\n');
    const afterLines = after.code.split('\n');

    // Simple diff (in production, use a proper diff library)
    const linesAdded = Math.max(0, afterLines.length - beforeLines.length);
    const linesRemoved = Math.max(0, beforeLines.length - afterLines.length);
    const linesModified = Math.min(beforeLines.length, afterLines.length);

    return {
      linesAdded,
      linesRemoved,
      linesModified,
      sizeChange: after.size - before.size,
    };
  }
}

export const historyTracker = new HistoryTracker();
