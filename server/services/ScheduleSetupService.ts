/**
 * TRACK 5: Schedule Setup Service
 * Creates autonomous schedules for UI Sub-Agents (Agents #11.1-11.5)
 * Integrates with agentSchedules table
 */

import { db } from '../db';
import { agentSchedules, type InsertAgentSchedule } from '@shared/schema';
import { eq } from 'drizzle-orm';

export class ScheduleSetupService {
  /**
   * Setup all UI Sub-Agent schedules
   */
  async setupAllSchedules(): Promise<{
    created: number;
    schedules: any[];
  }> {
    const schedules: InsertAgentSchedule[] = [
      // Agent #11.1: Dark Mode Fixer - Every 6 hours
      {
        agentId: 'AGENT-11.1',
        agentName: 'Dark Mode Fixer',
        schedule: '0 */6 * * *', // Every 6 hours
        status: 'active',
        runCount: 0,
        successCount: 0,
        failCount: 0,
      },

      // Agent #11.2: Translation Fixer - Every 12 hours
      {
        agentId: 'AGENT-11.2',
        agentName: 'Translation Fixer',
        schedule: '0 */12 * * *', // Every 12 hours
        status: 'active',
        runCount: 0,
        successCount: 0,
        failCount: 0,
      },

      // Agent #11.3: Accessibility Auditor - Daily at 2 AM
      {
        agentId: 'AGENT-11.3',
        agentName: 'Accessibility Auditor',
        schedule: '0 2 * * *', // Daily at 2 AM
        status: 'active',
        runCount: 0,
        successCount: 0,
        failCount: 0,
      },

      // Agent #11.4: Performance Monitor - Every 6 hours
      {
        agentId: 'AGENT-11.4',
        agentName: 'Performance Monitor',
        schedule: '0 */6 * * *', // Every 6 hours
        status: 'active',
        runCount: 0,
        successCount: 0,
        failCount: 0,
      },

      // Agent #11.5: Component Watcher - Continuous (managed separately)
      {
        agentId: 'AGENT-11.5',
        agentName: 'Component Watcher',
        schedule: '*/5 * * * *', // Every 5 minutes (when active)
        status: 'paused', // Start paused, activated manually
        runCount: 0,
        successCount: 0,
        failCount: 0,
      },
    ];

    let created = 0;
    const createdSchedules = [];

    for (const schedule of schedules) {
      const existing = await db
        .select()
        .from(agentSchedules)
        .where(eq(agentSchedules.agentId, schedule.agentId));

      if (existing.length === 0) {
        const [newSchedule] = await db
          .insert(agentSchedules)
          .values(schedule)
          .returning();
        created++;
        createdSchedules.push(newSchedule);
      } else {
        createdSchedules.push(existing[0]);
      }
    }

    return {
      created,
      schedules: createdSchedules,
    };
  }

  /**
   * Update schedule status
   */
  async updateScheduleStatus(
    agentId: string,
    status: 'active' | 'paused' | 'failed'
  ): Promise<void> {
    await db
      .update(agentSchedules)
      .set({ status, updatedAt: new Date() })
      .where(eq(agentSchedules.agentId, agentId));
  }

  /**
   * Record schedule run
   */
  async recordRun(
    agentId: string,
    success: boolean,
    error?: string
  ): Promise<void> {
    const existing = await db
      .select()
      .from(agentSchedules)
      .where(eq(agentSchedules.agentId, agentId));

    if (existing.length === 0) {
      throw new Error(`Schedule not found for agent: ${agentId}`);
    }

    const schedule = existing[0];

    await db
      .update(agentSchedules)
      .set({
        lastRun: new Date(),
        runCount: (schedule.runCount || 0) + 1,
        successCount: success ? (schedule.successCount || 0) + 1 : schedule.successCount,
        failCount: !success ? (schedule.failCount || 0) + 1 : schedule.failCount,
        lastError: error || null,
        updatedAt: new Date(),
      })
      .where(eq(agentSchedules.agentId, agentId));
  }

  /**
   * Calculate next run time based on cron schedule
   */
  async updateNextRun(agentId: string): Promise<void> {
    const existing = await db
      .select()
      .from(agentSchedules)
      .where(eq(agentSchedules.agentId, agentId));

    if (existing.length === 0) {
      return;
    }

    // Simple next run calculation (in production, use a cron parser library)
    const schedule = existing[0];
    const nextRun = this.calculateNextRun(schedule.schedule);

    await db
      .update(agentSchedules)
      .set({ nextRun, updatedAt: new Date() })
      .where(eq(agentSchedules.agentId, agentId));
  }

  /**
   * Calculate next run time from cron expression
   */
  private calculateNextRun(cronExpression: string): Date {
    const now = new Date();
    
    // Parse simple cron patterns
    if (cronExpression === '0 */6 * * *') {
      // Every 6 hours
      const hours = 6 - (now.getHours() % 6);
      return new Date(now.getTime() + hours * 60 * 60 * 1000);
    }
    
    if (cronExpression === '0 */12 * * *') {
      // Every 12 hours
      const hours = 12 - (now.getHours() % 12);
      return new Date(now.getTime() + hours * 60 * 60 * 1000);
    }
    
    if (cronExpression === '0 2 * * *') {
      // Daily at 2 AM
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(2, 0, 0, 0);
      return tomorrow;
    }
    
    if (cronExpression === '*/5 * * * *') {
      // Every 5 minutes
      return new Date(now.getTime() + 5 * 60 * 1000);
    }

    // Default: 1 hour from now
    return new Date(now.getTime() + 60 * 60 * 1000);
  }

  /**
   * Get all schedules
   */
  async getAllSchedules() {
    return await db.select().from(agentSchedules);
  }

  /**
   * Get active schedules
   */
  async getActiveSchedules() {
    return await db
      .select()
      .from(agentSchedules)
      .where(eq(agentSchedules.status, 'active'));
  }
}

export const scheduleSetupService = new ScheduleSetupService();
