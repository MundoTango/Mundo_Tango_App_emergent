/**
 * TRACK A: Agent Memory Service
 * 
 * Enables every agent to learn from experience and build institutional knowledge.
 * Agents record learnings, retrieve past experiences, and contribute to collective wisdom.
 */

import { db } from '@db';
import { 
  agentMemories, 
  agentKnowledgeBase,
  type InsertAgentMemory,
  type InsertAgentKnowledge 
} from '@shared/schema';
import { eq, desc, and, ilike, sql } from 'drizzle-orm';

export class AgentMemoryService {
  /**
   * Record a learning event - agent learns from experience
   */
  async recordLearning(data: InsertAgentMemory) {
    const [learning] = await db.insert(agentMemories).values(data).returning();
    return learning;
  }

  /**
   * Get agent's past learnings on a specific topic
   */
  async getLearnings(agentId: string, topic?: string, limit = 10) {
    let query = db
      .select()
      .from(agentMemories)
      .where(eq(agentMemories.agentId, agentId))
      .orderBy(desc(agentMemories.createdAt))
      .limit(limit);

    if (topic) {
      query = db
        .select()
        .from(agentMemories)
        .where(
          and(
            eq(agentMemories.agentId, agentId),
            ilike(agentMemories.context, `%${topic}%`)
          )
        )
        .orderBy(desc(agentMemories.createdAt))
        .limit(limit);
    }

    return await query;
  }

  /**
   * Get agent's complete learning history
   */
  async getAgentHistory(agentId: string, limit = 50) {
    return await db
      .select()
      .from(agentMemories)
      .where(eq(agentMemories.agentId, agentId))
      .orderBy(desc(agentMemories.createdAt))
      .limit(limit);
  }

  /**
   * Search knowledge base across all agents
   */
  async searchKnowledge(query: string, tags?: string[], limit = 20) {
    let dbQuery = db
      .select()
      .from(agentKnowledgeBase)
      .where(
        ilike(agentKnowledgeBase.content, `%${query}%`)
      )
      .orderBy(desc(agentKnowledgeBase.upvotes))
      .limit(limit);

    if (tags && tags.length > 0) {
      dbQuery = db
        .select()
        .from(agentKnowledgeBase)
        .where(
          and(
            ilike(agentKnowledgeBase.content, `%${query}%`),
            sql`${agentKnowledgeBase.tags} && ${tags}`
          )
        )
        .orderBy(desc(agentKnowledgeBase.upvotes))
        .limit(limit);
    }

    return await dbQuery;
  }

  /**
   * Contribute knowledge to the collective knowledge base
   */
  async shareKnowledge(data: InsertAgentKnowledge) {
    const [knowledge] = await db
      .insert(agentKnowledgeBase)
      .values(data)
      .returning();
    return knowledge;
  }

  /**
   * Upvote knowledge (agent found it helpful)
   */
  async upvoteKnowledge(knowledgeId: number) {
    const [updated] = await db
      .update(agentKnowledgeBase)
      .set({ 
        upvotes: sql`${agentKnowledgeBase.upvotes} + 1` 
      })
      .where(eq(agentKnowledgeBase.id, knowledgeId))
      .returning();
    return updated;
  }

  /**
   * Calculate agent's expertise score in a domain
   * Based on: learning count, confidence, and applied count
   */
  async calculateExpertise(agentId: string, domain?: string) {
    const learnings = await this.getLearnings(agentId, domain, 100);
    
    if (learnings.length === 0) {
      return {
        agentId,
        domain: domain || 'all',
        expertiseScore: 0,
        totalLearnings: 0,
        avgConfidence: 0,
        totalApplications: 0
      };
    }

    const totalLearnings = learnings.length;
    const avgConfidence = learnings.reduce((sum, l) => sum + (l.confidenceScore || 50), 0) / totalLearnings;
    const totalApplications = learnings.reduce((sum, l) => sum + (l.appliedCount || 0), 0);

    // Expertise score: weighted combination
    // 40% learning count, 30% confidence, 30% applications
    const expertiseScore = Math.min(100, Math.round(
      (totalLearnings * 0.4) + 
      (avgConfidence * 0.3) + 
      (Math.min(totalApplications, 100) * 0.3)
    ));

    return {
      agentId,
      domain: domain || 'all',
      expertiseScore,
      totalLearnings,
      avgConfidence: Math.round(avgConfidence),
      totalApplications
    };
  }

  /**
   * Mark a learning as applied (agent used this knowledge)
   */
  async markAsApplied(learningId: number) {
    const [updated] = await db
      .update(agentMemories)
      .set({ 
        appliedCount: sql`${agentMemories.appliedCount} + 1`,
        confidenceScore: sql`LEAST(100, ${agentMemories.confidenceScore} + 5)` // Increase confidence when applied
      })
      .where(eq(agentMemories.id, learningId))
      .returning();
    return updated;
  }

  /**
   * Get top learnings by confidence and application
   */
  async getTopLearnings(agentId: string, limit = 10) {
    return await db
      .select()
      .from(agentMemories)
      .where(eq(agentMemories.agentId, agentId))
      .orderBy(
        desc(agentMemories.confidenceScore),
        desc(agentMemories.appliedCount)
      )
      .limit(limit);
  }

  /**
   * Get recent learnings across all agents (community intelligence)
   */
  async getRecentCommunityLearnings(limit = 20) {
    return await db
      .select()
      .from(agentMemories)
      .orderBy(desc(agentMemories.createdAt))
      .limit(limit);
  }
}

export const agentMemoryService = new AgentMemoryService();
