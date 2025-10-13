import OpenAI from 'openai';
import { db } from '../db';
import { 
  agentLearnings, 
  knowledgeFlow, 
  bestPractices, 
  agents,
  qualityPatterns,
  type InsertKnowledgeFlow,
  type InsertBestPractice,
  type KnowledgeFlow,
  type BestPractice
} from '../../shared/schema';
import { eq, desc, sql, and, or, count } from 'drizzle-orm';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface Pattern {
  id?: number;
  pattern: string;
  category: string;
  impact: string;
  strategicValue: number;
  sourceAgent: string; // Agent ID (e.g., "AGENT_79")
  recommendation?: string;
}

export interface Solution {
  id: number;
  description: string;
  steps: string[];
  codeExample?: string;
  targetAgents: string[]; // Agent IDs
  sourceAgent: string; // Agent ID
}

export interface BestPracticeInput {
  title: string;
  description: string;
  category: string;
  sourceAgent: string; // Agent ID
  codeExample?: string;
  tags?: string[];
}

export interface Learning {
  agentId: string; // Agent ID (e.g., "AGENT_79")
  learningType: 'pattern' | 'solution' | 'best-practice' | 'insight';
  content: string;
  context?: string;
  effectiveness?: number;
  metadata?: any;
}

export interface Feedback {
  successful: boolean;
  improvement?: number;
  notes?: string;
}

export interface NetworkStatus {
  totalFlows: number;
  upFlows: number;
  acrossFlows: number;
  downFlows: number;
  activeBestPractices: number;
  avgEffectiveness: number;
  learningsToday: number;
  networkHealth: 'healthy' | 'degraded' | 'critical';
}

/**
 * Agent #80: Learning Coordinator Service
 * Knowledge Flow Architecture: UP (to CEO) / ACROSS (to peers) / DOWN (to all agents)
 */
export class LearningCoordinatorService {
  
  /**
   * UP: Escalate strategic patterns to CEO Agent #0
   * High-value insights that require executive decision-making
   */
  async escalatePattern(pattern: Pattern): Promise<void> {
    try {
      console.log(`[Agent #80 → Agent #0] Escalating strategic pattern (value: ${pattern.strategicValue})`);

      // Record the UP flow
      await db.insert(knowledgeFlow).values({
        direction: 'UP',
        fromAgent: pattern.sourceAgent,
        toAgent: 'AGENT_0', // CEO Agent #0
        content: pattern.pattern,
        contentType: 'pattern',
        effectiveness: pattern.strategicValue.toString(),
        metadata: {
          category: pattern.category,
          impact: pattern.impact,
          recommendation: pattern.recommendation
        }
      });

      // In production: Send to CEO Agent #0's message queue
      console.log(`[UP Flow] Pattern: ${pattern.pattern.substring(0, 100)}...`);
      console.log(`[UP Flow] Strategic Value: ${(pattern.strategicValue * 100).toFixed(0)}%`);
      console.log(`[UP Flow] Impact: ${pattern.impact}`);
      console.log(`[UP Flow] Recommendation: ${pattern.recommendation || 'None'}`);

    } catch (error) {
      console.error('[Learning Coordinator] Escalate pattern error:', error);
      throw new Error('Failed to escalate pattern to CEO');
    }
  }

  /**
   * ACROSS: Distribute tactical solutions to peer agents
   * Share immediately useful solutions with relevant agents
   */
  async distributeSolution(solution: Solution): Promise<void> {
    try {
      console.log(`[Agent #80] Distributing solution ACROSS to ${solution.targetAgents.length} peer agents`);

      // Record flows to each target agent
      const flowPromises = solution.targetAgents.map(targetAgent => 
        db.insert(knowledgeFlow).values({
          direction: 'ACROSS',
          fromAgent: solution.sourceAgent,
          toAgent: targetAgent,
          content: solution.description,
          contentType: 'solution',
          metadata: {
            steps: solution.steps,
            codeExample: solution.codeExample
          }
        })
      );

      await Promise.all(flowPromises);

      // Log A2A distribution
      solution.targetAgents.forEach(targetAgent => {
        console.log(`[ACROSS Flow] Agent ${solution.sourceAgent} → Agent ${targetAgent}: ${solution.description.substring(0, 60)}...`);
      });

    } catch (error) {
      console.error('[Learning Coordinator] Distribute solution error:', error);
      throw new Error('Failed to distribute solution across agents');
    }
  }

