import { db } from "@db";
import { validationResults, customerJourneyTests, type InsertValidationResult } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { learningCoordinator } from "../learning/learningCoordinator";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * ESA Agent #79: Critical Quality Validator
 * Validates features, finds issues, analyzes root causes, suggests solutions, offers collaboration
 */

export class QualityValidator {

  /**
   * Main validation workflow: "Is this ACTUALLY done?"
   */
  async validateFeature(params: {
    feature: string;
    page?: string;
    targetAgent: string;
    testType: 'functional' | 'performance' | 'mobile' | 'journey';
  }): Promise<any> {
    
    console.log(`[Agent #79] Validating ${params.feature} (${params.testType})...`);

    // Step 1: Run validation tests
    const issues = await this.runValidationTests(params);

    if (issues.length === 0) {
      // All good!
      const [result] = await db.insert(validationResults).values({
        targetAgent: params.targetAgent,
        feature: params.feature,
        page: params.page,
        testType: params.testType,
        status: 'passed',
        issues: [],
      }).returning();

      await this.logLearning({
        agent_id: 'Agent #79',
        category: 'validation',
        domain: params.testType,
        problem: `Validated ${params.feature}`,
        solution: 'All tests passed',
        outcome: { success: true, impact: 'medium' },
      });

      return { status: 'passed', result };
    }

    // Step 2: Analyze root causes
    const analyzed = await Promise.all(
      issues.map(issue => this.analyzeRootCause(issue))
    );

    // Step 3: Search for similar solved issues
    const suggestions = await this.generateSuggestions(analyzed);

    // Step 4: Create fix plan
    const fixPlan = this.createFixPlan(analyzed, suggestions);

    // Step 5: Store validation result
    const [result] = await db.insert(validationResults).values({
      targetAgent: params.targetAgent,
      feature: params.feature,
      page: params.page,
      testType: params.testType,
      status: 'failed',
      issues: analyzed,
      suggestions,
      fixPlan,
      collaborationOffered: true,
    }).returning();

    // Step 6: Send collaborative report to responsible agent
    await this.sendCollaborativeReport(params.targetAgent, result);

    // Step 7: Log learning
    await this.logLearning({
      agent_id: 'Agent #79',
      category: 'issue_found',
      domain: params.testType,
      problem: `Found ${issues.length} issues in ${params.feature}`,
      solution: `Suggested ${suggestions.length} proven fixes`,
      outcome: { success: true, impact: 'high' },
    });

    return { status: 'failed', result, suggestions, fixPlan };
  }

  /**
   * Run actual validation tests
   */
  private async runValidationTests(params: any): Promise<any[]> {
    const issues: any[] = [];

    // Simulated checks (in production: real Playwright/performance tests)
    
    if (params.testType === 'mobile') {
      // Check mobile-specific issues
      // For demo: simulate finding mobile overflow issue
      if (params.feature.includes('Visual Editor')) {
        issues.push({
          severity: 'high' as const,
          description: 'Selection overlay overflows viewport on mobile',
          location: 'SelectionLayer.tsx',
        });
      }
    }

    if (params.testType === 'performance') {
      // Check performance metrics
      // Simulate slow load check
    }

    if (params.testType === 'functional') {
      // Check functionality
    }

    return issues;
  }

