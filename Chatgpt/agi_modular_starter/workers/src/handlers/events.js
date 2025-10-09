export async function handleEventsNormalize(pool, job, log) {
  const { source_event_id } = job.payload || {};
  await log(job.id, 'events', 'info', `Start events.normalize for ${source_event_id || 'batch'}`);
  // TODO: parse raw event, normalize tz/geo, de-dupe by (source, source_id)
  await log(job.id, 'events', 'info', `Finished events.normalize for ${source_event_id || 'batch'}`);
}
