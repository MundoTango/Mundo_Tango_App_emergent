/**
 * ARCHITECT AGENT - Real Code Review & Validation
 * MB.MD Priority 2: Replaces auto-approve stub with evidence-based validation
 * 
 * Evidence Package Required:
 * - Code changes (diffs)
 * - Test results (must pass)
 * - Screenshots (visual proof)
 * - Server logs (must be clean)
 * - Browser logs (no console errors)
 * - Integration proof (component actually rendered)
 * 
 * Created: October 28, 2025
 */

import Anthropic from '@anthropic-ai/sdk';
import type { BrowserTestResult } from './BrowserTesterAgent';

/*
<important_code_snippet_instructions>
The newest Anthropic model is "claude-sonnet-4-20250514", not "claude-3-7-sonnet-20250219", "claude-3-5-sonnet-20241022" nor "claude-3-sonnet-20240229". 
If the user doesn't specify a model, always prefer using "claude-sonnet-4-20250514" as it is the latest model.
</important_code_snippet_instructions>
*/

const DEFAULT_MODEL_STR = "claude-sonnet-4-20250514";

interface ArchitectReview {
  changeId: string;
  approved: boolean;
  issues: string[];
  suggestions: string[];
  severity: 'minor' | 'major' | 'critical';
  score: number; // 0-100
}

interface EvidencePackage {
  codeChanges: Array<{
    filePath: string;
    diff: string;
    type: string;
  }>;
  screenshots?: string[];
  serverLogs?: string[];
  browserLogs?: string[];
  testResults?: BrowserTestResult;
  integrationProof?: {
    componentPath: string;
    parentPath: string;
    imported: boolean;
    rendered: boolean;
  };
}

interface ArchitectContext {
  taskDescription: string;
  evidencePackage: EvidencePackage;
  executionMode?: 'FOCUSED' | 'PARALLEL' | 'SIMULTANEOUS';
}

/**
 * ArchitectAgent - Real validation with evidence requirements
 * Replaces the auto-approve stub in VibeGraph.ts line 679
 */
export class ArchitectAgent {
  private anthropic: Anthropic;
  private model: string = DEFAULT_MODEL_STR;

  constructor() {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not found in environment');
    }
    this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  /**
   * Review code changes with evidence validation
   * Returns approval only if ALL criteria met
   */
  async review(context: ArchitectContext, changeId: string): Promise<ArchitectReview> {
    console.log(`🏛️  [ArchitectAgent] Starting review for: ${context.taskDescription}`);

    // MANDATORY PRE-CHECKS: Validate evidence package
    const preCheckResults = this.validateEvidencePackage(context.evidencePackage);
    
    if (preCheckResults.critical.length > 0) {
      console.log(`❌ [ArchitectAgent] REJECTED - Missing critical evidence`);
      return {
        changeId,
        approved: false,
        issues: preCheckResults.critical,
        suggestions: preCheckResults.warnings,
        severity: 'critical',
        score: 0
      };
    }

    // AI-powered code review
    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildUserPrompt(context);

    try {
      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      // Parse AI review
      const aiReview = this.parseAIReview(content.text);

      // Combine AI review with pre-check results
      const finalReview: ArchitectReview = {
        changeId,
        approved: aiReview.score >= 70 && preCheckResults.warnings.length === 0,
        issues: [...aiReview.issues, ...preCheckResults.warnings],
        suggestions: aiReview.suggestions,
        severity: this.calculateSeverity(aiReview.score, preCheckResults),
        score: aiReview.score
      };

      if (finalReview.approved) {
        console.log(`✅ [ArchitectAgent] APPROVED - Score: ${finalReview.score}/100`);
      } else {
        console.log(`❌ [ArchitectAgent] REJECTED - Score: ${finalReview.score}/100`);
        console.log(`   Issues: ${finalReview.issues.join(', ')}`);
      }

      return finalReview;

    } catch (error) {
      console.error('[ArchitectAgent] Error during review:', error);
      
      // FAIL SAFE: Reject on error (never auto-approve)
      return {
        changeId,
        approved: false,
        issues: ['Architect review service unavailable', error instanceof Error ? error.message : 'Unknown error'],
        suggestions: ['Retry the review after checking service status'],
        severity: 'critical',
        score: 0
      };
    }
  }

  /**
   * MANDATORY PRE-CHECKS: Validate evidence package completeness
   */
  private validateEvidencePackage(evidence: EvidencePackage): {
    critical: string[];
    warnings: string[];
  } {
    const critical: string[] = [];
    const warnings: string[] = [];

    // Critical: Must have code changes
    if (!evidence.codeChanges || evidence.codeChanges.length === 0) {
      critical.push('No code changes provided');
    }

    // Critical: Test results must exist and pass
    if (!evidence.testResults) {
      critical.push('No test results provided - testing is MANDATORY');
    } else if (!evidence.testResults.passed) {
      critical.push(`Tests failed: ${evidence.testResults.errors.map(e => e.message).join(', ')}`);
    }

    // Critical: Screenshots required for UI changes
    if (evidence.codeChanges.some(c => c.filePath.includes('.tsx') || c.filePath.includes('.jsx'))) {
      if (!evidence.screenshots || evidence.screenshots.length === 0) {
        critical.push('No screenshots provided for UI changes - visual proof is MANDATORY');
      }
    }

    // Warning: Server logs should be clean
    if (evidence.serverLogs && evidence.serverLogs.some(log => log.includes('ERROR') || log.includes('FATAL'))) {
      warnings.push('Server logs contain errors');
    }

    // Warning: Browser logs should be clean
    if (evidence.browserLogs && evidence.browserLogs.some(log => log.includes('error') || log.includes('warning'))) {
      warnings.push('Browser console contains errors or warnings');
    }

    // Warning: Integration proof recommended
    if (evidence.codeChanges.some(c => c.filePath.includes('components/'))) {
      if (!evidence.integrationProof || !evidence.integrationProof.imported || !evidence.integrationProof.rendered) {
        warnings.push('Component integration not verified - confirm component is imported and rendered');
      }
    }

    return { critical, warnings };
  }

