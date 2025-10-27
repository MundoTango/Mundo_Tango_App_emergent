/**
 * QA Agent - Phase 4 Deployment Validation
 * Squad D: Governance & QA - Oct 27, 2025
 */

import { db } from '../../db';
import { mbmdEvidence, mbmdReviews } from '@shared/schema';
import { eq } from 'drizzle-orm';

export interface ValidationResult {
  passed: boolean;
  checks: CheckResult[];
  feedback: string;
}

export interface CheckResult {
  name: string;
  passed: boolean;
  message: string;
}

export interface EvidencePackage {
  sessionId: number;
  screenshots: string[];
  browserLogs?: string;
  serverLogs?: string;
  testResults?: any;
  integrationProof?: any;
  requiresArchitectReview: boolean;
}

export class QAAgent {
  async validate(evidence: EvidencePackage): Promise<ValidationResult> {
    const checks: CheckResult[] = [];

    // 1. Screenshot evidence check
    checks.push(await this.validateScreenshots(evidence.screenshots));

    // 2. Browser console check
    if (evidence.browserLogs) {
      checks.push(await this.validateBrowserLogs(evidence.browserLogs));
    } else {
      checks.push({
        name: 'Browser Console',
        passed: false,
        message: 'No browser logs provided'
      });
    }

    // 3. Server log check
    if (evidence.serverLogs) {
      checks.push(await this.validateServerLogs(evidence.serverLogs));
    } else {
      checks.push({
        name: 'Server Logs',
        passed: false,
        message: 'No server logs provided'
      });
    }

    // 4. Test results check
    if (evidence.testResults) {
      checks.push(await this.validateTestResults(evidence.testResults));
    }

    // 5. Integration verification
    if (evidence.integrationProof) {
      checks.push(await this.validateIntegration(evidence.integrationProof));
    }

    // 6. Architect review check (if required)
    if (evidence.requiresArchitectReview) {
      checks.push(await this.validateArchitectApproval(evidence.sessionId));
    }

    const allPassed = checks.every(c => c.passed);

    return {
      passed: allPassed,
      checks,
      feedback: this.generateFeedback(checks)
    };
  }

  private async validateScreenshots(screenshots: string[]): Promise<CheckResult> {
    if (screenshots.length === 0) {
      return {
        name: 'Screenshot Evidence',
        passed: false,
        message: '❌ No screenshots provided. Screenshots are MANDATORY.'
      };
    }

    if (screenshots.length < 3) {
      return {
        name: 'Screenshot Evidence',
        passed: false,
        message: `⚠️ Only ${screenshots.length} screenshots provided. Need at least 3 (access, action, result).`
      };
    }

    return {
      name: 'Screenshot Evidence',
      passed: true,
      message: `✅ ${screenshots.length} screenshots provided`
    };
  }

  private async validateBrowserLogs(logs: string): Promise<CheckResult> {
    const hasErrors = logs.includes('ERROR') || logs.includes('[error]') || logs.includes('console.error');
    
    if (hasErrors) {
      return {
        name: 'Browser Console',
        passed: false,
        message: '❌ Browser console has errors. Must be clean before deployment.'
      };
    }

    return {
      name: 'Browser Console',
      passed: true,
      message: '✅ Browser console clean (no errors)'
    };
  }

  private async validateServerLogs(logs: string): Promise<CheckResult> {
    const hasErrors = logs.includes('[ERROR]') || logs.includes('Error:') || logs.includes('failed');
    
    if (hasErrors) {
      return {
        name: 'Server Logs',
        passed: false,
        message: '❌ Server logs contain errors. Must be clean before deployment.'
      };
    }

    return {
      name: 'Server Logs',
      passed: true,
      message: '✅ Server logs clean (no errors)'
    };
  }

  private async validateTestResults(testResults: any): Promise<CheckResult> {
    if (testResults.failed && testResults.failed > 0) {
      return {
        name: 'Test Results',
        passed: false,
        message: `❌ ${testResults.failed} tests failed. All tests must pass.`
      };
    }

    if (!testResults.passed || testResults.passed === 0) {
      return {
        name: 'Test Results',
        passed: false,
        message: '❌ No tests passed. Tests are required.'
      };
    }

    return {
      name: 'Test Results',
      passed: true,
      message: `✅ ${testResults.passed} tests passed`
    };
  }

  private async validateIntegration(integrationProof: any): Promise<CheckResult> {
    if (!integrationProof.imported) {
      return {
        name: 'Integration',
        passed: false,
        message: '❌ Component not imported. Must import into parent component.'
      };
    }

    if (!integrationProof.rendered) {
      return {
        name: 'Integration',
        passed: false,
        message: '❌ Component not rendered. Must add JSX to parent.'
      };
    }

    return {
      name: 'Integration',
      passed: true,
      message: '✅ Component integrated (imported and rendered)'
    };
  }

  private async validateArchitectApproval(sessionId: number): Promise<CheckResult> {
    const reviews = await db.select()
      .from(mbmdReviews)
      .where(eq(mbmdReviews.sessionId, sessionId));

    const architectReview = reviews.find(r => r.reviewer === 'architect');

    if (!architectReview) {
      return {
        name: 'Architect Review',
        passed: false,
        message: '❌ Architect review required but not found'
      };
    }

    if (!architectReview.approved) {
      return {
        name: 'Architect Review',
        passed: false,
        message: `❌ Architect rejected: ${architectReview.feedback}`
      };
    }

    return {
      name: 'Architect Review',
      passed: true,
      message: '✅ Architect approved'
    };
  }

  private generateFeedback(checks: CheckResult[]): string {
    const failed = checks.filter(c => !c.passed);
    
    if (failed.length === 0) {
      return '✅ All checks passed. Task ready for completion.';
    }

    return `❌ ${failed.length} checks failed:\n\n${failed.map(c => `- ${c.message}`).join('\n')}`;
  }
}
