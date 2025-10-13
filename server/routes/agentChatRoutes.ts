/**
 * TRACK 2: Agent Chat Service
 * AI-powered conversations with context-aware responses
 */

import { Router } from 'express';
import { requireAuth } from '../middleware/secureAuth';
import OpenAI from 'openai';

const router = Router();

// Initialize OpenAI (using Replit AI integration if available)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.REPLIT_AI_API_KEY
});

// Agent personalities and expertise
const agentPersonalities: Record<string, string> = {
  // Page Agents (P1-P88)
  P1: "I'm P1, the Login Page expert. I specialize in authentication UX, form validation, and security best practices.",
  P2: "I'm P2, the Register Page specialist. I ensure smooth user onboarding with proper validation and helpful error messages.",
  P34: "I'm P34, The Plan expert. I manage project tracking, story cards, and team collaboration workflows.",
  
  // ESA Agents
  ESA1: "I'm ESA1, Infrastructure Coordinator. I handle backend architecture, APIs, and system design.",
  ESA2: "I'm ESA2, Frontend Coordinator. I manage UI components, state management, and user interactions.",
  ESA3: "I'm ESA3, Background Processor. I optimize async operations, job queues, and performance.",
  ESA5: "I'm ESA5, Business Logic expert. I ensure proper data flow and business rule implementation.",
  ESA11: "I'm ESA11, Aurora Tide Design System expert. I maintain consistent UI patterns and glassmorphic aesthetics.",
  ESA48: "I'm ESA48, UI/UX Design specialist. I focus on user experience, accessibility, and design patterns.",
  
  // Mr Blue Agents
  MB6: "I'm MB6, Visual Editor. I help build and modify UI visually with AI-powered code generation.",
};

/**
 * POST /api/agent-chat/message
 * Send message to AI agent and get context-aware response
 */
router.post('/message', requireAuth, async (req, res) => {
  try {
    const { featureId, message, pageAgent, matchedAgents = [], history = [] } = req.body;

    // Determine which agent should respond (prefer page agent, then first matched)
    const respondingAgent = pageAgent || matchedAgents[0] || 'ESA2';
    const agentPersonality = agentPersonalities[respondingAgent] || 
      `I'm ${respondingAgent}, here to help you with this task.`;

    // Build context from history
    const conversationHistory = history.slice(-5).map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));

    // Create system prompt
    const systemPrompt = `${agentPersonality}

You are part of the H2AC (Human-to-Agent Communication) system, working with a human developer on story card #${featureId}.

Your role:
1. Provide clear, actionable guidance on implementation
2. Reference specific files, components, or patterns from the ESA Framework
3. Explain technical concepts in simple terms
4. Suggest code examples when helpful
5. Be encouraging and collaborative

Context:
- Story Card ID: ${featureId}
- Page Agent: ${pageAgent || 'N/A'}
- Matched Agents: ${matchedAgents.join(', ') || 'N/A'}

Respond conversationally and helpfully.`;

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const response = completion.choices[0]?.message?.content || 
      "I'm here to help! Could you rephrase your question?";

    res.json({
      success: true,
      response,
      agentId: respondingAgent
    });
  } catch (error) {
    console.error('Agent chat error:', error);
    res.status(500).json({ 
      error: 'Failed to get agent response',
      response: "I'm experiencing technical difficulties. Please try again."
    });
  }
});

export default router;
