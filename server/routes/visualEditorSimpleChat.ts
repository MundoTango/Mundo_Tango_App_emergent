/**
 * VISUAL EDITOR SIMPLE CHAT ENDPOINT
 * AI assistance for the Visual Editor - context-aware suggestions
 * Part of Phase 12 Autonomous Learning System
 */

import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { requireAuth } from '../middleware/secureAuth';

export const visualEditorSimpleChatRouter = Router();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const DEFAULT_MODEL = "claude-sonnet-4-20250514";

interface VisualEditorChatRequest {
  message: string;
  context?: {
    page?: string;
    url?: string;
    selectedComponent?: {
      id: string;
      name: string;
      type: string;
    };
    recentEdits?: Array<{
      type: string;
      component: string;
      description: string;
    }>;
  };
  model?: string;
}

/**
 * POST /api/visual-editor/simple-chat
 * AI assistance for Visual Editor interactions
 */
visualEditorSimpleChatRouter.post('/simple-chat', requireAuth, async (req, res) => {
  try {
    const { message, context, model }: VisualEditorChatRequest = req.body;

    console.log('🎨 [Visual Editor AI] Request:', {
      message: message.substring(0, 50),
      page: context?.page,
      selectedComponent: context?.selectedComponent?.name,
    });

    // Build context-aware system prompt
    const systemPrompt = `You are Mr Blue's Visual Editor AI assistant.

Your role is to help users edit their UI visually and confirm changes for autonomous learning.

CURRENT CONTEXT:
${context ? `
- Page: ${context.page || 'Unknown'}
- URL: ${context.url || '/'}
${context.selectedComponent ? `
- Selected Component: ${context.selectedComponent.name} (${context.selectedComponent.type})
- Component ID: ${context.selectedComponent.id}
` : ''}
${context.recentEdits && context.recentEdits.length > 0 ? `
- Recent Edits:
${context.recentEdits.map(e => `  • ${e.description}`).join('\n')}
` : '- No recent edits'}
` : '- No context available'}

YOUR RESPONSIBILITIES:
1. Confirm user changes: "I see you moved the Login Button right 50px. Is this correct?"
2. Suggest improvements: "The button might look better with more padding"
3. Explain implications: "Moving this will affect mobile layout"
4. Coordinate learning: "I'll teach this component about the new position"

COMMUNICATION STYLE:
- Be specific and reference the actual component names
- Confirm changes before applying learning
- Use a warm, collaborative tone
- Keep responses concise (2-3 sentences)`;

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

    console.log('✅ [Visual Editor AI] Response generated:', {
      length: aiMessage.length,
      model: model || DEFAULT_MODEL,
    });

    // Return clean JSON
    res.json({
      response: aiMessage,
      model: model || DEFAULT_MODEL,
      agent: 'Visual Editor AI',
      tokens: {
        input: response.usage.input_tokens,
        output: response.usage.output_tokens,
      },
    });

  } catch (error) {
    console.error('❌ [Visual Editor AI] Error:', error);
    res.status(500).json({
      response: "I encountered an error. Please try again.",
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default visualEditorSimpleChatRouter;
