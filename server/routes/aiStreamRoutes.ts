/**
 * AI STREAM ROUTES - Server-Sent Events for Real-Time AI Work Feed
 * ✅ FIX #3 (Oct 27, FINAL): SSE streaming like Replit Agent
 * 
 * Provides live updates during vibe coding, testing, and autonomous work
 */

import { Router, Request, Response } from 'express';
import { isAuthenticated } from '../replitAuth';

const router = Router();

// Active SSE connections by session ID
const activeConnections = new Map<string, Response[]>();

/**
 * GET /api/ai/stream/:sessionId
 * Server-Sent Events endpoint for AI work feed
 */
router.get('/stream/:sessionId', isAuthenticated, (req: Request, res: Response) => {
  const { sessionId } = req.params;

  console.log(`[AIStream] Client connected to session ${sessionId}`);

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

  // Register connection
  if (!activeConnections.has(sessionId)) {
    activeConnections.set(sessionId, []);
  }
  activeConnections.get(sessionId)!.push(res);

  // Send connection confirmation
  res.write(`data: ${JSON.stringify({
    type: 'connected',
    sessionId,
    timestamp: Date.now()
  })}\n\n`);

  // Handle client disconnect
  req.on('close', () => {
    console.log(`[AIStream] Client disconnected from session ${sessionId}`);
    const connections = activeConnections.get(sessionId);
    if (connections) {
      const index = connections.indexOf(res);
      if (index > -1) {
        connections.splice(index, 1);
      }
      if (connections.length === 0) {
        activeConnections.delete(sessionId);
      }
    }
  });
});

/**
 * Broadcast an event to all clients listening to a session
 */
export function broadcastToSession(sessionId: string, event: any) {
  const connections = activeConnections.get(sessionId);
  if (!connections || connections.length === 0) {
    console.log(`[AIStream] No listeners for session ${sessionId}`);
    return;
  }

  const eventData = {
    ...event,
    id: event.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: event.timestamp || Date.now()
  };

  const message = `event: agent-action\ndata: ${JSON.stringify(eventData)}\n\n`;

  console.log(`[AIStream] Broadcasting to ${connections.length} client(s) on session ${sessionId}:`, event.type);

  connections.forEach(res => {
    try {
      res.write(message);
    } catch (error) {
      console.error('[AIStream] Error broadcasting:', error);
    }
  });
}

/**
 * Helper function to emit AI work events from anywhere in the codebase
 */
export function emitAIEvent(sessionId: string, type: string, data: any) {
  broadcastToSession(sessionId, {
    type,
    ...data
  });
}

export default router;
