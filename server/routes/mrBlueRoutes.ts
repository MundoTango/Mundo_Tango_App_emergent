/**
 * Mr Blue API Routes
 * mb.md lines 1030-1051
 * Main chat endpoint + conversation management + Life CEO agents
 */

import { Router } from 'express';
import { aiModelService } from '../services/aiModelService';
import { routeToLifeCEOAgent, getAgentByName, getAllAgents } from '../services/lifeCEORouter';

const router = Router();

/**
 * POST /api/mr-blue/chat
 * Main chat endpoint with Life CEO routing
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
        content: personality || 'You are Mr. Blue, a friendly and helpful AI assistant for Mundo Tango.',
      },
      ...conversationHistory.slice(-10),
      {
        role: 'user' as const,
        content: message,
      },
    ];

    // Step 3: Call AI model
    const response = await aiModelService.callAI(messages, model);

    res.json({
      success: true,
      response: response.content,
      model: response.model,
      agent: targetAgent,
      agentDetails,
      usage: response.usage,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('❌ Mr Blue Chat Error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to get AI response',
      message: error.message,
    });
  }
});

/**
 * GET /api/mr-blue/agents
 * Get all Life CEO agents
 */
router.get('/agents', async (req, res) => {
  try {
    const agents = getAllAgents();

    res.json({
      success: true,
      agents,
      count: agents.length,
    });

  } catch (error: any) {
    console.error('❌ Get Agents Error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to get agents',
      message: error.message,
    });
  }
});

/**
 * GET /api/mr-blue/conversation
 * Get conversation history (placeholder - client-side localStorage is primary)
 */
router.get('/conversation', async (req, res) => {
  try {
    // In this implementation, conversations are stored client-side
    // This endpoint is for future server-side conversation storage
    res.json({
      success: true,
      message: 'Conversations are stored client-side in localStorage for privacy',
      messages: [],
    });

  } catch (error: any) {
    console.error('❌ Get Conversation Error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to get conversation',
      message: error.message,
    });
  }
});

export default router;
