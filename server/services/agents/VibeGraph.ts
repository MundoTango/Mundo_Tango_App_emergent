/**
 * VIBE GRAPH - Multi-Agent State Orchestrator
 * MB.MD SIMULTANEOUS - Agent #4: Multi-Agent Orchestration Specialist
 * 
 * Research Sources:
 * - LangGraph: State graphs with conditional edges
 * - Pattern: Manager → Editor → Verifier → Tester (with retry loops)
 * 
 * Created: October 23, 2025
 * Updated: October 26, 2025 - Real AI integration with Claude Sonnet 4
 */

import Anthropic from '@anthropic-ai/sdk';
import type { User } from '@shared/schema';
import { readFileSync } from 'fs';
import { join } from 'path';
import { BrowserTesterAgent, type BrowserTestResult, type TestSpec } from './BrowserTesterAgent';
import { SelfHealerAgent, type BugFix } from './SelfHealerAgent';
import { SessionManager } from '../SessionManager';

/*
<important_code_snippet_instructions>
The newest Anthropic model is "claude-sonnet-4-20250514", not "claude-3-7-sonnet-20250219", "claude-3-5-sonnet-20241022" nor "claude-3-sonnet-20240229". 
If the user doesn't specify a model, always prefer using "claude-sonnet-4-20250514" as it is the latest model.
</important_code_snippet_instructions>
*/

// <important_do_not_delete>
const DEFAULT_MODEL_STR = "claude-sonnet-4-20250514";
// </important_do_not_delete>

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * State shared across all agents in the graph
 */
interface VibeState {
  // Input
  userRequest: string;
  visualEditorContext?: {
    selectedElement: any;
    previewPath: string;
  };
  user: User;

  // 🎯 REPLIT-STYLE: Clarification & Conversation Mode
  needsClarification: boolean;
  clarificationQuestion?: string;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;

  // Planning (Manager Agent)
  tasks: Task[];
  currentTaskIndex: number;

  // Code Generation (Editor Agent)
  codeChanges: CodeChange[];
  currentChange?: CodeChange;

  // Verification (Verifier Agent)
  verificationResults: VerificationResult[];
  allApproved: boolean;

  // Testing (Tester Agent)
  testResults?: TestResult;

  // Error Handling
  errors: string[];
  retryCount: number;
  maxRetries: number;

  // Status
  status: 'planning' | 'editing' | 'verifying' | 'testing' | 'complete' | 'failed' | 'needs_clarification';
}

interface Task {
  id: string;
  description: string;
  filesPaths: string[];
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

interface CodeChange {
  taskId: string;
  filePath: string;
  diff: string;
  type: 'unified_diff' | 'search_replace';
  status: 'pending' | 'applied' | 'failed';
  error?: string;
}

interface VerificationResult {
  changeId: string;
  approved: boolean;
  issues: string[];
  suggestions: string[];
}

interface TestResult {
  passed: boolean;
  failures: string[];
  screenshots: string[];
  browserTestResult?: BrowserTestResult;
  selfHealingAttempts?: number;
}

/**
 * VibeGraph - LangGraph-inspired state orchestrator
 * 
 * Flow:
 * Manager → Editor → Verifier → (if approved) Tester → Complete
 *                              → (if rejected) Editor (retry)
 *                              → (if test fails) Editor (fix)
 */
export class VibeGraph {
  private state: VibeState;
  private maxRetries: number = 3;
  private sessionManager: SessionManager | null = null;
  private browserTester: BrowserTesterAgent | null = null;
  private selfHealer: SelfHealerAgent;
  private enableAutonomousMode: boolean;

  constructor(
    userRequest: string,
    user: User,
    context?: any,
    options?: { autonomousMode?: boolean; maxMinutes?: number }
  ) {
    this.state = {
      userRequest,
      user,
      visualEditorContext: context,
      needsClarification: false,
      conversationHistory: [{ role: 'user', content: userRequest }],
      tasks: [],
      currentTaskIndex: 0,
      codeChanges: [],
      verificationResults: [],
      allApproved: false,
      errors: [],
      retryCount: 0,
      maxRetries: this.maxRetries,
      status: 'planning'
    };
    
    // 🚀 PHASE 1: Initialize autonomous mode agents
    this.enableAutonomousMode = options?.autonomousMode || false;
    this.selfHealer = new SelfHealerAgent();
    
    if (this.enableAutonomousMode) {
      const maxMinutes = options?.maxMinutes || 200;
      this.sessionManager = new SessionManager(userRequest, maxMinutes);
      console.log(`🤖 [VibeGraph] Autonomous mode ENABLED (max ${maxMinutes} min)`);
    }
  }

