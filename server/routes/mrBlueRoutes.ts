/**
 * Mr Blue API Routes
 * Per mb.md lines 1030-1051
 * Main chat endpoint + conversation management
 */

import { Router } from 'express';
import { aiModelService } from '../services/aiModelService';
import { routeToLifeCEOAgent, getAgentByName } from '../services/lifeCEORouter';

const router = Router();

/**
 * POST /api/mr-blue/chat
 * Main chat endpoint (mb.md lines 1034-1036)
 * 
 * Handles:
 * - Multi-model AI routing (GPT-4o, Claude, Gemini)
 * - Life CEO agent routing (16 agents)
 * - Page context awareness
 * - Semantic search integration
 */
router.post('/chat', async (req, res) => {
  try {
    const { 
      message, 
      personality, 
      agent, 
      context = {}, 
      model = 'gpt-4o',
      conversationHistory = []
    } = req.body;

    if (!message) {
      return res.status(400).json({ 
        error: 'Message is required' 
      });
    }

    // Step 1: Route to Life CEO agent if needed
    const targetAgent = agent || routeToLifeCEOAgent(message);
    const agentDetails = getAgentByName(targetAgent);

    // Step 2: Build AI messages with context
    const messages = [
      {
        role: 'system' as const,
        content: personality || 'You are Mr. Blue, a friendly and helpful AI assistant for the Mundo Tango platform. You help users with tango events, communities, and life management through specialized Life CEO agents.',
      },
      {
        role: 'system' as const,
        content: `Current Context:
- Page: ${context.page || 'unknown'}
- User Journey: ${context.userJourney || 'unknown'}
- Assigned Agent: ${targetAgent}
${agentDetails ? `- Agent Purpose: ${agentDetails.description}` : ''}`,
      },
    ];

    // Add conversation history (last 10 messages)
    const recentHistory = conversationHistory.slice(-10);
    messages.push(...recentHistory);

    // Add current user message
    messages.push({
      role: 'user' as const,
      content: message,
    });

    // Step 3: Call AI model with intelligent routing
    const aiResponse = await aiModelService.route(model, messages);

    // Step 4: Return response with metadata
    res.json({
      success: true,
      response: aiResponse.content,
      model: aiResponse.model,
      agent: targetAgent,
      agentDetails: agentDetails ? {
        name: agentDetails.name,
        description: agentDetails.description,
      } : null,
      usage: aiResponse.usage,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('❌ Mr Blue Chat Error:', error);
    
    res.status(500).json({
      success: false,
      error: 'AI chat failed',
      message: error.message,
      response: "No worries—hit a quick snag. Let's try that again.",
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/mr-blue/conversation
 * Retrieve conversation history (mb.md lines 1035)
 * Note: Conversations stored in localStorage (privacy-first)
 * This endpoint is for server-side backups only
 */
router.get('/conversation', async (req, res) => {
  // Conversations are client-side only (localStorage)
  // This endpoint exists for compatibility but returns empty
  res.json({
    success: true,
    messages: [],
    note: 'Conversations are stored client-side in localStorage for privacy',
  });
});

/**
 * DELETE /api/mr-blue/conversation
 * Clear conversation history (mb.md lines 1036)
 * Note: Actual deletion happens client-side
 */
router.delete('/conversation', async (req, res) => {
  // Client-side deletion via localStorage
  res.json({
    success: true,
    message: 'Conversation cleared (client-side localStorage)',
  });
});

/**
 * GET /api/mr-blue/agents
 * Get all Life CEO agents (for UI display)
 */
router.get('/agents', async (req, res) => {
  const { getAllLifeCEOAgents } = await import('../services/lifeCEORouter');
  
  res.json({
    success: true,
    agents: getAllLifeCEOAgents(),
    count: 16,
  });
});

/**
 * POST /api/mr-blue/test-simple
 * Diagnostic endpoint for testing (mb.md debugging)
 */
router.post('/test-simple', async (req, res) => {
  try {
    const { message } = req.body;
    
    const response = await aiModelService.callGPT4o([
      { role: 'system', content: 'You are a test AI assistant.' },
      { role: 'user', content: message || 'Hello, this is a test.' },
    ]);

    res.json({
      success: true,
      response: response.content,
      model: response.model,
      message: 'Test endpoint working!',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
