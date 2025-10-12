/**
 * ESA AI Intelligence Network Routes
 * Agent #31 (AI Infrastructure) + Agent #2 (API Layer)
 * 
 * Endpoints for AI learning system:
 * - AI Conversation Memory (cross-page context)
 * - Page Journey Patterns (ML predictions)
 * - Learned Patterns (audit insights)
 * - AI User Preferences (personalization)
 */

import { Router } from 'express';
import { db } from '../db';
import { 
  aiConversationMemory, 
  pageJourneyPatterns, 
  learnedPatterns, 
  aiUserPreferences,
  insertAiConversationMemorySchema,
  insertPageJourneyPatternSchema,
  insertLearnedPatternSchema,
  insertAiUserPreferencesSchema
} from '@shared/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { requireAuth } from '../middleware/secureAuth';

const router = Router();

// ========================================
// AI CONVERSATION MEMORY ENDPOINTS
// ========================================

// Store AI conversation for cross-page context
router.post('/conversation', requireAuth, async (req, res) => {
  try {
    const data = insertAiConversationMemorySchema.parse(req.body);
    
    const [conversation] = await db.insert(aiConversationMemory).values({
      ...data,
      userId: req.user?.id || null
    }).returning();

    res.json({ success: true, conversation });
  } catch (error: any) {
    console.error('[AI Intelligence] Store conversation error:', error);
    res.status(400).json({ 
      success: false, 
      error: error.message || 'Failed to store conversation' 
    });
  }
});

// Get user's conversation history (for context preservation)
router.get('/conversation/history', requireAuth, async (req, res) => {
  try {
    const { sessionId, limit = 10 } = req.query;

    let query = db.select()
      .from(aiConversationMemory)
      .where(eq(aiConversationMemory.userId, req.user!.id))
      .orderBy(desc(aiConversationMemory.createdAt))
      .limit(parseInt(limit as string));

    if (sessionId) {
      query = db.select()
        .from(aiConversationMemory)
        .where(and(
          eq(aiConversationMemory.userId, req.user!.id),
          eq(aiConversationMemory.sessionId, sessionId as string)
        ))
        .orderBy(desc(aiConversationMemory.createdAt))
        .limit(parseInt(limit as string));
    }

    const history = await query;

    res.json({ success: true, history });
  } catch (error: any) {
    console.error('[AI Intelligence] Get history error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch conversation history' 
    });
  }
});

// Mark conversation as helpful/not helpful (feedback loop)
router.patch('/conversation/:id/feedback', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { wasHelpful } = req.body;

    const [updated] = await db.update(aiConversationMemory)
      .set({ wasHelpful })
      .where(and(
        eq(aiConversationMemory.id, parseInt(id)),
        eq(aiConversationMemory.userId, req.user!.id)
      ))
      .returning();

    res.json({ success: true, conversation: updated });
  } catch (error: any) {
    console.error('[AI Intelligence] Feedback error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to save feedback' 
    });
  }
});

// ========================================
// PAGE JOURNEY PATTERN ENDPOINTS
// ========================================

// Get predicted next page based on current journey
router.post('/journey/predict', requireAuth, async (req, res) => {
  try {
    const { currentPage, journeyHistory, userRole } = req.body;

    // Find matching patterns
    const patterns = await db.select()
      .from(pageJourneyPatterns)
      .where(and(
        eq(pageJourneyPatterns.isActive, true),
        eq(pageJourneyPatterns.userRole, userRole || 'member')
      ))
      .orderBy(desc(pageJourneyPatterns.confidence));

    // Simple prediction: find pattern that matches journey history
    const prediction = patterns.find(p => {
      const sequence = p.journeySequence || [];
      return sequence.includes(currentPage);
    });

    res.json({ 
      success: true, 
      prediction: prediction ? {
        nextPage: prediction.nextPagePrediction,
        probability: prediction.predictionProbability,
        confidence: prediction.confidence,
        pattern: prediction.patternName
      } : null
    });
  } catch (error: any) {
    console.error('[AI Intelligence] Journey prediction error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to predict next page' 
    });
  }
});

// Record journey pattern (for ML learning - Agent #71)
router.post('/journey/record', requireAuth, async (req, res) => {
  try {
    const data = insertPageJourneyPatternSchema.parse(req.body);

    const [pattern] = await db.insert(pageJourneyPatterns).values(data).returning();

    res.json({ success: true, pattern });
  } catch (error: any) {
    console.error('[AI Intelligence] Record journey error:', error);
    res.status(400).json({ 
      success: false, 
      error: error.message || 'Failed to record journey pattern' 
    });
  }
});

// Get all active journey patterns (for analysis)
router.get('/journey/patterns', requireAuth, async (req, res) => {
  try {
    const patterns = await db.select()
      .from(pageJourneyPatterns)
      .where(eq(pageJourneyPatterns.isActive, true))
      .orderBy(desc(pageJourneyPatterns.confidence));

    res.json({ success: true, patterns });
  } catch (error: any) {
    console.error('[AI Intelligence] Get patterns error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch patterns' 
    });
  }
});

// ========================================
// LEARNED PATTERN ENDPOINTS (Agent #68)
// ========================================

