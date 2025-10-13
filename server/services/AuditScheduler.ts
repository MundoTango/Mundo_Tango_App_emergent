// TRACK 4: Audit Scheduler Service
import { db } from '../db';
import { auditSchedules } from '@shared/schema';
import { eq } from 'drizzle-orm';
import cron from 'node-cron';
import { auditOrchestrator } from './AuditOrchestrator';

// All 88 pages with priority tiers
const PAGE_AUDIT_CONFIG = [
  // HIGH PRIORITY (15 pages) - Every 6 hours
  { pageAgent: 'P1', pageRoute: '/login', priority: 'high', tools: ['playwright', 'axe'] },
  { pageAgent: 'P2', pageRoute: '/register', priority: 'high', tools: ['playwright', 'axe'] },
  { pageAgent: 'P3', pageRoute: '/onboarding', priority: 'high', tools: ['playwright', 'axe'] },
  { pageAgent: 'P4', pageRoute: '/onboarding/profile-setup', priority: 'high', tools: ['playwright', 'axe'] },
  { pageAgent: 'P5', pageRoute: '/home', priority: 'high', tools: ['playwright', 'axe'] },
  { pageAgent: 'P34', pageRoute: '/the-plan', priority: 'high', tools: ['playwright', 'axe'] },
  { pageAgent: 'P35', pageRoute: '/messages', priority: 'high', tools: ['playwright', 'axe'] },
  { pageAgent: 'P40', pageRoute: '/community/groups', priority: 'high', tools: ['playwright', 'axe'] },
  { pageAgent: 'P50', pageRoute: '/events', priority: 'high', tools: ['playwright', 'axe'] },
  { pageAgent: 'P60', pageRoute: '/profile/settings', priority: 'high', tools: ['playwright', 'axe'] },
  { pageAgent: 'P70', pageRoute: '/admin/dashboard', priority: 'high', tools: ['playwright', 'axe'] },
  { pageAgent: 'P75', pageRoute: '/admin/users', priority: 'high', tools: ['playwright', 'axe'] },
  { pageAgent: 'P80', pageRoute: '/admin/system', priority: 'high', tools: ['playwright', 'axe'] },
  { pageAgent: 'P85', pageRoute: '/help', priority: 'high', tools: ['playwright', 'axe'] },
  { pageAgent: 'P88', pageRoute: '/admin/audit', priority: 'high', tools: ['playwright', 'axe'] },

  // MEDIUM PRIORITY (30 pages) - Daily at 2 AM
  { pageAgent: 'P6', pageRoute: '/posts', priority: 'medium', tools: ['playwright', 'axe'] },
  { pageAgent: 'P7', pageRoute: '/posts/create', priority: 'medium', tools: ['playwright', 'axe'] },
  { pageAgent: 'P8', pageRoute: '/posts/:id/comments', priority: 'medium', tools: ['playwright', 'axe'] },
  { pageAgent: 'P10', pageRoute: '/posts/:id/share', priority: 'medium', tools: ['playwright', 'axe'] },
  { pageAgent: 'P16', pageRoute: '/groups/create', priority: 'medium', tools: ['playwright', 'axe'] },
  { pageAgent: 'P17', pageRoute: '/groups/:id/members', priority: 'medium', tools: ['playwright', 'axe'] },
  { pageAgent: 'P18', pageRoute: '/groups/:id/moderation', priority: 'medium', tools: ['playwright', 'axe'] },
  { pageAgent: 'P24', pageRoute: '/events/create', priority: 'medium', tools: ['playwright', 'axe'] },
  { pageAgent: 'P25', pageRoute: '/events/:id/rsvp', priority: 'medium', tools: ['playwright', 'axe'] },
  { pageAgent: 'P30', pageRoute: '/profile/edit', priority: 'medium', tools: ['playwright', 'axe'] },
  { pageAgent: 'P31', pageRoute: '/profile/privacy', priority: 'medium', tools: ['playwright', 'axe'] },
  { pageAgent: 'P32', pageRoute: '/profile/preferences', priority: 'medium', tools: ['playwright', 'axe'] },
  { pageAgent: 'P35', pageRoute: '/project/:id/stories', priority: 'medium', tools: ['playwright', 'axe'] },
  { pageAgent: 'P36', pageRoute: '/project/:id/tasks', priority: 'medium', tools: ['playwright', 'axe'] },
  { pageAgent: 'P41', pageRoute: '/chat/:id', priority: 'medium', tools: ['playwright', 'axe'] },
  // Add more medium priority pages...
];

export class AuditSchedulerService {
  private cronJobs: Map<string, cron.ScheduledTask> = new Map();

