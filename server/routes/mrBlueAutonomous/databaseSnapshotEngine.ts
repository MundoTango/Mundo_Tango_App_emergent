/**
 * WEEK 3 STREAM 3: Database Snapshot Engine
 * Create snapshots before autonomous execution for safe rollback
 */

import { Router } from 'express';
import { db } from '../../db/index.js';
import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

const router = Router();

// SECURITY: Whitelist of allowed table names (prevent shell injection)
const ALLOWED_TABLES_REGEX = /^[a-z_][a-z0-9_]*$/i;

/**
 * SECURITY: Validate table names to prevent shell injection
 */
function validateTableNames(tables: string[]): boolean {
  return tables.every(table => ALLOWED_TABLES_REGEX.test(table));
}

/**
 * SECURITY: Execute shell command safely using spawn (not exec)
 */
function spawnCommand(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      stdio: 'pipe',
      shell: false // CRITICAL: Disable shell to prevent injection
    });
    
    let stderr = '';
    
    proc.stderr?.on('data', (data) => {
      stderr += data.toString();
    });
    
    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}: ${stderr}`));
      }
    });
    
    proc.on('error', (error) => {
      reject(error);
    });
  });
}

interface DatabaseSnapshot {
  id: string;
  taskId: string;
  timestamp: Date;
  backupPath: string;
  tables: string[];
  size: number;
  status: 'creating' | 'ready' | 'failed';
  error?: string;
}

// In-memory snapshot registry
const snapshots = new Map<string, DatabaseSnapshot>();

const SNAPSHOTS_DIR = path.join(process.cwd(), '.snapshots');

/**
 * Initialize snapshots directory
 */
async function initSnapshotsDir() {
  try {
    await fs.mkdir(SNAPSHOTS_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create snapshots directory:', error);
  }
}

initSnapshotsDir();

/**
 * Create database snapshot before risky operation
 */
export async function createDatabaseSnapshot(
  taskId: string,
  tablesToBackup?: string[]
): Promise<string> {
  const snapshotId = `snapshot-${taskId}-${Date.now()}`;
  const backupPath = path.join(SNAPSHOTS_DIR, `${snapshotId}.sql`);
  
  const snapshot: DatabaseSnapshot = {
    id: snapshotId,
    taskId,
    timestamp: new Date(),
    backupPath,
    tables: tablesToBackup || ['all'],
    size: 0,
    status: 'creating'
  };
  
  snapshots.set(snapshotId, snapshot);
  
  try {
    console.log('📸 [SNAPSHOT] Creating database snapshot:', snapshotId);
    
    // SECURITY: Validate table names before using
    if (tablesToBackup && tablesToBackup.length > 0) {
      if (!validateTableNames(tablesToBackup)) {
        throw new Error('Invalid table names detected');
      }
    }
    
    // Use pg_dump to create backup (SAFE: using spawn, not exec)
    const DATABASE_URL = process.env.DATABASE_URL;
    
    if (!DATABASE_URL) {
      throw new Error('DATABASE_URL not configured');
    }
    
    // Build pg_dump arguments (SAFE: array, not string interpolation)
    const args = [DATABASE_URL, '-F', 'c', '-f', backupPath];
    
    // If specific tables specified, add them to arguments
    if (tablesToBackup && tablesToBackup.length > 0) {
      for (const table of tablesToBackup) {
        args.push('-t', table); // SAFE: separate arguments, no shell expansion
      }
    }
    
    await spawnCommand('pg_dump', args);
    
    // Get backup file size
    const stats = await fs.stat(backupPath);
    
    snapshot.size = stats.size;
    snapshot.status = 'ready';
    
    console.log(`✅ [SNAPSHOT] Snapshot created: ${snapshotId} (${formatBytes(stats.size)})`);
    
    return snapshotId;
    
  } catch (error: any) {
    console.error('❌ [SNAPSHOT] Failed to create snapshot:', error.message);
    snapshot.status = 'failed';
    snapshot.error = error.message;
    throw error;
  }
}

/**
 * Restore database from snapshot
 */
export async function restoreDatabaseSnapshot(
  snapshotId: string
): Promise<{ success: boolean; tablesRestored: string[]; error?: string }> {
  const snapshot = snapshots.get(snapshotId);
  
  if (!snapshot) {
    return { success: false, tablesRestored: [], error: 'Snapshot not found' };
  }
  
  if (snapshot.status !== 'ready') {
    return { success: false, tablesRestored: [], error: 'Snapshot not ready' };
  }
  
  try {
    console.log('🔄 [SNAPSHOT] Restoring from snapshot:', snapshotId);
    
    const DATABASE_URL = process.env.DATABASE_URL;
    
    if (!DATABASE_URL) {
      throw new Error('DATABASE_URL not configured');
    }
    
    // Use pg_restore to restore backup (SAFE: using spawn, not exec)
    const args = [
      '-d', DATABASE_URL,
      '--clean',
      '--if-exists',
      snapshot.backupPath
    ];
    
    await spawnCommand('pg_restore', args);
    
    console.log('✅ [SNAPSHOT] Database restored successfully');
    
    return {
      success: true,
      tablesRestored: snapshot.tables
    };
    
  } catch (error: any) {
    console.error('❌ [SNAPSHOT] Restore failed:', error.message);
    return {
      success: false,
      tablesRestored: [],
      error: error.message
    };
  }
}

/**
 * Clean up old snapshots (keep last N)
 */
export async function cleanupSnapshots(keepLast: number = 10): Promise<number> {
  const allSnapshots = Array.from(snapshots.values())
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  
  const toDelete = allSnapshots.slice(keepLast);
  
  let deleted = 0;
  
  for (const snapshot of toDelete) {
    try {
      await fs.unlink(snapshot.backupPath);
      snapshots.delete(snapshot.id);
      deleted++;
      console.log(`🗑️ [SNAPSHOT] Deleted old snapshot: ${snapshot.id}`);
    } catch (error) {
      console.error(`Failed to delete snapshot ${snapshot.id}:`, error);
    }
  }
  
  console.log(`✅ [SNAPSHOT] Cleaned up ${deleted} old snapshots`);
  return deleted;
}

/**
 * POST /api/mrblue/autonomous/create-snapshot
 * Create database snapshot before risky operation
 */
router.post('/create-snapshot', async (req, res) => {
  try {
    const { taskId, tables } = req.body;
    
    if (!taskId) {
      return res.status(400).json({
        success: false,
        error: 'taskId is required'
      });
    }
    
    const snapshotId = await createDatabaseSnapshot(taskId, tables);
    
    res.json({
      success: true,
      data: {
        snapshotId,
        message: 'Database snapshot created successfully'
      }
    });
    
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/mrblue/autonomous/restore-snapshot/:snapshotId
 * Restore database from snapshot
 */
router.post('/restore-snapshot/:snapshotId', async (req, res) => {
  try {
    const { snapshotId } = req.params;
    
    const result = await restoreDatabaseSnapshot(snapshotId);
    
    if (result.success) {
      res.json({
        success: true,
        data: {
          snapshotId,
          tablesRestored: result.tablesRestored,
          message: `Restored ${result.tablesRestored.length} tables successfully`
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Restore failed'
      });
    }
    
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/mrblue/autonomous/snapshots
 * List all available snapshots
 */
router.get('/snapshots', async (req, res) => {
  try {
    const snapshotList = Array.from(snapshots.values()).map(s => ({
      id: s.id,
      taskId: s.taskId,
      timestamp: s.timestamp,
      tables: s.tables,
      size: formatBytes(s.size),
      status: s.status,
      error: s.error
    }));
    
    res.json({
      success: true,
      data: { snapshots: snapshotList }
    });
    
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/mrblue/autonomous/cleanup-snapshots
 * Clean up old snapshots
 */
router.delete('/cleanup-snapshots', async (req, res) => {
  try {
    const { keepLast = 10 } = req.query;
    
    const deleted = await cleanupSnapshots(Number(keepLast));
    
    res.json({
      success: true,
      data: {
        deleted,
        message: `Cleaned up ${deleted} old snapshots`
      }
    });
    
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export default router;