// Create learned pattern from audit (Agent #68 Pattern Recognition)
router.post('/patterns/learned', requireAuth, async (req, res) => {
  try {
    const data = insertLearnedPatternSchema.parse(req.body);

    const [pattern] = await db.insert(learnedPatterns).values(data).returning();

    res.json({ success: true, pattern });
  } catch (error: any) {
    console.error('[AI Intelligence] Create pattern error:', error);
    res.status(400).json({ 
      success: false, 
      error: error.message || 'Failed to create learned pattern' 
    });
  }
});

// Get learned patterns by type/severity
router.get('/patterns/learned', requireAuth, async (req, res) => {
  try {
    const { type, severity, status } = req.query;

    const conditions = [];
    if (type) conditions.push(eq(learnedPatterns.patternType, type as string));
    if (severity) conditions.push(eq(learnedPatterns.severity, severity as string));
    if (status) conditions.push(eq(learnedPatterns.implementationStatus, status as string));

    const patterns = conditions.length > 0
      ? await db.select()
          .from(learnedPatterns)
          .where(and(...conditions))
          .orderBy(desc(learnedPatterns.confidence))
      : await db.select()
          .from(learnedPatterns)
          .orderBy(desc(learnedPatterns.confidence));

    res.json({ success: true, patterns });
  } catch (error: any) {
    console.error('[AI Intelligence] Get learned patterns error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch learned patterns' 
    });
  }
});

// Update pattern status (mark as resolved)
router.patch('/patterns/learned/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { implementationStatus, resolvedBy } = req.body;

    const [pattern] = await db.update(learnedPatterns)
      .set({ 
        implementationStatus, 
        resolvedBy,
        updatedAt: new Date()
      })
      .where(eq(learnedPatterns.id, parseInt(id)))
      .returning();

    res.json({ success: true, pattern });
  } catch (error: any) {
    console.error('[AI Intelligence] Update pattern error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to update pattern' 
    });
  }
});

// Get pattern analytics (dashboard view)
router.get('/patterns/analytics', requireAuth, async (req, res) => {
  try {
    const analytics = await db.select({
      total: sql<number>`count(*)`,
      pending: sql<number>`count(*) filter (where implementation_status = 'pending')`,
      inProgress: sql<number>`count(*) filter (where implementation_status = 'in_progress')`,
      resolved: sql<number>`count(*) filter (where implementation_status = 'resolved')`,
      avgConfidence: sql<number>`avg(confidence)`,
      criticalCount: sql<number>`count(*) filter (where severity = 'critical')`,
    }).from(learnedPatterns);

    res.json({ success: true, analytics: analytics[0] });
  } catch (error: any) {
    console.error('[AI Intelligence] Pattern analytics error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch pattern analytics' 
    });
  }
});

// ========================================
// AI USER PREFERENCES ENDPOINTS
// ========================================

// Get user AI preferences
router.get('/preferences', requireAuth, async (req, res) => {
  try {
    const [preferences] = await db.select()
      .from(aiUserPreferences)
      .where(eq(aiUserPreferences.userId, req.user!.id));

    // Create default preferences if none exist
    if (!preferences) {
      const [newPrefs] = await db.insert(aiUserPreferences).values({
        userId: req.user!.id,
        preferredLanguage: 'en',
        aiHelpFrequency: 'moderate',
        showSmartSuggestions: true,
        showProactiveTips: true,
        contextPreservation: true,
      }).returning();

      return res.json({ success: true, preferences: newPrefs });
    }

    res.json({ success: true, preferences });
  } catch (error: any) {
    console.error('[AI Intelligence] Get preferences error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch preferences' 
    });
  }
});

// Update user AI preferences
router.patch('/preferences', requireAuth, async (req, res) => {
  try {
    const updates = req.body;

    const [preferences] = await db.update(aiUserPreferences)
      .set({ 
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(aiUserPreferences.userId, req.user!.id))
      .returning();

    res.json({ success: true, preferences });
  } catch (error: any) {
    console.error('[AI Intelligence] Update preferences error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to update preferences' 
    });
  }
});

// Track AI interaction (for analytics)
router.post('/preferences/interaction', requireAuth, async (req, res) => {
  try {
    const { helpful, dismissed } = req.body;

    // Get current preferences
    const [current] = await db.select()
      .from(aiUserPreferences)
      .where(eq(aiUserPreferences.userId, req.user!.id));

    if (!current) {
      return res.status(404).json({ 
        success: false, 
        error: 'Preferences not found' 
      });
    }

    const history = (current.interactionHistory as any) || { total: 0, helpful: 0, dismissed: 0 };
    
    history.total += 1;
    if (helpful) history.helpful += 1;
    if (dismissed) history.dismissed += 1;

    const [updated] = await db.update(aiUserPreferences)
      .set({ 
        interactionHistory: history,
        lastAiInteraction: new Date(),
        updatedAt: new Date()
      })
      .where(eq(aiUserPreferences.userId, req.user!.id))
      .returning();

    res.json({ success: true, preferences: updated });
  } catch (error: any) {
    console.error('[AI Intelligence] Track interaction error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to track interaction' 
    });
  }
});

export default router;
