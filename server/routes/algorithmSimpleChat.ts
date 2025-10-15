/**
 * ALGORITHM AGENT SIMPLE CHAT ENDPOINT
 * AI assistance for 30 algorithm agents (A1-A30)
 * Part of Phase 12 Autonomous Learning System
 */

import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { requireAuth } from '../middleware/secureAuth';

export const algorithmSimpleChatRouter = Router();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const DEFAULT_MODEL = "claude-sonnet-4-20250514";

// Algorithm agent metadata
const ALGORITHM_AGENTS = {
  'A1': { name: 'Memories Feed Agent', domain: 'Feed Ranking' },
  'A2': { name: 'Friend Recommendations Agent', domain: 'Social Graph' },
  'A3': { name: 'Event Recommendations Agent', domain: 'Events' },
  'A4': { name: 'Search Relevance Agent', domain: 'Search' },
  'A5': { name: 'Notification Priority Agent', domain: 'Notifications' },
  'A6': { name: 'Content Moderation Agent', domain: 'Safety' },
  'A7': { name: 'Housing Match Agent', domain: 'Marketplace' },
  'A8': { name: 'Sentiment Analysis Agent', domain: 'NLP' },
  'A9': { name: 'Topic Extraction Agent', domain: 'NLP' },
  'A10': { name: 'User Clustering Agent', domain: 'ML' },
  'A11': { name: 'Churn Prediction Agent', domain: 'ML' },
  'A12': { name: 'Spam Detection Agent', domain: 'Safety' },
  'A13': { name: 'Image Recognition Agent', domain: 'Vision' },
  'A14': { name: 'Translation Quality Agent', domain: 'i18n' },
  'A15': { name: 'Voice Commands Agent', domain: 'Voice' },
  'A16': { name: 'Cache Strategy Agent', domain: 'Performance' },
  'A17': { name: 'Query Optimization Agent', domain: 'Database' },
  'A18': { name: 'Load Balancing Agent', domain: 'Infrastructure' },
  'A19': { name: 'Resource Allocation Agent', domain: 'Infrastructure' },
  'A20': { name: 'Rate Limiting Agent', domain: 'Security' },
  'A21': { name: 'CDN Routing Agent', domain: 'Performance' },
  'A22': { name: 'Background Jobs Agent', domain: 'Queue' },
  'A23': { name: 'Fraud Detection Agent', domain: 'Security' },
  'A24': { name: 'Access Control Agent', domain: 'Authorization' },
  'A25': { name: 'Data Encryption Agent', domain: 'Security' },
  'A26': { name: 'Audit Scoring Agent', domain: 'Quality' },
  'A27': { name: 'Map Route Planning Agent', domain: 'Maps' },
  'A28': { name: 'Calendar Scheduling Agent', domain: 'Events' },
  'A29': { name: 'Payment Processing Agent', domain: 'Payments' },
  'A30': { name: 'Analytics Aggregation Agent', domain: 'Analytics' },
} as const;

interface AlgorithmChatRequest {
  message: string;
  context?: {
    currentPerformance?: any;
    userFeedback?: string[];
    testResults?: any;
  };
  model?: string;
}

/**
 * POST /api/algorithms/:id/simple-chat
 * AI assistance for algorithm agents
 */
algorithmSimpleChatRouter.post('/:id/simple-chat', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { message, context, model }: AlgorithmChatRequest = req.body;

    // Validate algorithm ID
    const algorithmId = id.toUpperCase() as keyof typeof ALGORITHM_AGENTS;
    const algorithm = ALGORITHM_AGENTS[algorithmId];

    if (!algorithm) {
      return res.status(404).json({
        response: `Algorithm ${id} not found. Valid IDs: A1-A30`,
        error: 'Invalid algorithm ID',
      });
    }

    console.log('🔬 [Algorithm AI] Request:', {
      algorithm: algorithm.name,
      domain: algorithm.domain,
      message: message.substring(0, 50),
    });

    // Build algorithm-specific system prompt
    const systemPrompt = `You are an AI assistant for the ${algorithm.name}.

ALGORITHM INFORMATION:
- ID: ${algorithmId}
- Name: ${algorithm.name}
- Domain: ${algorithm.domain}

${context?.currentPerformance ? `CURRENT PERFORMANCE:\n${JSON.stringify(context.currentPerformance, null, 2)}\n` : ''}
${context?.userFeedback ? `USER FEEDBACK:\n${context.userFeedback.join('\n')}\n` : ''}

YOUR ROLE:
1. Analyze algorithm performance and suggest optimizations
2. Explain how the algorithm works to users
3. Debug issues and recommend parameter tuning
4. Suggest A/B tests for improvements

RESPONSE STYLE:
- Technical but accessible
- Data-driven recommendations
- Explain trade-offs
- Keep responses focused (3-4 sentences)`;

    // Call Claude
    const response = await anthropic.messages.create({
      model: model || DEFAULT_MODEL,
      max_tokens: 1024,
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

    console.log('✅ [Algorithm AI] Response generated for', algorithm.name);

    // Return clean JSON
    res.json({
      response: aiMessage,
      model: model || DEFAULT_MODEL,
      agent: `Algorithm ${algorithmId}: ${algorithm.name}`,
      algorithmInfo: {
        id: algorithmId,
        name: algorithm.name,
        domain: algorithm.domain,
      },
      tokens: {
        input: response.usage.input_tokens,
        output: response.usage.output_tokens,
      },
    });

  } catch (error) {
    console.error('❌ [Algorithm AI] Error:', error);
    res.status(500).json({
      response: "I encountered an error. Please try again.",
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default algorithmSimpleChatRouter;
