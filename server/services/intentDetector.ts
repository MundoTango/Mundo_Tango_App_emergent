/**
 * Intent Detection Service
 * MB.MD Option A - Recursive Testing System
 * 
 * Predicts user actions BEFORE they happen
 * Analyzes breadcrumb patterns to test features proactively
 */

import { db } from '../db';
import { intentDetections, type InsertIntentDetection } from '@shared/schema';
import { breadcrumbTracker } from './breadcrumbTracker';
import { autoFixOrchestrator } from './autoFixOrchestrator';
import { eq } from 'drizzle-orm';

export interface IntentPrediction {
  predictedAction: string;
  predictedTarget: string;
  confidence: number;
  patternMatched: string;
  breadcrumbIds: number[];
}

export class IntentDetector {
  /**
   * Analyze recent user behavior and predict next action
   */
  async detectIntent(
    sessionId: string,
    userId?: number
  ): Promise<IntentPrediction | null> {
    const recentBreadcrumbs = await breadcrumbTracker.getRecentBreadcrumbs(sessionId, 10);
    
    if (recentBreadcrumbs.length < 2) {
      return null; // Not enough data
    }

    // Pattern 1: Hover then likely click
    const hoverPattern = this.detectHoverPattern(recentBreadcrumbs);
    if (hoverPattern) {
      return hoverPattern;
    }

    // Pattern 2: Sequential navigation (user going through pages in order)
    const navPattern = this.detectNavigationPattern(recentBreadcrumbs);
    if (navPattern) {
      return navPattern;
    }

    // Pattern 3: Form submission pattern
    const formPattern = this.detectFormPattern(recentBreadcrumbs);
    if (formPattern) {
      return formPattern;
    }

    return null;
  }

  /**
   * Pattern 1: User hovering over element → likely to click
   */
  private detectHoverPattern(breadcrumbs: any[]): IntentPrediction | null {
    const recentHovers = breadcrumbs.filter(b => b.action === 'hover');
    
    if (recentHovers.length === 0) return null;

    const lastHover = recentHovers[0];
    
    // If user hovered over same element multiple times, high confidence they'll click
    const hoverCount = recentHovers.filter(b => b.target === lastHover.target).length;
    const confidence = Math.min(0.5 + (hoverCount * 0.2), 0.95);

    return {
      predictedAction: 'click',
      predictedTarget: lastHover.target || lastHover.targetId || 'unknown',
      confidence,
      patternMatched: 'hover_then_click',
      breadcrumbIds: recentHovers.map(b => b.id),
    };
  }

  /**
   * Pattern 2: Sequential navigation (J1 → J2 → J3...)
   */
  private detectNavigationPattern(breadcrumbs: any[]): IntentPrediction | null {
    const navs = breadcrumbs.filter(b => b.action === 'navigate');
    
    if (navs.length < 2) return null;

    const pages = navs.map(n => n.page);
    
    // Detect journey progression
    const journeyMatch = pages[0]?.match(/\/journey\/(\d+)/);
    if (journeyMatch) {
      const currentJourney = parseInt(journeyMatch[1]);
      if (currentJourney < 5) {
        return {
          predictedAction: 'navigate_to_journey',
          predictedTarget: `/journey/${currentJourney + 1}`,
          confidence: 0.75,
          patternMatched: 'sequential_navigation',
          breadcrumbIds: navs.map(n => n.id),
        };
      }
    }

    return null;
  }

  /**
   * Pattern 3: Form input pattern (filling form → likely to submit)
   */
  private detectFormPattern(breadcrumbs: any[]): IntentPrediction | null {
    const inputs = breadcrumbs.filter(b => 
      b.action === 'click' && b.target?.includes('input')
    );
    
    if (inputs.length >= 2) {
      return {
        predictedAction: 'form_submit',
        predictedTarget: breadcrumbs[0].page,
        confidence: 0.65,
        patternMatched: 'form_fill_sequence',
        breadcrumbIds: inputs.map(i => i.id),
      };
    }

    return null;
  }

