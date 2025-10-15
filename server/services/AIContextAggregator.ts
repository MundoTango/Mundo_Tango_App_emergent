/**
 * AI CONTEXT AGGREGATOR
 * Fetches all platform knowledge for Mr Blue AI conversations
 */

import { db } from '../db';
import { 
  componentLearningHistory,
  visualEditorChanges,
  componentAgents,
  esaAgents
} from '../../shared/schema';
import { desc, gte, sql } from 'drizzle-orm';

export interface PlatformContext {
  learnings: Array<{
    componentId: string;
    issue: string;
    solution: string;
    confidence: number;
    timestamp: Date;
  }>;
  visualChanges: Array<{
    componentId: string;
    changeType: string;
    approved: boolean | null;
    timestamp: Date;
  }>;
  componentHealth: {
    healthy: number;
    warning: number;
    error: number;
  };
  esaInsights: Array<{
    agentId: string;
    name: string;
    status: string;
    metrics: any;
  }>;
  summary: {
    totalLearnings: number;
    totalVisualChanges: number;
    totalComponents: number;
    totalAgents: number;
  };
}

export class AIContextAggregator {
  /**
   * Fetch comprehensive platform context for AI conversations
   */
  async fetchPlatformContext(timeWindow: number = 24): Promise<PlatformContext> {
    const since = new Date();
    since.setHours(since.getHours() - timeWindow);

    console.log(`🧠 [AIContext] Fetching platform knowledge (last ${timeWindow}h)`);

    // Parallel queries for maximum speed
    const [learnings, visualChanges, healthStats, esaAgentsData] = await Promise.all([
      this.fetchLearnings(since),
      this.fetchVisualChanges(since),
      this.fetchComponentHealth(),
      this.fetchESAAgents()
    ]);

    const context: PlatformContext = {
      learnings,
      visualChanges,
      componentHealth: healthStats,
      esaInsights: esaAgentsData,
      summary: {
        totalLearnings: learnings.length,
        totalVisualChanges: visualChanges.length,
        totalComponents: healthStats.healthy + healthStats.warning + healthStats.error,
        totalAgents: esaAgentsData.length
      }
    };

    console.log(`✅ [AIContext] Context built:`, {
      learnings: learnings.length,
      visualChanges: visualChanges.length,
      components: context.summary.totalComponents,
      agents: esaAgentsData.length
    });

    return context;
  }

  /**
   * Fetch recent component learnings
   */
  private async fetchLearnings(since: Date) {
    try {
      const results = await db
        .select({
          componentId: componentLearningHistory.componentId,
          issue: componentLearningHistory.issue,
          solution: componentLearningHistory.solution,
          confidence: componentLearningHistory.confidence,
          timestamp: componentLearningHistory.createdAt
        })
        .from(componentLearningHistory)
        .where(gte(componentLearningHistory.createdAt, since))
        .orderBy(desc(componentLearningHistory.createdAt))
        .limit(50);

      return results.map(r => ({
        componentId: r.componentId,
        issue: r.issue || '',
        solution: r.solution || '',
        confidence: r.confidence || 80,
        timestamp: r.timestamp || new Date()
      }));
    } catch (error) {
      console.warn('⚠️  [AIContext] Learning history unavailable:', error);
      return [];
    }
  }

  /**
   * Fetch recent Visual Editor changes
   */
  private async fetchVisualChanges(since: Date) {
    try {
      const results = await db
        .select({
          componentId: visualEditorChanges.componentId,
          changeType: visualEditorChanges.changeType,
          approved: visualEditorChanges.approved,
          timestamp: visualEditorChanges.createdAt
        })
        .from(visualEditorChanges)
        .where(gte(visualEditorChanges.createdAt, since))
        .orderBy(desc(visualEditorChanges.createdAt))
        .limit(30);

      return results.map(r => ({
        componentId: r.componentId,
        changeType: r.changeType,
        approved: r.approved,
        timestamp: r.timestamp || new Date()
      }));
    } catch (error) {
      console.warn('⚠️  [AIContext] Visual changes unavailable:', error);
      return [];
    }
  }