  async initializeSchedules(): Promise<number> {
    console.log('[AuditScheduler] Initializing schedules for all pages...');

    try {
      // Insert all schedules into database
      const schedules = PAGE_AUDIT_CONFIG.map(config => ({
        pageAgent: config.pageAgent,
        pageRoute: config.pageRoute,
        priority: config.priority as 'high' | 'medium' | 'low',
        frequency: this.getFrequency(config.priority as 'high' | 'medium' | 'low'),
        tools: config.tools,
        enabled: true,
        lastRun: null,
        nextRun: this.calculateNextRun(config.priority as 'high' | 'medium' | 'low'),
      }));

      const results = await db
        .insert(auditSchedules)
        .values(schedules)
        .onConflictDoUpdate({
          target: [auditSchedules.pageAgent, auditSchedules.pageRoute],
          set: {
            priority: sql`EXCLUDED.priority`,
            frequency: sql`EXCLUDED.frequency`,
            tools: sql`EXCLUDED.tools`,
            nextRun: sql`EXCLUDED.next_run`,
          },
        })
        .returning();

      console.log(`[AuditScheduler] Initialized ${results.length} audit schedules`);

      // Setup cron jobs
      this.setupCronJobs();

      return results.length;
    } catch (error) {
      console.error('[AuditScheduler] Failed to initialize schedules:', error);
      throw error;
    }
  }

  private setupCronJobs(): void {
    // High priority: Every 6 hours (00:00, 06:00, 12:00, 18:00)
    const highPriorityCron = cron.schedule('0 */6 * * *', async () => {
      console.log('[AuditScheduler] Running HIGH priority audits...');
      await this.runScheduledAudits('high');
    });
    this.cronJobs.set('high', highPriorityCron);

    // Medium priority: Daily at 2 AM
    const mediumPriorityCron = cron.schedule('0 2 * * *', async () => {
      console.log('[AuditScheduler] Running MEDIUM priority audits...');
      await this.runScheduledAudits('medium');
    });
    this.cronJobs.set('medium', mediumPriorityCron);

    // Low priority: Weekly on Sunday at 3 AM
    const lowPriorityCron = cron.schedule('0 3 * * 0', async () => {
      console.log('[AuditScheduler] Running LOW priority audits...');
      await this.runScheduledAudits('low');
    });
    this.cronJobs.set('low', lowPriorityCron);

    console.log('[AuditScheduler] Cron jobs configured:');
    console.log('  - High priority: Every 6 hours');
    console.log('  - Medium priority: Daily at 2 AM');
    console.log('  - Low priority: Weekly on Sunday at 3 AM');
  }

  async runScheduledAudits(priority: 'high' | 'medium' | 'low'): Promise<number> {
    const schedules = await db
      .select()
      .from(auditSchedules)
      .where(eq(auditSchedules.priority, priority));

    console.log(`[AuditScheduler] Found ${schedules.length} ${priority} priority schedules`);

    let completed = 0;

    for (const schedule of schedules) {
      try {
        if (!schedule.enabled) {
          console.log(`[AuditScheduler] Skipping disabled schedule: ${schedule.pageAgent}`);
          continue;
        }

        // Run audit
        await auditOrchestrator.runPageAudit(
          schedule.pageAgent,
          schedule.pageRoute,
          schedule.tools as any[]
        );

        // Update last run and next run
        await db
          .update(auditSchedules)
          .set({
            lastRun: new Date(),
            nextRun: this.calculateNextRun(schedule.priority),
          })
          .where(eq(auditSchedules.id, schedule.id));

        completed++;
        console.log(`[AuditScheduler] ✅ Completed audit: ${schedule.pageAgent}`);
      } catch (error) {
        console.error(`[AuditScheduler] ❌ Failed audit: ${schedule.pageAgent}`, error);
      }
    }

    console.log(`[AuditScheduler] Completed ${completed}/${schedules.length} ${priority} priority audits`);
    return completed;
  }

  private getFrequency(priority: 'high' | 'medium' | 'low'): string {
    switch (priority) {
      case 'high':
        return '0 */6 * * *'; // Every 6 hours
      case 'medium':
        return '0 2 * * *'; // Daily at 2 AM
      case 'low':
        return '0 3 * * 0'; // Weekly on Sunday at 3 AM
    }
  }

  private calculateNextRun(priority: 'high' | 'medium' | 'low'): Date {
    const now = new Date();
    const next = new Date(now);

    switch (priority) {
      case 'high':
        // Next 6-hour interval (00:00, 06:00, 12:00, 18:00)
        const currentHour = now.getHours();
        const nextHour = Math.ceil(currentHour / 6) * 6;
        next.setHours(nextHour, 0, 0, 0);
        if (next <= now) next.setHours(next.getHours() + 6);
        break;
      case 'medium':
        // Tomorrow at 2 AM
        next.setDate(next.getDate() + 1);
        next.setHours(2, 0, 0, 0);
        break;
      case 'low':
        // Next Sunday at 3 AM
        const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
        next.setDate(next.getDate() + daysUntilSunday);
        next.setHours(3, 0, 0, 0);
        break;
    }

    return next;
  }

  async runBaselineAudit(): Promise<void> {
    console.log('[AuditScheduler] Running baseline audit for high-priority pages...');
    await this.runScheduledAudits('high');
  }

  stopAllCronJobs(): void {
    this.cronJobs.forEach((job, name) => {
      job.stop();
      console.log(`[AuditScheduler] Stopped cron job: ${name}`);
    });
    this.cronJobs.clear();
  }
}

export const auditScheduler = new AuditSchedulerService();
