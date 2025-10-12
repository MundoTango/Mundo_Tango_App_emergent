/**
 * ESA AI Intelligence Network - Vector Database Service
 * Agent #31 (AI Infrastructure)
 * 
 * LanceDB integration for semantic search and pattern storage
 */

import { connect, Table } from 'vectordb';
import { OpenAI } from 'openai';

// Initialize OpenAI for embeddings
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface VectorDocument extends Record<string, unknown> {
  id: string;
  text: string;
  vector: number[];
  metadata: {
    pageRoute?: string;
    userRole?: string;
    intent?: string;
    timestamp: number;
    agentId?: string;
  };
}

interface PatternVector extends Record<string, unknown> {
  id: string;
  pattern: string;
  vector: number[];
  metadata: {
    type: string;
    confidence: number;
    affectedPages: string[];
    severity?: string;
    auditPhase?: number;
  };
}

class AIVectorService {
  private db: any = null;
  private conversationTable: Table | null = null;
  private patternTable: Table | null = null;
  private initialized = false;

  async initialize() {
    if (this.initialized) return;

    try {
      // Connect to LanceDB (creates db/ directory if doesn't exist)
      this.db = await connect('lancedb');
      
      console.log('[AI Vector] LanceDB connected successfully');
      this.initialized = true;
    } catch (error) {
      console.error('[AI Vector] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Generate embedding vector from text using OpenAI
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('[AI Vector] Embedding generation failed:', error);
      throw error;
    }
  }

  /**
   * Store conversation in vector DB for semantic search
   */
  async storeConversation(data: {
    id: string;
    userQuery: string;
    aiResponse: string;
    pageRoute: string;
    userRole?: string;
    intent?: string;
    agentId?: string;
  }): Promise<void> {
    await this.initialize();

    try {
      // Combine query + response for semantic context
      const combinedText = `Query: ${data.userQuery}\nResponse: ${data.aiResponse}`;
      const vector = await this.generateEmbedding(combinedText);

      const document: VectorDocument = {
        id: data.id,
        text: combinedText,
        vector,
        metadata: {
          pageRoute: data.pageRoute,
          userRole: data.userRole,
          intent: data.intent,
          timestamp: Date.now(),
          agentId: data.agentId
        }
      };

      // Create or get conversation table
      if (!this.conversationTable) {
        this.conversationTable = await this.db.createTable('ai_conversations', [document]);
      } else {
        await this.conversationTable.add([document]);
      }

      console.log('[AI Vector] Conversation stored:', data.id);
    } catch (error) {
      console.error('[AI Vector] Store conversation failed:', error);
      throw error;
    }
  }

  /**
   * Find similar conversations (for context-aware responses)
   */
  async findSimilarConversations(query: string, limit: number = 5): Promise<any[]> {
    await this.initialize();

    try {
      if (!this.conversationTable) {
        return [];
      }

      const queryVector = await this.generateEmbedding(query);
      
      const results = await this.conversationTable
        .search(queryVector)
        .limit(limit)
        .execute();

      return results;
    } catch (error) {
      console.error('[AI Vector] Similar search failed:', error);
      return [];
    }
  }

  /**
   * Store learned pattern in vector DB (Agent #68)
   */
  async storePattern(data: {
    id: string;
    pattern: string;
    type: string;
    confidence: number;
    affectedPages: string[];
    severity?: string;
    auditPhase?: number;
  }): Promise<void> {
    await this.initialize();

    try {
      const vector = await this.generateEmbedding(data.pattern);

      const document: PatternVector = {
        id: data.id,
        pattern: data.pattern,
        vector,
        metadata: {
          type: data.type,
          confidence: data.confidence,
          affectedPages: data.affectedPages,
          severity: data.severity,
          auditPhase: data.auditPhase
        }
      };

      // Create or get pattern table
      if (!this.patternTable) {
        this.patternTable = await this.db.createTable('learned_patterns', [document]);
      } else {
        await this.patternTable.add([document]);
      }

      console.log('[AI Vector] Pattern stored:', data.id);
    } catch (error) {
      console.error('[AI Vector] Store pattern failed:', error);
      throw error;
    }
  }

  /**
   * Find similar patterns (detect duplicates/related issues)
   */
  async findSimilarPatterns(pattern: string, limit: number = 5): Promise<any[]> {
    await this.initialize();

    try {
      if (!this.patternTable) {
        return [];
      }

      const queryVector = await this.generateEmbedding(pattern);
      
      const results = await this.patternTable
        .search(queryVector)
        .limit(limit)
        .execute();

      return results;
    } catch (error) {
      console.error('[AI Vector] Pattern search failed:', error);
      return [];
    }
  }

  /**
   * Get semantic context for current page (cross-page AI)
   */
  async getPageContext(pageRoute: string, userQuery?: string): Promise<any> {
    await this.initialize();

    try {
      // Find conversations on this page
      const pageConversations = userQuery 
        ? await this.findSimilarConversations(`${pageRoute}: ${userQuery}`, 3)
        : [];

      // Find patterns affecting this page
      const pagePatterns = await this.findSimilarPatterns(`page: ${pageRoute}`, 3);

      return {
        conversations: pageConversations,
        patterns: pagePatterns,
        hasContext: pageConversations.length > 0 || pagePatterns.length > 0
      };
    } catch (error) {
      console.error('[AI Vector] Get page context failed:', error);
      return { conversations: [], patterns: [], hasContext: false };
    }
  }

  /**
   * Clear vector database (for testing)
   */
  async clearDatabase(): Promise<void> {
    await this.initialize();

    try {
      if (this.conversationTable) {
        await this.db.dropTable('ai_conversations');
        this.conversationTable = null;
      }
      if (this.patternTable) {
        await this.db.dropTable('learned_patterns');
        this.patternTable = null;
      }

      console.log('[AI Vector] Database cleared');
    } catch (error) {
      console.error('[AI Vector] Clear database failed:', error);
      throw error;
    }
  }
}

// Singleton instance
export const aiVectorService = new AIVectorService();
