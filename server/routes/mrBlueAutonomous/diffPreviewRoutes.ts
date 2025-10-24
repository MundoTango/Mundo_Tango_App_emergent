import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { diffLines } from 'diff';
import { sanitizeFilePath } from './securityUtils.js';

const router = Router();

/**
 * POST /api/mrblue/preview-diff
 * Generate unified diff preview
 */
router.post('/preview-diff', async (req, res) => {
  try {
    const { filePath, newContent } = req.body;

    if (!filePath || typeof filePath !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'filePath is required and must be a string'
      });
    }

    if (typeof newContent !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'newContent must be a string'
      });
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 [MR BLUE - DIFF PREVIEW]');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📁 File:', filePath);

    // Security: Sanitize and validate path (prevents path traversal)
    const fullPath = sanitizeFilePath(filePath);
    console.log('🔒 Validated Path:', fullPath);

    // Read existing file
    let oldContent = '';
    let isNewFile = false;
    try {
      oldContent = await fs.readFile(fullPath, 'utf-8');
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        isNewFile = true;
        console.log('ℹ️  New file - will create');
      } else {
        throw error;
      }
    }

    // Generate diff
    const changes = diffLines(oldContent, newContent);
    
    // Build unified diff format
    const diffOutput: string[] = [];
    let addedLines = 0;
    let removedLines = 0;
    let lineNumber = 1;

    changes.forEach((change: any) => {
      if (change.added) {
        const lines = change.value.split('\n').filter((l: string) => l.length > 0);
        lines.forEach((line: string) => {
          diffOutput.push(`+ ${line}`);
          addedLines++;
        });
      } else if (change.removed) {
        const lines = change.value.split('\n').filter((l: string) => l.length > 0);
        lines.forEach((line: string) => {
          diffOutput.push(`- ${line}`);
          removedLines++;
        });
      } else {
        // Context lines (unchanged)
        const lines = change.value.split('\n').filter((l: string) => l.length > 0);
        lines.forEach((line: string) => {
          diffOutput.push(`  ${line}`);
          lineNumber++;
        });
      }
    });

    const diffText = diffOutput.join('\n');

    console.log('✅ Diff generated');
    console.log('📊 Stats:', {
      isNewFile,
      addedLines,
      removedLines,
      totalChanges: diffOutput.length
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    res.json({
      success: true,
      data: {
        path: filePath,
        isNewFile,
        diff: diffText,
        stats: {
          addedLines,
          removedLines,
          totalLines: diffOutput.length
        }
      }
    });

  } catch (error: any) {
    console.error('❌ [DIFF ERROR]:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
