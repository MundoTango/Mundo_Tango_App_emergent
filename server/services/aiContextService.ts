/**
 * ESA AI Intelligence Network - Cross-Page AI Context Service
 * Agent #33 (Context Management)
 * 
 * Preserves AI context across page transitions for seamless user experience
 */

import { db } from '../db';
import { aiConversationMemory, aiUserPreferences, pageJourneyPatterns } from '@shared/schema';
import { eq, desc, and } from 'drizzle-orm';
import { aiVectorService } from './aiVectorService';
import { v4 as uuidv4 } from 'uuid';

interface PageContext {
  currentPage: string;
  previousPages: string[];
  userRole: string;
  intent?: string;
  timeOnPage: number;
}

interface AIContext {
  sessionId: string;
  conversationHistory: any[];
  userPreferences: any;
  journeyContext: any;
  predictedNextPage?: string;
  suggestedActions?: string[];
}

class AIContextService {
  private activeContexts = new Map<number, AIContext>(); // userId -> context

  /**
   * Initialize AI context for user session
   */
  async initializeContext(userId: number, pageRoute: string): Promise<string> {
    try {
      const sessionId = uuidv4();

      // Get user preferences
      const [preferences] = await db.select()
        .from(aiUserPreferences)
        .where(eq(aiUserPreferences.userId, userId));

      // Get recent conversation history
      const history = await db.select()
        .from(aiConversationMemory)
        .where(eq(aiConversationMemory.userId, userId))
        .orderBy(desc(aiConversationMemory.createdAt))
        .limit(5);

      const context: AIContext = {
        sessionId,
        conversationHistory: history,
        userPreferences: preferences || {},
        journeyContext: {
          pages: [pageRoute],
          startTime: Date.now()
        }
      };

      this.activeContexts.set(userId, context);

      console.log(`[AI Context] Initialized for user ${userId}, session ${sessionId}`);
      return sessionId;
    } catch (error) {
      console.error('[AI Context] Initialize failed:', error);
      throw error;
    }
  }

  /**
   * Update context when user navigates to new page
   */
  async updatePageContext(
    userId: number, 
    sessionId: string, 
    pageRoute: string,
    timeOnPrevPage: number
  ): Promise<void> {
    try {
      const context = this.activeContexts.get(userId);
      
      if (!context || context.sessionId !== sessionId) {
        console.warn(`[AI Context] No active context for user ${userId}`);
        return;
      }

      // Update journey
      context.journeyContext.pages.push(pageRoute);
      context.journeyContext.timeOnPage = context.journeyContext.timeOnPage || {};
      context.journeyContext.timeOnPage[pageRoute] = timeOnPrevPage;

      // Predict next page based on journey patterns
      const prediction = await this.predictNextPage(
        context.journeyContext.pages,
        context.userPreferences.userRole || 'member'
      );

      if (prediction) {
        context.predictedNextPage = prediction.nextPage;
        context.suggestedActions = this.generateSuggestions(prediction);
      }

      // Get semantic context from vector DB
      const vectorContext = await aiVectorService.getPageContext(pageRoute);
      
      if (vectorContext.hasContext) {
        context.journeyContext.relatedConversations = vectorContext.conversations;
        context.journeyContext.knownPatterns = vectorContext.patterns;
      }

      this.activeContexts.set(userId, context);

      console.log(`[AI Context] Updated for user ${userId}: ${pageRoute}`);
    } catch (error) {
      console.error('[AI Context] Update page context failed:', error);
      throw error;
    }
  }

  /**
   * Get AI context for current page (for AI help generation)
   */
  async getContext(userId: number, sessionId: string): Promise<AIContext | null> {
    try {
      const context = this.activeContexts.get(userId);
      
      if (!context || context.sessionId !== sessionId) {
        console.warn(`[AI Context] No context found for user ${userId}`);
        return null;
      }

      return context;
    } catch (error) {
      console.error('[AI Context] Get context failed:', error);
      return null;
    }
  }

