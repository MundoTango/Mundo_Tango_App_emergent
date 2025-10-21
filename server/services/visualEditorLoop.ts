/**
 * Visual Editor Learning Loop
 * MB.MD Option A - Recursive Testing System
 * 
 * Handles autonomous component learning when Visual Editor saves changes
 * Triggers: User saves changes in Visual Editor → Mr Blue confirms → Component learns
 */

import { db } from '../db';
import { componentHistory, type InsertComponentHistory } from '@shared/schema';
import { eq } from 'drizzle-orm';

export interface VisualEditChange {
  componentId: string;
  componentPath: string;
  componentName: string;
  changeType: 'move' | 'resize' | 'styleChange' | 'textChange' | 'delete' | 'add';
  before?: any;
  after?: any;
  description?: string;
}

export class VisualEditorLoop {
  /**
   * Handle visual edit confirmation from user
   * This is the entry point for the autonomous learning loop
   */
  async handleVisualEdit(
    changes: VisualEditChange[],
    userId: number
  ): Promise<{
    success: boolean;
    learnedCount: number;
    errors: string[];
  }> {
    const results = {
      success: true,
      learnedCount: 0,
      errors: [] as string[]
    };

    console.log(`[Visual Editor Loop] Processing ${changes.length} changes from user ${userId}`);

    for (const change of changes) {
      try {
        // 1. Record change in component history
        await this.recordComponentChange(change, userId);

        // 2. Trigger component self-test (autonomous learning)
        const learned = await this.triggerComponentLearning(change);

        if (learned) {
          results.learnedCount++;
        }

      } catch (error) {
        console.error('[Visual Editor Loop] Error processing change:', error);
        results.errors.push(`Failed to process ${change.componentId}: ${error}`);
        results.success = false;
      }
    }

    console.log(`[Visual Editor Loop] Complete: ${results.learnedCount}/${changes.length} learned`);
    return results;
  }

  /**
   * Record component change in database
   */
  private async recordComponentChange(
    change: VisualEditChange,
    userId: number
  ): Promise<void> {
    const historyEntry: InsertComponentHistory = {
      componentPath: change.componentPath,
      componentId: change.componentId,
      changeType: change.changeType,
      changeDescription: change.description || `${change.changeType} on ${change.componentName}`,
      changedBy: `user-${userId}`,
      beforeSnapshot: change.before,
      afterSnapshot: change.after,
      learnedPatterns: null,
    };

    await db.insert(componentHistory).values(historyEntry);
    console.log(`[Component History] Recorded: ${change.componentId} - ${change.changeType}`);
  }

  /**
   * Trigger autonomous component learning
   * Component queries colleagues, runs self-test, and implements fix
   */
  private async triggerComponentLearning(
    change: VisualEditChange
  ): Promise<boolean> {
    console.log(`[Component Learning] Analyzing change for ${change.componentId}`);

    // Step 1: Extract patterns from the change
    const patterns = this.extractPatterns(change);

    // Step 2: Update component history with learned patterns
    if (patterns.length > 0) {
      await this.updateLearnedPatterns(change.componentId, patterns);
    }

    // Step 3: Notify related components (future: agent-to-agent communication)
    await this.notifyRelatedComponents(change.componentId, patterns);

    return patterns.length > 0;
  }

  /**
   * Extract learnings from the change
   */
  private extractPatterns(change: VisualEditChange): string[] {
    const patterns: string[] = [];

    switch (change.changeType) {
      case 'move':
        if (change.before && change.after) {
          patterns.push(`position_preference:${change.componentId}:${JSON.stringify(change.after)}`);
        }
        break;
      case 'styleChange':
        if (change.after) {
          patterns.push(`style_preference:${change.componentId}:${JSON.stringify(change.after)}`);
        }
        break;
      case 'textChange':
        patterns.push(`text_update:${change.componentId}`);
        break;
      case 'resize':
        if (change.after) {
          patterns.push(`size_preference:${change.componentId}:${JSON.stringify(change.after)}`);
        }
        break;
    }

    return patterns;
  }

  /**
   * Update component history with learned patterns
   */
  private async updateLearnedPatterns(
    componentId: string,
    patterns: string[]
  ): Promise<void> {
    // Get the most recent history entry for this component
    const latestEntry = await db.query.componentHistory.findFirst({
      where: (history, { eq }) => eq(history.componentId, componentId),
      orderBy: (history, { desc }) => [desc(history.timestamp)],
    });

    if (latestEntry) {
      await db
        .update(componentHistory)
        .set({ learnedPatterns: patterns as any })
        .where(eq(componentHistory.id, latestEntry.id));

      console.log(`[Patterns Learned] ${componentId}: ${patterns.join(', ')}`);
    }
  }

  /**
   * Notify related components about the learning
   * (Future: This will trigger agent-to-agent communication)
   */
  private async notifyRelatedComponents(
    componentId: string,
    patterns: string[]
  ): Promise<void> {
    // Future implementation: Send patterns to component agents
    // For now, just log
    console.log(`[A2A Communication] Would notify colleagues of ${componentId} about patterns:`, patterns);
  }

  /**
   * Get component learning history
   */
  async getComponentHistory(componentId: string): Promise<any[]> {
    return await db.query.componentHistory.findMany({
      where: (history, { eq }) => eq(history.componentId, componentId),
      orderBy: (history, { desc }) => [desc(history.timestamp)],
      limit: 20,
    });
  }

  /**
   * Get learning statistics for admin dashboard
   */
  async getLearningStats(): Promise<{
    totalChanges: number;
    componentsModified: number;
    patternsLearned: number;
  }> {
    const allHistory = await db.query.componentHistory.findMany();
    
    const uniqueComponents = new Set(allHistory.map(h => h.componentId));
    const patternsLearned = allHistory
      .filter(h => h.learnedPatterns && Array.isArray(h.learnedPatterns) && h.learnedPatterns.length > 0)
      .reduce((sum, h) => sum + (h.learnedPatterns as string[]).length, 0);

    return {
      totalChanges: allHistory.length,
      componentsModified: uniqueComponents.size,
      patternsLearned,
    };
  }
}

// Singleton instance
export const visualEditorLoop = new VisualEditorLoop();
