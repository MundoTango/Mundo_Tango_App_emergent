/**
 * Cron Job Scheduler for Open Source Agent
 * Runs automated tasks on schedule
 * MB.MD: Continuous monitoring and optimization
 * Created: October 28, 2025
 */

import { CronJob } from 'cron';
import { db } from '../../db';
import { agentCronJobs, openSourceModels } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { openSourceService } from './OpenSourceManagementService';

interface ScheduledTask {
  agentId: string;
  jobName: string;
  schedule: string; // Cron expression
  handler: () => Promise<void>;
}

export class CronScheduler {
  private jobs: Map<string, CronJob> = new Map();
  
  constructor() {
    this.registerDefaultTasks();
  }
  
  /**
   * Register default cron tasks for Open Source Agent
   */
  private registerDefaultTasks() {
    // Task 1: Discover new models every 6 hours
    this.registerTask({
      agentId: 'layer_59',
      jobName: 'discover_new_models',
      schedule: '0 */6 * * *', // Every 6 hours
      handler: async () => {
        console.log('[CronScheduler] Running model discovery...');
        const discoveries = await openSourceService.discoverModels();
        console.log(`[CronScheduler] Discovered ${discoveries.length} models`);
      }
    });
    
    // Task 2: Evaluate pending models daily
    this.registerTask({
      agentId: 'layer_59',
      jobName: 'evaluate_pending_models',
      schedule: '0 2 * * *', // 2 AM daily
      handler: async () => {
        console.log('[CronScheduler] Evaluating pending models...');
        const models = await db.query.openSourceModels.findMany({
          where: eq(openSourceModels.status, 'discovered')
        });
        
        for (const model of models.slice(0, 5)) { // Process 5 per day
          try {
            await openSourceService.evaluateModel(model.id, 'Claude Sonnet');
          } catch (error) {
            console.error(`[CronScheduler] Evaluation failed for ${model.name}:`, error);
          }
        }
      }
    });
    
    // Task 3: Generate cost report daily
    this.registerTask({
      agentId: 'layer_59',
      jobName: 'daily_cost_report',
      schedule: '0 8 * * *', // 8 AM daily
      handler: async () => {
        console.log('[CronScheduler] Generating cost report...');
        const report = await openSourceService.generateCostReport(30);
        console.log('[CronScheduler] Cost Report:', {
          totalSpent: `$${report.totalSpent.toFixed(2)}`,
          totalSaved: `$${report.totalSaved.toFixed(2)}`,
          savingsRate: `${((report.totalSaved / (report.totalSpent + report.totalSaved)) * 100).toFixed(1)}%`
        });
        
        // Alert if costs exceed threshold
        if (report.totalSpent > 1000) {
          console.warn('[CronScheduler] ⚠️ Monthly costs exceed $1000!');
        }
      }
    });
    
    // Task 4: Security scan weekly
    this.registerTask({
      agentId: 'layer_59',
      jobName: 'weekly_security_scan',
      schedule: '0 0 * * 0', // Midnight every Sunday
      handler: async () => {
        console.log('[CronScheduler] Running security scan...');
        const models = await db.query.openSourceModels.findMany({
          where: eq(openSourceModels.status, 'in_production')
        });
        
        for (const model of models) {
          // Re-evaluate security
          await openSourceService.evaluateModel(model.id, 'Claude Sonnet');
        }
      }
    });
  }
  
  /**
   * Register a new cron task
   */
  async registerTask(task: ScheduledTask): Promise<void> {
    const taskKey = `${task.agentId}:${task.jobName}`;
    
    // Check if task already registered in database
    let dbTask = await db.query.agentCronJobs.findFirst({
      where: and(
        eq(agentCronJobs.agentId, task.agentId),
        eq(agentCronJobs.jobName, task.jobName)
      )
    });
    
    if (!dbTask) {
      // Create new task record
      [dbTask] = await db.insert(agentCronJobs).values({
        agentId: task.agentId,
        jobName: task.jobName,
        schedule: task.schedule,
        enabled: true,
        nextRunAt: this.calculateNextRun(task.schedule)
      }).returning();
    }
    
    // Create CronJob instance
    const cronJob = new CronJob(
      task.schedule,
      async () => {
        if (!dbTask) return;
        
        // Update status to running
        await db.update(agentCronJobs)
          .set({ lastStatus: 'running' })
          .where(eq(agentCronJobs.id, dbTask.id));
        
        try {
          // Execute handler
          await task.handler();
          
          // Update success status
          await db.update(agentCronJobs)
            .set({
              lastRunAt: new Date(),
              lastStatus: 'success',
              lastError: null,
              nextRunAt: this.calculateNextRun(task.schedule),
              runCount: (dbTask.runCount || 0) + 1
            })
            .where(eq(agentCronJobs.id, dbTask.id));
          
          console.log(`[CronScheduler] ✅ ${task.jobName} completed successfully`);
        } catch (error) {
          // Update failure status
          const errorMessage = error instanceof Error ? error.message : String(error);
          await db.update(agentCronJobs)
            .set({
              lastRunAt: new Date(),
              lastStatus: 'failed',
              lastError: errorMessage,
              nextRunAt: this.calculateNextRun(task.schedule)
            })
            .where(eq(agentCronJobs.id, dbTask.id));
          
          console.error(`[CronScheduler] ❌ ${task.jobName} failed:`, error);
        }
      },
      null,
      true, // Start immediately
      'America/Los_Angeles' // Timezone
    );
    
    this.jobs.set(taskKey, cronJob);
    console.log(`[CronScheduler] Registered task: ${taskKey} (${task.schedule})`);
  }
  
  /**
   * Calculate next run time based on cron expression
   */
  private calculateNextRun(schedule: string): Date {
    // Simple calculation - in production use a cron parser library
    const now = new Date();
    now.setHours(now.getHours() + 6); // Default to 6 hours from now
    return now;
  }
  
  /**
   * Enable/disable a cron task
   */
  async toggleTask(agentId: string, jobName: string, enabled: boolean): Promise<void> {
    await db.update(agentCronJobs)
      .set({ enabled })
      .where(and(
        eq(agentCronJobs.agentId, agentId),
        eq(agentCronJobs.jobName, jobName)
      ));
    
    const taskKey = `${agentId}:${jobName}`;
    const job = this.jobs.get(taskKey);
    
    if (job) {
      if (enabled) {
        job.start();
      } else {
        job.stop();
      }
    }
    
    console.log(`[CronScheduler] Task ${taskKey} ${enabled ? 'enabled' : 'disabled'}`);
  }
  
  /**
   * Get all registered tasks
   */
  async getTasks() {
    return db.query.agentCronJobs.findMany({
      orderBy: (jobs, { asc }) => [asc(jobs.agentId), asc(jobs.jobName)]
    });
  }
  
  /**
   * Manually trigger a task
   */
  async triggerTask(agentId: string, jobName: string): Promise<void> {
    const taskKey = `${agentId}:${jobName}`;
    const job = this.jobs.get(taskKey);
    
    if (!job) {
      throw new Error(`Task ${taskKey} not found`);
    }
    
    console.log(`[CronScheduler] Manually triggering ${taskKey}...`);
    job.fireOnTick(); // Trigger immediately
  }
  
  /**
   * Stop all cron jobs (for graceful shutdown)
   */
  stopAll(): void {
    this.jobs.forEach((job, key) => {
      job.stop();
      console.log(`[CronScheduler] Stopped ${key}`);
    });
  }
}

export const cronScheduler = new CronScheduler();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[CronScheduler] Received SIGTERM, stopping all jobs...');
  cronScheduler.stopAll();
});