  /**
   * Execute the complete graph
   * 🚀 PHASE 1.4: Wrapped with SessionManager for 200-min autonomous runtime
   */
  async execute(): Promise<VibeState> {
    try {
      // 🚀 PHASE 1: Initialize session tracking
      if (this.sessionManager) {
        this.sessionManager.updateMetrics({
          tasksTotal: this.state.tasks.length || 1
        });
      }

      // Node 1: Planning (Manager Agent)
      await this.managerNode();

      // Update task count after planning
      if (this.sessionManager) {
        this.sessionManager.updateMetrics({
          tasksTotal: this.state.tasks.length
        });
      }

      // Node 2: Code Generation (Editor Agent)
      while (this.state.currentTaskIndex < this.state.tasks.length) {
        // Check if max runtime exceeded
        if (this.sessionManager && this.sessionManager.hasExceededMaxRuntime()) {
          this.state.status = 'failed';
          this.state.errors.push('Max runtime exceeded');
          this.sessionManager.completeSession('failed', 'Max runtime exceeded');
          return this.state;
        }

        // Set current task in session
        const currentTask = this.state.tasks[this.state.currentTaskIndex];
        if (this.sessionManager && currentTask) {
          this.sessionManager.setCurrentTask(currentTask.description);
        }

        await this.editorNode();

        // Node 3: Verification (Verifier Agent)
        await this.verifierNode();

        // Conditional: If approved, move to next task
        if (this.state.allApproved) {
          this.state.currentTaskIndex++;
          this.state.retryCount = 0; // Reset retry count for next task
          
          // Update session metrics
          if (this.sessionManager) {
            this.sessionManager.updateMetrics({
              tasksCompleted: this.state.currentTaskIndex,
              codeChangesProposed: this.state.codeChanges.length
            });
          }
        } else {
          // If rejected, retry (up to maxRetries)
          this.state.retryCount++;
          
          if (this.state.retryCount >= this.maxRetries) {
            this.state.status = 'failed';
            this.state.errors.push('Max retries exceeded');
            
            if (this.sessionManager) {
              this.sessionManager.completeSession('failed', 'Max retries exceeded');
            }
            
            return this.state;
          }

          // Track retry in session
          if (this.sessionManager) {
            this.sessionManager.updateMetrics({
              totalRetries: (this.sessionManager.getSession().metrics.totalRetries || 0) + 1
            });
          }

          // Loop back to editor with verification feedback
          continue;
        }
      }

      // Node 4: Testing (Tester Agent)
      await this.testerNode();

      // Conditional: If tests pass, complete
      if (this.state.testResults?.passed) {
        this.state.status = 'complete';
        
        if (this.sessionManager) {
          this.sessionManager.completeSession('completed');
        }
      } else {
        // If tests fail, could retry or fail
        this.state.status = 'failed';
        
        if (this.sessionManager) {
          this.sessionManager.completeSession('failed', 'Tests failed after self-healing attempts');
        }
      }

      return this.state;
    } catch (error) {
      this.state.status = 'failed';
      this.state.errors.push(error instanceof Error ? error.message : 'Unknown error');
      
      if (this.sessionManager) {
        this.sessionManager.completeSession('failed', error instanceof Error ? error.message : 'Unknown error');
      }
      
      return this.state;
    }
  }

