/**
 * ESA AI Intelligence Network - Audit Learning Service
 * Agent #31 (AI Infrastructure) + Agent #68 (Pattern Recognition)
 * 
 * Extracts patterns from audits and learns from user behavior
 */

import { db } from '../db';
import { learnedPatterns, pageJourneyPatterns, aiConversationMemory } from '@shared/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { aiVectorService } from './aiVectorService';

interface AuditReport {
  page: string;
  phase: number;
  issues: Array<{
    type: string;
    severity: string;
    description: string;
    location?: string;
  }>;
  successes: Array<{
    type: string;
    description: string;
  }>;
  recommendations: string[];
}

interface JourneyData {
  userId: number;
  pages: string[];
  timePerPage: Record<string, number>;
  role: string;
  completedAction?: boolean;
}

class AILearningService {
  /**
   * Agent #68: Extract patterns from audit report
   */
  async learnFromAudit(report: AuditReport): Promise<void> {
    try {
      // Group issues by type
      const issueMap = new Map<string, typeof report.issues>();
      
      for (const issue of report.issues) {
        const key = `${issue.type}_${issue.severity}`;
        if (!issueMap.has(key)) {
          issueMap.set(key, []);
        }
        issueMap.get(key)!.push(issue);
      }

      // Create learned patterns for recurring issues
      for (const [key, issues] of issueMap.entries()) {
        const [type, severity] = key.split('_');
        
        if (issues.length >= 1) { // Even single occurrence is worth tracking
          const pattern = {
            patternType: type,
            title: issues[0].description.substring(0, 200),
            description: `Found ${issues.length} instance(s) on ${report.page}`,
            affectedPages: [report.page],
            occurrences: issues.length,
            severity: severity as any,
            confidence: issues.length >= 3 ? 0.9 : 0.6,
            suggestedSolution: this.generateSolution(type, issues[0].description),
            auditPhase: report.phase,
            discoveredBy: 'Agent #68',
            metadata: { issues }
          };

          // Store in database
          const [saved] = await db.insert(learnedPatterns).values(pattern).returning();

          // Store in vector DB for semantic search
          await aiVectorService.storePattern({
            id: saved.id.toString(),
            pattern: pattern.title,
            type: pattern.patternType,
            confidence: pattern.confidence,
            affectedPages: pattern.affectedPages,
            severity: pattern.severity,
            auditPhase: pattern.auditPhase
          });

          console.log(`[AI Learning] Pattern learned: ${pattern.title}`);
        }
      }

      // Learn from successes too
      for (const success of report.successes) {
        const pattern = {
          patternType: 'success',
          title: `Success: ${success.description.substring(0, 200)}`,
          description: success.description,
          affectedPages: [report.page],
          occurrences: 1,
          severity: 'low' as any,
          confidence: 0.8,
          suggestedSolution: `Replicate this pattern on other pages`,
          auditPhase: report.phase,
          discoveredBy: 'Agent #68'
        };

        await db.insert(learnedPatterns).values(pattern);
        console.log(`[AI Learning] Success pattern learned: ${success.type}`);
      }
    } catch (error) {
      console.error('[AI Learning] Learn from audit failed:', error);
      throw error;
    }
  }

  /**
   * Agent #71: Learn journey pattern from user behavior
   */
  async learnJourneyPattern(data: JourneyData): Promise<void> {
    try {
      // Check if similar pattern exists
      const existing = await db.select()
        .from(pageJourneyPatterns)
        .where(eq(pageJourneyPatterns.userRole, data.role))
        .limit(10);

      // Simple pattern matching: find similar journey sequences
      const similar = existing.find(p => {
        const sequence = p.journeySequence || [];
        return this.sequenceSimilarity(sequence, data.pages) > 0.7;
      });

      if (similar) {
        // Update existing pattern
        await db.update(pageJourneyPatterns)
          .set({
            frequency: similar.frequency + 1,
            confidence: Math.min(similar.confidence + 0.05, 1.0),
            avgTimePerPage: this.mergeTimeData(
              similar.avgTimePerPage as any,
              data.timePerPage
            ),
            conversionRate: data.completedAction 
              ? ((similar.conversionRate || 0) * similar.frequency + 1) / (similar.frequency + 1)
              : similar.conversionRate,
            updatedAt: new Date()
          })
          .where(eq(pageJourneyPatterns.id, similar.id));

        console.log(`[AI Learning] Journey pattern updated: ${similar.patternName}`);
      } else {
        // Create new pattern
        const pattern = {
          patternName: `${data.role}_journey_${data.pages[0]}_${Date.now()}`,
          journeySequence: data.pages,
          userRole: data.role,
          frequency: 1,
          confidence: 0.5,
          nextPagePrediction: this.predictNextPage(data.pages),
          predictionProbability: 0.6,
          avgTimePerPage: data.timePerPage,
          conversionRate: data.completedAction ? 1.0 : 0.0,
          learnedBy: 'Agent #71'
        };

        await db.insert(pageJourneyPatterns).values(pattern);
        console.log(`[AI Learning] New journey pattern created: ${pattern.patternName}`);
      }
    } catch (error) {
      console.error('[AI Learning] Learn journey failed:', error);
      throw error;
    }
  }