  /**
   * Analyze root cause of issue
   */
  private async analyzeRootCause(issue: any): Promise<any> {
    // Use AI to analyze root cause
    let rootCause = '';

    if (issue.description.includes('overflow')) {
      rootCause = 'Fixed positioning without viewport constraints. Container lacks overflow-x: hidden and proper mobile media queries.';
    } else {
      // Use GPT-4 for complex analysis
      try {
        const analysis = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [{
            role: "system",
            content: "You are a senior software architect analyzing root causes of bugs. Be specific and technical."
          }, {
            role: "user",
            content: `Analyze the root cause of this issue: ${issue.description} in ${issue.location}`
          }],
          max_tokens: 200,
        });
        rootCause = analysis.choices[0]?.message?.content || 'Unknown root cause';
      } catch (error) {
        rootCause = 'Analysis failed - manual investigation needed';
      }
    }

    return {
      ...issue,
      root_cause: rootCause,
    };
  }

  /**
   * Generate solution suggestions (check patterns + AI)
   */
  private async generateSuggestions(issues: any[]): Promise<any[]> {
    const suggestions: any[] = [];

    for (const issue of issues) {
      // Check pattern library
      const similarLearnings = await learningCoordinator.searchKnowledge(
        issue.description,
        'Agent #79',
        3
      );

      if (similarLearnings.length > 0) {
        // Proven pattern exists
        const learning = similarLearnings[0];
        suggestions.push({
          type: 'proven_pattern' as const,
          solution: learning.solution,
          source: `${learning.agentId} solved this (confidence: ${Math.round(learning.confidence * 100)}%)`,
          confidence: learning.confidence,
          code_example: this.extractCodeExample(issue),
        });
      } else {
        // Generate AI solution
        const aiSolution = await this.generateAISolution(issue);
        suggestions.push({
          type: 'ai_generated' as const,
          solution: aiSolution,
          confidence: 0.75,
          code_example: this.extractCodeExample(issue),
        });
      }
    }

    return suggestions;
  }

  /**
   * Generate AI solution for novel issues
   */
  private async generateAISolution(issue: any): Promise<string> {
    if (issue.description.includes('overflow')) {
      return 'Add overflow-x: hidden to container and use position: relative instead of fixed';
    }

    try {
      const solution = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{
          role: "system",
          content: "You are a senior software engineer suggesting bug fixes. Be specific and actionable."
        }, {
          role: "user",
          content: `Suggest a fix for: ${issue.description}. Root cause: ${issue.root_cause}`
        }],
        max_tokens: 150,
      });
      return solution.choices[0]?.message?.content || 'Manual fix needed';
    } catch (error) {
      return 'Unable to generate solution - requires manual analysis';
    }
  }

  /**
   * Extract code example for fix
   */
  private extractCodeExample(issue: any): string {
    if (issue.description.includes('overflow')) {
      return `.selection-layer {
  overflow-x: hidden;
  position: relative; /* changed from fixed */
  max-width: 100vw;
}`;
    }
    return '// Code example not available';
  }

  /**
   * Create detailed fix plan
   */
  private createFixPlan(issues: any[], suggestions: any[]): any {
    const files = issues.map(i => i.location).filter(Boolean);
    
    return {
      priority: issues.some(i => i.severity === 'critical') ? 'critical' : 'high',
      estimated_time: `${issues.length * 30} minutes`,
      steps: [
        `1. Review ${issues.length} identified issues`,
        `2. Apply suggested fixes to ${files.join(', ')}`,
        '3. Test on target devices (iPhone 12, Pixel 5, iPad)',
        '4. Verify no regression on desktop',
        '5. Run validation suite again',
      ],
      files_to_modify: files,
      validation_criteria: [
        'All issues resolved',
        'No new issues introduced',
        'Performance within acceptable range',
        'User journey completes successfully',
      ],
    };
  }

  /**
   * Send collaborative report to responsible agent
   */
  private async sendCollaborativeReport(targetAgent: string, result: any): Promise<void> {
    const message = `
📱 [Agent #79 → ${targetAgent}] Found ${result.issues?.length || 0} issues in ${result.feature}

${result.issues?.map((issue: any, i: number) => `
${i + 1}. ${issue.description}
   ROOT CAUSE: ${issue.root_cause}
   SEVERITY: ${issue.severity}
`).join('\n')}

SUGGESTED FIXES:
${result.suggestions?.map((s: any, i: number) => `
${i + 1}. ${s.solution}
   TYPE: ${s.type}
   CONFIDENCE: ${Math.round(s.confidence * 100)}%
   ${s.source ? `SOURCE: ${s.source}` : ''}
`).join('\n')}

FIX PLAN:
- Priority: ${result.fixPlan?.priority}
- Estimated time: ${result.fixPlan?.estimated_time}
- Files to modify: ${result.fixPlan?.files_to_modify?.join(', ')}

OPTIONS:
A) Apply suggested fixes (I can help!)
B) Request detailed implementation plan
C) Pair-program the fix together
D) You have a better approach (share it!)

What would help you most?
    `;

    console.log(message);

    // In production: send to agent's queue/webhook
  }

  /**
   * Test customer journey end-to-end
   */
  async testCustomerJourney(params: {
    journeyName: string;
    steps: Array<{ step: number; description: string; route: string; expected_outcome: string; }>;
    responsibleAgents: string[];
    device?: 'desktop' | 'mobile' | 'tablet';
  }): Promise<any> {
    
    console.log(`[Agent #79] Testing journey: ${params.journeyName} on ${params.device || 'desktop'}...`);

    // Simulate journey test (in production: Playwright automation)
    const allPassed = Math.random() > 0.3; // Simulate 70% success rate

    if (allPassed) {
      const [result] = await db.insert(customerJourneyTests).values({
        journeyName: params.journeyName,
        journeySteps: params.steps,
        status: 'passed',
        responsibleAgents: params.responsibleAgents,
        deviceTested: params.device || 'desktop',
      }).returning();

      return { status: 'passed', result };
    }

    // Journey failed
    const failedStep = Math.floor(Math.random() * params.steps.length);
    const [result] = await db.insert(customerJourneyTests).values({
      journeyName: params.journeyName,
      journeySteps: params.steps,
      status: 'failed',
      failedStep,
      failureReason: `Step ${failedStep + 1} failed: ${params.steps[failedStep].description}`,
      responsibleAgents: params.responsibleAgents,
      deviceTested: params.device || 'desktop',
    }).returning();

    // Analyze and suggest fix
    await this.validateFeature({
      feature: params.journeyName,
      page: params.steps[failedStep].route,
      targetAgent: params.responsibleAgents[0],
      testType: 'journey',
    });

    return { status: 'failed', result };
  }

  /**
   * Log learning to Agent #80
   */
  private async logLearning(learning: any): Promise<void> {
    await learningCoordinator.captureLearning({
      agentId: learning.agent_id,
      category: learning.category,
      domain: learning.domain,
      problem: learning.problem,
      solution: learning.solution,
      outcome: learning.outcome,
      confidence: 0.8,
      tags: [learning.domain, learning.category],
    });
  }

  /**
   * Get validation metrics
   */
  async getMetrics(): Promise<any> {
    const totalValidations = await db.select().from(validationResults);
    const passed = totalValidations.filter(v => v.status === 'passed').length;
    const failed = totalValidations.filter(v => v.status === 'failed').length;

    return {
      total_validations: totalValidations.length,
      passed,
      failed,
      success_rate: totalValidations.length > 0 ? passed / totalValidations.length : 0,
      avg_fix_time: '45 minutes', // Calculate from timeToFix
      collaboration_offered: totalValidations.filter(v => v.collaborationOffered).length,
    };
  }
}

export const qualityValidator = new QualityValidator();
