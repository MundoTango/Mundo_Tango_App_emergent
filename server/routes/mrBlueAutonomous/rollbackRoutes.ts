import { Router } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';

const execAsync = promisify(exec);
const router = Router();

/**
 * POST /api/mrblue/rollback
 * Rollback to a checkpoint
 */
router.post('/rollback', async (req, res) => {
  try {
    const { checkpointId, restoreDatabase = false } = req.body;

    if (!checkpointId || typeof checkpointId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'checkpointId is required and must be a string'
      });
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔄 [MR BLUE - ROLLBACK]');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📌 Checkpoint ID:', checkpointId);
    console.log('🗄️  Restore DB:', restoreDatabase);

    // Find checkpoint by commit message
    console.log('🔍 Finding checkpoint...');
    const { stdout: logOutput } = await execAsync(
      `git log --grep="Checkpoint ID: ${checkpointId}" --pretty=format:"%H" --all`,
      { cwd: process.cwd() }
    );

    const commitHash = logOutput.trim().split('\n')[0];
    
    if (!commitHash) {
      return res.status(404).json({
        success: false,
        error: 'Checkpoint not found'
      });
    }

    console.log('✅ Found checkpoint commit:', commitHash.substring(0, 7));

    // Check for uncommitted changes
    const { stdout: statusOutput } = await execAsync('git status --short', {
      cwd: process.cwd()
    });

    if (statusOutput.trim()) {
      console.log('⚠️  Uncommitted changes detected - creating safety commit...');
      
      // Configure Git identity if not set
      await execAsync('git config user.name "Mr Blue AI"', { cwd: process.cwd() }).catch(() => {});
      await execAsync('git config user.email "mrblue@mundotango.life"', { cwd: process.cwd() }).catch(() => {});
      
      await execAsync('git add -A', { cwd: process.cwd() });
      await execAsync(
        `git commit -m "[MR BLUE SAFETY] Pre-rollback backup at ${new Date().toISOString()}"`,
        { cwd: process.cwd() }
      ).catch(() => {
        console.log('ℹ️  No changes to commit');
      });
    }

    // Perform Git reset
    console.log('🔄 Resetting to checkpoint...');
    const { stdout: resetOutput } = await execAsync(`git reset --hard ${commitHash}`, {
      cwd: process.cwd()
    });

    console.log('✅ Files restored:', resetOutput);

    // Optional: Restore database
    let dbRestored = false;
    if (restoreDatabase) {
      console.log('🗄️  Restoring database...');
      try {
        const backupFile = `backups/db/${checkpointId}.sql`;
        const stats = await fs.stat(backupFile);
        
        if (stats.isFile()) {
          const dbUrl = process.env.DATABASE_URL;
          if (dbUrl) {
            // Drop and recreate database, then restore
            await execAsync(`psql ${dbUrl} < ${backupFile}`, {
              cwd: process.cwd()
            });
            dbRestored = true;
            console.log('✅ Database restored');
          }
        }
      } catch (dbError: any) {
        console.log('⚠️  Database restore failed:', dbError.message);
      }
    }

    console.log('✅ Rollback complete');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    res.json({
      success: true,
      data: {
        checkpointId,
        gitCommit: commitHash,
        filesRestored: true,
        databaseRestored: dbRestored
      }
    });

  } catch (error: any) {
    console.error('❌ [ROLLBACK ERROR]:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
