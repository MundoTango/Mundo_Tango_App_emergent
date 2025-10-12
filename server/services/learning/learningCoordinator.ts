import { db } from "@db";
import { agentLearnings, learningPatterns, type InsertAgentLearning, type AgentLearning } from "@shared/schema";
import { eq, desc, and, or, sql } from "drizzle-orm";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * ESA Agent #80: Inter-Agent Learning Coordinator
 * Captures learnings from all agents, distributes knowledge UP/ACROSS, builds collective intelligence
 */

export class LearningCoordinator {
  
  /**
   * Step 1: Agent reports a learning
   */
  async captureLearning(learning: InsertAgentLearning): Promise<AgentLearning> {
    // Generate embedding for semantic search
    const embedding = await this.generateEmbedding(
      `${learning.problem} ${learning.solution}`
    );
    
    // Store in database
    const [captured] = await db.insert(agentLearnings).values({
      ...learning,
      embedding: JSON.stringify(embedding),
    }).returning();
    
    // Process learning asynchronously
    this.processLearning(captured).catch(console.error);
    
    return captured;
  }

  /**
   * Step 2: Process learning - extract patterns, distribute knowledge
   */
  private async processLearning(learning: AgentLearning): Promise<void> {
    // Extract patterns
    const patterns = await this.identifyPatterns(learning);
    if (patterns.length > 0) {
      await this.updatePatternLibrary(patterns);
    }

    // Find relevant agents
    const relevantAgents = await this.findRelevantAgents(learning);

    // Assess strategic value
    const strategicValue = this.assessStrategicValue(learning);

    // Distribute UP to CEO (Agent #0)
    if (strategicValue > 0.7) {
      await this.distributeUp(learning, strategicValue);
    }

    // Distribute ACROSS to peers
    for (const agent of relevantAgents) {
      await this.distributeAcross(agent, learning);
    }
  }

  /**
   * Step 3: Identify patterns from learning
   */
  private async identifyPatterns(learning: AgentLearning): Promise<any[]> {
    const patterns = [];

    // Check if this problem matches existing patterns
    const existingPatterns = await db.select()
      .from(learningPatterns)
      .where(sql`${learningPatterns.problemSignature} ILIKE ${'%' + learning.problem.substring(0, 50) + '%'}`);

    if (existingPatterns.length > 0) {
      // Update existing pattern
      const pattern = existingPatterns[0];
      await db.update(learningPatterns)
        .set({
          timesApplied: pattern.timesApplied + 1,
          discoveredBy: [...(pattern.discoveredBy || []), learning.agentId],
        })
        .where(eq(learningPatterns.id, pattern.id));
    } else {
      // Check if this could be a new pattern (occurred 2+ times recently)
      const similarLearnings = await this.findSimilarLearnings(learning, 0.85);
      
      if (similarLearnings.length >= 2) {
        patterns.push({
          problemSignature: learning.problem,
          solutionTemplate: learning.solution,
          discoveredBy: [learning.agentId, ...similarLearnings.map(l => l.agentId)],
        });
      }
    }

    return patterns;
  }

  /**
   * Step 4: Update pattern library with new patterns
   */
  private async updatePatternLibrary(patterns: any[]): Promise<void> {
    for (const pattern of patterns) {
      await db.insert(learningPatterns).values({
        patternName: this.generatePatternName(pattern.problemSignature),
        problemSignature: pattern.problemSignature,
        solutionTemplate: pattern.solutionTemplate,
        discoveredBy: pattern.discoveredBy,
        timesApplied: 1,
        successRate: 0.5, // Start neutral, will adjust with feedback
      }).onConflictDoNothing();
    }
  }

  /**
   * Step 5: Find agents who would benefit from this learning
   */
  private async findRelevantAgents(learning: AgentLearning): Promise<string[]> {
    const relevantAgents: string[] = [];

    // Domain-based relevance
    const domainAgents: Record<string, string[]> = {
      'mobile': ['Agent #73', 'Agent #74', 'Agent #78'],
      'performance': ['Agent #73', 'Agent #77', 'Agent #78'],
      'ui': ['Agent #73', 'Agent #74', 'Agent #78'],
      'backend': ['Agent #75', 'Agent #77'],
      'payment': ['Agent #75'],
    };

    if (learning.domain && domainAgents[learning.domain]) {
      relevantAgents.push(...domainAgents[learning.domain]);
    }

    // Remove the learning agent itself
    return relevantAgents.filter(agent => agent !== learning.agentId);
  }

  /**
   * Step 6: Assess strategic value for CEO
   */
  private assessStrategicValue(learning: AgentLearning): number {
    let value = 0.5;

    // High impact outcomes
    if (learning.outcome?.impact === 'high') {
      value += 0.3;
    }

    // Affects multiple domains
    if (learning.tags && learning.tags.length > 2) {
      value += 0.2;
    }

    // High confidence solutions
    if (learning.confidence > 0.9) {
      value += 0.1;
    }

    return Math.min(value, 1.0);
  }