  /**
   * Fetch component health statistics
   */
  private async fetchComponentHealth() {
    try {
      const results = await db
        .select({
          status: componentAgents.currentHealth,
          count: sql<number>`count(*)`
        })
        .from(componentAgents)
        .groupBy(componentAgents.currentHealth);

      const stats = {
        healthy: 0,
        warning: 0,
        error: 0
      };

      results.forEach(r => {
        if (r.status === 'healthy') stats.healthy = Number(r.count);
        else if (r.status === 'warning') stats.warning = Number(r.count);
        else if (r.status === 'error') stats.error = Number(r.count);
      });

      return stats;
    } catch (error) {
      console.warn('⚠️  [AIContext] Component health unavailable:', error);
      return { healthy: 0, warning: 0, error: 0 };
    }
  }

  /**
   * Fetch ESA agent insights
   */
  private async fetchESAAgents() {
    try {
      const results = await db
        .select({
          agentId: esaAgents.id,
          name: esaAgents.name,
          status: esaAgents.status,
          metrics: esaAgents.metrics
        })
        .from(esaAgents)
        .orderBy(desc(esaAgents.lastActive))
        .limit(20);

      return results.map(r => ({
        agentId: r.agentId,
        name: r.name,
        status: r.status || 'unknown',
        metrics: r.metrics || {}
      }));
    } catch (error) {
      console.warn('⚠️  [AIContext] ESA agents unavailable:', error);
      return [];
    }
  }

  /**
   * Build context-aware system prompt
   */
  buildEnhancedPrompt(
    userMessage: string,
    platformContext: PlatformContext,
    pageContext?: { page?: string; url?: string }
  ): string {
    const topLearnings = platformContext.learnings.slice(0, 5);
    const topVisualChanges = platformContext.visualChanges.slice(0, 3);
    const topAgents = platformContext.esaInsights.slice(0, 3);

    return `You are Mr Blue, the universal AI companion for the Mundo Tango platform.

PLATFORM KNOWLEDGE (Last 24 hours):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 SUMMARY:
• Component Learnings: ${platformContext.summary.totalLearnings} new solutions
• Visual Changes: ${platformContext.summary.totalVisualChanges} UI modifications
• System Health: ${platformContext.componentHealth.healthy} healthy, ${platformContext.componentHealth.warning} warnings, ${platformContext.componentHealth.error} errors
• Active Agents: ${platformContext.summary.totalAgents} ESA agents

${topLearnings.length > 0 ? `
🧠 RECENT LEARNINGS:
${topLearnings.map(l => 
  `• ${l.componentId}: ${l.issue.substring(0, 60)}... → ${l.solution.substring(0, 60)}... (${l.confidence}% confidence)`
).join('\n')}
` : ''}

${topVisualChanges.length > 0 ? `
🎨 VISUAL EDITOR CHANGES:
${topVisualChanges.map(v => 
  `• ${v.componentId}: ${v.changeType} (${v.approved === null ? 'PENDING' : v.approved ? 'APPROVED' : 'REJECTED'})`
).join('\n')}
` : ''}

${topAgents.length > 0 ? `
🤖 ESA AGENT INSIGHTS:
${topAgents.map(a => 
  `• ${a.name} (${a.agentId}): ${a.status}`
).join('\n')}
` : ''}

${pageContext ? `
📍 USER CONTEXT:
• Current Page: ${pageContext.page || 'Unknown'}
• URL: ${pageContext.url || '/'}
` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INSTRUCTIONS:
✅ Use platform knowledge to give specific, contextual answers
✅ Reference actual learnings, changes, and agent insights when relevant
✅ Be conversational but precise
✅ Suggest Visual Editor if UI changes are needed
✅ Reference specific components and their learnings
✅ Show data sources used (e.g., "Based on recent learnings...")

User: ${userMessage}`;
  }
}

export const aiContextAggregator = new AIContextAggregator();
