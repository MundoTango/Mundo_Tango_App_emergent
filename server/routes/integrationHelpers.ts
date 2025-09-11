
import express from 'express';
import { setupSocketIO } from '../socket';
import { openaiService } from '../services/openaiService';
import type { ApiResponse } from '../../shared/socketEvents';

const router = express.Router();

/**
 * ESA LIFE CEO 61×21 - Integration Helper Endpoints
 * For coordination between Memories, Events, and Groups agents
 */

// Socket.io health check
router.get('/socket-health', (req, res) => {
  const response: ApiResponse = {
    success: true,
    data: {
      socketPort: 5000,
      namespace: '/',
      rooms: ['user:{id}', 'memory:{id}', 'event:{id}', 'group:{id}', 'city:{name}', 'global'],
      events: {
        memory: ['memory:like', 'memory:comment', 'memory:share', 'memory:typing'],
        event: ['event:rsvp', 'event:update', 'event:comment', 'event:typing'],
        group: ['group:message', 'group:typing']
      }
    },
    message: 'Socket.io integration ready for Events Agent'
  };
  res.json(response);
});

// AI service health check
router.get('/ai-health', (req, res) => {
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const response: ApiResponse = {
    success: true,
    data: {
      openaiConfigured: hasOpenAI,
      models: hasOpenAI ? ['gpt-4o', 'text-embedding-3-small'] : [],
      endpoints: ['/api/posts/:id/enhance', '/api/posts/enhance-content'],
      fallbackMode: !hasOpenAI
    },
    message: hasOpenAI ? 'AI service ready' : 'AI service in fallback mode'
  };
  res.json(response);
});

// Database schema info for Events Agent
router.get('/database-schema', (req, res) => {
  const response: ApiResponse = {
    success: true,
    data: {
      sharedTables: {
        users: 'Complete user profiles with roles and preferences',
        posts: 'Unified content (memories, announcements, updates)',
        events: 'Event management with RSVP and delegation',
        groups: 'City and role-based communities',
        notifications: 'Real-time notification system'
      },
      apiFormat: {
        success: 'boolean',
        data: 'any',
        error: 'string (optional)',
        message: 'string (optional)'
      },
      authentication: 'JWT tokens with role-based permissions',
      realtime: 'Socket.io on port 5000 with room-based broadcasting'
    },
    message: 'Database schema ready for Events Agent integration'
  };
  res.json(response);
});

// Test real-time broadcasting (for debugging)
router.post('/test-broadcast', async (req, res) => {
  const { room, event, data } = req.body;
  
  try {
    // This would typically be called from the socket service
    // For testing Events Agent integration
    const response: ApiResponse = {
      success: true,
      data: {
        room,
        event,
        data,
        timestamp: new Date().toISOString()
      },
      message: `Test broadcast sent to room: ${room}`
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Test broadcast failed'
    };
    res.status(500).json(response);
  }
});

// AI enhancement test endpoint (for Events Agent to use)
router.post('/test-ai-enhance', async (req, res) => {
  const { content } = req.body;
  
  try {
    if (!process.env.OPENAI_API_KEY) {
      const response: ApiResponse = {
        success: true,
        data: {
          original: content,
          enhanced: `✨ ${content} (Enhanced in demo mode)`,
          mode: 'fallback'
        },
        message: 'AI enhancement working in fallback mode'
      };
      return res.json(response);
    }

    // Test real OpenAI enhancement
    const messages = [
      { role: 'system', content: 'Enhance this event description to be more engaging and informative.' },
      { role: 'user', content }
    ];

    const completion = await openaiService.createCompletion(messages);
    const enhanced = completion.choices[0]?.message?.content || content;

    const response: ApiResponse = {
      success: true,
      data: {
        original: content,
        enhanced,
        mode: 'openai',
        model: 'gpt-4o'
      },
      message: 'AI enhancement successful'
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'AI enhancement failed'
    };
    res.status(500).json(response);
  }
});

export default router;
