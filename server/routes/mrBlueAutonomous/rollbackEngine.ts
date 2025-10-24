/**
 * WEEK 3 STREAM 1: Real Rollback/Retry Engine
 * Replaces TODO at orchestrationEngine.ts line 244-249
 */

import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const router = Router();

interface RollbackPoint {
  id: string;
  timestamp: Date;
  taskId: string;
  description: string;
  filesChanged: string[];
  gitCommitBefore?: string;
  gitCommitAfter?: string;
}

// In-memory rollback history (use database in production)
const rollbackHistory = new Map<string, RollbackPoint>();

/**
 * Create rollback point before risky operation
 */
export async function createRollbackPoint(
  taskId: string,
  description: string,
  filesAffected: string[]
): Promise<string> {
  const rollbackId = `rollback-${taskId}-${Date.now()}`;
  
  try {
    // Get current git commit hash
    const { stdout: gitHash } = await execAsync('git rev-parse HEAD');
    
    // ARCHITECT FIX: Create actual file backups (so fallback works)
    for (const filePath of filesAffected) {
      try {
        const backupPath = `${filePath}.backup-${rollbackId}`;
        await fs.copyFile(filePath, backupPath);
        console.log(`💾 [ROLLBACK] Backed up: ${filePath}`);
      } catch (error) {
        console.warn(`⚠️ [ROLLBACK] Failed to backup ${filePath}:`, error);
      }
    }
    
    const rollbackPoint: RollbackPoint = {
      id: rollbackId,
      timestamp: new Date(),
      taskId,
      description,
      filesChanged: filesAffected,
      gitCommitBefore: gitHash.trim()
    };
    
    rollbackHistory.set(rollbackId, rollbackPoint);
    
    console.log('✅ [ROLLBACK] Created rollback point:', rollbackId);
    return rollbackId;
    
  } catch (error: any) {
    console.error('❌ [ROLLBACK] Failed to create rollback point:', error.message);
    throw error;
  }
}

/**
 * Rollback to previous state after error
 */
export async function executeRollback(
  rollbackId: string
): Promise<{ success: boolean; filesRestored: string[]; error?: string }> {
  const rollbackPoint = rollbackHistory.get(rollbackId);
  
  if (!rollbackPoint) {
    return { success: false, filesRestored: [], error: 'Rollback point not found' };
  }
  
  try {
    console.log('🔄 [ROLLBACK] Starting rollback to:', rollbackId);
    console.log('📋 [ROLLBACK] Files to restore:', rollbackPoint.filesChanged);
    
    // Strategy 1: Git-based rollback (if commit exists)
    if (rollbackPoint.gitCommitBefore) {
      try {
        // Restore files from git commit
        for (const filePath of rollbackPoint.filesChanged) {
          await execAsync(`git checkout ${rollbackPoint.gitCommitBefore} -- ${filePath}`);
          console.log(`✅ [ROLLBACK] Restored from git: ${filePath}`);
        }
        
        return {
          success: true,
          filesRestored: rollbackPoint.filesChanged
        };
      } catch (gitError: any) {
        console.warn('⚠️ [ROLLBACK] Git rollback failed, trying backup strategy:', gitError.message);
      }
    }
    
    // Strategy 2: File backup rollback (fallback) - ARCHITECT FIX: Backups now created
    const restoredFiles: string[] = [];
    
    for (const filePath of rollbackPoint.filesChanged) {
      const backupPath = `${filePath}.backup-${rollbackPoint.id}`;
      
      try {
        const backupExists = await fs.access(backupPath).then(() => true).catch(() => false);
        
        if (backupExists) {
          await fs.copyFile(backupPath, filePath);
          restoredFiles.push(filePath);
          console.log(`✅ [ROLLBACK] Restored from backup: ${filePath}`);
          
          // Clean up backup after successful restore
          await fs.unlink(backupPath).catch(() => {});
        } else {
          console.warn(`⚠️ [ROLLBACK] No backup found for: ${filePath}`);
        }
      } catch (error: any) {
        console.error(`❌ [ROLLBACK] Failed to restore ${filePath}:`, error.message);
      }
    }
    
    console.log('✅ [ROLLBACK] Rollback complete');
    return {
      success: restoredFiles.length > 0,
      filesRestored: restoredFiles
    };
    
  } catch (error: any) {
    console.error('❌ [ROLLBACK] Rollback failed:', error.message);
    return {
      success: false,
      filesRestored: [],
      error: error.message
    };
  }
}

/**
 * Retry logic with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 [RETRY] Attempt ${attempt}/${maxRetries}`);
      return await operation();
    } catch (error: any) {
      lastError = error;
      console.error(`❌ [RETRY] Attempt ${attempt} failed:`, error.message);
      
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`⏱️ [RETRY] Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Max retries exceeded');
}

/**
 * POST /api/mrblue/autonomous/rollback/:rollbackId
 * Execute rollback to previous state
 */
router.post('/rollback/:rollbackId', async (req, res) => {
  try {
    const { rollbackId } = req.params;
    
    const result = await executeRollback(rollbackId);
    
    if (result.success) {
      res.json({
        success: true,
        data: {
          rollbackId,
          filesRestored: result.filesRestored,
          message: `Rolled back ${result.filesRestored.length} files successfully`
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Rollback failed'
      });
    }
    
  } catch (error: any) {
    console.error('❌ [ROLLBACK API] Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/mrblue/autonomous/rollback-points
 * List available rollback points
 */
router.get('/rollback-points', async (req, res) => {
  try {
    const points = Array.from(rollbackHistory.values()).map(point => ({
      id: point.id,
      timestamp: point.timestamp,
      taskId: point.taskId,
      description: point.description,
      filesCount: point.filesChanged.length
    }));
    
    res.json({
      success: true,
      data: { rollbackPoints: points }
    });
    
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
