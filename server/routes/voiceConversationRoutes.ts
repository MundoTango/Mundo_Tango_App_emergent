/**
 * STREAM 2: Voice Conversation History API
 * RESTful endpoints for voice conversation management
 */

import { Router } from 'express';
import { db } from '../db';
import { voiceConversationTurns } from '@db/schema';
import { eq, desc } from 'drizzle-orm';

const router = Router();

/**
 * GET /api/voice/conversations/:projectId
 * Fetch all voice conversation turns for a project
 */
router.get('/conversations/:projectId', async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const turns = await db
      .select()
      .from(voiceConversationTurns)
      .where(eq(voiceConversationTurns.projectId, projectId))
      .orderBy(desc(voiceConversationTurns.createdAt));

    res.json(turns);
  } catch (error) {
    console.error('[VoiceConversations] Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch conversation history' });
  }
});

/**
 * GET /api/voice/conversations/:projectId/stats
 * Get statistics for voice conversations in a project
 */
router.get('/conversations/:projectId/stats', async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const turns = await db
      .select()
      .from(voiceConversationTurns)
      .where(eq(voiceConversationTurns.projectId, projectId));

    // Calculate stats
    const totalTurns = turns.length;
    const userTurns = turns.filter(t => t.role === 'user').length;
    const assistantTurns = turns.filter(t => t.role === 'assistant').length;
    const totalDuration = turns.reduce((sum, t) => sum + (t.audioDuration || 0), 0);
    
    const toolUsage: Record<string, number> = {};
    turns.forEach(turn => {
      turn.toolsUsed?.forEach(tool => {
        toolUsage[tool] = (toolUsage[tool] || 0) + 1;
      });
    });

    const languageBreakdown: Record<string, number> = {};
    turns.forEach(turn => {
      const lang = turn.language || 'unknown';
      languageBreakdown[lang] = (languageBreakdown[lang] || 0) + 1;
    });

    res.json({
      totalTurns,
      userTurns,
      assistantTurns,
      totalDuration,
      avgDurationPerTurn: totalTurns > 0 ? totalDuration / totalTurns : 0,
      toolUsage,
      languageBreakdown,
      firstConversation: turns[turns.length - 1]?.createdAt,
      lastConversation: turns[0]?.createdAt,
    });
  } catch (error) {
    console.error('[VoiceConversations] Error calculating stats:', error);
    res.status(500).json({ error: 'Failed to calculate statistics' });
  }
});

/**
 * DELETE /api/voice/conversations/:projectId
 * Delete all voice conversations for a project
 */
router.delete('/conversations/:projectId', async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // TODO: Verify user owns this project before deleting

    await db
      .delete(voiceConversationTurns)
      .where(eq(voiceConversationTurns.projectId, projectId));

    res.json({ success: true, message: 'Conversation history deleted' });
  } catch (error) {
    console.error('[VoiceConversations] Error deleting history:', error);
    res.status(500).json({ error: 'Failed to delete conversation history' });
  }
});

export default router;
