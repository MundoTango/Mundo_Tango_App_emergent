import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

export interface FileChange {
  path: string;
  content: string;
  type: 'create' | 'update' | 'delete';
}

export interface GitBranchResult {
  branch: string;
  created: boolean;
  previousBranch: string;
}

export interface GitCommitResult {
  committed: boolean;
  filesChanged: number;
  commitHash: string;
}

/**
 * Track C: Git Automation Service
 * Agent #78: Visual Page Editor
 * 
 * Provides git operations for Visual Page Editor:
 * - Branch creation for visual edits
 * - File writing with backup
 * - Automated commits with descriptive messages
 * - Push to remote (optional)
 */
export class GitAutomationService {
  private projectRoot: string;

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
  }

  /**
   * Create a new feature branch for visual editing
   * Pattern: visual-edit-{timestamp}
   */
  async createFeatureBranch(description: string = 'visual-edit'): Promise<GitBranchResult> {
    const timestamp = Date.now();
    const branchName = `${description}-${timestamp}`;

    try {
      // Get current branch
      const { stdout: currentBranch } = await execAsync('git branch --show-current', {
        cwd: this.projectRoot
      });

      // Create and checkout new branch
      await execAsync(`git checkout -b ${branchName}`, {
        cwd: this.projectRoot
      });

      return {
        branch: branchName,
        created: true,
        previousBranch: currentBranch.trim()
      };
    } catch (error) {
      throw new Error(`Failed to create branch: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Switch to an existing branch
   */
  async checkoutBranch(branchName: string): Promise<void> {
    try {
      await execAsync(`git checkout ${branchName}`, {
        cwd: this.projectRoot
      });
    } catch (error) {
      throw new Error(`Failed to checkout branch ${branchName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Apply file changes with automatic backup
   * Creates .backup files before overwriting
   */
  async applyChanges(files: FileChange[]): Promise<void> {
    for (const file of files) {
      const fullPath = path.join(this.projectRoot, file.path);

      try {
        if (file.type === 'delete') {
          // Backup before delete
          const backupPath = `${fullPath}.backup`;
          await fs.copyFile(fullPath, backupPath);
          await fs.unlink(fullPath);
        } else {
          // Backup existing file if it exists
          try {
            const exists = await fs.access(fullPath).then(() => true).catch(() => false);
            if (exists && file.type === 'update') {
              const backupPath = `${fullPath}.backup`;
              await fs.copyFile(fullPath, backupPath);
            }
          } catch {
            // File doesn't exist, no backup needed
          }

          // Ensure directory exists
          const dir = path.dirname(fullPath);
          await fs.mkdir(dir, { recursive: true });

          // Write new content
          await fs.writeFile(fullPath, file.content, 'utf-8');
        }
      } catch (error) {
        throw new Error(`Failed to apply changes to ${file.path}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  /**
   * Commit changes with descriptive message
   * Pattern: "Visual edit: [component] - [changes]"
   */
  async commitChanges(
    files: FileChange[],
    customMessage?: string,
    author?: { name: string; email: string }
  ): Promise<GitCommitResult> {
    try {
      // Stage all changes
      await execAsync('git add .', {
        cwd: this.projectRoot
      });

      // Generate commit message
      const fileCount = files.length;
      const fileNames = files.map(f => path.basename(f.path)).join(', ');
      const message = customMessage || `Visual edit: ${fileCount} file(s) updated (${fileNames})`;

      // Commit with optional author
      let commitCmd = `git commit -m "${message}"`;
      if (author) {
        commitCmd = `git -c user.name="${author.name}" -c user.email="${author.email}" commit -m "${message}"`;
      }

      const { stdout } = await execAsync(commitCmd, {
        cwd: this.projectRoot
      });

      // Extract commit hash
      const { stdout: hash } = await execAsync('git rev-parse HEAD', {
        cwd: this.projectRoot
      });

      return {
        committed: true,
        filesChanged: fileCount,
        commitHash: hash.trim().substring(0, 7)
      };
    } catch (error) {
      throw new Error(`Failed to commit changes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Push branch to remote (optional for preview deployment)
   */
  async pushBranch(branchName: string, remote: string = 'origin'): Promise<void> {
    try {
      await execAsync(`git push -u ${remote} ${branchName}`, {
        cwd: this.projectRoot
      });
    } catch (error) {
      throw new Error(`Failed to push branch ${branchName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get current git status
   */
  async getStatus(): Promise<{ clean: boolean; branch: string; modified: string[] }> {
    try {
      const { stdout: branch } = await execAsync('git branch --show-current', {
        cwd: this.projectRoot
      });

      const { stdout: status } = await execAsync('git status --porcelain', {
        cwd: this.projectRoot
      });

      const modified = status
        .split('\n')
        .filter(line => line.trim())
        .map(line => line.substring(3));

      return {
        clean: status.trim() === '',
        branch: branch.trim(),
        modified
      };
    } catch (error) {
      throw new Error(`Failed to get git status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Rollback to previous commit (safety feature)
   */
  async rollbackLastCommit(): Promise<void> {
    try {
      await execAsync('git reset --soft HEAD~1', {
        cwd: this.projectRoot
      });
    } catch (error) {
      throw new Error(`Failed to rollback commit: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clean up backup files
   */
  async cleanupBackups(): Promise<number> {
    try {
      const { stdout } = await execAsync('find . -name "*.backup" -type f', {
        cwd: this.projectRoot
      });

      const backupFiles = stdout.split('\n').filter(f => f.trim());
      
      for (const file of backupFiles) {
        await fs.unlink(path.join(this.projectRoot, file));
      }

      return backupFiles.length;
    } catch (error) {
      // Non-critical error, return 0
      return 0;
    }
  }
}

// Export singleton instance
export const gitService = new GitAutomationService();

/**
 * Track C Helper Functions
 * Quick access functions for common operations
 */

export async function createVisualEditBranch(description?: string): Promise<GitBranchResult> {
  return gitService.createFeatureBranch(description || 'visual-edit');
}

export async function applyVisualChanges(files: FileChange[]): Promise<GitCommitResult> {
  await gitService.applyChanges(files);
  return gitService.commitChanges(files);
}

export async function deployPreview(branchName: string): Promise<string> {
  // Push to remote for preview deployment
  await gitService.pushBranch(branchName);
  
  // Return preview URL (to be implemented with Vercel/Netlify)
  return `https://preview-${branchName}.your-domain.com`;
}
