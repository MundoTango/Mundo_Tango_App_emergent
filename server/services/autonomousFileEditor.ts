/**
 * AGENT #142 (Multi-Model): Autonomous File Editing System
 * 
 * YOLO mode: AI can edit files autonomously with safety controls
 * Research: docs/research/AUTONOMOUS_CODING_RESEARCH.md
 */

import fs from 'fs/promises';
import path from 'path';
import { logger } from '../lib/logger';
import { approvalQueue } from './approvalQueue'; // STREAM 2 INTEGRATION - Human-in-the-Loop gates

export interface FileEdit {
  filePath: string;
  operation: 'create' | 'update' | 'delete';
  content?: string;
  diff?: string;
  reason: string;
}

export interface EditResult {
  success: boolean;
  filePath: string;
  operation: string;
  error?: string;
  backupPath?: string;
}

/**
 * Safety config for autonomous editing
 */
interface SafetyConfig {
  yoloMode: boolean; // If true, auto-apply edits; if false, queue for approval
  allowedPatterns: string[]; // File patterns that can be edited
  deniedPatterns: string[]; // File patterns that cannot be edited
  maxFileSize: number; // Max file size in bytes (5MB default)
  requireBackup: boolean; // Create backups before editing
}

const DEFAULT_SAFETY_CONFIG: SafetyConfig = {
  yoloMode: false, // Conservative by default
  allowedPatterns: [
    'client/src/**/*.tsx',
    'client/src/**/*.ts',
    'client/src/**/*.css',
    'server/**/*.ts',
    'shared/**/*.ts',
  ],
  deniedPatterns: [
    '**/node_modules/**',
    '**/.git/**',
    '**/dist/**',
    '**/.env',
    '**/package.json', // Require manual review
    '**/package-lock.json',
    '**/drizzle.config.ts',
  ],
  maxFileSize: 5 * 1024 * 1024, // 5MB
  requireBackup: true,
};

/**
 * Autonomous File Editor with safety controls
 */
export class AutonomousFileEditor {
  private config: SafetyConfig;
  private editQueue: FileEdit[] = [];
  private backupDir = path.join(process.cwd(), '.backups');

  constructor(config: Partial<SafetyConfig> = {}) {
    this.config = { ...DEFAULT_SAFETY_CONFIG, ...config };
    this.ensureBackupDir();
  }

