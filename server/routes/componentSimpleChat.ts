/**
 * COMPONENT AGENT SIMPLE CHAT ENDPOINT
 * Allows individual components to ask for AI help
 * Part of Phase 12 Autonomous Learning System
 */

import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { requireAuth } from '../middleware/secureAuth';
import { db } from '../db';
import { componentAgents } from '../../shared/schema';
import { eq } from 'drizzle-orm';

export const componentSimpleChatRouter = Router();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const DEFAULT_MODEL = "claude-sonnet-4-20250514";

interface ComponentChatRequest {
  message: string;
  componentId: string;
  context?: {
    issue?: string;
    attemptedFix?: string;
    testResults?: any;
    colleagues?: string[];
  };
  model?: string;
}

/**
 * POST /api/component/:id/simple-chat
 * AI assistance for autonomous component learning
 */
componentSimpleChatRouter.post('/:id/simple-chat', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { message, context, model }: ComponentChatRequest = req.body;

    // Get component info from database
    const [component] = await db
      .select()
      .from(componentAgents)
      .where(eq(componentAgents.componentName, id));

    if (!component) {
      return res.status(404).json({
        response: `Component ${id} not found in registry.`,
        error: 'Component not registered',
      });
    }

    console.log('🧩 [Component AI] Request:', {
      component: component.componentName,
      type: component.componentType,
      health: component.currentHealth,
      message: message.substring(0, 50),
    });

    // Build component-specific system prompt
    const systemPrompt = `You are an AI assistant for autonomous component learning.

COMPONENT INFORMATION:
- Name: ${component.componentName}
- Type: ${component.componentType}
- Path: ${component.componentPath}
- Current Health: ${component.currentHealth}
- Learning Count: ${component.learningCount}
- Test Coverage: ${component.testCoverage}%

${context?.issue ? `CURRENT ISSUE:\n${context.issue}\n` : ''}
${context?.attemptedFix ? `ATTEMPTED FIX:\n${context.attemptedFix}\n` : ''}
${context?.colleagues ? `CONSULTED COLLEAGUES:\n${context.colleagues.join(', ')}\n` : ''}

YOUR ROLE:
1. Help this component understand what went wrong
2. Suggest fix strategies based on the issue
3. Recommend colleagues to consult if needed
4. Guide escalation to parent agents if stuck

RESPONSE FORMAT:
- Be technical and specific
- Reference React/TypeScript best practices
- Suggest testable fixes
- Keep responses focused (3-4 sentences max)`;

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

    console.log('✅ [Component AI] Response generated for', component.componentName);

    // Return clean JSON
    res.json({
      response: aiMessage,
      model: model || DEFAULT_MODEL,
      agent: `Component Agent: ${component.componentName}`,
      componentInfo: {
        name: component.componentName,
        type: component.componentType,
        health: component.currentHealth,
      },
      tokens: {
        input: response.usage.input_tokens,
        output: response.usage.output_tokens,
      },
    });

  } catch (error) {
    console.error('❌ [Component AI] Error:', error);
    res.status(500).json({
      response: "I encountered an error. Please try again.",
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default componentSimpleChatRouter;
