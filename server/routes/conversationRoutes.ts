/**
 * TRACK B & C: Conversation API Routes
 * MB.MD SIMULTANEOUS BUILD - Oct 23, 2025
 * Agents #123 (API) + #129 (Services)
 * 
 * Unified routes for search, export, and analytics
 */

import { Router, type Request, Response } from 'express';
import { searchConversations } from '../services/conversationSearchService';
import { exportConversation } from '../services/conversationExportService';
import { getUserAnalytics } from '../services/conversationAnalyticsService';
import { storage } from '../storage';

const router = Router();

/**
 * POST /api/conversations/search
 * Full-text search across conversations
 */
router.post('/search', async (req: any, res: Response) => {
  if (!req.user?.claims?.sub) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const user = await storage.getUserByReplitId(req.user.claims.sub);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { query, projectId, dateFrom, dateTo, models, hasTools, sentiment, type } = req.body;

    if (!query || query.length < 3) {
      return res.status(400).json({ error: 'Query must be at least 3 characters' });
    }

    const results = await searchConversations({
      query,
      userId: user.id,
      projectId,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      models,
      hasTools,
      sentiment,
      type,
    });

    res.json(results);
  } catch (error) {
    console.error('[Conversations] Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

/**
 * POST /api/conversations/export
 * Export conversation to file
 */
router.post('/export', async (req: any, res: Response) => {
  if (!req.user?.claims?.sub) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const user = await storage.getUserByReplitId(req.user.claims.sub);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const {
      projectId,
      format,
      includeMessages = true,
      includeVoice = true,
      includeMetadata = false,
      includeTimestamps = true,
      dateFrom,
      dateTo,
    } = req.body;

    if (!projectId || !format) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { content, filename } = await exportConversation({
      projectId,
      format,
      includeMessages,
      includeVoice,
      includeMetadata,
      includeTimestamps,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
    }, user.id); // Pass userId for security validation

    // For now, return content as base64 (client will handle download)
    // TODO: Upload to object storage and return URL
    const base64Content = Buffer.isBuffer(content) 
      ? content.toString('base64')
      : Buffer.from(content).toString('base64');

    res.json({
      success: true,
      downloadUrl: `data:application/octet-stream;base64,${base64Content}`,
      filename,
    });
  } catch (error) {
    console.error('[Conversations] Export error:', error);
    res.status(500).json({ error: 'Export failed' });
  }
});

/**
 * GET /api/conversations/analytics
 * Get conversation analytics
 */
router.get('/analytics', async (req: any, res: Response) => {
  if (!req.user?.claims?.sub) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const user = await storage.getUserByReplitId(req.user.claims.sub);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const days = parseInt(req.query.days as string) || 30;

    const analytics = await getUserAnalytics(user.id, days);

    res.json(analytics);
  } catch (error) {
    console.error('[Conversations] Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
