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

  constructor(userRequest: string, user: User, context?: any) {
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
  }

  /**
   * Execute the complete graph
   */
  async execute(): Promise<VibeState> {
    try {
      // Node 1: Planning (Manager Agent)
      await this.managerNode();

      // Node 2: Code Generation (Editor Agent)
      while (this.state.currentTaskIndex < this.state.tasks.length) {
        await this.editorNode();

        // Node 3: Verification (Verifier Agent)
        await this.verifierNode();

        // Conditional: If approved, move to next task
        if (this.state.allApproved) {
          this.state.currentTaskIndex++;
          this.state.retryCount = 0; // Reset retry count for next task
        } else {
          // If rejected, retry (up to maxRetries)
          this.state.retryCount++;
          
          if (this.state.retryCount >= this.maxRetries) {
            this.state.status = 'failed';
            this.state.errors.push('Max retries exceeded');
            return this.state;
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
      } else {
        // If tests fail, could retry or fail
        this.state.status = 'failed';
      }

      return this.state;
    } catch (error) {
      this.state.status = 'failed';
      this.state.errors.push(error instanceof Error ? error.message : 'Unknown error');
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
   * Tester Node - Run tests
   * MVP: Auto-pass for now, can enhance later with Playwright integration
   */
  private async testerNode(): Promise<void> {
    this.state.status = 'testing';

    // MVP: Auto-pass (can add Playwright tests later)
    this.state.testResults = {
      passed: true,
      failures: [],
      screenshots: []
    };
    
    console.log('✅ [VibeGraph] Tester auto-passed');
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
