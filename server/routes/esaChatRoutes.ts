/**
 * ESA Mind Map Chat Endpoint
 * Context-aware AI chat for ESA Framework navigation
 */

import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';

export const esaChatRouter = Router();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const DEFAULT_MODEL = "claude-sonnet-4-20250514";

// ESA Framework knowledge base
const ESA_KNOWLEDGE = `You are the ESA Mind AI assistant - an expert on the ESA Framework.

ESA FRAMEWORK STRUCTURE:
- 125 Agents organized in 61 layers
- 559 self-aware UI components
- 19-phase tiered audit system
- Complete UI/UX autonomy capabilities

CURRENT CONTEXT:
- Phase 12 Component Autonomy System: ACTIVE (60% complete)
- All 559 components trained to 100%
- Mr Blue AI Companion: Operational
- Visual Page Editor: Integrated with learning system
- ESA Mind Map: Interactive intelligence dashboard

YOUR ROLE:
- Help users navigate the ESA Framework
- Explain agent relationships and dependencies
- Guide through quality gates and audit phases
- Provide ESA-compliant implementation suggestions
- Answer questions about specific agents or layers

TONE:
- Technical but approachable
- Direct and efficient
- Use emojis sparingly for clarity (🎯 ✅ 📊)
`;

interface ChatRequest {
  message: string;
  pageContext: {
    route: string;
    agents: number[];
    summary: string;
  };
  history?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

esaChatRouter.post('/chat', async (req, res) => {
  try {
    const { message, pageContext, history = [] }: ChatRequest = req.body;

    console.log('🗺️ [ESA Chat] Request:', { message, route: pageContext.route });

    // Build context-aware system prompt
    const systemPrompt = `${ESA_KNOWLEDGE}

CURRENT PAGE CONTEXT:
- Route: ${pageContext.route}
- Built by Agents: ${pageContext.agents.join(', ')}
- Summary: ${pageContext.summary}

Answer the user's question with this context in mind. Be specific about which agents are involved on this page.`;

    // Call Claude
    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        ...history.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
        {
          role: 'user',
          content: message,
        },
      ],
    });

    const aiMessage = response.content[0].type === 'text' 
      ? response.content[0].text 
      : 'Sorry, I could not generate a response.';

    console.log('✅ [ESA Chat] Response generated');

    res.json({
      message: aiMessage,
      model: DEFAULT_MODEL,
      tokens: response.usage,
    });

  } catch (error) {
    console.error('❌ [ESA Chat] Error:', error);
    res.status(500).json({
      message: 'Sorry, I encountered an error. Please try again.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default esaChatRouter;