  /**
   * Get AI-powered insights for admin dashboard
   */
  async getInsights(): Promise<any> {
    try {
      const [patternStats] = await db.select({
        total: sql<number>`count(*)`,
        critical: sql<number>`count(*) filter (where severity = 'critical')`,
        high: sql<number>`count(*) filter (where severity = 'high')`,
        pending: sql<number>`count(*) filter (where implementation_status = 'pending')`,
        avgConfidence: sql<number>`avg(confidence)`
      }).from(learnedPatterns);

      const topPatterns = await db.select()
        .from(learnedPatterns)
        .where(eq(learnedPatterns.implementationStatus, 'pending'))
        .orderBy(desc(learnedPatterns.confidence))
        .limit(5);

      const [journeyStats] = await db.select({
        total: sql<number>`count(*)`,
        highConfidence: sql<number>`count(*) filter (where confidence > 0.8)`,
        avgConfidence: sql<number>`avg(confidence)`
      }).from(pageJourneyPatterns);

      return {
        patterns: patternStats,
        topIssues: topPatterns,
        journeys: journeyStats,
        learningStatus: {
          patternsLearned: patternStats.total,
          journeysTracked: journeyStats.total,
          readyForAction: patternStats.pending
        }
      };
    } catch (error) {
      console.error('[AI Learning] Get insights failed:', error);
      return null;
    }
  }

  /**
   * Helper: Generate solution based on issue type
   */
  private generateSolution(type: string, description: string): string {
    const solutions: Record<string, string> = {
      'dark_mode': 'Add dark: variants to Tailwind classes. Example: className="bg-white dark:bg-gray-800"',
      'accessibility': 'Ensure WCAG 2.1 AA compliance: aria-labels, keyboard navigation, color contrast',
      'performance': 'Optimize bundle size, lazy load components, use React.memo() for expensive renders',
      'mobile': 'Add responsive breakpoints: md:, lg:, xl: variants. Test on mobile devices',
      'i18n': 'Use useTranslation() hook. Add translation keys to all 68 languages',
      'seo': 'Add meta tags, semantic HTML, alt text for images, descriptive titles',
      'security': 'Implement RBAC checks, sanitize inputs, use CSRF tokens, enable RLS'
    };

    for (const [key, solution] of Object.entries(solutions)) {
      if (type.toLowerCase().includes(key) || description.toLowerCase().includes(key)) {
        return solution;
      }
    }

    return 'Review code against ESA standards. Check esa.md for guidance.';
  }

  /**
   * Helper: Calculate sequence similarity (Jaccard index)
   */
  private sequenceSimilarity(seq1: string[], seq2: string[]): number {
    const set1 = new Set(seq1);
    const set2 = new Set(seq2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  }

  /**
   * Helper: Predict next page based on journey
   */
  private predictNextPage(pages: string[]): string {
    const lastPage = pages[pages.length - 1];
    
    // Simple heuristic predictions
    const predictions: Record<string, string> = {
      '/profile': '/community',
      '/community': '/events',
      '/events': '/housing',
      '/housing': '/apply',
      '/admin': '/admin/users',
      '/admin/users': '/admin/moderation'
    };

    return predictions[lastPage] || '/';
  }

  /**
   * Helper: Merge time data for patterns
   */
  private mergeTimeData(existing: Record<string, number>, newData: Record<string, number>): any {
    const merged = { ...existing };
    
    for (const [page, time] of Object.entries(newData)) {
      if (merged[page]) {
        merged[page] = (merged[page] + time) / 2; // Average
      } else {
        merged[page] = time;
      }
    }

    return merged;
  }
}

// Singleton instance
export const aiLearningService = new AILearningService();
