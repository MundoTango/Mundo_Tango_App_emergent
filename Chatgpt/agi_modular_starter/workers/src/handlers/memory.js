export async function handleMemoryIngest(pool, job, log) {
  const { memory_id } = job.payload || {};
  if (!memory_id) throw new Error('Missing memory_id');
  await log(job.id, 'memory', 'info', `Start memory.ingest for ${memory_id}`);

  const { rows } = await pool.query(`select * from memories where id = $1`, [memory_id]);
  if (!rows.length) throw new Error('Memory not found');
  const mem = rows[0];

  // TODO: caption/tags generation
  const caption = mem.caption || 'Auto-caption TBD';
  const tags = mem.tags || ['tango'];

  // TODO: embedding computation (pgvector)
  // const embedding = ...

  await pool.query(`update memories set caption=$2, tags=$3 where id=$1`, [memory_id, caption, tags]);
  await log(job.id, 'memory', 'info', `Finished memory.ingest for ${memory_id}`);
}