  /**
   * Record prediction and trigger proactive testing
   */
  async recordAndTest(
    prediction: IntentPrediction,
    sessionId: string,
    userId?: number
  ): Promise<void> {
    console.log(`[Intent Detection] ${prediction.patternMatched}: ${prediction.predictedAction} (${Math.round(prediction.confidence * 100)}% confidence)`);

    // Only test high-confidence predictions
    if (prediction.confidence >= 0.6) {
      // Test the feature BEFORE user clicks
      const testResult = await autoFixOrchestrator.testAndFix(prediction.predictedTarget);

      // Record prediction with test result
      await db.insert(intentDetections).values({
        userId: userId || null,
        sessionId,
        predictedAction: prediction.predictedAction,
        predictedTarget: prediction.predictedTarget,
        confidence: prediction.confidence,
        basedOnBreadcrumbs: prediction.breadcrumbIds as any,
        patternMatched: prediction.patternMatched,
        testedProactively: true,
        testResult: testResult.status,
        wasCorrect: null, // Will be updated when user actually acts
        actualAction: null,
      });

      console.log(`[Proactive Test] ${prediction.predictedTarget}: ${testResult.status}`);
    } else {
      // Just record prediction without testing
      await db.insert(intentDetections).values({
        userId: userId || null,
        sessionId,
        predictedAction: prediction.predictedAction,
        predictedTarget: prediction.predictedTarget,
        confidence: prediction.confidence,
        basedOnBreadcrumbs: prediction.breadcrumbIds as any,
        patternMatched: prediction.patternMatched,
        testedProactively: false,
        wasCorrect: null,
        actualAction: null,
      });
    }
  }

  /**
   * Update prediction accuracy when user actually acts
   */
  async updatePredictionAccuracy(
    sessionId: string,
    actualAction: string,
    actualTarget: string
  ): Promise<void> {
    // Find recent predictions for this session
    const recentPredictions = await db.query.intentDetections.findMany({
      where: eq(intentDetections.sessionId, sessionId),
      orderBy: (detections, { desc }) => [desc(detections.timestamp)],
      limit: 5,
    });

    for (const prediction of recentPredictions) {
      if (!prediction.wasCorrect && !prediction.actualAction) {
        const wasCorrect = 
          prediction.predictedAction === actualAction &&
          prediction.predictedTarget === actualTarget;

        await db
          .update(intentDetections)
          .set({
            wasCorrect,
            actualAction,
          })
          .where(eq(intentDetections.id, prediction.id));

        console.log(`[Prediction Accuracy] ${prediction.patternMatched}: ${wasCorrect ? '✅ CORRECT' : '❌ WRONG'}`);
      }
    }
  }

  /**
   * Get prediction statistics (for ML improvement)
   */
  async getStats(): Promise<{
    totalPredictions: number;
    accuracyRate: number;
    topPatterns: Array<{ pattern: string; accuracy: number }>;
  }> {
    const allPredictions = await db.query.intentDetections.findMany({
      where: (detections, { isNotNull }) => isNotNull(detections.wasCorrect),
    });

    const correct = allPredictions.filter(p => p.wasCorrect).length;
    const accuracyRate = allPredictions.length > 0 ? correct / allPredictions.length : 0;

    // Calculate accuracy per pattern
    const patternStats = new Map<string, { total: number; correct: number }>();
    
    for (const pred of allPredictions) {
      if (pred.patternMatched) {
        const stats = patternStats.get(pred.patternMatched) || { total: 0, correct: 0 };
        stats.total++;
        if (pred.wasCorrect) stats.correct++;
        patternStats.set(pred.patternMatched, stats);
      }
    }

    const topPatterns = Array.from(patternStats.entries())
      .map(([pattern, stats]) => ({
        pattern,
        accuracy: stats.correct / stats.total,
      }))
      .sort((a, b) => b.accuracy - a.accuracy);

    return {
      totalPredictions: allPredictions.length,
      accuracyRate,
      topPatterns,
    };
  }
}

// Singleton instance
export const intentDetector = new IntentDetector();
