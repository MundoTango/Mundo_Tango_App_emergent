import { db } from "../db";
import { sql } from "drizzle-orm";

interface AgentJob {
  id?: number;
  agentId?: string;
  jobName: string;
  data: Record<string, any>;
  priority: number;
  status: 'queued' | 'running' | 'done' | 'failed';
  attempts: number;
  maxAttempts: number;
  scheduledAt?: Date;
}

export class AgentJobRouter {
  async enqueueJob(module: string, operation: string, payload: Record<string, any>, priority: number = 5, maxAttempts: number = 3) {
    const jobName = `${module}.${operation}`;
    
    const result = await db.execute(sql`
      INSERT INTO agent_jobs (job_name, data, priority, status, attempts, max_attempts, scheduled_at)
      VALUES (
        ${jobName},
        ${JSON.stringify(payload)}::jsonb,
        ${priority},
        'queued',
        0,
        ${maxAttempts},
        NOW()
      )
      RETURNING id
    `);
    
    console.log(`[Agent Router] Enqueued: ${jobName} (priority: ${priority})`);
    return result.rows[0]?.id;
  }

  async dequeueJob(workerPrefix: string): Promise<AgentJob | null> {
    const result = await db.execute(sql`
      UPDATE agent_jobs
      SET status = 'running', attempts = attempts + 1, processed_at = NOW()
      WHERE id = (
        SELECT id FROM agent_jobs
        WHERE status = 'queued'
          AND job_name LIKE ${workerPrefix + '%'}
          AND (scheduled_at IS NULL OR scheduled_at <= NOW())
        ORDER BY priority ASC, created_at ASC
        FOR UPDATE SKIP LOCKED
        LIMIT 1
      )
      RETURNING id, job_name, data, attempts, max_attempts, priority
    `);

    if (result.rows.length === 0) return null;

    const job = result.rows[0];
    return {
      id: job.id,
      jobName: job.job_name,
      data: job.data,
      attempts: job.attempts,
      maxAttempts: job.max_attempts,
      priority: job.priority,
      status: 'running'
    };
  }

  async completeJob(jobId: number, result: any) {
    await db.execute(sql`
      UPDATE agent_jobs
      SET status = 'done', result = ${JSON.stringify(result)}::jsonb, completed_at = NOW()
      WHERE id = ${jobId}
    `);
    console.log(`[Agent Router] ✅ Completed job ${jobId}`);
  }

  async failJob(jobId: number, error: string, shouldRetry: boolean = true) {
    if (shouldRetry) {
      await db.execute(sql`
        UPDATE agent_jobs
        SET status = 'queued', error = ${error}, scheduled_at = NOW() + INTERVAL '5 minutes'
        WHERE id = ${jobId} AND attempts < max_attempts
      `);
      console.log(`[Agent Router] 🔄 Retrying job ${jobId}`);
    } else {
      await db.execute(sql`
        UPDATE agent_jobs
        SET status = 'failed', error = ${error}, completed_at = NOW()
        WHERE id = ${jobId}
      `);
      console.log(`[Agent Router] ❌ Failed job ${jobId}`);
    }
  }

  async getJobStats(prefix?: string) {
    const filter = prefix ? sql`WHERE job_name LIKE ${prefix + '%'}` : sql``;
    
    const result = await db.execute(sql`
      SELECT 
        status,
        COUNT(*)::int as count,
        AVG(EXTRACT(EPOCH FROM (completed_at - created_at)))::float as avg_duration
      FROM agent_jobs
      ${filter}
      GROUP BY status
    `);

    return result.rows;
  }
}

export const agentJobRouter = new AgentJobRouter();