  /**
   * DOWN: Broadcast best practices to all agents
   * System-wide knowledge that benefits everyone
   */
  async broadcastBestPractice(practice: BestPracticeInput): Promise<BestPractice> {
    try {
      console.log(`[Agent #80] Broadcasting best practice DOWN to all agents: ${practice.title}`);

      // Store in best practices library
      const [savedPractice] = await db.insert(bestPractices).values({
        title: practice.title,
        description: practice.description,
        category: practice.category,
        sourceAgent: practice.sourceAgent,
        codeExample: practice.codeExample,
        relatedPatterns: [],
        tags: practice.tags || [],
        adoptionRate: '0',
        validated: false
      }).returning();

      // Record DOWN flow (broadcast to all)
      await db.insert(knowledgeFlow).values({
        direction: 'DOWN',
        fromAgent: practice.sourceAgent,
        toAgent: null, // null = broadcast to all
        content: practice.title,
        contentType: 'best-practice',
        metadata: {
          practiceId: savedPractice.id,
          category: practice.category,
          tags: practice.tags
        }
      });

      console.log(`[DOWN Flow] Best Practice: ${practice.title}`);
      console.log(`[DOWN Flow] Category: ${practice.category}`);
      console.log(`[DOWN Flow] Available to: ALL AGENTS`);

      return savedPractice;
    } catch (error) {
      console.error('[Learning Coordinator] Broadcast best practice error:', error);
      throw new Error('Failed to broadcast best practice');
    }
  }

  /**
   * Capture learnings from all agents automatically
   * Central knowledge collection point
   */
  async captureLearning(agentId: string, learning: Learning): Promise<void> {
    try {
      // Determine flow direction based on learning type and value
      const direction = await this.determineFlowDirection(learning);
      
      // Store the learning
      await db.insert(agentLearnings).values({
        pattern: `${learning.learningType}: ${learning.content.substring(0, 100)}`,
        problem: learning.context || 'Context not provided',
        solution: learning.content,
        confidence: (learning.effectiveness || 0.5).toString(),
        discoveredBy: agentId,
        esaLayers: [],
        agentDomains: [learning.metadata?.domain || 'general']
      });

      // Process based on direction
      switch (direction) {
        case 'UP':
          if (learning.effectiveness && learning.effectiveness > 0.7) {
            await this.escalatePattern({
              pattern: learning.content,
              category: learning.learningType,
              impact: 'high',
              strategicValue: learning.effectiveness,
              sourceAgent: agentId
            });
          }
          break;
        case 'ACROSS':
          // Determine relevant peers and distribute
          const relevantAgents = await this.findRelevantAgents(learning);
          if (relevantAgents.length > 0) {
            await this.distributeSolution({
              id: Date.now(),
              description: learning.content,
              steps: [learning.content],
              targetAgents: relevantAgents,
              sourceAgent: agentId
            });
          }
          break;
        case 'DOWN':
          if (learning.learningType === 'best-practice') {
            await this.broadcastBestPractice({
              title: learning.content.substring(0, 100),
              description: learning.content,
              category: learning.metadata?.category || 'general',
              sourceAgent: agentId,
              tags: learning.metadata?.tags || []
            });
          }
          break;
      }

      console.log(`[Agent #80] Captured learning from Agent ${agentId} (${learning.learningType}) → ${direction}`);

    } catch (error) {
      console.error('[Learning Coordinator] Capture learning error:', error);
      throw new Error('Failed to capture learning');
    }
  }

  /**
   * Track solution effectiveness over time
   * Update reuse count and effectiveness metrics
   */
  async trackEffectiveness(solutionId: number, feedback: Feedback): Promise<void> {
    try {
      // Find the knowledge flow
      const flow = await db.select()
        .from(knowledgeFlow)
        .where(eq(knowledgeFlow.id, solutionId))
        .limit(1);

      if (flow.length === 0) {
        throw new Error('Solution not found');
      }

      const currentFlow = flow[0];
      const newReuses = (currentFlow.timesReused || 0) + 1;
      
      // Calculate new effectiveness (rolling average)
      const currentEffectiveness = Number(currentFlow.effectiveness) || 0.5;
      const feedbackValue = feedback.successful ? 1 : 0;
      const newEffectiveness = (currentEffectiveness * (newReuses - 1) + feedbackValue) / newReuses;

      // Update the flow
      await db.update(knowledgeFlow)
        .set({
          timesReused: newReuses,
          effectiveness: newEffectiveness.toString(),
          metadata: {
            ...currentFlow.metadata,
            lastFeedback: {
              successful: feedback.successful,
              improvement: feedback.improvement,
              notes: feedback.notes,
              timestamp: new Date()
            }
          }
        })
        .where(eq(knowledgeFlow.id, solutionId));

      console.log(`[Agent #80] Tracked effectiveness: Solution #${solutionId}`);
      console.log(`  - Reuses: ${newReuses}`);
      console.log(`  - Effectiveness: ${(newEffectiveness * 100).toFixed(1)}%`);
      console.log(`  - Success: ${feedback.successful ? 'Yes' : 'No'}`);

    } catch (error) {
      console.error('[Learning Coordinator] Track effectiveness error:', error);
      throw new Error('Failed to track solution effectiveness');
    }
  }

