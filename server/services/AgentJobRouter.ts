import { db } from "../db";
import { sql } from "drizzle-orm";

interface AgentJob {
  id?: number;
  module: string;
  operation: string;
  payload: Record<string, any>;
  priority: number;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  attempts: number;
  maxAttempts: number;
  scheduledFor?: Date;
  createdAt?: Date;
}

export class AgentJobRouter {
  async enqueueJob(job: Omit<AgentJob, 'id' | 'status' | 'attempts' | 'createdAt'>) {
    const result = await db.execute(sql`
      INSERT INTO agent_jobs (module, operation, payload, priority, status, attempts, max_attempts, scheduled_for)
      VALUES (
        ${job.module},
        ${job.operation},
        ${JSON.stringify(job.payload)}::jsonb,
        ${job.priority},
        'queued',
        0,
        ${job.maxAttempts},
        ${job.scheduledFor || null}
      )
      RETURNING id
    `);
    
    console.log(`[Agent Router] Enqueued job: ${job.module}.${job.operation}`);
    return result.rows[0]?.id;
  }

  async dequeueJob(workerPrefix: string): Promise<AgentJob | null> {
    const result = await db.execute(sql`
      UPDATE agent_jobs
      SET status = 'processing', attempts = attempts + 1
      WHERE id = (
        SELECT id FROM agent_jobs
        WHERE status = 'queued'
          AND module LIKE ${workerPrefix + '%'}
          AND (scheduled_for IS NULL OR scheduled_for <= NOW())
        ORDER BY priority DESC, created_at ASC
        FOR UPDATE SKIP LOCKED
        LIMIT 1
      )
      RETURNING id, module, operation, payload, attempts, max_attempts
    `);

    if (result.rows.length === 0) return null;

    const job = result.rows[0];
    return {
      id: job.id,
      module: job.module,
      operation: job.operation,
      payload: job.payload,
      attempts: job.attempts,
      maxAttempts: job.max_attempts,
      priority: 0,
      status: 'processing'
    };
  }

  async completeJob(jobId: number, result: any) {
    await db.execute(sql`
      UPDATE agent_jobs
      SET status = 'completed', result = ${JSON.stringify(result)}::jsonb, completed_at = NOW()
      WHERE id = ${jobId}
    `);
  }

  async failJob(jobId: number, error: string, shouldRetry: boolean = true) {
    if (shouldRetry) {
      await db.execute(sql`
        UPDATE agent_jobs
        SET status = 'queued', error = ${error}, scheduled_for = NOW() + INTERVAL '5 minutes'
        WHERE id = ${jobId} AND attempts < max_attempts
      `);
    } else {
      await db.execute(sql`
        UPDATE agent_jobs
        SET status = 'failed', error = ${error}
        WHERE id = ${jobId}
      `);
    }
  }

  async getJobStats(module?: string) {
    const filter = module ? sql`WHERE module LIKE ${module + '%'}` : sql``;
    
    const result = await db.execute(sql`
      SELECT 
        status,
        COUNT(*) as count,
        AVG(EXTRACT(EPOCH FROM (completed_at - created_at))) as avg_duration
      FROM agent_jobs
      ${filter}
      GROUP BY status
    `);

    return result.rows;
  }
}

export const agentJobRouter = new AgentJobRouter();
