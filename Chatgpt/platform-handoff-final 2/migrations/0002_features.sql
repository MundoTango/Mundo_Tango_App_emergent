create table if not exists events(id uuid primary key default gen_random_uuid(), owner_id uuid, title text not null, starts_at timestamptz, ends_at timestamptz, visibility text default 'Public', source text, created_at timestamptz default now());
create table if not exists event_links(id uuid primary key default gen_random_uuid(), event_id uuid references events(id) on delete cascade, source text, source_id text, created_at timestamptz default now());
create table if not exists fb_event_imports(id uuid primary key default gen_random_uuid(), fb_event_id text, payload_raw jsonb, created_at timestamptz default now());
create table if not exists fb_user_tokens(id uuid primary key default gen_random_uuid(), user_id uuid, access_token text, created_at timestamptz default now());

create table if not exists payments(id uuid primary key default gen_random_uuid(), user_id uuid, amount int, currency text, stripe_session_id text, status text, created_at timestamptz default now());

create table if not exists help_logs(id uuid primary key default gen_random_uuid(), user_id uuid, question text, answer text, created_at timestamptz default now());
create table if not exists bot_feedback(id uuid primary key default gen_random_uuid(), user_id uuid, feedback text, created_at timestamptz default now());
create table if not exists knowledge_base(id uuid primary key default gen_random_uuid(), title text, content text, created_at timestamptz default now());

create table if not exists travel_plans(id uuid primary key default gen_random_uuid(), user_id uuid, destination text, start_date date, end_date date, created_at timestamptz default now());
create table if not exists lodging_links(id uuid primary key default gen_random_uuid(), travel_plan_id uuid references travel_plans(id) on delete cascade, url text, created_at timestamptz default now());
create table if not exists memory_connections(id uuid primary key default gen_random_uuid(), a uuid, b uuid, created_at timestamptz default now());

create table if not exists volunteers(id uuid primary key default gen_random_uuid(), event_id uuid references events(id) on delete cascade, user_id uuid, role text, status text, created_at timestamptz default now());
create table if not exists predictions(id uuid primary key default gen_random_uuid(), event_id uuid, payload jsonb, created_at timestamptz default now());

create table if not exists media_tasks(id uuid primary key default gen_random_uuid(), params jsonb, status text, created_at timestamptz default now());

create table if not exists security_audits(id uuid primary key default gen_random_uuid(), actor uuid, action text, table_name text, row_id uuid, created_at timestamptz default now());
create table if not exists incident_reports(id uuid primary key default gen_random_uuid(), title text, details text, created_at timestamptz default now());