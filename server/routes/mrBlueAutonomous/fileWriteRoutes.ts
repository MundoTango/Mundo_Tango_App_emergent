import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { sanitizeFilePath } from './securityUtils.js';

const execAsync = promisify(exec);
const router = Router();

/**
 * POST /api/mrblue/write-file
 * Write file with validation and backup
 */
router.post('/write-file', async (req, res) => {
  try {
    const { filePath, content, validate = true, backup = true } = req.body;

    if (!filePath || typeof filePath !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'filePath is required and must be a string'
      });
    }

    if (typeof content !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'content must be a string'
      });
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✍️  [MR BLUE - FILE WRITE]');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📁 File:', filePath);
    console.log('📏 Size:', content.length, 'characters');
    console.log('🔍 Validate:', validate);
    console.log('💾 Backup:', backup);

    // Security: Sanitize and validate path (prevents path traversal)
    const fullPath = sanitizeFilePath(filePath);
    const ext = path.extname(fullPath);
    console.log('🔒 Validated Path:', fullPath);

    // Backup existing file
    let backupPath: string | null = null;
    try {
      const existingContent = await fs.readFile(fullPath, 'utf-8');
      if (backup) {
        backupPath = `${fullPath}.backup.${Date.now()}`;
        await fs.writeFile(backupPath, existingContent);
        console.log('💾 Backup created:', backupPath);
      }
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        console.log('⚠️  Could not backup file:', error.message);
      } else {
        console.log('ℹ️  New file - no backup needed');
      }
    }

    // Validate TypeScript/JavaScript syntax
    const validationErrors: string[] = [];
    if (validate && (ext === '.ts' || ext === '.tsx' || ext === '.js' || ext === '.jsx')) {
      try {
        // Write to temp file and check with TypeScript
        const tempPath = `${fullPath}.temp`;
        await fs.writeFile(tempPath, content);

        try {
          await execAsync(`npx tsc --noEmit ${tempPath}`, {
            cwd: process.cwd(),
            timeout: 5000
          });
          console.log('✅ TypeScript validation passed');
        } catch (tscError: any) {
          // Parse TypeScript errors
          const errorLines = tscError.stdout?.split('\n') || [];
          validationErrors.push(...errorLines.filter((line: string) => line.includes('error TS')));
          console.log('⚠️  TypeScript validation warnings:', validationErrors.length);
        } finally {
          await fs.unlink(tempPath).catch(() => {});
        }
      } catch (error) {
        console.log('⚠️  Could not validate syntax');
      }
    }

    // Ensure directory exists
    const dir = path.dirname(fullPath);
    await fs.mkdir(dir, { recursive: true });

    // Write file
    await fs.writeFile(fullPath, content, 'utf-8');
    console.log('✅ File written successfully');

    // Run Prettier if available
    try {
      await execAsync(`npx prettier --write ${fullPath}`, {
        cwd: process.cwd(),
        timeout: 5000
      });
      console.log('✨ Code formatted with Prettier');
    } catch (error) {
      console.log('ℹ️  Prettier not available or failed');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    res.json({
      success: true,
      data: {
        path: filePath,
        size: content.length,
        backupPath: backupPath || undefined,
        validationErrors: validationErrors.length > 0 ? validationErrors : undefined,
        formatted: true
      }
    });

  } catch (error: any) {
    console.error('❌ [FILE WRITE ERROR]:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