  /**
   * Ensure backup directory exists
   */
  private async ensureBackupDir() {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
    } catch (error) {
      logger.error({ error }, 'Failed to create backup directory');
    }
  }

  /**
   * Check if file path is allowed for editing
   */
  private isFileAllowed(filePath: string): boolean {
    const normalizedPath = filePath.replace(/\\/g, '/');

    // Check denied patterns first
    for (const pattern of this.config.deniedPatterns) {
      const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
      if (regex.test(normalizedPath)) {
        logger.warn(`[AutonomousEditor] File denied by pattern: ${filePath}`);
        return false;
      }
    }

    // Check allowed patterns
    for (const pattern of this.config.allowedPatterns) {
      const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
      if (regex.test(normalizedPath)) {
        return true;
      }
    }

    logger.warn(`[AutonomousEditor] File not in allowed patterns: ${filePath}`);
    return false;
  }

  /**
   * Create backup of file before editing
   */
  private async createBackup(filePath: string): Promise<string | null> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupName = `${path.basename(filePath)}.${timestamp}.backup`;
      const backupPath = path.join(this.backupDir, backupName);

      const content = await fs.readFile(filePath, 'utf-8');
      await fs.writeFile(backupPath, content, 'utf-8');

      logger.info(`[AutonomousEditor] Backup created: ${backupPath}`);
      return backupPath;
    } catch (error) {
      logger.error({ error, filePath }, `[AutonomousEditor] Failed to create backup`);
      return null;
    }
  }

  /**
   * Queue file edit for review (non-YOLO mode)
   */
  queueEdit(edit: FileEdit): void {
    logger.info(`[AutonomousEditor] Queued edit: ${edit.operation} ${edit.filePath}`);
    this.editQueue.push(edit);
  }

  /**
   * Get pending edits queue
   */
  getPendingEdits(): FileEdit[] {
    return [...this.editQueue];
  }

  /**
   * Clear edit queue
   */
  clearQueue(): void {
    this.editQueue = [];
  }

  /**
   * Execute file edit with safety checks
   * STREAM 2 INTEGRATION: Human approval required for high-risk edits
   */
  async executeEdit(edit: FileEdit, userId?: number, override: boolean = false): Promise<EditResult> {
    const { filePath, operation, content, reason } = edit;

    // Safety check: Is file allowed?
    if (!this.isFileAllowed(filePath) && !override) {
      return {
        success: false,
        filePath,
        operation,
        error: 'File path not allowed by safety config',
      };
    }

    // STREAM 2: Human-in-the-loop gate for high-risk operations
    if (!this.config.yoloMode && userId && this.requiresHumanApproval(edit)) {
      const approval = await approvalQueue.createRequest(
        'file_edit',
        `${operation} ${filePath}`,
        { filePath, operation, content: content?.substring(0, 500), reason },
        userId,
        this.assessEditRisk(edit)
      );

      logger.info({ approvalId: approval.id, filePath }, '[AutonomousEditor] Queued for approval');

      const decision = await approvalQueue.waitForDecision(approval.id, 300000);
      if (decision !== 'approved') {
        return {
          success: false,
          filePath,
          operation,
          error: decision === 'rejected' ? 'Admin rejected edit' : 'Approval timeout',
        };
      }
    }

    // Safety check: File size (for updates)
    if (operation === 'update' && content) {
      if (Buffer.byteLength(content, 'utf-8') > this.config.maxFileSize) {
        return {
          success: false,
          filePath,
          operation,
          error: `File size exceeds limit (${this.config.maxFileSize} bytes)`,
        };
      }
    }

    try {
      let backupPath: string | null = null;

      // Create backup if required
      if (this.config.requireBackup && operation !== 'create') {
        try {
          const exists = await fs.access(filePath).then(() => true).catch(() => false);
          if (exists) {
            backupPath = await this.createBackup(filePath);
          }
        } catch (error) {
          logger.warn(`[AutonomousEditor] Backup failed for ${filePath}, continuing...`);
        }
      }

      // Execute operation
      switch (operation) {
        case 'create':
          if (!content) {
            throw new Error('Content required for create operation');
          }
          // Ensure directory exists
          await fs.mkdir(path.dirname(filePath), { recursive: true });
          await fs.writeFile(filePath, content, 'utf-8');
          logger.info(`[AutonomousEditor] Created file: ${filePath} (${reason})`);
          break;

        case 'update':
          if (!content) {
            throw new Error('Content required for update operation');
          }
          await fs.writeFile(filePath, content, 'utf-8');
          logger.info(`[AutonomousEditor] Updated file: ${filePath} (${reason})`);
          break;

        case 'delete':
          await fs.unlink(filePath);
          logger.info(`[AutonomousEditor] Deleted file: ${filePath} (${reason})`);
          break;

        default:
          throw new Error(`Unknown operation: ${operation}`);
      }

      return {
        success: true,
        filePath,
        operation,
        backupPath: backupPath || undefined,
      };
    } catch (error) {
      logger.error({ error, operation, filePath }, `[AutonomousEditor] Failed to execute operation`);
      return {
        success: false,
        filePath,
        operation,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Apply edit in YOLO mode (auto-apply) or queue for review
   */
  async applyEdit(edit: FileEdit): Promise<EditResult> {
    if (this.config.yoloMode) {
      logger.info(`[AutonomousEditor] YOLO mode: Auto-applying edit to ${edit.filePath}`);
      return this.executeEdit(edit);
    } else {
      logger.info(`[AutonomousEditor] Safe mode: Queuing edit for review: ${edit.filePath}`);
      this.queueEdit(edit);
      return {
        success: true,
        filePath: edit.filePath,
        operation: 'queued',
      };
    }
  }

  /**
   * Batch apply multiple edits
   */
  async applyEdits(edits: FileEdit[]): Promise<EditResult[]> {
    const results: EditResult[] = [];

    for (const edit of edits) {
      const result = await this.applyEdit(edit);
      results.push(result);

      // Stop on first failure in safe mode
      if (!result.success && !this.config.yoloMode) {
        logger.warn(`[AutonomousEditor] Stopping batch on failure: ${edit.filePath}`);
        break;
      }
    }

    return results;
  }

  /**
   * Toggle YOLO mode
   */
  setYoloMode(enabled: boolean): void {
    this.config.yoloMode = enabled;
    logger.info(`[AutonomousEditor] YOLO mode ${enabled ? 'ENABLED' : 'DISABLED'}`);
  }

  /**
   * Get current configuration
   */
  getConfig(): SafetyConfig {
    return { ...this.config };
  }

  /**
   * Check if edit requires human approval (STREAM 2 INTEGRATION)
   */
  private requiresHumanApproval(edit: FileEdit): boolean {
    if (edit.operation === 'delete') return true;
    if (edit.filePath.includes('package.json')) return true;
    if (edit.filePath.includes('drizzle.config')) return true;
    if (edit.filePath.includes('.env')) return true;
    return false;
  }

  /**
   * Assess risk level of edit (STREAM 2 INTEGRATION)
   */
  private assessEditRisk(edit: FileEdit): 'low' | 'medium' | 'high' | 'critical' {
    if (edit.operation === 'delete') return 'critical';
    if (edit.filePath.includes('package.json')) return 'critical';
    if (edit.filePath.includes('drizzle.config')) return 'high';
    if (edit.filePath.includes('.env')) return 'high';
    if (edit.filePath.includes('server/')) return 'medium';
    return 'low';
  }
}

// Export singleton instance
export const autonomousEditor = new AutonomousFileEditor({
  yoloMode: process.env.ENABLE_YOLO_MODE === 'true',
});
