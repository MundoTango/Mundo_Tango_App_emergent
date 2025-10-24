/**
 * STREAM 2.1: SSE Endpoint for Autonomous Real-Time Updates
 * Provides Server-Sent Events for streaming task progress to frontend
 */

import { Router, Request, Response } from 'express';

const router = Router();

// Store SSE clients per task
const sseClients = new Map<string, Response[]>();

/**
 * GET /api/mrblue/autonomous/stream/:taskId
 * SSE endpoint for real-time task updates
 */
router.get('/stream/:taskId', (req: Request, res: Response) => {
  const { taskId } = req.params;

  console.log(`🎧 [SSE] New client connected for task: ${taskId}`);

  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

  // Send initial connection message
  res.write('data: {"type":"connected","taskId":"' + taskId + '"}\n\n');

  // Register client
  if (!sseClients.has(taskId)) {
    sseClients.set(taskId, []);
  }
  sseClients.get(taskId)!.push(res);

  // Send keep-alive every 30 seconds
  const keepAliveInterval = setInterval(() => {
    res.write(':keep-alive\n\n');
  }, 30000);

  // Clean up on client disconnect
  req.on('close', () => {
    console.log(`🔌 [SSE] Client disconnected from task: ${taskId}`);
    clearInterval(keepAliveInterval);
    
    const clients = sseClients.get(taskId);
    if (clients) {
      const index = clients.indexOf(res);
      if (index !== -1) {
        clients.splice(index, 1);
      }
      if (clients.length === 0) {
        sseClients.delete(taskId);
      }
    }
  });
});

/**
 * Emit SSE event to all clients listening to a task
 */
export function emitSSEEvent(taskId: string, eventType: string, data: any) {
  const clients = sseClients.get(taskId);
  if (!clients || clients.length === 0) {
    console.log(`⚠️  [SSE] No clients listening for task: ${taskId}`);
    return;
  }

  const event = {
    type: eventType,
    timestamp: new Date().toISOString(),
    ...data
  };

  const payload = `data: ${JSON.stringify(event)}\n\n`;
  
  console.log(`📡 [SSE] Emitting ${eventType} to ${clients.length} client(s) for task: ${taskId}`);

  clients.forEach((client) => {
    try {
      client.write(payload);
    } catch (error) {
      console.error('❌ [SSE] Error writing to client:', error);
    }
  });
}

export default router;
