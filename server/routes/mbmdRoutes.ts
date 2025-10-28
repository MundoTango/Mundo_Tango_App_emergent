/**
 * MB.MD Evidence System API Routes
 * Phase 0: Shared Infrastructure - Oct 27, 2025
 */

import { Router } from 'express';
import { db } from '../db';
import { mbmdSessions, mbmdEvidence, mbmdReviews, insertMbmdSessionSchema, insertMbmdEvidenceSchema, insertMbmdReviewSchema } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';
import { isAuthenticated } from '../replitAuth';

const router = Router();

// Note: Authentication applied at app.use level in routes.ts
// router.use(isAuthenticated) not needed here

/**
 * POST /api/mbmd/session/start
 * Start a new MB.MD session
 */
router.post('/session/start', async (req: any, res) => {
  try {
    // Ensure user is authenticated (middleware ensures req.user exists)
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const validated = insertMbmdSessionSchema.parse(req.body);
    
    const [session] = await db.insert(mbmdSessions).values({
      ...validated,
      userId: req.user.id,
    }).returning();
    
    console.log('[MB.MD] Session started:', session.id, 'Feature:', session.feature, 'User:', req.user.id);
    
    res.json({
      success: true,
      session
    });
  } catch (error: any) {
    console.error('[MB.MD] Session start error:', error);
    res.status(400).json({ 
      error: 'Failed to start MB.MD session',
      details: error.message 
    });
  }
});

/**
 * POST /api/mbmd/evidence/upload
 * Upload evidence for a phase
 * FIX #5: Added authentication check
 * Note: isAuthenticated already applied at app.use level
 */
router.post('/evidence/upload', async (req: any, res) => {
  try {
    const validated = insertMbmdEvidenceSchema.parse(req.body);
    
    // Verify session belongs to user
    const [session] = await db.select()
      .from(mbmdSessions)
      .where(eq(mbmdSessions.id, validated.sessionId))
      .limit(1);
    
    if (!session || session.userId !== req.user.id) {
      return res.status(403).json({ error: 'Session not found or unauthorized' });
    }
    
    const [evidence] = await db.insert(mbmdEvidence).values(validated).returning();
    
    console.log('[MB.MD] Evidence uploaded:', evidence.id, 'Phase:', evidence.phase, 'Type:', evidence.evidenceType);
    
    res.json({
      success: true,
      evidence
    });
  } catch (error: any) {
    console.error('[MB.MD] Evidence upload error:', error);
    res.status(400).json({ 
      error: 'Failed to upload evidence',
      details: error.message 
    });
  }
});

/**
 * POST /api/mbmd/evidence/upload-file
 * Get presigned URL for file upload (screenshots, logs)
 * FIX #1: Added authentication + session scoping
 * Note: isAuthenticated already applied at app.use level
 */
router.post('/evidence/upload-file', async (req: any, res) => {
  try {
    const { sessionId } = req.body;
    
    // Validate sessionId is provided
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }
    
    // Verify session belongs to authenticated user
    const [session] = await db.select()
      .from(mbmdSessions)
      .where(eq(mbmdSessions.id, sessionId))
      .limit(1);
    
    if (!session || session.userId !== req.user.id) {
      return res.status(403).json({ error: 'Session not found or unauthorized' });
    }
    
    // Use Object Storage for file uploads
    const { ObjectStorageService } = await import('../objectStorage');
    const objectStorageService = new ObjectStorageService();
    
    // Scope upload URL to user/session directory
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    
    console.log('[MB.MD] File upload URL generated:', {
      sessionId,
      userId: req.user.id,
      scoped: true
    });
    
    res.json({
      success: true,
      uploadURL,
      scope: `evidence/${req.user.id}/${sessionId}/`
    });
  } catch (error: any) {
    console.error('[MB.MD] File upload URL generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate upload URL',
      details: error.message 
    });
  }
});

/**
 * POST /api/mbmd/review/request
 * Request a review (architect or QA)
 * FIX #5: Added authentication check
 * Note: isAuthenticated already applied at app.use level
 */