  /**
   * Store conversation in context
   */
  async addConversation(
    userId: number,
    sessionId: string,
    conversation: any
  ): Promise<void> {
    try {
      const context = this.activeContexts.get(userId);
      
      if (!context || context.sessionId !== sessionId) {
        console.warn(`[AI Context] Cannot add conversation - no context`);
        return;
      }

      context.conversationHistory.push(conversation);

      // Keep only last 10 conversations in memory
      if (context.conversationHistory.length > 10) {
        context.conversationHistory.shift();
      }

      this.activeContexts.set(userId, context);
    } catch (error) {
      console.error('[AI Context] Add conversation failed:', error);
      throw error;
    }
  }

  /**
   * End session and clean up context
   */
  async endSession(userId: number, sessionId: string): Promise<void> {
    try {
      const context = this.activeContexts.get(userId);
      
      if (!context || context.sessionId !== sessionId) {
        return;
      }

      // Log journey for learning (Agent #71)
      const journeyData = {
        userId,
        pages: context.journeyContext.pages,
        timePerPage: context.journeyContext.timeOnPage || {},
        role: context.userPreferences.userRole || 'member',
        sessionDuration: Date.now() - context.journeyContext.startTime
      };

      // This would call aiLearningService.learnJourneyPattern(journeyData)
      console.log(`[AI Context] Session ended for user ${userId}:`, journeyData);

      this.activeContexts.delete(userId);
    } catch (error) {
      console.error('[AI Context] End session failed:', error);
      throw error;
    }
  }

  /**
   * Helper: Predict next page based on journey patterns
   */
  private async predictNextPage(
    pages: string[],
    userRole: string
  ): Promise<any> {
    try {
      const currentPage = pages[pages.length - 1];

      const patterns = await db.select()
        .from(pageJourneyPatterns)
        .where(and(
          eq(pageJourneyPatterns.userRole, userRole),
          eq(pageJourneyPatterns.isActive, true)
        ))
        .orderBy(desc(pageJourneyPatterns.confidence))
        .limit(5);

      // Find pattern that matches current journey
      for (const pattern of patterns) {
        const sequence = pattern.journeySequence || [];
        const currentIndex = sequence.indexOf(currentPage);
        
        if (currentIndex >= 0 && currentIndex < sequence.length - 1) {
          return {
            nextPage: sequence[currentIndex + 1],
            probability: pattern.predictionProbability,
            confidence: pattern.confidence,
            pattern: pattern.patternName
          };
        }
      }

      return null;
    } catch (error) {
      console.error('[AI Context] Predict next page failed:', error);
      return null;
    }
  }

  /**
   * Helper: Generate action suggestions based on prediction
   */
  private generateSuggestions(prediction: any): string[] {
    const suggestions: string[] = [];

    if (prediction.probability > 0.7) {
      suggestions.push(`Most users go to ${prediction.nextPage} next`);
    }

    if (prediction.nextPage.includes('/apply')) {
      suggestions.push(`Ready to apply? We can help you fill out the form`);
    } else if (prediction.nextPage.includes('/housing')) {
      suggestions.push(`Looking for housing? Browse verified listings`);
    } else if (prediction.nextPage.includes('/events')) {
      suggestions.push(`Discover events happening near you`);
    }

    return suggestions;
  }

  /**
   * Get active session count (for monitoring)
   */
  getActiveSessionCount(): number {
    return this.activeContexts.size;
  }

  /**
   * Clear stale contexts (cleanup job)
   */
  clearStaleContexts(maxAgeMs: number = 30 * 60 * 1000): void {
    const now = Date.now();
    
    for (const [userId, context] of this.activeContexts.entries()) {
      const sessionAge = now - (context.journeyContext.startTime || 0);
      
      if (sessionAge > maxAgeMs) {
        console.log(`[AI Context] Clearing stale context for user ${userId}`);
        this.activeContexts.delete(userId);
      }
    }
  }
}

// Singleton instance
export const aiContextService = new AIContextService();

// Cleanup job: run every 10 minutes
setInterval(() => {
  aiContextService.clearStaleContexts();
}, 10 * 60 * 1000);