  /**
   * Step 7: Distribute knowledge UP to Agent #0 (CEO)
   */
  private async distributeUp(learning: AgentLearning, strategicValue: number): Promise<void> {
    console.log(`[Agent #80 → Agent #0] Strategic learning (value: ${strategicValue}):`, {
      from: learning.agentId,
      domain: learning.domain,
      insight: learning.problem,
      recommendation: learning.solution,
      impact: learning.outcome?.impact,
    });

    // In production, this would send to Agent #0's queue/webhook
    // For now, we log it
  }

  /**
   * Step 8: Distribute knowledge ACROSS to peer agents
   */
  private async distributeAcross(targetAgent: string, learning: AgentLearning): Promise<void> {
    console.log(`[Agent #80 → ${targetAgent}] Peer learning:`, {
      from: learning.agentId,
      message: `${learning.agentId} discovered: ${learning.solution}`,
      pattern: learning.problem,
      how_it_helps: `Relevant to your ${learning.domain} work`,
    });

    // In production, this would send to agent's notification queue
  }

  /**
   * Semantic search for similar learnings
   */
  async findSimilarLearnings(learning: Partial<AgentLearning>, threshold: number = 0.8): Promise<AgentLearning[]> {
    if (!learning.problem) return [];

    const queryEmbedding = await this.generateEmbedding(learning.problem);
    
    // For now, simple text matching (in production: vector similarity)
    const similar = await db.select()
      .from(agentLearnings)
      .where(sql`${agentLearnings.problem} ILIKE ${'%' + learning.problem.substring(0, 30) + '%'}`)
      .limit(5);

    return similar;
  }

  /**
   * Search knowledge base semantically
   */
  async searchKnowledge(query: string, agentContext?: string, limit: number = 5): Promise<AgentLearning[]> {
    const embedding = await this.generateEmbedding(query);
    
    // Simple text search for now (upgrade to vector similarity)
    let results = await db.select()
      .from(agentLearnings)
      .where(sql`${agentLearnings.problem} ILIKE ${'%' + query + '%'} OR ${agentLearnings.solution} ILIKE ${'%' + query + '%'}`)
      .orderBy(desc(agentLearnings.confidence))
      .limit(limit);

    return results;
  }

  /**
   * Get pattern library
   */
  async getPatterns(): Promise<any[]> {
    return await db.select().from(learningPatterns).orderBy(desc(learningPatterns.successRate));
  }

  /**
   * Track solution reuse (when an agent applies a learning)
   */
  async trackReuse(learningId: number, success: boolean): Promise<void> {
    const learning = await db.select()
      .from(agentLearnings)
      .where(eq(agentLearnings.id, learningId))
      .limit(1);

    if (learning[0]) {
      const newReuseCount = learning[0].reuseCount + 1;
      const currentSuccessRate = learning[0].successRate;
      const newSuccessRate = success 
        ? (currentSuccessRate * learning[0].reuseCount + 1) / newReuseCount
        : (currentSuccessRate * learning[0].reuseCount) / newReuseCount;

      await db.update(agentLearnings)
        .set({
          reuseCount: newReuseCount,
          successRate: newSuccessRate,
        })
        .where(eq(agentLearnings.id, learningId));
    }
  }

  /**
   * Generate embedding for semantic search
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text.substring(0, 8000), // Limit context
      });
      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      return [];
    }
  }

  /**
   * Generate pattern name from problem signature
   */
  private generatePatternName(problemSignature: string): string {
    const words = problemSignature.toLowerCase()
      .split(' ')
      .filter(w => w.length > 3)
      .slice(0, 3);
    return words.join('_') + '_pattern';
  }

  /**
   * Get learning metrics
   */
  async getMetrics(): Promise<any> {
    const totalLearnings = await db.select({ count: sql<number>`count(*)` })
      .from(agentLearnings);

    const totalPatterns = await db.select({ count: sql<number>`count(*)` })
      .from(learningPatterns);

    const avgConfidence = await db.select({ avg: sql<number>`avg(${agentLearnings.confidence})` })
      .from(agentLearnings);

    const avgSuccessRate = await db.select({ avg: sql<number>`avg(${agentLearnings.successRate})` })
      .from(agentLearnings);

    return {
      total_learnings: totalLearnings[0]?.count || 0,
      total_patterns: totalPatterns[0]?.count || 0,
      avg_confidence: avgConfidence[0]?.avg || 0,
      avg_success_rate: avgSuccessRate[0]?.avg || 0,
      knowledge_capture_rate: 'active',
      distribution_speed: '<1 minute',
    };
  }
}

export const learningCoordinator = new LearningCoordinator();