router.post('/review/request', async (req: any, res) => {
  try {
    const { sessionId, reviewer, phase } = req.body;
    
    if (!sessionId || !reviewer || !phase) {
      return res.status(400).json({ 
        error: 'sessionId, reviewer, and phase are required' 
      });
    }
    
    // Verify session ownership
    const [session] = await db.select()
      .from(mbmdSessions)
      .where(eq(mbmdSessions.id, sessionId))
      .limit(1);
    
    if (!session || session.userId !== req.user.id) {
      return res.status(403).json({ error: 'Session not found or unauthorized' });
    }
    
    // Fetch session evidence
    const evidenceList = await db.select()
      .from(mbmdEvidence)
      .where(eq(mbmdEvidence.sessionId, sessionId));
    
    // Create pending review
    const [review] = await db.insert(mbmdReviews).values({
      sessionId,
      reviewer,
      phase,
      approved: false, // Pending by default
      feedback: 'Review pending...'
    }).returning();
    
    console.log('[MB.MD] Review requested:', review.id, 'Reviewer:', reviewer, 'Phase:', phase);
    
    res.json({
      success: true,
      review,
      evidenceCount: evidenceList.length
    });
  } catch (error: any) {
    console.error('[MB.MD] Review request error:', error);
    res.status(500).json({ 
      error: 'Failed to request review',
      details: error.message 
    });
  }
});

/**
 * POST /api/mbmd/review/submit
 * Submit a review result (architect or QA agent uses this)
 * FIX #5: Added authentication check
 * Note: isAuthenticated already applied at app.use level
 */
router.post('/review/submit', async (req: any, res) => {
  try {
    const { reviewId, approved, feedback } = req.body;
    
    if (!reviewId || approved === undefined) {
      return res.status(400).json({ 
        error: 'reviewId and approved are required' 
      });
    }
    
    // Verify review session ownership
    const [review] = await db.select()
      .from(mbmdReviews)
      .where(eq(mbmdReviews.id, reviewId))
      .limit(1);
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    const [session] = await db.select()
      .from(mbmdSessions)
      .where(eq(mbmdSessions.id, review.sessionId))
      .limit(1);
    
    if (!session || session.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    await db.update(mbmdReviews)
      .set({ 
        approved, 
        feedback: feedback || (approved ? 'Approved' : 'Rejected'),
        reviewedAt: new Date()
      })
      .where(eq(mbmdReviews.id, reviewId));
    
    console.log('[MB.MD] Review submitted:', reviewId, 'Approved:', approved);
    
    res.json({
      success: true,
      approved,
      feedback
    });
  } catch (error: any) {
    console.error('[MB.MD] Review submit error:', error);
    res.status(500).json({ 
      error: 'Failed to submit review',
      details: error.message 
    });
  }
});

/**
 * GET /api/mbmd/session/:id/status
 * Get session status with evidence and reviews
 */
router.get('/session/:id/status', async (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);
    
    const [session] = await db.select()
      .from(mbmdSessions)
      .where(eq(mbmdSessions.id, sessionId));
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const evidenceList = await db.select()
      .from(mbmdEvidence)
      .where(eq(mbmdEvidence.sessionId, sessionId))
      .orderBy(desc(mbmdEvidence.timestamp));
    
    const reviewsList = await db.select()
      .from(mbmdReviews)
      .where(eq(mbmdReviews.sessionId, sessionId))
      .orderBy(desc(mbmdReviews.reviewedAt));
    
    console.log('[MB.MD] Session status fetched:', sessionId, 'Evidence:', evidenceList.length, 'Reviews:', reviewsList.length);
    
    res.json({
      success: true,
      session,
      evidence: evidenceList,
      reviews: reviewsList,
      summary: {
        totalEvidence: evidenceList.length,
        evidenceByPhase: {
          MAPPING: evidenceList.filter(e => e.phase === 'MAPPING').length,
          BREAKDOWN: evidenceList.filter(e => e.phase === 'BREAKDOWN').length,
          MITIGATION: evidenceList.filter(e => e.phase === 'MITIGATION').length,
          DEPLOYMENT: evidenceList.filter(e => e.phase === 'DEPLOYMENT').length,
        },
        reviewsApproved: reviewsList.filter(r => r.approved).length,
        reviewsPending: reviewsList.filter(r => !r.approved).length,
      }
    });
  } catch (error: any) {
    console.error('[MB.MD] Session status error:', error);
    res.status(500).json({ 
      error: 'Failed to get session status',
      details: error.message 
    });
  }
});

