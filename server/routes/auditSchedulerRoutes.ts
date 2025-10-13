// TRACK 4: Audit Scheduler Routes
import { Router } from 'express';
import { auditScheduler } from '../services/AuditScheduler';
import { db } from '../db';
import { auditSchedules } from '@shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Initialize all 88 audit schedules
router.post('/initialize', async (req, res) => {
  try {
    console.log('[AuditScheduler] Initializing all schedules...');
    
    const count = await auditScheduler.initializeSchedules();
    
    res.json({
      success: true,
      message: `Initialized ${count} audit schedules`,
      count,
    });
  } catch (error) {
    console.error('[AuditScheduler] Initialize error:', error);
    res.status(500).json({
      error: 'Failed to initialize schedules',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Run baseline audit (high-priority pages)
router.post('/baseline', async (req, res) => {
  try {
    console.log('[AuditScheduler] Running baseline audit...');
    
    await auditScheduler.runBaselineAudit();
    
    res.json({
      success: true,
      message: 'Baseline audit completed for high-priority pages',
    });
  } catch (error) {
    console.error('[AuditScheduler] Baseline error:', error);
    res.status(500).json({
      error: 'Baseline audit failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Manually trigger scheduled audits for a priority level
router.post('/run/:priority', async (req, res) => {
  try {
    const { priority } = req.params as { priority: 'high' | 'medium' | 'low' };
    
    if (!['high', 'medium', 'low'].includes(priority)) {
      return res.status(400).json({ error: 'Invalid priority level' });
    }
    
    console.log(`[AuditScheduler] Manually running ${priority} priority audits...`);
    
    const count = await auditScheduler.runScheduledAudits(priority);
    
    res.json({
      success: true,
      message: `Completed ${count} ${priority} priority audits`,
      count,
    });
  } catch (error) {
    console.error('[AuditScheduler] Manual run error:', error);
    res.status(500).json({
      error: 'Failed to run scheduled audits',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get all schedules
router.get('/schedules', async (req, res) => {
  try {
    const schedules = await db.select().from(auditSchedules);
    res.json(schedules);
  } catch (error) {
    console.error('[AuditScheduler] Get schedules error:', error);
    res.status(500).json({ error: 'Failed to get schedules' });
  }
});

// Get schedules by priority
router.get('/schedules/:priority', async (req, res) => {
  try {
    const { priority } = req.params as { priority: 'high' | 'medium' | 'low' };
    
    const schedules = await db
      .select()
      .from(auditSchedules)
      .where(eq(auditSchedules.priority, priority));
    
    res.json(schedules);
  } catch (error) {
    console.error('[AuditScheduler] Get schedules by priority error:', error);
    res.status(500).json({ error: 'Failed to get schedules' });
  }
});

// Update schedule (enable/disable, change priority)
router.patch('/schedules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const [updated] = await db
      .update(auditSchedules)
      .set(updates)
      .where(eq(auditSchedules.id, Number(id)))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error('[AuditScheduler] Update schedule error:', error);
    res.status(500).json({ error: 'Failed to update schedule' });
  }
});

export default router;
