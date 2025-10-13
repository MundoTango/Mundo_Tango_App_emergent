import { Router } from 'express';
import { platformAuditService } from '../services/platformAuditService';

const router = Router();

/**
 * Run Platform Audit - Layer 4 & 4B of "The Audit"
 * Finds translation gaps and dark mode design issues
 * 
 * POST /api/platform-audit/run
 */
router.post('/run', async (req, res) => {
  try {
    console.log('🔬 Starting Platform Audit...');
    
    const results = await platformAuditService.auditPlatform();
    
    console.log(`📊 Audit Complete:
      - Total Pages: ${results.totalPages}
      - Translation Issues: ${results.translationIssues.length}
      - Dark Mode Issues: ${results.darkModeIssues.length}
      - Health Score: ${results.summary.healthScore}%
    `);

    res.json(results);
  } catch (error) {
    console.error('❌ Platform audit failed:', error);
    res.status(500).json({ 
      error: 'Platform audit failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get translation fixes report
 * 
 * GET /api/platform-audit/translation-fixes
 */
router.get('/translation-fixes', async (req, res) => {
  try {
    const results = await platformAuditService.auditPlatform();
    const fixReport = platformAuditService.generateTranslationFixes(results.translationIssues);
    
    res.setHeader('Content-Type', 'text/markdown');
    res.send(fixReport);
  } catch (error) {
    console.error('❌ Failed to generate translation fixes:', error);
    res.status(500).json({ error: 'Failed to generate fixes' });
  }
});

/**
 * Get dark mode fixes report
 * 
 * GET /api/platform-audit/dark-mode-fixes
 */
router.get('/dark-mode-fixes', async (req, res) => {
  try {
    const results = await platformAuditService.auditPlatform();
    const fixReport = platformAuditService.generateDarkModeFixes(results.darkModeIssues);
    
    res.setHeader('Content-Type', 'text/markdown');
    res.send(fixReport);
  } catch (error) {
    console.error('❌ Failed to generate dark mode fixes:', error);
    res.status(500).json({ error: 'Failed to generate fixes' });
  }
});

export default router;
