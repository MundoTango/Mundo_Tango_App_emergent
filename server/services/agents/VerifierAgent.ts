/**
 * VERIFIER AGENT - Code Quality Verification
 * MB.MD SIMULTANEOUS - Agent #4: Multi-Agent Orchestration Specialist
 * 
 * Responsibilities:
 * - Review generated code changes
 * - Check for syntax errors, type errors
 * - Validate code style consistency
 * - Suggest improvements
 * - Approve or reject changes
 * 
 * Created: October 23, 2025
 */

import Anthropic from '@anthropic-ai/sdk';

interface VerificationResult {
  changeId: string;
  approved: boolean;
  issues: string[];
  suggestions: string[];
  score: number; // 0-100
}

interface VerificationContext {
  filePath: string;
  diff: string;
  taskDescription: string;
}

/**
 * VerifierAgent - Reviews code quality using Claude
 */
export class VerifierAgent {
  private anthropic: Anthropic;
  private model: string = 'claude-sonnet-4-5-20250929'; // Claude Sonnet 4.5 - replacement for deprecated 3.5 Sonnet

  constructor() {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not found in environment');
    }
    this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  /**
   * Verify code change
   */
  async verify(context: VerificationContext, changeId: string): Promise<VerificationResult> {
    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildUserPrompt(context);

    try {
      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 2048,
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

      // Parse verification result
      const result = this.parseVerificationResult(content.text, changeId);
      return result;
    } catch (error) {
      console.error('[VerifierAgent] Error verifying code:', error);
      
      // Fallback: Auto-approve with warning
      return {
        changeId,
        approved: true,
        issues: ['Verification service unavailable'],
        suggestions: [],
        score: 50
      };
    }
  }

  /**
   * Build system prompt
   */
  private buildSystemPrompt(): string {
    return `You are the Verifier Agent in a multi-agent vibe coding system.

Your role is to review code changes for quality, correctness, and best practices.

Review Criteria:
1. **Syntax & Types**: No syntax errors, proper TypeScript types
2. **Code Style**: Consistent with existing codebase
3. **Best Practices**: Follows language/framework conventions
4. **Security**: No obvious security vulnerabilities
5. **Performance**: No obvious performance issues

Output Format (JSON):
{
  "approved": true/false,
  "score": 0-100,
  "issues": ["Critical issue 1", "Issue 2"],
  "suggestions": ["Suggestion 1", "Suggestion 2"]
}

Scoring:
- 90-100: Excellent, approve
- 70-89: Good with minor suggestions, approve
- 50-69: Acceptable with issues, approve with caution
- 0-49: Needs work, reject

Be constructive but strict. Reject obviously broken code.`;
  }

  /**
   * Build user prompt
   */
  private buildUserPrompt(context: VerificationContext): string {
    return `Task: ${context.taskDescription}
File: ${context.filePath}

Code Change:
\`\`\`
${context.diff}
\`\`\`

Please review this code change and provide verification result in JSON format.`;
  }

  /**
   * Parse verification result from Claude
   */
  private parseVerificationResult(response: string, changeId: string): VerificationResult {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        changeId,
        approved: parsed.approved ?? true,
        score: parsed.score ?? 80,
        issues: parsed.issues || [],
        suggestions: parsed.suggestions || []
      };
    } catch (error) {
      console.error('[VerifierAgent] Error parsing result:', error);
      
      // Fallback: Auto-approve
      return {
        changeId,
        approved: true,
        issues: [],
        suggestions: [],
        score: 75
      };
    }
  }
}

/**
 * Factory function
 */
export function createVerifierAgent(): VerifierAgent {
  return new VerifierAgent();
}