  /**
   * Build collective intelligence network
   * Sync and report on network health
   */
  async syncKnowledgeNetwork(): Promise<NetworkStatus> {
    try {
      // Get flow statistics
      const [flowStats] = await db.select({
        total: count(),
        upCount: sql<number>`COUNT(CASE WHEN ${knowledgeFlow.direction} = 'UP' THEN 1 END)`,
        acrossCount: sql<number>`COUNT(CASE WHEN ${knowledgeFlow.direction} = 'ACROSS' THEN 1 END)`,
        downCount: sql<number>`COUNT(CASE WHEN ${knowledgeFlow.direction} = 'DOWN' THEN 1 END)`,
        avgEffectiveness: sql<number>`AVG(${knowledgeFlow.effectiveness})`
      }).from(knowledgeFlow);

      // Get best practices count
      const [practiceStats] = await db.select({
        count: count(),
        validated: sql<number>`COUNT(CASE WHEN ${bestPractices.validated} = true THEN 1 END)`
      }).from(bestPractices);

      // Get today's learnings
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const [todayStats] = await db.select({
        count: count()
      })
        .from(knowledgeFlow)
        .where(sql`${knowledgeFlow.timestamp} >= ${today}`);

      // Determine network health
      const avgEff = Number(flowStats.avgEffectiveness) || 0;
      let networkHealth: 'healthy' | 'degraded' | 'critical';
      
      if (avgEff >= 0.7) networkHealth = 'healthy';
      else if (avgEff >= 0.4) networkHealth = 'degraded';
      else networkHealth = 'critical';

      const status: NetworkStatus = {
        totalFlows: Number(flowStats.total) || 0,
        upFlows: Number(flowStats.upCount) || 0,
        acrossFlows: Number(flowStats.acrossCount) || 0,
        downFlows: Number(flowStats.downCount) || 0,
        activeBestPractices: Number(practiceStats.validated) || 0,
        avgEffectiveness: avgEff,
        learningsToday: Number(todayStats.count) || 0,
        networkHealth
      };

      console.log('[Agent #80] Knowledge Network Status:', status);

      return status;
    } catch (error) {
      console.error('[Learning Coordinator] Sync network error:', error);
      throw new Error('Failed to sync knowledge network');
    }
  }

  /**
   * Helper: Determine flow direction based on learning characteristics
   */
  private async determineFlowDirection(learning: Learning): Promise<'UP' | 'ACROSS' | 'DOWN'> {
    // Strategic/high-value → UP to CEO
    if (learning.effectiveness && learning.effectiveness > 0.8) {
      return 'UP';
    }

    // Best practices → DOWN to all
    if (learning.learningType === 'best-practice') {
      return 'DOWN';
    }

    // Tactical solutions → ACROSS to peers
    return 'ACROSS';
  }

  /**
   * Helper: Find relevant peer agents for knowledge sharing
   */
  private async findRelevantAgents(learning: Learning): Promise<string[]> {
    try {
      // Simple domain-based relevance (can be enhanced with ML)
      const domain = learning.metadata?.domain || '';
      
      const relevantAgents = await db.select()
        .from(agents)
        .where(
          and(
            eq(agents.status, 'active'),
            sql`${agents.capabilities}::text ILIKE ${'%' + domain + '%'}`
          )
        )
        .limit(5);

      return relevantAgents
        .map(a => a.id)
        .filter(id => id !== learning.agentId);
    } catch (error) {
      console.error('Error finding relevant agents:', error);
      return [];
    }
  }

  /**
   * Get all best practices
   */
  async getBestPractices(category?: string): Promise<BestPractice[]> {
    try {
      if (category) {
        const practices = await db.select()
          .from(bestPractices)
          .where(eq(bestPractices.category, category))
          .orderBy(desc(bestPractices.adoptionRate))
          .limit(50);
        return practices;
      }

      const practices = await db.select()
        .from(bestPractices)
        .orderBy(desc(bestPractices.adoptionRate))
        .limit(50);
      return practices;
    } catch (error) {
      console.error('Error getting best practices:', error);
      return [];
    }
  }

  /**
   * Get knowledge flows by direction
   */
  async getFlowsByDirection(direction: 'UP' | 'ACROSS' | 'DOWN'): Promise<KnowledgeFlow[]> {
    try {
      const flows = await db.select()
        .from(knowledgeFlow)
        .where(eq(knowledgeFlow.direction, direction))
        .orderBy(desc(knowledgeFlow.timestamp))
        .limit(50);
      
      return flows;
    } catch (error) {
      console.error(`Error getting ${direction} flows:`, error);
      return [];
    }
  }
}

export const learningCoordinatorService = new LearningCoordinatorService();
