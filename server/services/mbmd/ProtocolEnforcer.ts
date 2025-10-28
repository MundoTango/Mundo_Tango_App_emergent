/**
 * PROTOCOL ENFORCER - Makes MB.MD Rules UNBYPASSABLE
 * Created: October 28, 2025
 * Purpose: Prevent agents from skipping verification, integration, screenshots, tests, and architect review
 * 
 * Enforcement Layer:
 * 1. Tool Pre-Conditions: Require evidence before task creation
 * 2. Completion Gates: Block task completion without proof
 * 3. Deployment Veto: QA Agent has final say
 */

import { QAAgent, type EvidencePackage, type ValidationResult } from './QAAgent';

export interface DocumentationEvidence {
  docs_read: string[];
  verification_checklist_completed: boolean;
  integration_points_mapped: IntegrationPoint[];
  requirements_summary: string;
}

export interface IntegrationPoint {
  component: string;
  parent: string;
  imported: boolean;
  rendered: boolean;
  props_wired: boolean;
}

export interface TaskCompletionEvidence {
  task_id: string;
  screenshots: string[];
  browser_logs?: string;
  server_logs?: string;
  test_results?: any;
  integration_proof?: any;
  architect_reviewed: boolean;
  architect_approval?: string;
}

export class ProtocolEnforcer {
  private qaAgent: QAAgent;

  constructor() {
    this.qaAgent = new QAAgent();
  }

  /**
   * RULE 1: VERIFY BEFORE BUILD
   * Enforce documentation verification before task creation
   */
  validateDocumentationEvidence(evidence: DocumentationEvidence): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check docs were read
    if (!evidence.docs_read || evidence.docs_read.length === 0) {
      errors.push('❌ RULE 1 VIOLATION: No documentation read. Must read relevant docs BEFORE building.');
    }

    // Check verification checklist completed
    if (!evidence.verification_checklist_completed) {
      errors.push('❌ RULE 1 VIOLATION: Verification checklist not completed. See docs/DOCUMENTATION_VERIFICATION.md');
    }

    // Check integration points mapped
    if (!evidence.integration_points_mapped || evidence.integration_points_mapped.length === 0) {
      errors.push('❌ RULE 1 VIOLATION: Integration points not mapped. Must identify where feature hooks into app.');
    }

    // Check requirements summary provided
    if (!evidence.requirements_summary || evidence.requirements_summary.length < 50) {
      errors.push('❌ RULE 1 VIOLATION: Requirements summary missing or too short. Must summarize requirements.');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * RULE 2: INTEGRATE IMMEDIATELY
   * Validate integration points are wired correctly
   */
  validateIntegration(integrationPoints: IntegrationPoint[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const point of integrationPoints) {
      if (!point.imported) {
        errors.push(`❌ RULE 2 VIOLATION: ${point.component} not imported into ${point.parent}`);
      }

      if (!point.rendered) {
        errors.push(`❌ RULE 2 VIOLATION: ${point.component} not rendered in ${point.parent} JSX`);
      }

      if (!point.props_wired) {
        errors.push(`❌ RULE 2 VIOLATION: ${point.component} props not wired correctly in ${point.parent}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * RULE 3: SCREENSHOT EVERYTHING
   * Validate screenshot evidence exists
   */
  validateScreenshots(screenshots: string[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!screenshots || screenshots.length === 0) {
      errors.push('❌ RULE 3 VIOLATION: No screenshots provided. Screenshots are MANDATORY.');
      return { valid: false, errors };
    }

    if (screenshots.length < 3) {
      errors.push(`❌ RULE 3 VIOLATION: Only ${screenshots.length} screenshots. Need at least 3 (access, action, result).`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * RULE 4: TEST USER JOURNEY
   * Validate user journey was tested
   */
  validateUserJourney(testResults: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!testResults) {
      errors.push('❌ RULE 4 VIOLATION: No test results provided. Must test user journey.');
      return { valid: false, errors };
    }

    if (!testResults.regular_user_tested) {
      errors.push('❌ RULE 4 VIOLATION: Regular user journey not tested.');
    }

    if (!testResults.super_admin_tested) {
      errors.push('❌ RULE 4 VIOLATION: Super admin journey not tested.');
    }

    if (!testResults.access_controls_verified) {
      errors.push('❌ RULE 4 VIOLATION: Access controls not verified.');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * RULE 5: ARCHITECT VALIDATES
   * Validate architect review was completed
   */
  validateArchitectReview(evidence: TaskCompletionEvidence): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!evidence.architect_reviewed) {
      errors.push('❌ RULE 5 VIOLATION: Architect review not completed. Must call architect tool before marking complete.');
      return { valid: false, errors };
    }

    if (!evidence.architect_approval) {
      errors.push('❌ RULE 5 VIOLATION: Architect approval status missing.');
      return { valid: false, errors };
    }

    if (evidence.architect_approval === 'rejected') {
      errors.push('❌ RULE 5 VIOLATION: Architect rejected changes. Must fix issues before deployment.');
      return { valid: false, errors };
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * COMPREHENSIVE VALIDATION
   * Run all rules at once
   */
  async validateTaskCompletion(evidence: TaskCompletionEvidence): Promise<ValidationResult> {
    const allErrors: string[] = [];

    // Rule 3: Screenshots
    const screenshotCheck = this.validateScreenshots(evidence.screenshots);
    if (!screenshotCheck.valid) {
      allErrors.push(...screenshotCheck.errors);
    }

    // Rule 5: Architect Review
    const architectCheck = this.validateArchitectReview(evidence);
    if (!architectCheck.valid) {
      allErrors.push(...architectCheck.errors);
    }

    // Use QA Agent for comprehensive validation
    const qaEvidence: EvidencePackage = {
      sessionId: 0, // Will be set by caller
      screenshots: evidence.screenshots,
      browserLogs: evidence.browser_logs,
      serverLogs: evidence.server_logs,
      testResults: evidence.test_results,
      integrationProof: evidence.integration_proof,
      requiresArchitectReview: true
    };

    const qaResult = await this.qaAgent.validate(qaEvidence);

    // Combine all errors
    const failedChecks = qaResult.checks.filter(c => !c.passed);
    allErrors.push(...failedChecks.map(c => c.message));

    return {
      passed: allErrors.length === 0,
      checks: qaResult.checks,
      feedback: allErrors.length > 0 
        ? `❌ ${allErrors.length} MB.MD protocol violations:\n\n${allErrors.join('\n')}`
        : '✅ All MB.MD protocol checks passed. Task ready for completion.'
    };
  }

  /**
   * DEPLOYMENT GATE
   * Final check before allowing deployment
   */
  async canDeploy(sessionId: number, evidence: TaskCompletionEvidence): Promise<{ allowed: boolean; reason: string }> {
    const validation = await this.validateTaskCompletion(evidence);

    if (!validation.passed) {
      return {
        allowed: false,
        reason: `🚫 DEPLOYMENT BLOCKED\n\n${validation.feedback}\n\nFix all violations before deploying.`
      };
    }

    return {
      allowed: true,
      reason: '✅ All MB.MD checks passed. Deployment approved.'
    };
  }
}
