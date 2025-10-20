import { Router, Request, Response } from 'express';

/**
 * MB.MD Phase 5: CSP Violation Reporting Endpoint
 * Collects and logs Content Security Policy violations for monitoring
 */

const router = Router();

interface CSPViolation {
  'document-uri': string;
  'violated-directive': string;
  'effective-directive': string;
  'original-policy': string;
  'blocked-uri': string;
  'source-file'?: string;
  'line-number'?: number;
  'column-number'?: number;
  'status-code': number;
}

interface CSPReport {
  'csp-report': CSPViolation;
}

// Store recent violations for monitoring (in-memory for now)
const recentViolations: Array<CSPViolation & { timestamp: string }> = [];
const MAX_VIOLATIONS = 100;

// POST /api/csp-report - Receive CSP violation reports
router.post('/api/csp-report', (req: Request, res: Response) => {
  try {
    const report: CSPReport = req.body;
    
    if (!report || !report['csp-report']) {
      return res.status(400).json({ error: 'Invalid CSP report format' });
    }
    
    const violation = report['csp-report'];
    
    // Log violation
    console.warn('🛡️  [CSP VIOLATION]', {
      timestamp: new Date().toISOString(),
      directive: violation['violated-directive'],
      blockedUri: violation['blocked-uri'],
      documentUri: violation['document-uri'],
      sourceFile: violation['source-file'],
      lineNumber: violation['line-number']
    });
    
    // Store for monitoring
    recentViolations.push({
      ...violation,
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 100 violations
    if (recentViolations.length > MAX_VIOLATIONS) {
      recentViolations.shift();
    }
    
    // Always return 204 No Content for CSP reports
    res.status(204).end();
  } catch (error) {
    console.error('Error processing CSP report:', error);
    res.status(204).end(); // Still return 204 to avoid retries
  }
});

// GET /api/csp-violations - View recent violations (admin only)
router.get('/api/csp-violations', (req: Request, res: Response) => {
  // TODO: Add admin auth check
  const user = (req as any).user;
  
  if (!user || !user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  // Group violations by directive
  const groupedViolations = recentViolations.reduce((acc, violation) => {
    const directive = violation['violated-directive'];
    if (!acc[directive]) {
      acc[directive] = [];
    }
    acc[directive].push(violation);
    return acc;
  }, {} as Record<string, typeof recentViolations>);
  
  res.json({
    total: recentViolations.length,
    groupedByDirective: Object.keys(groupedViolations).map(directive => ({
      directive,
      count: groupedViolations[directive].length,
      recent: groupedViolations[directive].slice(-5) // Last 5 per directive
    })),
    recentViolations: recentViolations.slice(-20) // Last 20 overall
  });
});

export default router;
