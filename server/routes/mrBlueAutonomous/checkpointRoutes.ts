import { Router } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { db } from '../../db.js';
import { sql } from 'drizzle-orm';
import { sanitizeGitMessage, escapeShellArg } from './securityUtils.js';

const execAsync = promisify(exec);
const router = Router();

interface Checkpoint {
  id: string;
  description: string;
  timestamp: string;
  gitCommit: string;
  files: string[];
}

/**
 * POST /api/mrblue/create-checkpoint
 * Create checkpoint with Git commit and optional DB snapshot
 */
router.post('/create-checkpoint', async (req, res) => {
  try {
    const { description, includeDatabase = false } = req.body;

    if (!description || typeof description !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'description is required and must be a string'
      });
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💾 [MR BLUE - CREATE CHECKPOINT]');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 Description:', description);
    console.log('🗄️  Include DB:', includeDatabase);

    const checkpointId = `mrblue-${Date.now()}`;
    
    // Get current git status
    const { stdout: gitStatus } = await execAsync('git status --short', {
      cwd: process.cwd()
    });

    const changedFiles = gitStatus
      .split('\n')
      .filter(Boolean)
      .map(line => line.substring(3));  // Remove status prefix

    console.log('📁 Changed files:', changedFiles.length);

    // Create Git commit
    console.log('📝 Creating Git commit...');
    
    // Stage all changes
    await execAsync('git add -A', { cwd: process.cwd() });

    // Sanitize and commit with checkpoint ID (prevent command injection)
    const safeDescription = sanitizeGitMessage(description);
    const commitMessage = `[MR BLUE CHECKPOINT] ${safeDescription}\n\nCheckpoint ID: ${checkpointId}`;
    const { stdout: commitHash } = await execAsync(`git commit -m ${escapeShellArg(commitMessage)}`, {
      cwd: process.cwd()
    }).catch(async (error) => {
      // If no changes to commit, get current commit
      const { stdout } = await execAsync('git rev-parse HEAD', { cwd: process.cwd() });
      return { stdout };
    });

    const gitCommit = commitHash.trim();
    console.log('✅ Git commit:', gitCommit.substring(0, 7));

    // Optional: Create database snapshot
    let dbSnapshot: string | undefined;
    if (includeDatabase) {
      console.log('🗄️  Creating database snapshot...');
      try {
        // Create backup directory
        const backupDir = path.join(process.cwd(), 'backups', 'db');
        await fs.mkdir(backupDir, { recursive: true });

        // Export database to SQL file
        const backupFile = path.join(backupDir, `${checkpointId}.sql`);
        
        // Use pg_dump if available (escaped to prevent injection)
        const dbUrl = process.env.DATABASE_URL;
        if (dbUrl) {
          await execAsync(`pg_dump ${escapeShellArg(dbUrl)} > ${escapeShellArg(backupFile)}`, {
            cwd: process.cwd()
          });
          dbSnapshot = backupFile;
          console.log('✅ Database snapshot created');
        }
      } catch (dbError: any) {
        console.log('⚠️  Database snapshot failed:', dbError.message);
      }
    }

    const checkpoint: Checkpoint = {
      id: checkpointId,
      description,
      timestamp: new Date().toISOString(),
      gitCommit,
      files: changedFiles
    };

    console.log('✅ Checkpoint created successfully');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    res.json({
      success: true,
      data: {
        ...checkpoint,
        dbSnapshot
      }
    });

  } catch (error: any) {
    console.error('❌ [CHECKPOINT ERROR]:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/mrblue/checkpoints
 * List all Mr Blue checkpoints
 */
router.get('/checkpoints', async (req, res) => {
  try {
    console.log('📋 [MR BLUE - LIST CHECKPOINTS]');

    // Get Git log for Mr Blue checkpoints
    const { stdout } = await execAsync(
      'git log --grep="\\[MR BLUE CHECKPOINT\\]" --pretty=format:"%H|%s|%ai" --all',
      { cwd: process.cwd() }
    );

    const checkpoints = stdout
      .split('\n')
      .filter(Boolean)
      .map(line => {
        const [hash, message, date] = line.split('|');
        const idMatch = message.match(/Checkpoint ID: (mrblue-\d+)/);
        const descMatch = message.match(/\[MR BLUE CHECKPOINT\] (.+)/);
        
        return {
          id: idMatch?.[1] || hash.substring(0, 7),
          description: descMatch?.[1]?.split('\n')[0] || message,
          timestamp: date,
          gitCommit: hash
        };
      });

    console.log('✅ Found', checkpoints.length, 'checkpoints');

    res.json({
      success: true,
      data: checkpoints
    });

  } catch (error: any) {
    console.error('❌ [LIST CHECKPOINTS ERROR]:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
