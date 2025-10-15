/**
 * ML Confidence Scoring System
 * Phase 7: ESA Integration
 * 
 * Purpose: Calculate confidence scores for agent learnings using ML-based analysis
 * Algorithm: Confidence = Historical Accuracy (40%) + Context Similarity (30%) + Agent Expertise (30%)
 * 
 * Uses LanceDB for semantic similarity matching between current and historical contexts
 */

import { connect, Table } from '@lancedb/lancedb';
import { db } from '../../db';
import { agentLearnings, agentSelfTests, esaAgents } from '../../../shared/schema';
import { eq, sql } from 'drizzle-orm';
import { mlEnsemble } from '../ml/MLEnsemble';

interface ConfidenceFactors {
  historicalSuccessRate: number;  // 0-1
  contextSimilarity: number;      // 0-1 (from LanceDB vector search)
  agentExpertise: number;         // 0-1
}

interface ConfidenceResult {
  confidence: number;             // Final 0-1 score
  factors: ConfidenceFactors;
  accuracy: 'high' | 'medium' | 'low';
  recommendation: string;
}

interface LearningEmbedding {
  id: number;
  agentId: string;
  pattern: string;
  problem: string;
  solution: string;
  vector: number[];  // 768-dim embedding
  successCount: number;
  failureCount: number;
}

class MLConfidenceScorer {
  private lanceDb: any = null;
  private learningTable: Table<LearningEmbedding> | null = null;
  private vectorDimension = 768; // OpenAI embeddings dimension
  private mlEnsembleLoaded = false;
  private useMLEnsemble = true; // Phase 9: Toggle ML ensemble usage

  /**
   * Initialize LanceDB connection and learning embeddings table
   */
  async initialize() {
    // Phase 9: Load ML Ensemble model
    if (this.useMLEnsemble) {
      const loaded = await mlEnsemble.loadModel();
      this.mlEnsembleLoaded = loaded;
      if (loaded) {
        console.log('✅ [ML Scorer] ML Ensemble model loaded successfully');
      }
    }
    try {
      // Connect to LanceDB (in-memory for Replit compatibility)
      this.lanceDb = await connect('data/lancedb');
      
      // Try to open existing table or create new one
      try {
        this.learningTable = await this.lanceDb.openTable('learning_embeddings');
        console.log('✅ [ML Scorer] Connected to existing LanceDB learning_embeddings table');
      } catch (err) {
        // Table doesn't exist, create it
        const sampleData: LearningEmbedding[] = [];
        this.learningTable = await this.lanceDb.createTable('learning_embeddings', sampleData);
        console.log('✅ [ML Scorer] Created new LanceDB learning_embeddings table');
      }
    } catch (error) {
      console.error('❌ [ML Scorer] Failed to initialize LanceDB:', error);
      // Continue without LanceDB - use fallback scoring
    }
  }

  /**
   * Calculate confidence score for a learning pattern
   * Phase 9: Enhanced with ML Ensemble prediction
   */
  async calculateConfidence(
    agentId: string,
    pattern: string,
    context: string
  ): Promise<ConfidenceResult> {
    await this.ensureInitialized();

    // Get the three confidence factors
    const historicalSuccessRate = await this.getHistoricalSuccessRate(agentId, pattern);
    const contextSimilarity = await this.getContextSimilarity(pattern, context);
    const agentExpertise = await this.getAgentExpertise(agentId);

    const factors: ConfidenceFactors = {
      historicalSuccessRate,
      contextSimilarity,
      agentExpertise
    };

    let confidence: number;

    // Phase 9: Use ML Ensemble if loaded
    if (this.mlEnsembleLoaded && this.useMLEnsemble) {
      // Prepare features for ML model
      const features = [
        0, // strategyCode (placeholder)
        agentExpertise,
        0.5, // codeComplexity (placeholder)
        historicalSuccessRate,
        0.3 // executionTime (normalized)
      ];

      const prediction = mlEnsemble.predict(features);
      confidence = prediction.confidence;
    } else {
      // Fallback to heuristic calculation
      confidence = (
        historicalSuccessRate * 0.4 +  // 40% weight on past success
        contextSimilarity * 0.3 +       // 30% weight on context match
        agentExpertise * 0.3            // 30% weight on agent skill
      );
    }

    // Determine accuracy tier
    let accuracy: 'high' | 'medium' | 'low';
    let recommendation: string;

    if (confidence >= 0.85) {
      accuracy = 'high';
      recommendation = 'Auto-apply with confidence. Pattern has strong historical success.';
    } else if (confidence >= 0.60) {
      accuracy = 'medium';
      recommendation = 'Apply with validation. Manual review recommended.';
    } else {
      accuracy = 'low';
      recommendation = 'Human review required. Low confidence in automatic application.';
    }

    return {
      confidence,
      factors,
      accuracy,
      recommendation
    };
  }

