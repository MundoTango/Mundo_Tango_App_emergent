/**
 * MR BLUE SIMPLE CHAT ENDPOINT
 * Lightweight JSON endpoint for ScottAI and other simple chat interfaces
 * Uses Claude Sonnet 4.5 but returns clean JSON instead of streaming
 */

import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { requireAuth } from '../middleware/secureAuth';

export const mrBlueSimpleChatRouter = Router();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const DEFAULT_MODEL = "claude-sonnet-4-20250514";

interface SimpleChatRequest {
  message: string;
  context?: {
    page?: string;
    url?: string;
    title?: string;
    elements?: number;
    visualEdits?: string;
  };
  personality?: string;
  agent?: string;
  model?: string;
}

/**
 * POST /api/mrblue/simple-chat
 * Simple JSON endpoint for basic Mr Blue conversations
 */
mrBlueSimpleChatRouter.post('/simple-chat', requireAuth, async (req, res) => {
  try {
    const { message, context, personality, agent, model }: SimpleChatRequest = req.body;

    console.log('💬 [Mr Blue Simple Chat] Request:', {
      message: message.substring(0, 50),
      hasContext: !!context,
      agent: agent || 'Mr Blue',
    });

    // Build context-aware system prompt
    const systemPrompt = `You are Mr Blue, the universal AI companion for the Mundo Tango platform.

${personality || 'You are helpful, direct, and focused. You speak like a knowledgeable colleague who gets things done.'}

CURRENT CONTEXT:
${context ? `
- Page: ${context.page || 'Unknown'}
- URL: ${context.url || '/'}
- Title: ${context.title || 'Mundo Tango'}
- Interactive Elements: ${context.elements || 0}
- Recent Visual Edits: ${context.visualEdits || 'None'}
` : '- No page context available'}

${agent && agent !== 'Mr Blue' ? `
AGENT MODE: ${agent}
You are acting as ${agent}. Respond in the style and expertise of this specialized agent.
` : ''}

INSTRUCTIONS:
- Be specific and reference the current page context when relevant
- If user asks "what page am i on", tell them the exact page name and URL
- Mention visual edits if they exist
- Keep responses concise but helpful
- Use a warm, professional tone`;

    // Call Claude
    const response = await anthropic.messages.create({
      model: model || DEFAULT_MODEL,
      max_tokens: 2048,
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

    console.log('✅ [Mr Blue Simple Chat] Response generated:', {
      length: aiMessage.length,
      model: model || DEFAULT_MODEL,
    });

    // Return clean JSON
    res.json({
      response: aiMessage,
      model: model || DEFAULT_MODEL,
      agent: agent || 'Mr Blue',
      tokens: {
        input: response.usage.input_tokens,
        output: response.usage.output_tokens,
      },
    });

  } catch (error) {
    console.error('❌ [Mr Blue Simple Chat] Error:', error);
    res.status(500).json({
      response: "I encountered an error. Please try again.",
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default mrBlueSimpleChatRouter;