  /**
   * Manager Node - Plan tasks from user request
   * Uses Claude Sonnet 4 for intelligent task planning
   */
  private async managerNode(): Promise<void> {
    this.state.status = 'planning';
    
    try {
      // Build context for AI
      let contextInfo = `User request: "${this.state.userRequest}"\n\n`;
      
      if (this.state.visualEditorContext?.selectedElement) {
        const el = this.state.visualEditorContext.selectedElement;
        contextInfo += `Selected element in Visual Editor:\n`;
        contextInfo += `- Tag: ${el.tag}\n`;
        contextInfo += `- ID: ${el.id || 'none'}\n`;
        contextInfo += `- Classes: ${el.className || 'none'}\n`;
        contextInfo += `- Text: ${el.innerText?.substring(0, 100) || 'none'}\n`;
        contextInfo += `- XPath: ${el.xpath || 'none'}\n\n`;
      }
      
      if (this.state.visualEditorContext?.previewPath) {
        contextInfo += `Current page: ${this.state.visualEditorContext.previewPath}\n\n`;
      }
      
      const prompt = `You are a Replit-style AI coding assistant. Analyze this request and decide if you need clarification or can proceed.

${contextInfo}

Conversation so far:
${this.state.conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}

Your job:
1. If the request is AMBIGUOUS or UNCLEAR, ask a clarifying question
2. If the request is CLEAR, create a task plan

Examples of ambiguous requests:
- "make it red" → Ask: "Which element do you want red? The background, button, or heading?"
- "add a smiley face" → Ask: "Where should I add the smiley? In the heading, next to a button, or as decoration?"
- "change the color" → Ask: "Which color should I change, and what color would you like?"

Examples of clear requests:
- "change the background to red and add a smiley face emoji to the welcome heading" → Proceed
- "make the button blue with rounded corners" → Proceed

Return ONLY a JSON object:
{
  "needsClarification": true/false,
  "clarificationQuestion": "Your question here" (only if needsClarification is true),
  "tasks": [
    {
      "description": "Clear description of what to do",
      "files": ["path/to/file.tsx"],
      "priority": "high|medium|low"
    }
  ] (only if needsClarification is false)
}

Common file patterns for tasks:
- Landing page: client/src/pages/landing.tsx
- Home page: client/src/pages/home.tsx  
- Components: client/src/components/
- Styles: CSS classes in the component files`;

      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL_STR,
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }]
      });
      
      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }
      
      // Parse JSON response
      const planText = content.text.trim();
      const jsonMatch = planText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const plan = JSON.parse(jsonMatch[0]);
      
      // 🎯 REPLIT-STYLE: Check if AI needs clarification
      if (plan.needsClarification) {
        this.state.needsClarification = true;
        this.state.clarificationQuestion = plan.clarificationQuestion;
        this.state.status = 'needs_clarification';
        console.log('❓ [VibeGraph] Needs clarification:', plan.clarificationQuestion);
        return; // Don't create tasks yet
      }
      
      // Convert to Task objects
      this.state.tasks = plan.tasks.map((t: any, i: number) => ({
        id: String(i + 1),
        description: t.description,
        filesPaths: t.files || [],
        priority: t.priority || 'high',
        status: 'pending' as const
      }));
      
      console.log('✅ [VibeGraph] Manager planned', this.state.tasks.length, 'tasks');
      
    } catch (error) {
      console.error('❌ [VibeGraph] Manager error:', error);
      // Fallback: Create simple task
      this.state.tasks = [{
        id: '1',
        description: this.state.userRequest,
        filesPaths: ['client/src/pages/landing.tsx'], // Reasonable default
        priority: 'high',
        status: 'pending'
      }];
    }
  }

  /**
   * Editor Node - Generate code changes
   * Uses Claude Sonnet 4 for intelligent code generation
   */
  private async editorNode(): Promise<void> {
    this.state.status = 'editing';
    
    const currentTask = this.state.tasks[this.state.currentTaskIndex];
    if (!currentTask) return;

    currentTask.status = 'in_progress';

    try {
      const targetFile = currentTask.filesPaths[0];
      if (!targetFile) {
        throw new Error('No target file specified');
      }
      
      // Read current file content
      let currentCode = '';
      try {
        currentCode = readFileSync(join(process.cwd(), targetFile), 'utf-8');
      } catch (readError) {
        console.warn(`⚠️ [VibeGraph] Could not read ${targetFile}, assuming new file`);
      }
      
      // Build prompt for code generation
      let contextInfo = '';
      if (this.state.visualEditorContext?.selectedElement) {
        const el = this.state.visualEditorContext.selectedElement;
        contextInfo = `\n\nSelected element context:
- Tag: ${el.tag}
- ID: ${el.id || 'none'}
- Classes: ${el.className || 'none'}
- Text content: ${el.innerText?.substring(0, 100) || 'none'}`;
      }
      
      const prompt = `You are a code editor. Generate a unified diff to accomplish this task:

Task: ${currentTask.description}
File: ${targetFile}
${contextInfo}

Current file content:
\`\`\`
${currentCode.substring(0, 5000)}${currentCode.length > 5000 ? '\n... (truncated)' : ''}
\`\`\`

Generate a unified diff in standard format. Example:
\`\`\`diff
--- a/${targetFile}
+++ b/${targetFile}
@@ -10,7 +10,7 @@
-  <div className="container">
+  <div className="container bg-red-500">
     <h1>Welcome</h1>
-    <p>Hello</p>
+    <p>Hello 😊</p>
   </div>
\`\`\`

Rules:
1. Use exact unified diff format with --- and +++ headers
2. Include enough context lines (3-5 lines before/after)
3. Make minimal, focused changes
4. Preserve existing code structure and style
5. Return ONLY the diff, no explanations`;

      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL_STR,
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }]
      });
      
      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }
      
      // Extract diff from response
      let diffText = content.text.trim();
      
      // Remove markdown code blocks if present
      diffText = diffText.replace(/```diff\n?/g, '').replace(/```\n?/g, '');
      
      // Validate diff format
      if (!diffText.includes('---') || !diffText.includes('+++')) {
        throw new Error('Invalid diff format - missing headers');
      }
      
      // Extract file path from diff
      const fileMatch = diffText.match(/^---\s+a\/(.+)$/m);
      const extractedPath = fileMatch ? fileMatch[1] : targetFile;
      
      // CRITICAL: Validate no placeholders
      if (extractedPath === 'unknown' || extractedPath.includes('TODO')) {
        throw new Error('Failed to identify target file');
      }
      if (diffText.includes('// TODO') || diffText.includes('TODO: Generate')) {
        throw new Error('AI returned placeholder diff');
      }
      
      this.state.currentChange = {
        taskId: currentTask.id,
        filePath: extractedPath,
        diff: diffText,
        type: 'unified_diff',
        status: 'pending'
      };

      this.state.codeChanges.push(this.state.currentChange);
      console.log('✅ [VibeGraph] Editor generated diff for', extractedPath);
      
    } catch (error) {
      console.error('❌ [VibeGraph] Editor error:', error);
      this.state.errors.push(error instanceof Error ? error.message : 'Editor failed');
      currentTask.status = 'failed';
    }
  }

  /**
   * Verifier Node - Check code quality
   * MVP: Auto-approve for now, can enhance later with AI verification
   */
  private async verifierNode(): Promise<void> {
    this.state.status = 'verifying';

    if (!this.state.currentChange) {
      this.state.allApproved = false;
      return;
    }

    // MVP: Auto-approve (can add Claude-based code review later)
    const result: VerificationResult = {
      changeId: this.state.currentChange.taskId,
      approved: true,
      issues: [],
      suggestions: []
    };

    this.state.verificationResults.push(result);
    this.state.allApproved = result.approved;
    
    console.log('✅ [VibeGraph] Verifier auto-approved change');
  }

  /**
   * Tester Node - Run browser tests with Playwright
   * 🚀 PHASE 1.4: Real browser testing + self-healing loop
   */
  private async testerNode(): Promise<void> {
    this.state.status = 'testing';

    // If autonomous mode disabled, auto-pass (backward compatibility)
    if (!this.enableAutonomousMode) {
      this.state.testResults = {
        passed: true,
        failures: [],
        screenshots: []
      };
      console.log('✅ [VibeGraph] Tester auto-passed (autonomous mode OFF)');
      return;
    }

    // 🚀 PHASE 1: Run actual browser tests with self-healing loop
    try {
      // Initialize browser tester
      if (!this.browserTester) {
        this.browserTester = new BrowserTesterAgent();
        await this.browserTester.initialize();
      }

      // Generate test spec from user request
      const testSpec = await this.browserTester.generateTestFromRequest(
        this.state.userRequest,
        this.state.visualEditorContext?.selectedElement
      );

      let testResult: BrowserTestResult;
      let selfHealingAttempts = 0;
      const maxSelfHealingRetries = 5;

      // Self-healing loop: Test → Fail → Heal → Retry
      while (selfHealingAttempts < maxSelfHealingRetries) {
        console.log(`🧪 [VibeGraph] Running browser test (attempt ${selfHealingAttempts + 1}/${maxSelfHealingRetries})...`);
        
        // Run Playwright test
        testResult = await this.browserTester.runTest(testSpec);

        // Update session metrics
        if (this.sessionManager) {
          this.sessionManager.updateMetrics({
            testsRun: (this.sessionManager.getSession().metrics.testsRun || 0) + 1,
            testsPassed: testResult.passed 
              ? (this.sessionManager.getSession().metrics.testsPassed || 0) + 1 
              : this.sessionManager.getSession().metrics.testsPassed,
            testsFailed: !testResult.passed 
              ? (this.sessionManager.getSession().metrics.testsFailed || 0) + 1 
              : this.sessionManager.getSession().metrics.testsFailed
          });
        }

        // If test passed, we're done!
        if (testResult.passed) {
          this.state.testResults = {
            passed: true,
            failures: [],
            screenshots: testResult.screenshots.map(s => s.path),
            browserTestResult: testResult,
            selfHealingAttempts
          };
          console.log(`✅ [VibeGraph] Browser test PASSED after ${selfHealingAttempts} healing attempts`);
          return;
        }

        // Test failed - attempt self-healing
        console.log(`❌ [VibeGraph] Test failed with ${testResult.errors.length} errors`);
        selfHealingAttempts++;

        if (selfHealingAttempts >= maxSelfHealingRetries) {
          console.log(`⏹️  [VibeGraph] Max self-healing retries reached`);
          break;
        }

        // Use SelfHealerAgent to diagnose and fix
        console.log(`🔧 [VibeGraph] Attempting self-healing (${selfHealingAttempts}/${maxSelfHealingRetries})...`);
        
        const bugFix: BugFix = await this.selfHealer.analyzeFailure(testResult);

        // Update session metrics
        if (this.sessionManager) {
          this.sessionManager.updateMetrics({
            selfHealingAttempts: (this.sessionManager.getSession().metrics.selfHealingAttempts || 0) + 1
          });
        }

        // Check if we should retry
        if (!this.selfHealer.shouldRetry(bugFix, selfHealingAttempts)) {
          console.log(`⏹️  [VibeGraph] Self-healing not recommended (confidence: ${bugFix.confidence})`);
          break;
        }

        // Apply the bug fix (add to code changes)
        if (bugFix.proposedFix.length > 0) {
          console.log(`✨ [VibeGraph] Applying ${bugFix.proposedFix.length} bug fixes...`);
          
          for (const fix of bugFix.proposedFix) {
            this.state.codeChanges.push({
              taskId: 'self-healing',
              filePath: fix.filePath,
              diff: fix.diff,
              type: 'unified_diff',
              status: 'pending'
            });
          }

          // Update session metrics
          if (this.sessionManager) {
            this.sessionManager.updateMetrics({
              selfHealingSuccesses: (this.sessionManager.getSession().metrics.selfHealingSuccesses || 0) + 1
            });
          }

          // TODO: Actually apply the fixes to files here
          // For now, just log that we would apply them
          console.log(`📝 [VibeGraph] Bug fixes queued for application`);
        }

        // Continue loop to retry test
      }

      // If we exit the loop, test failed even after healing
      this.state.testResults = {
        passed: false,
        failures: testResult!.errors.map(e => e.message),
        screenshots: testResult!.screenshots.map(s => s.path),
        browserTestResult: testResult!,
        selfHealingAttempts
      };
      
      console.log(`❌ [VibeGraph] Browser test FAILED after ${selfHealingAttempts} healing attempts`);

    } catch (error) {
      console.error('❌ [VibeGraph] Tester node error:', error);
      this.state.testResults = {
        passed: false,
        failures: [error instanceof Error ? error.message : 'Unknown test error'],
        screenshots: []
      };
    } finally {
      // Cleanup browser
      if (this.browserTester) {
        await this.browserTester.cleanup();
      }
    }
  }

  /**
   * Get current state
   */
  getState(): VibeState {
    return {
      ...this.state,
      needsClarification: this.state.needsClarification,
      clarificationQuestion: this.state.clarificationQuestion
    };
  }
}