  /**
   * Phase 9: Toggle ML Ensemble usage
   */
  setUseMLEnsemble(enabled: boolean): void {
    this.useMLEnsemble = enabled;
    console.log(`[ML Scorer] ML Ensemble ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Phase 9: Get ML Ensemble status
   */
  getMLEnsembleStatus(): { loaded: boolean; enabled: boolean } {
    return {
      loaded: this.mlEnsembleLoaded,
      enabled: this.useMLEnsemble
    };
  }

  /**
   * Factor 1: Historical Success Rate (40% weight)
   * How often has this pattern worked in the past?
   */
  private async getHistoricalSuccessRate(agentId: string, pattern: string): Promise<number> {
    try {
      // Get all learnings for this agent with this pattern
      const learnings = await db
        .select()
        .from(agentLearnings)
        .where(eq(agentLearnings.agentId, agentId));

      // Filter by similar pattern (simple string match for now)
      const similarLearnings = learnings.filter(l => 
        l.pattern.toLowerCase().includes(pattern.toLowerCase()) ||
        pattern.toLowerCase().includes(l.pattern.toLowerCase())
      );

      if (similarLearnings.length === 0) {
        return 0.5; // No history = neutral score
      }

      // Calculate success rate from confidence scores
      const avgConfidence = similarLearnings.reduce((sum, l) => 
        sum + parseFloat(l.confidence), 0
      ) / similarLearnings.length;

      return avgConfidence;
    } catch (error) {
      console.error('Error calculating historical success rate:', error);
      return 0.5;
    }
  }

  /**
   * Factor 2: Context Similarity (30% weight)
   * How similar is current context to past successful contexts?
   * Uses LanceDB vector search for semantic similarity
   */
  private async getContextSimilarity(pattern: string, context: string): Promise<number> {
    try {
      // If LanceDB not available, use simple text similarity
      if (!this.learningTable) {
        return this.fallbackTextSimilarity(pattern, context);
      }

      // Generate embedding for current context
      const embedding = await this.generateEmbedding(context);

      // Search for similar contexts in LanceDB
      const results = await this.learningTable
        .search(embedding)
        .limit(5)
        .execute();

      if (results.length === 0) {
        return 0.5; // No similar contexts found
      }

      // Use top result's similarity score
      // LanceDB returns distance, convert to similarity (0-1)
      const topMatch = results[0];
      const distance = topMatch._distance || 1.0;
      const similarity = Math.max(0, 1 - distance);

      return similarity;
    } catch (error) {
      console.error('Error calculating context similarity:', error);
      return this.fallbackTextSimilarity(pattern, context);
    }
  }

  /**
   * Factor 3: Agent Expertise (30% weight)
   * Agent's overall competency in their domain
   */
  private async getAgentExpertise(agentId: string): Promise<number> {
    try {
      // Get agent from ESA registry
      const [agent] = await db
        .select()
        .from(esaAgents)
        .where(eq(esaAgents.id, agentId))
        .limit(1);

      if (agent?.expertiseScore) {
        return agent.expertiseScore;
      }

      // Calculate from test pass rate
      const tests = await db
        .select()
        .from(agentSelfTests)
        .where(eq(agentSelfTests.agentId, agentId));

      if (tests.length === 0) {
        return 0.5; // No test history = neutral
      }

      const passedTests = tests.filter(t => t.testResult === 'pass').length;
      const passRate = passedTests / tests.length;

      return passRate;
    } catch (error) {
      console.error('Error calculating agent expertise:', error);
      return 0.5;
    }
  }

  /**
   * Generate embedding vector for text using simple hash-based approach
   * (Placeholder - in production would use OpenAI embeddings)
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    // Simple hash-based embedding for demo
    // In production, use: const embedding = await openai.embeddings.create({ input: text, model: 'text-embedding-3-small' })
    
    const embedding = new Array(this.vectorDimension).fill(0);
    const words = text.toLowerCase().split(/\s+/);
    
    words.forEach((word, idx) => {
      const hash = this.simpleHash(word);
      embedding[hash % this.vectorDimension] += 1;
    });

    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => magnitude > 0 ? val / magnitude : 0);
  }

  /**
   * Simple hash function for text embedding
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  /**
   * Fallback text similarity using Jaccard similarity
   */
  private fallbackTextSimilarity(text1: string, text2: string): Promise<number> {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    const similarity = intersection.size / union.size;
    return Promise.resolve(similarity);
  }

  /**
   * Add a learning to the vector database
   */
  async addLearningEmbedding(
    id: number,
    agentId: string,
    pattern: string,
    problem: string,
    solution: string
  ) {
    await this.ensureInitialized();

    if (!this.learningTable) {
      console.warn('[ML Scorer] LanceDB not available, skipping embedding storage');
      return;
    }

    try {
      // Generate embedding for the context
      const contextText = `${pattern} ${problem} ${solution}`;
      const vector = await this.generateEmbedding(contextText);

      const embedding: LearningEmbedding = {
        id,
        agentId,
        pattern,
        problem,
        solution,
        vector,
        successCount: 1,
        failureCount: 0
      };

      await this.learningTable.add([embedding]);
      console.log(`✅ [ML Scorer] Added learning embedding for agent ${agentId}`);
    } catch (error) {
      console.error('Error adding learning embedding:', error);
    }
  }

  /**
   * Validate a learning pattern's accuracy over time
   */
  async validateLearning(learningId: number): Promise<{
    validated: boolean;
    confidence: number;
    usageCount: number;
    successRate: number;
  }> {
    try {
      // Get the learning
      const [learning] = await db
        .select()
        .from(agentLearnings)
        .where(eq(agentLearnings.id, learningId))
        .limit(1);

      if (!learning) {
        throw new Error('Learning not found');
      }

      // Get all tests since this learning was created
      const testsAfter = await db
        .select()
        .from(agentSelfTests)
        .where(sql`${agentSelfTests.agentId} = ${learning.agentId} 
                   AND ${agentSelfTests.runAt} > ${learning.createdAt}`);

      // Count how many times this pattern helped
      const relevantTests = testsAfter.filter(t => 
        t.testName.toLowerCase().includes(learning.pattern.toLowerCase()) ||
        t.errorMessage?.toLowerCase().includes(learning.pattern.toLowerCase())
      );

      const usageCount = relevantTests.length;
      const successCount = relevantTests.filter(t => t.testResult === 'pass').length;
      const successRate = usageCount > 0 ? successCount / usageCount : 0;

      // Validated if used 3+ times with 80%+ success
      const validated = usageCount >= 3 && successRate >= 0.8;

      // Recalculate confidence based on actual usage
      const newConfidence = validated ? 
        Math.min(0.95, parseFloat(learning.confidence) + (successRate * 0.2)) :
        parseFloat(learning.confidence);

      return {
        validated,
        confidence: newConfidence,
        usageCount,
        successRate
      };
    } catch (error: any) {
      console.error('Error validating learning:', error);
      throw error;
    }
  }

  /**
   * Get learning accuracy trends over time
   */
  async getLearningAccuracy(agentId?: string): Promise<{
    patterns: Array<{
      pattern: string;
      timesApplied: number;
      successRate: number;
      trending: 'up' | 'down' | 'stable';
    }>;
    overallAccuracy: number;
  }> {
    try {
      let learnings;
      
      if (agentId) {
        learnings = await db
          .select()
          .from(agentLearnings)
          .where(eq(agentLearnings.agentId, agentId));
      } else {
        learnings = await db.select().from(agentLearnings);
      }

      // Group by pattern
      const patternMap = new Map<string, { successes: number; total: number }>();

      for (const learning of learnings) {
        const pattern = learning.pattern;
        const confidence = parseFloat(learning.confidence);
        
        if (!patternMap.has(pattern)) {
          patternMap.set(pattern, { successes: 0, total: 0 });
        }

        const stats = patternMap.get(pattern)!;
        stats.total += 1;
        if (confidence > 0.7) stats.successes += 1;
      }

      // Convert to array
      const patterns = Array.from(patternMap.entries()).map(([pattern, stats]) => ({
        pattern,
        timesApplied: stats.total,
        successRate: stats.total > 0 ? stats.successes / stats.total : 0,
        trending: 'stable' as const // TODO: Calculate trend from historical data
      }));

      // Calculate overall accuracy
      const totalSuccesses = Array.from(patternMap.values()).reduce((sum, s) => sum + s.successes, 0);
      const totalLearnings = Array.from(patternMap.values()).reduce((sum, s) => sum + s.total, 0);
      const overallAccuracy = totalLearnings > 0 ? totalSuccesses / totalLearnings : 0;

      return { patterns, overallAccuracy };
    } catch (error) {
      console.error('Error getting learning accuracy:', error);
      return { patterns: [], overallAccuracy: 0 };
    }
  }

  /**
   * Ensure LanceDB is initialized
   */
  private async ensureInitialized() {
    if (!this.lanceDb) {
      await this.initialize();
    }
  }
}

// Singleton instance
export const mlConfidenceScorer = new MLConfidenceScorer();
