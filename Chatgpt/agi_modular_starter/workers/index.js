import pg from 'pg';
import { handleMemoryIngest } from './src/handlers/memory.js';
import { handleEventsNormalize } from './src/handlers/events.js';

const pool = new pg.Pool({ connectionString: process.env.SUPABASE_DB_URL });
const PREFIX = process.env.WORKER_PREFIX || 'memory.';

async function fetchJob(prefix) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(`
      SELECT * FROM jobs
      WHERE status='queued' AND job_type LIKE $1 AND scheduled_at <= now()
      ORDER BY priority ASC, scheduled_at ASC
      FOR UPDATE SKIP LOCKED
      LIMIT 1`, [`${prefix}%`]);
    if (!rows.length) { await client.query('COMMIT'); return null; }
    const job = rows[0];
    await client.query(`UPDATE jobs SET status='running', started_at=now(), attempts=attempts+1 WHERE id=$1`, [job.id]);
    await client.query('COMMIT');
    return job;
  } catch (e) {
    await client.query('ROLLBACK'); throw e;
  } finally {
    client.release();
  }
}

async function log(job_id, module, level, msg) {
  try { await pool.query(`insert into module_logs(job_id, module, level, msg) values ($1,$2,$3,$4)`, [job_id, module, level, msg]); }
  catch(e){ console.error('log error', e); }
}

async function runJob(job) {
  const type = job.job_type;
  try {
    if (type === 'memory.ingest') await handleMemoryIngest(pool, job, log);
    else if (type === 'events.normalize') await handleEventsNormalize(pool, job, log);
    else throw new Error(`No handler for ${type}`);
    await pool.query(`UPDATE jobs SET status='done', finished_at=now() WHERE id=$1`, [job.id]);
  } catch (e) {
    console.error('job failed', job.id, e);
    const failed = (job.attempts + 1) >= (job.max_attempts || 3);
    await pool.query(`UPDATE jobs SET status=$2, error_text=$3, finished_at=now() WHERE id=$1`,
      [job.id, failed ? 'failed' : 'queued', String(e)]);
  }
}

async function loop(prefix) {
  console.log('Worker started for prefix', prefix);
  while (true) {
    const job = await fetchJob(prefix);
    if (!job) { await new Promise(r => setTimeout(r, 1500)); continue; }
    await runJob(job);
  }
}
loop(PREFIX).catch(err => { console.error(err); process.exit(1); });