  /**
   * Build system prompt for AI review
   */
  private buildSystemPrompt(): string {
    return `You are the Architect Agent in the MB.MD (Mapping → Breakdown → Mitigation → Deployment) methodology.

Your role is to perform STRICT code review with evidence-based validation. You have the power to REJECT changes that don't meet quality standards.

## Review Criteria (Score 0-100)

### Code Quality (40 points)
- Syntax & Types: Proper TypeScript types, no syntax errors
- Code Style: Consistent with existing codebase conventions
- Best Practices: Follows React/Node.js/TypeScript best practices
- Security: No SQL injection, XSS, secrets exposure, path traversal
- Performance: No obvious performance issues (N+1 queries, unnecessary re-renders)

### Integration (30 points)
- Component Imports: New components are imported where used
- Route Registration: New routes are registered in App.tsx
- Type Safety: Shared types used between frontend/backend
- Database Schema: Drizzle schema updated if data model changes
- API Contracts: Frontend and backend agree on request/response formats

### Testing & Evidence (30 points)
- Test Coverage: Critical paths are tested
- Visual Proof: Screenshots show the feature working
- Error Handling: Edge cases handled gracefully
- Logs: Clean server and browser logs (no errors)
- Documentation: Complex logic has comments

## Scoring Guidelines
- 90-100: Excellent - APPROVE immediately
- 70-89: Good with minor issues - APPROVE with suggestions
- 50-69: Acceptable but needs improvements - APPROVE with caution
- 0-49: Significant issues - REJECT and request fixes

## Output Format (JSON)
{
  "score": 85,
  "approved": true,
  "issues": ["Issue 1", "Issue 2"],
  "suggestions": ["Suggestion 1", "Suggestion 2"],
  "highlights": ["Good practice 1", "Good practice 2"]
}

Be constructive but STRICT. Reject broken code. Protect code quality.`;
  }

  /**
   * Build user prompt with evidence package
   */
  private buildUserPrompt(context: ArchitectContext): string {
    const { taskDescription, evidencePackage, executionMode } = context;

    let prompt = `# Architect Review Request

## Task Description
${taskDescription}

## Execution Mode
${executionMode || 'Not specified'}

## Code Changes
${evidencePackage.codeChanges.map((change, i) => `
### Change ${i + 1}: ${change.filePath}
\`\`\`diff
${change.diff}
\`\`\`
`).join('\n')}

## Evidence Collected

### Test Results
${evidencePackage.testResults ? `
- Status: ${evidencePackage.testResults.passed ? '✅ PASSED' : '❌ FAILED'}
- Duration: ${evidencePackage.testResults.duration}ms
- Screenshots: ${evidencePackage.testResults.screenshots.length}
- Errors: ${evidencePackage.testResults.errors.length}
${evidencePackage.testResults.errors.length > 0 ? `
Errors:
${evidencePackage.testResults.errors.map(e => `- ${e.message}`).join('\n')}
` : ''}
` : '⚠️  No test results provided'}

### Screenshots
${evidencePackage.screenshots && evidencePackage.screenshots.length > 0 
  ? `✅ ${evidencePackage.screenshots.length} screenshot(s) captured` 
  : '⚠️  No screenshots provided'}

### Integration Proof
${evidencePackage.integrationProof ? `
- Component: ${evidencePackage.integrationProof.componentPath}
- Parent: ${evidencePackage.integrationProof.parentPath}
- Imported: ${evidencePackage.integrationProof.imported ? '✅' : '❌'}
- Rendered: ${evidencePackage.integrationProof.rendered ? '✅' : '❌'}
` : '⚠️  No integration proof provided'}

### Server Logs
${evidencePackage.serverLogs && evidencePackage.serverLogs.length > 0
  ? evidencePackage.serverLogs.slice(0, 10).join('\n')
  : '⚠️  No server logs provided'}

### Browser Console
${evidencePackage.browserLogs && evidencePackage.browserLogs.length > 0
  ? evidencePackage.browserLogs.slice(0, 10).join('\n')
  : '⚠️  No browser logs provided'}

Please review this code change and provide your assessment in JSON format.`;

    return prompt;
  }

  /**
   * Parse AI review response
   */
  private parseAIReview(response: string): {
    score: number;
    issues: string[];
    suggestions: string[];
  } {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        score: parsed.score ?? 0,
        issues: parsed.issues || [],
        suggestions: parsed.suggestions || []
      };
    } catch (error) {
      console.error('[ArchitectAgent] Error parsing AI review:', error);
      
      // Return conservative score on parse error
      return {
        score: 50,
        issues: ['Failed to parse review response'],
        suggestions: []
      };
    }
  }

  /**
   * Calculate final severity based on score and pre-checks
   */
  private calculateSeverity(
    score: number,
    preChecks: { critical: string[]; warnings: string[] }
  ): 'minor' | 'major' | 'critical' {
    if (preChecks.critical.length > 0 || score < 50) {
      return 'critical';
    }
    if (preChecks.warnings.length > 0 || score < 70) {
      return 'major';
    }
    return 'minor';
  }
}

/**
 * Factory function
 */
export function createArchitectAgent(): ArchitectAgent {
  return new ArchitectAgent();
}
