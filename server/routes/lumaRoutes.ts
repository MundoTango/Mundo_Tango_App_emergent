import { Router } from 'express';
import { lumaLabsService } from '../services/lumaLabsService';
import { db } from '../db';
import { sql } from 'drizzle-orm';
import { isAuthenticated } from '../replitAuth';
import { requireRole } from '../middleware/roleAuth';

const router = Router();

/**
 * POST /api/luma/generate
 * Generate new 3D avatar using Luma Labs AI
 * Requires: Admin role
 */
router.post('/generate', isAuthenticated, requireRole({ roles: ['super_admin', 'admin'] }), async (req, res) => {
  try {
    const params = req.body;
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }
    
    // Start generation
    const generation = await lumaLabsService.generateAvatar(params);
    
    // Store in database for tracking
    await db.execute(sql`
      INSERT INTO luma_generations (id, user_id, prompt, status, created_at)
      VALUES (
        ${generation.id},
        ${userId},
        ${lumaLabsService.getScottPrompt()},
        ${generation.state},
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        status = ${generation.state}
    `);
    
    res.json({
      success: true,
      generationId: generation.id,
      state: generation.state,
      message: 'Avatar generation started. This may take 5-10 minutes.'
    });
  } catch (error) {
    console.error('Failed to start avatar generation:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Generation failed'
    });
  }
});

/**
 * GET /api/luma/status/:generationId
 * Check status of avatar generation
 */
router.get('/status/:generationId', isAuthenticated, async (req, res) => {
  try {
    const { generationId } = req.params;
    
    const status = await lumaLabsService.checkStatus(generationId);
    
    // Update database
    await db.execute(sql`
      UPDATE luma_generations
      SET 
        status = ${status.state},
        glb_url = ${status.assets?.model || null},
        preview_url = ${status.assets?.preview || null},
        completed_at = CASE 
          WHEN ${status.state} = 'completed' THEN NOW()
          ELSE completed_at
        END,
        error_message = ${status.failure_reason || null}
      WHERE id = ${generationId}
    `);
    
    res.json({
      success: true,
      generation: status
    });
  } catch (error) {
    console.error('Failed to check generation status:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Status check failed'
    });
  }
});

/**
 * POST /api/luma/download/:generationId
 * Download completed GLB model
 * Requires: Admin role
 */
router.post('/download/:generationId', isAuthenticated, requireRole({ roles: ['super_admin', 'admin'] }), async (req, res) => {
  try {
    const { generationId } = req.params;
    
    const localPath = await lumaLabsService.downloadModel(generationId);
    
    // Update database with local path
    await db.execute(sql`
      UPDATE luma_generations
      SET glb_url = ${localPath}
      WHERE id = ${generationId}
    `);
    
    res.json({
      success: true,
      localPath,
      message: 'Model downloaded successfully'
    });
  } catch (error) {
    console.error('Failed to download model:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Download failed'
    });
  }
});

/**
 * GET /api/luma/history
 * Get generation history for current user (or all if admin)
 */
router.get('/history', isAuthenticated, async (req, res) => {
  try {
    const user = (req as any).user;
    const userId = user?.id;
    const userRole = user?.role || 'user';
    
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }
    
    const isAdmin = userRole === 'super_admin' || userRole === 'admin';
    
    const result = await db.execute(sql`
      SELECT 
        id, user_id, prompt, status, glb_url, preview_url,
        created_at, completed_at, error_message
      FROM luma_generations
      WHERE ${isAdmin ? sql`1=1` : sql`user_id = ${userId}`}
      ORDER BY created_at DESC
      LIMIT 50
    `);
    
    res.json({
      success: true,
      generations: result.rows
    });
  } catch (error) {
    console.error('Failed to fetch generation history:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Fetch failed'
    });
  }
});

/**
 * POST /api/webhooks/luma
 * Webhook endpoint for Luma Labs to notify completion
 * (Called by Luma when generation completes)
 */
router.post('/webhooks/luma', async (req, res) => {
  try {
    const { generation_id, state, assets, failure_reason } = req.body;
    
    // Update database
    await db.execute(sql`
      UPDATE luma_generations
      SET 
        status = ${state},
        glb_url = ${assets?.model || null},
        preview_url = ${assets?.preview || null},
        completed_at = CASE 
          WHEN ${state} = 'completed' THEN NOW()
          ELSE completed_at
        END,
        error_message = ${failure_reason || null}
      WHERE id = ${generation_id}
    `);
    
    console.log('Luma webhook received:', { generation_id, state });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Webhook processing failed:', error);
    res.status(500).json({ success: false });
  }
});

export default router;
