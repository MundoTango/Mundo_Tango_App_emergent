/**
 * TRACK 3A: Hot Reload API Routes
 * MB.MD Vibe Coding - 100% Plan
 */

import { Router } from 'express';
import type { Server as SocketIOServer } from 'socket.io';

export function createHotReloadRoutes(io: SocketIOServer) {
  const router = Router();

  /**
   * POST /api/hot-reload/trigger
   * Manually trigger hot reload for specific file
   */
  router.post('/trigger', (req, res) => {
    const { filePath } = req.body;
    
    console.log(`[HotReload API] 🔥 Manual trigger: ${filePath}`);
    
    io.emit('hot-reload', {
      type: 'manual',
      filePath: filePath || 'unknown',
      timestamp: Date.now(),
      action: 'reload'
    });

    res.json({ success: true, message: 'Hot reload triggered' });
  });

  /**
   * GET /api/hot-reload/status
   * Check hot reload status
   */
  router.get('/status', (req, res) => {
    res.json({
      enabled: true,
      connectedClients: io.sockets.sockets.size,
      targetLatency: 500
    });
  });

  return router;
}
