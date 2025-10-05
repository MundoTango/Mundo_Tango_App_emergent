import express from 'express';
import { agentOrchestrator, AGENT_REGISTRY } from '../services/AgentOrchestrator';
import { requireAuth } from '../middleware/secureAuth';

const router = express.Router();

/**
 * Get list of all available agents
 */
router.get('/agents', (req, res) => {
  const agents = Object.values(AGENT_REGISTRY).map(agent => ({
    id: agent.id,
    name: agent.name,
    icon: agent.icon,
    description: agent.description,
    capabilities: agent.capabilities
  }));
  
  res.json({ success: true, data: agents });
});

/**
 * Test endpoint for Life CEO agents (dev mode)
 */
router.post('/test/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { message } = req.body;
    
    // In development mode, use a test user ID
    const userId = process.env.NODE_ENV === 'development' ? 7 : null;
    
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Test endpoint only available in development' });
    }

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    if (!AGENT_REGISTRY[agentId as keyof typeof AGENT_REGISTRY]) {
      return res.status(404).json({ success: false, error: 'Agent not found' });
    }

    // Get conversation history
    const conversationHistory = await agentOrchestrator.getConversationHistory(userId, agentId);

    // Build context
    const context = {
      userId,
      agentId,
      conversationHistory
    };

    // Process message through OpenAI
    const response = await agentOrchestrator.processMessage(context, message);

    res.json({
      success: true,
      data: {
        message: response,
        agentId,
        agent: AGENT_REGISTRY[agentId as keyof typeof AGENT_REGISTRY].name,
        timestamp: new Date()
      }
    });
  } catch (error: any) {
    console.error('Error in Life CEO test endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process message'
    });
  }
});

/**
 * Send a message to an agent
 */
router.post('/agents/:agentId/message', requireAuth, async (req, res) => {
  try {
    const { agentId } = req.params;
    const { message } = req.body;
    const userId = (req.user as any)?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    if (!AGENT_REGISTRY[agentId as keyof typeof AGENT_REGISTRY]) {
      return res.status(404).json({ success: false, error: 'Agent not found' });
    }

    // Get conversation history
    const conversationHistory = await agentOrchestrator.getConversationHistory(userId, agentId);

    // Build context
    const context = {
      userId,
      agentId,
      conversationHistory
    };

    // Process message
    const response = await agentOrchestrator.processMessage(context, message);

    res.json({
      success: true,
      data: {
        message: response,
        agentId,
        timestamp: new Date()
      }
    });
  } catch (error: any) {
    console.error('Error processing agent message:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process message'
    });
  }
});

/**
 * Stream a message to an agent (Server-Sent Events)
 */
router.post('/agents/:agentId/stream', requireAuth, async (req, res) => {
  try {
    const { agentId } = req.params;
    const { message } = req.body;
    const userId = (req.user as any)?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    if (!AGENT_REGISTRY[agentId as keyof typeof AGENT_REGISTRY]) {
      return res.status(404).json({ success: false, error: 'Agent not found' });
    }

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Get conversation history
    const conversationHistory = await agentOrchestrator.getConversationHistory(userId, agentId);

    // Build context
    const context = {
      userId,
      agentId,
      conversationHistory
    };

    // Stream the response
    const stream = agentOrchestrator.streamMessage(context, message);

    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error('Error streaming agent message:', error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

/**
 * Get conversation history for an agent
 */
router.get('/agents/:agentId/history', requireAuth, async (req, res) => {
  try {
    const { agentId } = req.params;
    const userId = (req.user as any)?.id;
    const limit = parseInt(req.query.limit as string) || 50;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const history = await agentOrchestrator.getConversationHistory(userId, agentId, limit);

    res.json({
      success: true,
      data: history
    });
  } catch (error: any) {
    console.error('Error getting conversation history:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get conversation history'
    });
  }
});

/**
 * Get agent memories/context
 */
router.get('/agents/:agentId/memories', requireAuth, async (req, res) => {
  try {
    const { agentId } = req.params;
    const userId = (req.user as any)?.id;
    const query = req.query.query as string || '';
    const limit = parseInt(req.query.limit as string) || 10;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const memories = await agentOrchestrator.getRelevantMemories(userId, agentId, query, limit);

    res.json({
      success: true,
      data: memories
    });
  } catch (error: any) {
    console.error('Error getting agent memories:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get memories'
    });
  }
});

/**
 * Voice command endpoint (accepts audio and returns text + audio response)
 */
router.post('/agents/:agentId/voice', requireAuth, async (req, res) => {
  try {
    const { agentId } = req.params;
    const { transcript, language = 'en' } = req.body;
    const userId = (req.user as any)?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (!transcript) {
      return res.status(400).json({ success: false, error: 'Transcript is required' });
    }

    // Get conversation history
    const conversationHistory = await agentOrchestrator.getConversationHistory(userId, agentId);

    // Build context
    const context = {
      userId,
      agentId,
      conversationHistory
    };

    // Process message
    const textResponse = await agentOrchestrator.processMessage(context, transcript);

    // TODO: Integrate text-to-speech for voice response
    // const audioUrl = await textToSpeechService.synthesize(textResponse, language);

    res.json({
      success: true,
      data: {
        transcript,
        textResponse,
        // audioUrl, // Uncomment when TTS is implemented
        agentId,
        language,
        timestamp: new Date()
      }
    });
  } catch (error: any) {
    console.error('Error processing voice command:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process voice command'
    });
  }
});

/**
 * Health check for agent system
 */
router.get('/health', (req, res) => {
  const agentCount = Object.keys(AGENT_REGISTRY).length;
  const openaiConfigured = !!process.env.OPENAI_API_KEY;
  
  res.json({
    success: true,
    data: {
      status: 'operational',
      agentCount,
      openaiConfigured,
      timestamp: new Date()
    }
  });
});

export default router;
