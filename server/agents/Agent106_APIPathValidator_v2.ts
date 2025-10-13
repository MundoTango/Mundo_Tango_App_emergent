/**
 * Agent #106 v2: Auto-API Path Validator with Auto-Fix
 * MB.MD PHASE 5 - TRACK 17
 * 
 * Automatically fixes API path mismatches by generating route wrappers
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface APIPathMismatch {
  frontendPath: string;
  backendPath: string | null;
  httpMethod: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  autoFixable: boolean;
}

export class APIPathValidatorV2 {
  private criticalPaths = [
    '/api/admin/analytics',
    '/api/admin/dashboard/stats',
    '/api/esa-agents/health',
    '/api/smart-agents/status'
  ];

  /**
   * Run validation with auto-fix capability
   */
  async validateAndFix(dryRun = true): Promise<{
    mismatches: APIPathMismatch[];
    fixed: number;
    coverage: number;
    report: string;
  }> {
    console.log('🔍 [Agent #106 v2] Running API path validation with auto-fix...');
    
    try {
      // Run validation script
      const result = execSync('node scripts/validate-api-paths.mjs --json', {
        encoding: 'utf-8',
        maxBuffer: 10 * 1024 * 1024
      });
      
      const validation = JSON.parse(result);
      const mismatches = this.analyzeMismatches(validation);
      
      let fixed = 0;
      
      if (!dryRun) {
        // Auto-fix mismatches
        fixed = await this.autoFixMismatches(mismatches.filter(m => m.autoFixable));
      }
      
      const coverage = (validation.matches / validation.frontendCalls) * 100;
      
      return {
        mismatches,
        fixed,
        coverage,
        report: this.generateReport(mismatches, fixed, coverage)
      };
    } catch (error) {
      console.error('[Agent #106 v2] Validation failed:', error);
      throw error;
    }
  }

  /**
   * Analyze mismatches and categorize by severity
   */
  private analyzeMismatches(validation: any): APIPathMismatch[] {
    const mismatches: APIPathMismatch[] = [];
    
    // Parse mismatches from validation output
    const paths = validation.mismatches || [];
    
    for (const mismatch of paths) {
      const severity = this.determineSeverity(mismatch.frontendPath);
      const autoFixable = this.isAutoFixable(mismatch);
      
      mismatches.push({
        frontendPath: mismatch.frontendPath,
        backendPath: mismatch.suggestedBackend,
        httpMethod: mismatch.method || 'GET',
        severity,
        autoFixable
      });
    }
    
    return mismatches.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }

  /**
   * Determine severity based on path criticality
   */
  private determineSeverity(path: string): 'critical' | 'high' | 'medium' | 'low' {
    if (this.criticalPaths.some(cp => path.startsWith(cp))) {
      return 'critical';
    }
    
    if (path.includes('/admin/') || path.includes('/api/auth/')) {
      return 'high';
    }
    
    if (path.includes('/api/')) {
      return 'medium';
    }
    
    return 'low';
  }

  /**
   * Check if mismatch can be auto-fixed
   */
  private isAutoFixable(mismatch: any): boolean {
    // Can auto-fix if backend route exists without /api prefix
    if (mismatch.frontendPath.startsWith('/api/') && mismatch.suggestedBackend) {
      const withoutApi = mismatch.frontendPath.replace('/api/', '/');
      return mismatch.suggestedBackend === withoutApi;
    }
    
    return false;
  }

  /**
   * Auto-fix mismatches by generating route wrappers
   */
  private async autoFixMismatches(mismatches: APIPathMismatch[]): Promise<number> {
    console.log(`🔧 [Agent #106 v2] Auto-fixing ${mismatches.length} API path mismatches...`);
    
    const routeWrappers: string[] = [];
    
    for (const mismatch of mismatches.slice(0, 50)) { // Fix top 50
      const wrapper = this.generateRouteWrapper(mismatch);
      if (wrapper) {
        routeWrappers.push(wrapper);
      }
    }
    
    if (routeWrappers.length > 0) {
      // Write route wrappers to file
      const wrapperFile = path.join(process.cwd(), 'server/routes/apiPathWrappers.ts');
      const content = this.generateWrapperFile(routeWrappers);
      
      fs.writeFileSync(wrapperFile, content, 'utf-8');
      console.log(`✅ [Agent #106 v2] Generated ${routeWrappers.length} route wrappers`);
    }
    
    return routeWrappers.length;
  }

  /**
   * Generate route wrapper for a mismatch
   */
  private generateRouteWrapper(mismatch: APIPathMismatch): string | null {
    if (!mismatch.backendPath) return null;
    
    return `
// Auto-generated wrapper for ${mismatch.frontendPath}
router.${mismatch.httpMethod.toLowerCase()}('${mismatch.frontendPath}', async (req, res, next) => {
  // Forward to actual backend route: ${mismatch.backendPath}
  req.url = '${mismatch.backendPath}';
  next();
});`;
  }

  /**
   * Generate complete wrapper file
   */
  private generateWrapperFile(wrappers: string[]): string {
    return `/**
 * Auto-generated API Path Wrappers
 * Generated by Agent #106 v2 (MB.MD Phase 5)
 * 
 * These wrappers fix frontend/backend API path mismatches
 */

import { Router } from 'express';

const router = Router();

${wrappers.join('\n')}

export default router;
`;
  }

  /**
   * Generate validation report
   */
  private generateReport(mismatches: APIPathMismatch[], fixed: number, coverage: number): string {
    const critical = mismatches.filter(m => m.severity === 'critical').length;
    const high = mismatches.filter(m => m.severity === 'high').length;
    const autoFixable = mismatches.filter(m => m.autoFixable).length;
    
    return `
API Path Validation Report (Agent #106 v2)
==========================================
Coverage: ${coverage.toFixed(1)}%
Total Mismatches: ${mismatches.length}
Auto-Fixed: ${fixed}

Severity Breakdown:
- Critical: ${critical}
- High: ${high}
- Medium: ${mismatches.filter(m => m.severity === 'medium').length}
- Low: ${mismatches.filter(m => m.severity === 'low').length}

Auto-Fixable: ${autoFixable}
Remaining: ${mismatches.length - fixed}
`;
  }

  /**
   * Get validation statistics
   */
  async getStats() {
    const result = await this.validateAndFix(true);
    return {
      coverage: result.coverage,
      totalMismatches: result.mismatches.length,
      criticalIssues: result.mismatches.filter(m => m.severity === 'critical').length,
      autoFixable: result.mismatches.filter(m => m.autoFixable).length
    };
  }
}

export const agent106v2 = new APIPathValidatorV2();
