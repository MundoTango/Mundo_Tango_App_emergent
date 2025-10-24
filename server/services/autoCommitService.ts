/**
 * AUTO-COMMIT SERVICE
 * Automatically commit changes with AI-generated messages
 * 
 * MB.MD Agent #126 (Git Operations Specialist)
 * October 24, 2025
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import Anthropic from '@anthropic-ai/sdk';

const execAsync = promisify(exec);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface CommitOptions {
  files?: string[]; // Specific files to commit (optional - commits all if not provided)
  context?: string; // Additional context for AI commit message
  userMessage?: string; // User's original request (for context)
}

export class AutoCommitService {
  /**
   * Generate AI commit message using Claude 3.5 Sonnet
   */
  private async generateCommitMessage(diff: string, context?: string, userMessage?: string): Promise<string> {
    try {
      const prompt = `You are a Git commit message generator. Based on the git diff below, generate a concise, professional commit message following conventional commits format.

${context ? `Context: ${context}\n` : ''}
${userMessage ? `User Request: ${userMessage}\n` : ''}

Git Diff:
\`\`\`
${diff}
\`\`\`

Generate a commit message in this format:
<type>(<scope>): <subject>

Where:
- type: feat, fix, refactor, docs, style, test, chore, etc.
- scope: component/file/area affected
- subject: brief description (max 72 chars)

Examples:
- feat(visual-editor): Add autonomous execution mode
- fix(chat): Resolve conversation persistence issue
- refactor(navigation): Simplify breadcrumb navigation logic

Only output the commit message, nothing else.`;

      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 200,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const content = message.content[0];
      if (content.type === 'text') {
        return content.text.trim();
      }

      throw new Error('Unexpected response format from Claude');
    } catch (error) {
      console.error('❌ [AutoCommit] Failed to generate AI message:', error);
      // Fallback commit message
      return 'chore: Autonomous code changes';
    }
  }

  /**
   * Auto-commit changes with AI-generated message
   */
  async autoCommit(options: CommitOptions = {}): Promise<{ success: boolean; message: string; commitHash?: string }> {
    try {
      console.log('🤖 [AutoCommit] Starting auto-commit...');

      // Stage files
      if (options.files && options.files.length > 0) {
        for (const file of options.files) {
          await execAsync(`git add "${file}"`);
        }
        console.log(`📁 [AutoCommit] Staged ${options.files.length} file(s)`);
      } else {
        // Stage all changes
        await execAsync('git add -A');
        console.log('📁 [AutoCommit] Staged all changes');
      }

      // Get diff for AI analysis
      const { stdout: diff } = await execAsync('git diff --cached');
      
      if (!diff.trim()) {
        return {
          success: false,
          message: 'No changes to commit'
        };
      }

      // Generate AI commit message
      console.log('🧠 [AutoCommit] Generating AI commit message...');
      const commitMessage = await this.generateCommitMessage(
        diff,
        options.context,
        options.userMessage
      );
      
      console.log(`💬 [AutoCommit] Generated message: "${commitMessage}"`);

      // Commit changes
      await execAsync(`git commit -m "${commitMessage}"`);

      // Get commit hash
      const { stdout: hash } = await execAsync('git rev-parse HEAD');
      const commitHash = hash.trim();

      console.log(`✅ [AutoCommit] Committed successfully: ${commitHash.substring(0, 7)}`);

      return {
        success: true,
        message: commitMessage,
        commitHash
      };
    } catch (error) {
      console.error('❌ [AutoCommit] Failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check if there are uncommitted changes
   */
  async hasUncommittedChanges(): Promise<boolean> {
    try {
      const { stdout } = await execAsync('git status --porcelain');
      return stdout.trim().length > 0;
    } catch (error) {
      console.error('❌ [AutoCommit] Failed to check git status:', error);
      return false;
    }
  }

  /**
   * Get list of changed files
   */
  async getChangedFiles(): Promise<string[]> {
    try {
      const { stdout } = await execAsync('git status --porcelain');
      return stdout
        .split('\n')
        .filter(line => line.trim())
        .map(line => line.substring(3).trim());
    } catch (error) {
      console.error('❌ [AutoCommit] Failed to get changed files:', error);
      return [];
    }
  }
}

// Export singleton instance
export const autoCommitService = new AutoCommitService();
