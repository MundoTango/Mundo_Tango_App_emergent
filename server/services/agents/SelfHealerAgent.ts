/**
 * Self-Healer Agent - AI-powered bug fixing from test failures
 * MB.MD Phase 1.2: Auto-fix bugs using screenshot analysis
 * 
 * Research: docs/research/AUTONOMOUS_CODING_RESEARCH.md
 * Pattern: GPT-4 Vision analyzes failure screenshots → Generates bug fixes → Retry
 * 
 * Created: October 26, 2025
 */

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { readFileSync } from 'fs';
import type { BrowserTestResult, TestError } from './BrowserTesterAgent';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

export interface HealingStrategy {
  analysisMethod: 'visual' | 'stack_trace' | 'hybrid';
  model: 'gpt-4-vision' | 'claude-3-sonnet';
  maxRetries: number;
}

export interface BugFix {
  diagnosis: string;
  rootCause: string;
  proposedFix: {
    filePath: string;
    diff: string;
    explanation: string;
  }[];
  confidence: 'high' | 'medium' | 'low';
  retryRecommended: boolean;
}

/**
 * SelfHealerAgent - Analyzes test failures and generates fixes
 * 
 * Key Features (from Replit Agent 3 research):
 * - GPT-4 Vision for screenshot analysis
 * - Claude Sonnet for bug fix generation
 * - Multi-attempt healing (up to 5 retries)
 * - Confidence scoring
 */
export class SelfHealerAgent {
  private strategy: HealingStrategy;
  
  constructor(strategy?: Partial<HealingStrategy>) {
    this.strategy = {
      analysisMethod: strategy?.analysisMethod || 'hybrid',
      model: strategy?.model || 'gpt-4-vision',
      maxRetries: strategy?.maxRetries || 5
    };
  }
  
  /**
   * Analyze test failure and generate bug fix
   * 
   * Research Pattern (Replit Agent 3):
   * 1. Analyze screenshot with GPT-4 Vision
   * 2. Combine with stack trace analysis
   * 3. Generate code fix with Claude
   * 4. Return fix with confidence score
   */
  async analyzeFailure(
    testResult: BrowserTestResult,
    codeContext?: string
  ): Promise<BugFix> {
    console.log(`🔍 [SelfHealer] Analyzing ${testResult.errors.length} test errors`);
    
    if (testResult.passed) {
      throw new Error('Cannot heal a passing test');
    }
    
    // Step 1: Visual analysis of screenshots (if available)
    let visualAnalysis = '';
    if (testResult.screenshots.length > 0 && this.strategy.analysisMethod !== 'stack_trace') {
      visualAnalysis = await this.analyzeScreenshots(testResult);
    }
    
    // Step 2: Stack trace analysis
    let stackTraceAnalysis = '';
    if (testResult.errors.length > 0 && this.strategy.analysisMethod !== 'visual') {
      stackTraceAnalysis = await this.analyzeStackTraces(testResult.errors);
    }
    
    // Step 3: Generate bug fix with combined analysis
    const diagnosis = this.combinedDiagnosis(visualAnalysis, stackTraceAnalysis, testResult);
    
    // Step 4: Use Claude to generate code fixes
    const fix = await this.generateCodeFix(diagnosis, codeContext);
    
    return fix;
  }
  
