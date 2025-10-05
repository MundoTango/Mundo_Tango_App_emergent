/**
 * PostgreSQL Queue Adapter
 * Replacement for BullMQ/Redis with PostgreSQL-based job queue
 */

import EventEmitter from 'events';
import { db } from '../db';
import { 
  agentJobs, 
  agentState, 
  agentEvents,
  type InsertAgentJob,
  type AgentJob,
  type InsertAgentState,
  type InsertAgentEvent
} from '../../shared/schema';
import { eq, and, lt, gte, lte, or, isNull, sql, asc, desc } from 'drizzle-orm';

/**
 * PostgreSQL-based Job interface (mimics BullMQ Job)
 */
export interface PgJob {
  id: number;
  name: string;
  data: any;
  attemptsMade: number;
  opts?: {
    attempts?: number;
    backoff?: {
      type: string;
      delay: number;
    };
  };
  processedOn?: Date;
  finishedOn?: Date;
  failedReason?: string;
}

/**
 * PostgreSQL-based Queue implementation
 */
export class PgQueue extends EventEmitter {
  private pollInterval: NodeJS.Timeout | null = null;
  private isProcessing: boolean = false;
  
  constructor(
    public readonly name: string,
    private readonly options: { pollIntervalMs?: number } = {}
  ) {
    super();
    this.options.pollIntervalMs = this.options.pollIntervalMs || 1000;
  }
  
  /**
   * Add a job to the queue
   */
  async add(jobName: string, data: any, options?: any): Promise<AgentJob> {
    const jobData: InsertAgentJob = {
      agentId: this.name.replace('agent_', ''),
      jobName,
      data,
      status: 'pending',
      attempts: 0,
      maxAttempts: options?.attempts || 3,
      priority: options?.priority || 0,
      scheduledAt: options?.delay 
        ? new Date(Date.now() + options.delay) 
        : undefined,
    };
    
    const [job] = await db.insert(agentJobs).values(jobData).returning();
    
    // Emit event for job added
    await this.emitEvent('job:added', { jobId: job.id, agentId: job.agentId });
    
    return job;
  }
  
  /**
   * Get waiting jobs count
   */
  async getWaitingCount(): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(agentJobs)
      .where(
        and(
          eq(agentJobs.agentId, this.name.replace('agent_', '')),
          eq(agentJobs.status, 'pending')
        )
      );
    
    return result[0]?.count || 0;
  }
  
  /**
   * Get active jobs count
   */
  async getActiveCount(): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(agentJobs)
      .where(
        and(
          eq(agentJobs.agentId, this.name.replace('agent_', '')),
          eq(agentJobs.status, 'processing')
        )
      );
    
    return result[0]?.count || 0;
  }
  
  /**
   * Get completed jobs count
   */
  async getCompletedCount(): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(agentJobs)
      .where(
        and(
          eq(agentJobs.agentId, this.name.replace('agent_', '')),
          eq(agentJobs.status, 'completed')
        )
      );
    
    return result[0]?.count || 0;
  }
  
  /**
   * Get failed jobs count
   */
  async getFailedCount(): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(agentJobs)
      .where(
        and(
          eq(agentJobs.agentId, this.name.replace('agent_', '')),
          eq(agentJobs.status, 'failed')
        )
      );
    
    return result[0]?.count || 0;
  }
  
  /**
   * Close the queue
   */
  async close(): Promise<void> {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this.removeAllListeners();
  }
  
  /**
   * Emit event to PostgreSQL
   */
  private async emitEvent(event: string, data: any): Promise<void> {
    await db.insert(agentEvents).values({
      event,
      agentId: this.name.replace('agent_', ''),
      data,
      processed: false,
    });
  }
}

/**
 * PostgreSQL-based Worker implementation
 */
export class PgWorker extends EventEmitter {
  private pollInterval: NodeJS.Timeout | null = null;
  private isProcessing: boolean = false;
  private isClosed: boolean = false;
  
  constructor(
    private readonly queueName: string,
    private readonly processor: (job: PgJob) => Promise<any>,
    private readonly options: {
      connection?: any;
      concurrency?: number;
      pollIntervalMs?: number;
    } = {}
  ) {
    super();
    this.options.concurrency = this.options.concurrency || 1;
    this.options.pollIntervalMs = this.options.pollIntervalMs || 1000;
    this.startPolling();
  }
  
  /**
   * Start polling for jobs
   */
  private startPolling(): void {
    if (this.pollInterval) return;
    
    this.pollInterval = setInterval(async () => {
      if (this.isProcessing || this.isClosed) return;
      await this.processJobs();
    }, this.options.pollIntervalMs!);
    
    // Process immediately
    this.processJobs();
  }
  
  /**
   * Process pending jobs
   */
  private async processJobs(): Promise<void> {
    if (this.isProcessing || this.isClosed) return;
    this.isProcessing = true;
    
    try {
      const agentId = this.queueName.replace('agent_', '');
      
      // Get next pending job
      const jobs = await db
        .select()
        .from(agentJobs)
        .where(
          and(
            eq(agentJobs.agentId, agentId),
            eq(agentJobs.status, 'pending'),
            or(
              isNull(agentJobs.scheduledAt),
              lte(agentJobs.scheduledAt, new Date())
            )
          )
        )
        .orderBy(desc(agentJobs.priority), asc(agentJobs.createdAt))
        .limit(this.options.concurrency!);
      
      if (jobs.length === 0) {
        this.isProcessing = false;
        return;
      }
      
      // Process jobs concurrently
      await Promise.all(jobs.map(job => this.processJob(job)));
    } catch (error) {
      console.error(`[Worker ${this.queueName}] Error processing jobs:`, error);
    } finally {
      this.isProcessing = false;
    }
  }
  
