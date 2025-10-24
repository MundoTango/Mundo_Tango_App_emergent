/**
 * EDITOR AGENT - Generate Code Changes
 * MB.MD SIMULTANEOUS - Agent #4: Multi-Agent Orchestration Specialist
 * 
 * Responsibilities:
 * - Generate unified diffs for file edits
 * - Use SEARCH/REPLACE format (Aider-style)
 * - Leverage repository map for context
 * - Handle both new files and edits
 * 
 * Created: October 23, 2025
 */

import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs/promises';
import * as path from 'path';

interface CodeChange {
  taskId: string;
  filePath: string;
  diff: string;
  type: 'unified_diff' | 'search_replace' | 'new_file';
  status: 'pending' | 'applied' | 'failed';
  error?: string;
}

interface EditorContext {
  taskDescription: string;
  filePath: string;
  currentContent?: string;
  repositoryMap?: string;
}

/**
 * EditorAgent - Generates code changes using Claude
 */
export class EditorAgent {
  private anthropic: Anthropic;
  private model: string = 'claude-sonnet-4-5-20250929'; // Claude Sonnet 4.5 - replacement for deprecated 3.5 Sonnet
  private projectRoot: string;

  constructor(projectRoot: string = process.cwd()) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not found in environment');
    }
    this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    this.projectRoot = projectRoot;
  }

  /**
   * Generate code change for a task
   */
  async generateChange(context: EditorContext, taskId: string): Promise<CodeChange> {
    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = await this.buildUserPrompt(context);

    try {
      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 8192,
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

      // Extract SEARCH/REPLACE blocks or unified diff
      const diff = this.extractDiff(content.text);
      
      return {
        taskId,
        filePath: context.filePath,
        diff,
        type: 'unified_diff',
        status: 'pending'
      };
    } catch (error) {
      console.error('[EditorAgent] Error generating change:', error);
      
      return {
        taskId,
        filePath: context.filePath,
        diff: '',
        type: 'unified_diff',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Build system prompt for code generation
   */
  private buildSystemPrompt(): string {
    return `You are the Editor Agent in a multi-agent vibe coding system.

Your role is to generate precise code changes using the SEARCH/REPLACE format.

SEARCH/REPLACE Format:
<<<<<<< SEARCH
[exact lines to find in the file]
=======
[exact replacement lines]
>>>>>>> REPLACE

Guidelines:
1. Use SEARCH/REPLACE blocks for edits (NOT unified diff format)
2. Search block must match EXACTLY (including indentation, whitespace)
3. Include enough context (3-5 lines around change) for reliable matching
4. Multiple SEARCH/REPLACE blocks are allowed per file
5. For new files, output the complete file content without SEARCH/REPLACE markers
6. Never include explanations inside SEARCH/REPLACE blocks
7. Preserve existing code style (indentation, formatting)

Example:
<<<<<<< SEARCH
function login() {
  return "old code";
}
=======
function login(email: string, password: string) {
  return "new code";
}
>>>>>>> REPLACE

Now generate the code change for the task.`;
  }

  /**
   * Build user prompt with context
   */
  private async buildUserPrompt(context: EditorContext): Promise<string> {
    let prompt = `Task: ${context.taskDescription}\n`;
    prompt += `File: ${context.filePath}\n\n`;

    // Try to load current file content
    try {
      const fullPath = path.join(this.projectRoot, context.filePath);
      const content = await fs.readFile(fullPath, 'utf-8');
      prompt += `Current File Content:\n\`\`\`\n${content}\n\`\`\`\n\n`;
    } catch (error) {
      // File doesn't exist - will create new file
      prompt += `File does not exist - create new file with complete content.\n\n`;
    }

    if (context.repositoryMap) {
      prompt += `Repository Context (for imports/references):\n${context.repositoryMap}\n\n`;
    }

    prompt += `Generate the code change using SEARCH/REPLACE format.`;

    return prompt;
  }

  /**
   * Extract diff from Claude's response
   */
  private extractDiff(response: string): string {
    // Look for SEARCH/REPLACE blocks
    const hasSearchReplace = response.includes('<<<<<<< SEARCH');
    
    if (hasSearchReplace) {
      // Return the full response containing SEARCH/REPLACE blocks
      return response;
    }

    // Fallback: extract code block if present
    const codeBlockMatch = response.match(/```[\s\S]*?```/);
    if (codeBlockMatch) {
      return codeBlockMatch[0].replace(/```\w*\n?/g, '');
    }

    return response;
  }
}

/**
 * Factory function
 */
export function createEditorAgent(projectRoot?: string): EditorAgent {
  return new EditorAgent(projectRoot);
}
