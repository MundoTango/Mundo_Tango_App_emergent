// TRACK 5: Audit API Routes
import { Router } from 'express';
import { auditOrchestrator } from '../services/AuditOrchestrator';
import { db } from '../db';
import { auditResults, auditSchedules } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';

const router = Router();

// Trigger manual audit for a page
router.post('/run', async (req, res) => {
  try {
    const { pageAgent, pageRoute, tools } = req.body;

    if (!pageAgent || !pageRoute) {
      return res.status(400).json({ error: 'pageAgent and pageRoute are required' });
    }

    const results = await auditOrchestrator.runPageAudit(pageAgent, pageRoute, tools || ['all']);

    res.json({
      success: true,
      results,
      message: `Audit completed for ${pageAgent} using ${tools?.join(', ') || 'all tools'}`,
    });
  } catch (error) {
    console.error('[Audit] Run error:', error);
    res.status(500).json({ error: 'Failed to run audit' });
  }
});

// Get audit results for a page
router.get('/results/:pageAgent', async (req, res) => {
  try {
    const { pageAgent } = req.params;
    const { limit = 10 } = req.query;

    const results = await db
      .select()
      .from(auditResults)
      .where(eq(auditResults.pageAgent, pageAgent))
      .orderBy(desc(auditResults.createdAt))
      .limit(Number(limit));

    res.json(results);
  } catch (error) {
    console.error('[Audit] Get results error:', error);
    res.status(500).json({ error: 'Failed to get audit results' });
  }
});

// Get latest audit result for a page
router.get('/results/:pageAgent/latest', async (req, res) => {
  try {
    const { pageAgent } = req.params;

    const [result] = await db
      .select()
      .from(auditResults)
      .where(eq(auditResults.pageAgent, pageAgent))
      .orderBy(desc(auditResults.createdAt))
      .limit(1);

    if (!result) {
      return res.status(404).json({ error: 'No audit results found' });
    }

    res.json(result);
  } catch (error) {
    console.error('[Audit] Get latest error:', error);
    res.status(500).json({ error: 'Failed to get latest audit result' });
  }
});

// Get dashboard data (all pages summary)
router.get('/dashboard', async (req, res) => {
  try {
    // Get latest result for each page
    const latestResults = await db.query.auditResults.findMany({
      orderBy: (results, { desc }) => [desc(results.createdAt)],
    });

    // Group by page agent (get most recent)
    const pageMap = new Map();
    latestResults.forEach(result => {
      if (!pageMap.has(result.pageAgent)) {
        pageMap.set(result.pageAgent, result);
      }
    });

    const dashboard = {
      totalPages: pageMap.size,
      critical: Array.from(pageMap.values()).filter(r => r.severity === 'critical').length,
      high: Array.from(pageMap.values()).filter(r => r.severity === 'high').length,
      medium: Array.from(pageMap.values()).filter(r => r.severity === 'medium').length,
      low: Array.from(pageMap.values()).filter(r => r.severity === 'low').length,
      averageScore: Array.from(pageMap.values()).reduce((acc, r) => acc + (r.score || 0), 0) / pageMap.size,
      results: Array.from(pageMap.values()),
    };

    res.json(dashboard);
  } catch (error) {
    console.error('[Audit] Dashboard error:', error);
    res.status(500).json({ error: 'Failed to get dashboard data' });
  }
});

// Get all audit schedules
router.get('/schedules', async (req, res) => {
  try {
    const schedules = await db.select().from(auditSchedules);
    res.json(schedules);
  } catch (error) {
    console.error('[Audit] Get schedules error:', error);
    res.status(500).json({ error: 'Failed to get schedules' });
  }
});

// Run all scheduled audits (admin only)
router.post('/run-scheduled', async (req, res) => {
  try {
    // TODO: Add admin role check
    const count = await auditOrchestrator.runScheduledAudits();
    res.json({
      success: true,
      message: `Executed ${count} scheduled audits`,
      count,
    });
  } catch (error) {
    console.error('[Audit] Run scheduled error:', error);
    res.status(500).json({ error: 'Failed to run scheduled audits' });
  }
});

export default router;
