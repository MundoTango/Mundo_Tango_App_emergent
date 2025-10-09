
create extension if not exists pgcrypto;
create extension if not exists vector;

create table if not exists jobs (
  id bigserial primary key,
  job_type text not null,
  payload jsonb not null,
  status text not null default 'queued',
  priority int not null default 5,
  attempts int not null default 0,
  max_attempts int not null default 3,
  trace_id uuid default gen_random_uuid(),
  scheduled_at timestamptz default now(),
  started_at timestamptz,
  finished_at timestamptz,
  error_text text
);
create index if not exists idx_jobs_status_priority_sched on jobs (status, priority, scheduled_at);
create index if not exists idx_jobs_job_type on jobs (job_type);
create index if not exists idx_jobs_sched on jobs (scheduled_at);

create table if not exists module_logs (
  id bigserial primary key,
  job_id bigint references jobs(id) on delete cascade,
  module text not null,
  level text not null,
  msg text not null,
  ts timestamptz default now()
);

create table if not exists memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  media_url text,
  caption text,
  tags text[],
  embedding vector(768),
  event_id uuid,
  created_at timestamptz default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  source text,
  source_id text,
  title text,
  start_time timestamptz,
  end_time timestamptz,
  venue text,
  geo jsonb,
  created_at timestamptz default now()
);
create unique index if not exists ux_events_source_sourceid on events(source, source_id);

alter table jobs enable row level security;
alter table module_logs enable row level security;
alter table memories enable row level security;
alter table events enable row level security;

create policy if not exists deny_all_jobs on jobs for all using (false);
create policy if not exists deny_all_logs on module_logs for all using (false);
create policy if not exists deny_all_memories on memories for all using (false);
create policy if not exists deny_all_events on events for all using (false);

create policy if not exists memories_owner_rw on memories
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create or replace function enqueue_memory_ingest() returns trigger language plpgsql as $$
begin
  insert into jobs(job_type, payload)
  values ('memory.ingest', jsonb_build_object('memory_id', new.id));
  return new;
end $$;

drop trigger if exists trg_memories_enqueue on memories;
create trigger trg_memories_enqueue
after insert on memories
for each row execute function enqueue_memory_ingest();