  /**
   * Process a single job
   */
  private async processJob(job: AgentJob): Promise<void> {
    try {
      // Mark job as processing
      await db
        .update(agentJobs)
        .set({
          status: 'processing',
          processedAt: new Date(),
          attempts: job.attempts + 1,
        })
        .where(eq(agentJobs.id, job.id));
      
      // Convert to PgJob format
      const pgJob: PgJob = {
        id: job.id,
        name: job.jobName,
        data: job.data,
        attemptsMade: job.attempts,
        opts: {
          attempts: job.maxAttempts,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
        processedOn: job.processedAt || undefined,
      };
      
      // Process the job
      const result = await this.processor(pgJob);
      
      // Mark job as completed
      await db
        .update(agentJobs)
        .set({
          status: 'completed',
          result,
          completedAt: new Date(),
        })
        .where(eq(agentJobs.id, job.id));
      
      // Emit completed event
      this.emit('completed', {
        jobId: job.id.toString(),
        returnvalue: result,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Check if we should retry
      if (job.attempts < job.maxAttempts) {
        // Schedule retry with exponential backoff
        const delayMs = Math.pow(2, job.attempts) * 2000;
        await db
          .update(agentJobs)
          .set({
            status: 'pending',
            error: errorMessage,
            scheduledAt: new Date(Date.now() + delayMs),
          })
          .where(eq(agentJobs.id, job.id));
      } else {
        // Mark as failed
        await db
          .update(agentJobs)
          .set({
            status: 'failed',
            error: errorMessage,
            completedAt: new Date(),
          })
          .where(eq(agentJobs.id, job.id));
        
        // Emit failed event
        this.emit('failed', {
          jobId: job.id.toString(),
          failedReason: errorMessage,
        });
      }
    }
  }
  
  /**
   * Close the worker
   */
  async close(): Promise<void> {
    this.isClosed = true;
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this.removeAllListeners();
  }
}

/**
 * PostgreSQL-based Queue Events implementation
 */
export class PgQueueEvents extends EventEmitter {
  private pollInterval: NodeJS.Timeout | null = null;
  private lastEventId: number = 0;
  
  constructor(
    private readonly queueName: string,
    private readonly options: { pollIntervalMs?: number } = {}
  ) {
    super();
    this.options.pollIntervalMs = this.options.pollIntervalMs || 500;
    this.startPolling();
  }
  
  /**
   * Start polling for events
   */
  private startPolling(): void {
    if (this.pollInterval) return;
    
    this.pollInterval = setInterval(async () => {
      await this.pollEvents();
    }, this.options.pollIntervalMs!);
    
    // Poll immediately
    this.pollEvents();
  }
  
  /**
   * Poll for new events
   */
  private async pollEvents(): Promise<void> {
    try {
      const agentId = this.queueName.replace('agent_', '');
      
      // Get unprocessed events
      const events = await db
        .select()
        .from(agentEvents)
        .where(
          and(
            eq(agentEvents.agentId, agentId),
            eq(agentEvents.processed, false)
          )
        )
        .orderBy(asc(agentEvents.createdAt));
      
      for (const event of events) {
        // Emit the event
        this.emit(event.event, event.data);
        
        // Mark as processed
        await db
          .update(agentEvents)
          .set({
            processed: true,
            processedAt: new Date(),
          })
          .where(eq(agentEvents.id, event.id));
      }
    } catch (error) {
      console.error(`[QueueEvents ${this.queueName}] Error polling events:`, error);
    }
  }
  
  /**
   * Close the event listener
   */
  async close(): Promise<void> {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this.removeAllListeners();
  }
}

/**
 * PostgreSQL-based State Manager
 */
export class PgStateManager {
  constructor(private readonly agentId: string) {}
  
  /**
   * Get state value
   */
  async get(key: string): Promise<any> {
    const result = await db
      .select()
      .from(agentState)
      .where(
        and(
          eq(agentState.agentId, this.agentId),
          eq(agentState.key, key),
          or(
            isNull(agentState.expiresAt),
            gte(agentState.expiresAt, new Date())
          )
        )
      )
      .limit(1);
    
    return result[0]?.value || null;
  }
  
  /**
   * Set state value with optional TTL
   */
  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const stateData: InsertAgentState = {
      agentId: this.agentId,
      key,
      value,
      expiresAt: ttlSeconds 
        ? new Date(Date.now() + ttlSeconds * 1000)
        : undefined,
    };
    
    await db
      .insert(agentState)
      .values(stateData)
      .onConflictDoUpdate({
        target: [agentState.agentId, agentState.key],
        set: {
          value,
          expiresAt: stateData.expiresAt,
          updatedAt: new Date(),
        },
      });
  }
  
  /**
   * Delete state value
   */
  async delete(key: string): Promise<void> {
    await db
      .delete(agentState)
      .where(
        and(
          eq(agentState.agentId, this.agentId),
          eq(agentState.key, key)
        )
      );
  }
  
  /**
   * Clean up expired state values
   */
  async cleanupExpired(): Promise<void> {
    await db
      .delete(agentState)
      .where(
        and(
          eq(agentState.agentId, this.agentId),
          lt(agentState.expiresAt, new Date())
        )
      );
  }
}