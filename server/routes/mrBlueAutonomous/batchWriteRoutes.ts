import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { sanitizeFilePath } from './securityUtils.js';

const router = Router();

interface FileChange {
  filePath: string;
  content: string;
}

/**
 * POST /api/mrblue/batch-write
 * Write multiple files atomically
 */
router.post('/batch-write', async (req, res) => {
  try {
    const { changes, validate = true } = req.body;

    if (!Array.isArray(changes)) {
      return res.status(400).json({
        success: false,
        error: 'changes must be an array'
      });
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📦 [MR BLUE - BATCH WRITE]');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📁 Files to update:', changes.length);

    // Validate all changes first
    for (const change of changes) {
      if (!change.filePath || typeof change.filePath !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Each change must have a valid filePath'
        });
      }
      if (typeof change.content !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Each change must have content as string'
        });
      }
    }

    const backups: Map<string, string> = new Map();
    const results: Array<{
      path: string;
      success: boolean;
      error?: string;
    }> = [];

    try {
      // Phase 1: Backup all files
      console.log('💾 Phase 1: Creating backups...');
      for (const change of changes) {
        const fullPath = sanitizeFilePath(change.filePath);

        try {
          const existingContent = await fs.readFile(fullPath, 'utf-8');
          const backupPath = `${fullPath}.backup.${Date.now()}`;
          await fs.writeFile(backupPath, existingContent);
          backups.set(fullPath, backupPath);
          console.log('  ✅', change.filePath);
        } catch (error: any) {
          if (error.code !== 'ENOENT') {
            console.log('  ⚠️ ', change.filePath, '- backup failed');
          } else {
            console.log('  ℹ️ ', change.filePath, '- new file');
          }
        }
      }

      // Phase 2: Write all files
      console.log('✍️  Phase 2: Writing files...');
      for (const change of changes) {
        const fullPath = sanitizeFilePath(change.filePath);

        try {
          // Ensure directory exists
          const dir = path.dirname(fullPath);
          await fs.mkdir(dir, { recursive: true });

          // Write file
          await fs.writeFile(fullPath, change.content, 'utf-8');
          console.log('  ✅', change.filePath);

          results.push({
            path: change.filePath,
            success: true
          });
        } catch (error: any) {
          console.log('  ❌', change.filePath, '-', error.message);
          results.push({
            path: change.filePath,
            success: false,
            error: error.message
          });

          // Rollback on error
          console.log('🔄 Rolling back all changes...');
          for (const [originalPath, backupPath] of backups.entries()) {
            try {
              const backupContent = await fs.readFile(backupPath, 'utf-8');
              await fs.writeFile(originalPath, backupContent);
            } catch (rollbackError) {
              console.error('❌ Rollback failed for:', originalPath);
            }
          }

          throw new Error(`Failed to write ${change.filePath}: ${error.message}`);
        }
      }

      // Phase 3: Cleanup backups (optional - keep for safety)
      console.log('🧹 Phase 3: Backups preserved for safety');

      console.log('✅ Batch write complete');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      res.json({
        success: true,
        data: {
          filesWritten: results.filter(r => r.success).length,
          totalFiles: changes.length,
          results,
          backups: Array.from(backups.values())
        }
      });

    } catch (error: any) {
      console.error('❌ [BATCH WRITE ERROR]:', error.message);
      throw error;
    }

  } catch (error: any) {
    console.error('❌ [BATCH WRITE ERROR]:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