  /**
   * Analyze screenshots with GPT-4 Vision
   * Returns visual evidence of what went wrong
   */
  private async analyzeScreenshots(testResult: BrowserTestResult): Promise<string> {
    const failureScreenshots = testResult.screenshots.filter(s => s.type === 'failure');
    
    if (failureScreenshots.length === 0) {
      return 'No failure screenshots available';
    }
    
    console.log(`📸 [SelfHealer] Analyzing ${failureScreenshots.length} failure screenshots`);
    
    try {
      // Use GPT-4 Vision to analyze the first failure screenshot
      const screenshot = failureScreenshots[0];
      const imageData = readFileSync(screenshot.path, { encoding: 'base64' });
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4-vision-preview',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `You are a QA engineer analyzing a failed browser test screenshot. 
                
Test: ${testResult.testName}
Screenshot: ${screenshot.description}

Analyze this screenshot and identify:
1. What visual evidence shows the test failed?
2. Are there any error messages visible?
3. Is the expected UI element missing or broken?
4. Are there any console errors visible?
5. What is the likely root cause?

Provide a concise analysis (2-3 sentences).`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${imageData}`
                }
              }
            ]
          }
        ]
      });
      
      const analysis = response.choices[0]?.message?.content || 'No analysis generated';
      console.log(`✅ [SelfHealer] Visual analysis: ${analysis.substring(0, 100)}...`);
      
      return analysis;
      
    } catch (error) {
      console.error('❌ [SelfHealer] Screenshot analysis failed:', error);
      return `Screenshot analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }
  
  /**
   * Analyze stack traces from test errors
   */
  private async analyzeStackTraces(errors: TestError[]): Promise<string> {
    const stackTraces = errors
      .filter(e => e.stack)
      .map(e => `${e.message}\n${e.stack}`)
      .join('\n\n');
    
    if (!stackTraces) {
      return errors.map(e => e.message).join('; ');
    }
    
    console.log(`📚 [SelfHealer] Analyzing stack traces from ${errors.length} errors`);
    
    // Use Claude for stack trace analysis (fast and cheap)
    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: `Analyze these test error stack traces and identify the root cause:

${stackTraces}

Provide a concise analysis (1-2 sentences) identifying:
1. The root cause of the failure
2. Which file/line is likely causing the issue`
          }
        ]
      });
      
      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type');
      }
      
      const analysis = content.text;
      console.log(`✅ [SelfHealer] Stack trace analysis: ${analysis.substring(0, 100)}...`);
      
      return analysis;
      
    } catch (error) {
      console.error('❌ [SelfHealer] Stack trace analysis failed:', error);
      return `Stack trace analysis failed: ${stackTraces.substring(0, 200)}`;
    }
  }
  
  /**
   * Combine visual + stack trace analysis into diagnosis
   */
  private combinedDiagnosis(
    visualAnalysis: string,
    stackTraceAnalysis: string,
    testResult: BrowserTestResult
  ): string {
    const parts: string[] = [`Test "${testResult.testName}" failed after ${testResult.duration}ms`];
    
    if (visualAnalysis && visualAnalysis !== 'No failure screenshots available') {
      parts.push(`\nVisual Evidence: ${visualAnalysis}`);
    }
    
    if (stackTraceAnalysis) {
      parts.push(`\nStack Trace Analysis: ${stackTraceAnalysis}`);
    }
    
    if (testResult.userJourney.length > 0) {
      const lastActions = testResult.userJourney.slice(-3);
      parts.push(`\nLast Actions: ${lastActions.map(a => a.description).join(' → ')}`);
    }
    
    return parts.join('\n');
  }
  
  /**
   * Generate code fix using Claude
   * Returns diff-formatted fix ready for application
   */
  private async generateCodeFix(diagnosis: string, codeContext?: string): Promise<BugFix> {
    console.log('🛠️  [SelfHealer] Generating code fix with Claude');
    
    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: `You are a senior developer fixing a bug identified by automated testing.

DIAGNOSIS:
${diagnosis}

${codeContext ? `\n CURRENT CODE CONTEXT:\n${codeContext}\n` : ''}

Generate a bug fix as a JSON object:
{
  "rootCause": "Brief explanation of the root cause",
  "proposedFix": [
    {
      "filePath": "path/to/file.tsx",
      "diff": "unified diff format",
      "explanation": "Why this fixes the issue"
    }
  ],
  "confidence": "high|medium|low",
  "retryRecommended": true|false
}

Rules:
1. Use unified diff format for fixes
2. Make minimal, focused changes
3. Set confidence based on how clear the diagnosis is
4. Only recommend retry if fix has medium/high confidence`
          }
        ]
      });
      
      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type');
      }
      
      // Parse JSON response
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const fixData = JSON.parse(jsonMatch[0]);
      
      const bugFix: BugFix = {
        diagnosis,
        rootCause: fixData.rootCause,
        proposedFix: fixData.proposedFix,
        confidence: fixData.confidence,
        retryRecommended: fixData.retryRecommended
      };
      
      console.log(`✅ [SelfHealer] Generated fix with ${bugFix.confidence} confidence`);
      
      return bugFix;
      
    } catch (error) {
      console.error('❌ [SelfHealer] Code fix generation failed:', error);
      
      // Return low-confidence fallback
      return {
        diagnosis,
        rootCause: 'Unable to determine root cause automatically',
        proposedFix: [],
        confidence: 'low',
        retryRecommended: false
      };
    }
  }
  
  /**
   * Assess if retry is worthwhile based on confidence
   */
  shouldRetry(bugFix: BugFix, currentRetryCount: number): boolean {
    if (currentRetryCount >= this.strategy.maxRetries) {
      console.log(`⏹️  [SelfHealer] Max retries (${this.strategy.maxRetries}) reached`);
      return false;
    }
    
    if (!bugFix.retryRecommended) {
      console.log('⏹️  [SelfHealer] Retry not recommended');
      return false;
    }
    
    if (bugFix.confidence === 'low' && currentRetryCount >= 2) {
      console.log('⏹️  [SelfHealer] Low confidence after 2 retries');
      return false;
    }
    
    console.log(`✅ [SelfHealer] Retry #${currentRetryCount + 1} recommended`);
    return true;
  }
}
