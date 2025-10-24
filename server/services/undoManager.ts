/**
 * UNDO/ROLLBACK MANAGER
 * Track file changes for undo (10 changes per file, checkpoint every 5)
 * 
 * MB.MD Agent #127 (Deployment Safety) + Layer #36 (Memory Systems)
 * October 24, 2025
 */

import { db } from '../db';
import { undoHistory, type InsertUndoHistory } from '@shared/schema';
import { eq, and, desc, sql, max } from 'drizzle-orm';
import { randomBytes } from 'crypto';

interface UndoEntry {
  filePath: string;
  oldContent: string;
  newContent: string;
  changeDescription?: string;
}

export class UndoManager {
  private sessionId: string;
  private userId: number;
  private changeCountByFile: Map<string, number> = new Map();
  private initialized: boolean = false;

  constructor(userId: number, sessionId?: string) {
    this.userId = userId;
    this.sessionId = sessionId || `session-${Date.now()}-${randomBytes(4).toString('hex')}`;
  }

  /**
   * Initialize change counters from existing database history
   * CRITICAL: Must be called before recording changes to prevent duplicate changeNumbers
   */
  private async initialize(): Promise<void> {
    if (this.initialized) return;

    // Load max changeNumber for each file in this session using aggregation
    const existingChanges = await db
      .select({
        filePath: undoHistory.filePath,
        maxChangeNumber: max(undoHistory.changeNumber).as('max_change_number')
      })
      .from(undoHistory)
      .where(
        and(
          eq(undoHistory.userId, this.userId),
          eq(undoHistory.sessionId, this.sessionId)
        )
      )
      .groupBy(undoHistory.filePath);

    // Populate in-memory map with existing counts
    for (const change of existingChanges) {
      const changeNum = Number(change.maxChangeNumber) || 0;
      this.changeCountByFile.set(change.filePath, changeNum);
    }

    this.initialized = true;
    console.log(`🔄 [UndoManager] Initialized with ${existingChanges.length} files from session ${this.sessionId}`);
  }

  /**
   * Record a file change for undo
   */
  async recordChange(entry: UndoEntry): Promise<void> {
    // CRITICAL: Initialize from database on first use
    await this.initialize();

    const currentCount = this.changeCountByFile.get(entry.filePath) || 0;
    const newCount = currentCount + 1;
    this.changeCountByFile.set(entry.filePath, newCount);

    const isCheckpoint = newCount % 5 === 0; // Every 5th change

    await db.insert(undoHistory).values({
      userId: this.userId,
      sessionId: this.sessionId,
      filePath: entry.filePath,
      changeNumber: newCount,
      oldContent: entry.oldContent,
      newContent: entry.newContent,
      changeDescription: entry.changeDescription,
      isCheckpoint,
    });

    console.log(`📝 [UndoManager] Recorded change #${newCount} for ${entry.filePath}${isCheckpoint ? ' (CHECKPOINT)' : ''}`);

    // Cleanup old entries (keep max 10 per file)
    await this.cleanupOldEntries(entry.filePath);
  }

  /**
   * Undo last N changes for a file
   */
  async undo(filePath: string, steps: number = 1): Promise<string | null> {
    const changes = await db
      .select()
      .from(undoHistory)
      .where(
        and(
          eq(undoHistory.userId, this.userId),
          eq(undoHistory.sessionId, this.sessionId),
          eq(undoHistory.filePath, filePath)
        )
      )
      .orderBy(desc(undoHistory.changeNumber))
      .limit(steps);

    if (changes.length === 0) {
      console.warn(`⚠️ [UndoManager] No changes to undo for ${filePath}`);
      return null;
    }

    // Return content from N steps ago
    const targetChange = changes[changes.length - 1];
    console.log(`↩️ [UndoManager] Undoing ${steps} step(s) for ${filePath} -> change #${targetChange.changeNumber}`);
    
    return targetChange.oldContent;
  }

  /**
   * Rollback to last checkpoint
   */
  async rollbackToCheckpoint(filePath: string): Promise<string | null> {
    const checkpoint = await db
      .select()
      .from(undoHistory)
      .where(
        and(
          eq(undoHistory.userId, this.userId),
          eq(undoHistory.sessionId, this.sessionId),
          eq(undoHistory.filePath, filePath),
          eq(undoHistory.isCheckpoint, true)
        )
      )
      .orderBy(desc(undoHistory.changeNumber))
      .limit(1);

    if (checkpoint.length === 0) {
      console.warn(`⚠️ [UndoManager] No checkpoint found for ${filePath}`);
      return null;
    }

    console.log(`🔄 [UndoManager] Rolling back to checkpoint #${checkpoint[0].changeNumber} for ${filePath}`);
    return checkpoint[0].oldContent;
  }

  /**
   * Get change history for a file
   */
  async getHistory(filePath: string): Promise<any[]> {
    return await db
      .select()
      .from(undoHistory)
      .where(
        and(
          eq(undoHistory.userId, this.userId),
          eq(undoHistory.sessionId, this.sessionId),
          eq(undoHistory.filePath, filePath)
        )
      )
      .orderBy(desc(undoHistory.changeNumber))
      .limit(10);
  }

  /**
   * Cleanup old entries (keep max 10 per file)
   * OPTIMIZED: Single SQL statement instead of iteration
   */
  private async cleanupOldEntries(filePath: string): Promise<void> {
    // Delete all except the 10 most recent entries for this file
    const result = await db.execute(sql`
      DELETE FROM undo_history
      WHERE id IN (
        SELECT id FROM undo_history
        WHERE user_id = ${this.userId}
          AND session_id = ${this.sessionId}
          AND file_path = ${filePath}
        ORDER BY change_number DESC
        OFFSET 10
      )
    `);

    const deletedCount = result.rowCount || 0;
    if (deletedCount > 0) {
      console.log(`🗑️ [UndoManager] Cleaned up ${deletedCount} old entries for ${filePath}`);
    }
  }

  /**
   * Clear all history for current session
   */
  async clearSession(): Promise<void> {
    await db
      .delete(undoHistory)
      .where(
        and(
          eq(undoHistory.userId, this.userId),
          eq(undoHistory.sessionId, this.sessionId)
        )
      );
    
    this.changeCountByFile.clear();
    console.log(`🧹 [UndoManager] Cleared session ${this.sessionId}`);
  }
}
