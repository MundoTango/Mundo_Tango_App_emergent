/**
 * TRACK 3C: Auto-Commit Service with AI Messages
 * MB.MD Vibe Coding - 100% Plan
 * 
 * Features:
 * - AI-powered commit messages via Claude 3.5 Sonnet
 * - Instant rollback (git reset --hard)
 * - Pre-commit validation
 * - Integration with Git Operations Specialist (Agent #126)
 */

import Anthropic from '@anthropic-ai/sdk';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface CommitOptions {
  message?: string; // Manual message (skips AI)
  generateAI?: boolean; // Generate AI message
  validate?: boolean; // Run pre-commit validation
  autoRollback?: boolean; // Auto-rollback on failure
}

export interface CommitResult {
  success: boolean;
  commitHash?: string;
  message: string;
  filesChanged: number;
  error?: string;
}

export class AutoCommitService {
  private anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
  }

  /**
   * Auto-commit with AI-generated message
   */
  async commit(options: CommitOptions = {}): Promise<CommitResult> {
    const {
      message,
      generateAI = true,
      validate = true,
      autoRollback = true
    } = options;

    try {
      // 1. Check git status
      const { stdout: statusOutput } = await execAsync('git status --porcelain');
      
      if (!statusOutput.trim()) {
        return {
          success: false,
          message: 'No changes to commit',
          filesChanged: 0,
          error: 'Working directory clean'
        };
      }

      const filesChanged = statusOutput.trim().split('\n').length;
      console.log(`[AutoCommit] 📊 ${filesChanged} file(s) changed`);

      // 2. Stage all changes
      await execAsync('git add -A');
      console.log('[AutoCommit] ✅ Staged all changes');

      // 3. Generate commit message
      let commitMessage = message;
      
      if (!commitMessage && generateAI) {
        commitMessage = await this.generateCommitMessage();
        console.log('[AutoCommit] 🤖 AI-generated message:', commitMessage);
      }

      if (!commitMessage) {
        commitMessage = 'chore: auto-commit via vibe coding';
      }

      // 4. Pre-commit validation (if enabled)
      if (validate) {
        const validationResult = await this.validateChanges();
        if (!validationResult.valid) {
          console.error('[AutoCommit] ❌ Validation failed:', validationResult.errors);
          
          if (autoRollback) {
            await this.rollback();
          }
          
          return {
            success: false,
            message: commitMessage,
            filesChanged,
            error: `Validation failed: ${validationResult.errors.join(', ')}`
          };
        }
      }

      // 5. Commit
      await execAsync(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`);
      
      // 6. Get commit hash
      const { stdout: hashOutput } = await execAsync('git rev-parse HEAD');
      const commitHash = hashOutput.trim();

      console.log(`[AutoCommit] ✅ Committed: ${commitHash.substring(0, 7)}`);

      return {
        success: true,
        commitHash,
        message: commitMessage,
        filesChanged
      };

    } catch (error) {
      console.error('[AutoCommit] ❌ Commit failed:', error);
      
      if (autoRollback) {
        await this.rollback();
      }

      return {
        success: false,
        message: message || 'Commit failed',
        filesChanged: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate AI commit message using Claude 3.5 Sonnet
   */
  private async generateCommitMessage(): Promise<string> {
    try {
      // Get git diff for context
      const { stdout: diffOutput } = await execAsync('git diff --cached --stat');
      const { stdout: diffContent } = await execAsync('git diff --cached');

      const prompt = `Generate a concise, conventional commit message for these changes.

Rules:
- Use conventional commits format: type(scope): description
- Types: feat, fix, refactor, docs, chore, style, test, perf
- Keep under 72 characters
- Be specific but concise

Changed files:
${diffOutput}

Diff preview (first 2000 chars):
${diffContent.substring(0, 2000)}

Respond with ONLY the commit message, nothing else.`;

      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 100,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const content = message.content[0];
      if (content.type === 'text') {
        return content.text.trim();
      }

      return 'chore: auto-commit via AI';

    } catch (error) {
      console.error('[AutoCommit] ❌ AI message generation failed:', error);
      return 'chore: auto-commit (AI generation failed)';
    }
  }

  /**
   * Pre-commit validation
   */
  private async validateChanges(): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Check for console.logs in production code
      const { stdout: grepOutput } = await execAsync(
        'git diff --cached | grep -E "console\\.(log|debug|warn)" || true'
      );
      
      if (grepOutput.trim()) {
        errors.push('Found console.log statements (consider removing for production)');
      }

      // Check for merge conflict markers
      const { stdout: conflictCheck } = await execAsync(
        'git diff --cached | grep -E "^(<<<<<<<|=======|>>>>>>>)" || true'
      );
      
      if (conflictCheck.trim()) {
        errors.push('Found merge conflict markers');
      }

      // Check TypeScript compilation (if TS files changed)
      const { stdout: tsFiles } = await execAsync(
        'git diff --cached --name-only | grep -E "\\.(ts|tsx)$" || true'
      );
      
      if (tsFiles.trim()) {
        try {
          await execAsync('npm run check');
        } catch {
          errors.push('TypeScript type check failed');
        }
      }

    } catch (error) {
      console.error('[AutoCommit] ⚠️ Validation error:', error);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Instant rollback (git reset --hard)
   */
  async rollback(): Promise<void> {
    try {
      await execAsync('git reset --hard HEAD');
      await execAsync('git clean -fd'); // Remove untracked files
      console.log('[AutoCommit] ⏪ Rolled back to HEAD');
    } catch (error) {
      console.error('[AutoCommit] ❌ Rollback failed:', error);
      throw error;
    }
  }

  /**
   * Rollback to specific commit
   */
  async rollbackToCommit(commitHash: string): Promise<void> {
    try {
      await execAsync(`git reset --hard ${commitHash}`);
      console.log(`[AutoCommit] ⏪ Rolled back to ${commitHash}`);
    } catch (error) {
      console.error('[AutoCommit] ❌ Rollback to commit failed:', error);
      throw error;
    }
  }
}
