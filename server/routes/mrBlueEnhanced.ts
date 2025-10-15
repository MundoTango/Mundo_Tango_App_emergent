/**
 * MR BLUE ENHANCED CHAT ENDPOINT
 * Full conversational AI with complete platform knowledge
 */

import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { requireAuth } from '../middleware/secureAuth';
import { aiContextAggregator } from '../services/AIContextAggregator';
import { db } from '../db';
import { mrBlueConversations } from '../../shared/schema';

export const mrBlueEnhancedRouter = Router();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const DEFAULT_MODEL = "claude-sonnet-4-20250514";

interface EnhancedChatRequest {
  message: string;
  pageContext?: {
    page?: string;
    url?: string;
    title?: string;
  };
  includeHistory?: boolean;
  timeWindow?: number; // Hours of context to include
}

/**
 * POST /api/mrblue/enhanced-chat
 * Enhanced Mr Blue with full platform knowledge
 */
mrBlueEnhancedRouter.post('/enhanced-chat', requireAuth, async (req, res) => {
  try {
    const { 
      message, 
      pageContext, 
      includeHistory = true, 
      timeWindow = 24 
    }: EnhancedChatRequest = req.body;

    const userId = (req as any).user.id;

    console.log('🌟 [Mr Blue Enhanced] Request:', {
      user: userId,
      message: message.substring(0, 50),
      hasContext: !!pageContext,
      timeWindow
    });

    // Fetch comprehensive platform context
    const platformContext = await aiContextAggregator.fetchPlatformContext(timeWindow);

    // Build enhanced system prompt
    const systemPrompt = aiContextAggregator.buildEnhancedPrompt(
      message,
      platformContext,
      pageContext
    );

    // Call Claude with enriched context
    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 3072,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
    });

    const aiMessage = response.content[0].type === 'text' 
      ? response.content[0].text 
      : 'Sorry, I could not generate a response.';

    // Store conversation for learning
    await db
      .insert(mrBlueConversations)
      .values({
        userId,
        message,
        response: aiMessage,
        contextUsed: {
          learnings: platformContext.learnings.length,
          visualChanges: platformContext.visualChanges.length,
          agents: platformContext.esaInsights.length,
          timeWindow
        },
        pageContext: pageContext?.page || null
      })
      .catch(err => {
        console.warn('⚠️  Could not store conversation:', err);
      });

    console.log('✅ [Mr Blue Enhanced] Response generated:', {
      length: aiMessage.length,
      contextUsed: {
        learnings: platformContext.summary.totalLearnings,
        visualChanges: platformContext.summary.totalVisualChanges,
        agents: platformContext.summary.totalAgents
      }
    });

    // Return enhanced response with metadata
    res.json({
      response: aiMessage,
      model: DEFAULT_MODEL,
      contextSummary: {
        learnings: platformContext.summary.totalLearnings,
        visualChanges: platformContext.summary.totalVisualChanges,
        componentHealth: platformContext.componentHealth,
        agents: platformContext.summary.totalAgents
      },
      sources: {
        recentLearnings: platformContext.learnings.slice(0, 3),
        recentVisualChanges: platformContext.visualChanges.slice(0, 3),
        activeAgents: platformContext.esaInsights.slice(0, 3)
      },
      tokens: {
        input: response.usage.input_tokens,
        output: response.usage.output_tokens,
      },
    });

  } catch (error) {
    console.error('❌ [Mr Blue Enhanced] Error:', error);
    res.status(500).json({
      response: "I encountered an error while accessing platform knowledge. Please try again.",
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default mrBlueEnhancedRouter;