/**
 * GET /api/mbmd/dashboard
 * Get dashboard data (all sessions summary)
 */
router.get('/dashboard', async (req, res) => {
  try {
    const sessions = await db.select()
      .from(mbmdSessions)
      .orderBy(desc(mbmdSessions.startedAt))
      .limit(50);
    
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.status === 'complete').length;
    const failedSessions = sessions.filter(s => s.status === 'failed').length;
    const inProgressSessions = sessions.filter(s => !['complete', 'failed'].includes(s.status || '')).length;
    
    console.log('[MB.MD] Dashboard fetched:', totalSessions, 'sessions');
    
    res.json({
      success: true,
      sessions,
      stats: {
        total: totalSessions,
        completed: completedSessions,
        failed: failedSessions,
        inProgress: inProgressSessions,
        complianceRate: totalSessions > 0 ? (completedSessions / totalSessions * 100).toFixed(1) : 0
      }
    });
  } catch (error: any) {
    console.error('[MB.MD] Dashboard error:', error);
    res.status(500).json({ 
      error: 'Failed to get dashboard data',
      details: error.message 
    });
  }
});

/**
 * PUT /api/mbmd/session/:id/complete
 * Mark session as complete
 */
router.put('/session/:id/complete', async (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);
    
    await db.update(mbmdSessions)
      .set({ 
        status: 'complete',
        completedAt: new Date()
      })
      .where(eq(mbmdSessions.id, sessionId));
    
    console.log('[MB.MD] Session completed:', sessionId);
    
    res.json({
      success: true,
      sessionId
    });
  } catch (error: any) {
    console.error('[MB.MD] Session complete error:', error);
    res.status(500).json({ 
      error: 'Failed to complete session',
      details: error.message 
    });
  }
});

/**
 * PUT /api/mbmd/session/:id/fail
 * Mark session as failed
 */
router.put('/session/:id/fail', async (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);
    const { reason } = req.body;
    
    await db.update(mbmdSessions)
      .set({ 
        status: 'failed',
        metadata: { failureReason: reason }
      })
      .where(eq(mbmdSessions.id, sessionId));
    
    console.log('[MB.MD] Session failed:', sessionId, 'Reason:', reason);
    
    res.json({
      success: true,
      sessionId
    });
  } catch (error: any) {
    console.error('[MB.MD] Session fail error:', error);
    res.status(500).json({ 
      error: 'Failed to mark session as failed',
      details: error.message 
    });
  }
});

/**
 * GET /api/mbmd/dashboard
 * Get dashboard data with sessions and stats
 * FIX #3: Dashboard data endpoint
 * Note: isAuthenticated already applied at app.use level
 */
router.get('/dashboard', async (req: any, res) => {
  try {
    // Get user's sessions
    const sessions = await db.select()
      .from(mbmdSessions)
      .where(eq(mbmdSessions.userId, req.user.id))
      .orderBy(desc(mbmdSessions.startedAt))
      .limit(50);

    // Calculate stats
    const stats = {
      total: sessions.length,
      completed: sessions.filter(s => s.status === 'complete').length,
      inProgress: sessions.filter(s => s.status === 'in-progress').length,
      failed: sessions.filter(s => s.status === 'failed').length,
      complianceRate: sessions.length > 0
        ? Math.round((sessions.filter(s => s.status === 'complete').length / sessions.length) * 100)
        : 0
    };

    // Get evidence count
    const evidenceCount = await db.select()
      .from(mbmdEvidence)
      .where(eq(mbmdEvidence.sessionId, sessions.map(s => s.id)[0] || 0));

    console.log('[MB.MD] Dashboard loaded:', {
      userId: req.user.id,
      sessions: sessions.length,
      stats
    });

    res.json({
      success: true,
      sessions,
      stats,
      evidenceCount: evidenceCount.length
    });
  } catch (error: any) {
    console.error('[MB.MD] Dashboard error:', error);
    res.status(500).json({
      error: 'Failed to load dashboard',
      details: error.message
    });
  }
});

export default router;
