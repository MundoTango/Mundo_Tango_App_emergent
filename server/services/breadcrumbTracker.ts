/**
 * Breadcrumb Tracking Service
 * MB.MD Option A - Recursive Testing System
 * 
 * Tracks all user interactions (clicks, hovers, navigation)
 * Feeds data to Intent Detector for predictive testing
 */

import { db } from '../db';
import { breadcrumbs } from '@shared/schema';
import { desc, eq, and, gte } from 'drizzle-orm';

export interface BreadcrumbEvent {
  userId?: number;
  sessionId: string;
  actionType: 'click' | 'hover' | 'scroll' | 'navigate' | 'form_submit';
  targetElement?: string;
  targetUrl?: string;
  currentPage: string;
  elementText?: string;
  metadata?: Record<string, any>;
}

export class BreadcrumbTracker {
  /**
   * Track a user interaction
   */
  async track(event: BreadcrumbEvent): Promise<void> {
    try {
      // Skip if no user ID (breadcrumbs table requires userId to be not null)
      if (!event.userId) {
        console.log(`[Breadcrumb] Skipping - no userId for session ${event.sessionId}`);
        return;
      }

      await db.insert(breadcrumbs).values({
        userId: event.userId,
        sessionId: event.sessionId,
        page: event.currentPage,
        action: event.actionType,
        target: event.targetElement || null,
        targetId: event.targetUrl || null,
        value: event.metadata as any,
        timestamp: new Date(),
        // Set defaults for required fields
        success: true,
      });

      console.log(`[Breadcrumb] ${event.sessionId}: ${event.actionType} on ${event.targetElement || event.currentPage}`);
    } catch (error) {
      console.error('[Breadcrumb] Failed to track event:', error);
    }
  }

  /**
   * Get recent breadcrumbs for a user (for intent detection)
   */
  async getRecentBreadcrumbs(
    sessionId: string,
    limit: number = 10
  ): Promise<any[]> {
    const since = new Date(Date.now() - 5 * 60 * 1000); // Last 5 minutes
    
    return await db.query.breadcrumbs.findMany({
      where: and(
        eq(breadcrumbs.sessionId, sessionId),
        gte(breadcrumbs.timestamp, since)
      ),
      orderBy: [desc(breadcrumbs.timestamp)],
      limit,
    });
  }

  /**
   * Get breadcrumb history for a user
   */
  async getUserHistory(
    userId: number,
    limit: number = 50
  ): Promise<any[]> {
    return await db.query.breadcrumbs.findMany({
      where: eq(breadcrumbs.userId, userId),
      orderBy: [desc(breadcrumbs.timestamp)],
      limit,
    });
  }

  /**
   * Analyze user patterns for a specific page
   */
  async getPagePatterns(page: string): Promise<{
    topActions: Array<{ action: string; count: number }>;
    topTargets: Array<{ target: string; count: number }>;
  }> {
    const pageHistory = await db.query.breadcrumbs.findMany({
      where: eq(breadcrumbs.page, page),
      limit: 1000,
    });

    // Count actions
    const actionCounts = new Map<string, number>();
    const targetCounts = new Map<string, number>();

    for (const event of pageHistory) {
      actionCounts.set(event.action, (actionCounts.get(event.action) || 0) + 1);
      if (event.target) {
        targetCounts.set(event.target, (targetCounts.get(event.target) || 0) + 1);
      }
    }

    return {
      topActions: Array.from(actionCounts.entries())
        .map(([action, count]) => ({ action, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      topTargets: Array.from(targetCounts.entries())
        .map(([target, count]) => ({ target, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
    };
  }

  /**
   * Detect navigation sequences (for predictive navigation)
   */
  async detectSequences(
    sessionId: string,
    lookback: number = 5
  ): Promise<string[]> {
    const recentBreadcrumbs = await this.getRecentBreadcrumbs(sessionId, lookback);
    return recentBreadcrumbs
      .filter(b => b.action === 'navigate' || b.action === 'click')
      .map(b => b.page || b.targetId || 'unknown');
  }
}

// Singleton instance
export const breadcrumbTracker = new BreadcrumbTracker();
