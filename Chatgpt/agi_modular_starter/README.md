# Mundo Tango — AGI‑Modular Starter (Supabase + Replit + GitHub Actions)

Implements the architecture we agreed on:
- Supabase (Postgres + pgvector + RLS + Realtime + Storage)
- Edge Function Router (`/router/dispatch`) to enqueue jobs
- Workers (Node JS) consuming a Postgres queue with `FOR UPDATE SKIP LOCKED`
- Admin Jobs Dashboard (React + Vite) subscribing to `jobs`/`module_logs`
- GitHub Actions for nightly crons
- Playwright smoke tests (template)

Date: 2025-10-06

## Quick start

0) **Prereqs**: Supabase project (pgvector), Node 18+, GitHub repo.
1) **Env**: copy `.env.example` to `.env` and fill values.
2) **DB**: `psql "$SUPABASE_DB_URL" -f supabase/migrations/0001_queue_schema.sql`
3) **Edge Function**: deploy `supabase/functions/router/dispatch/index.ts`.
4) **Workers**:
```bash
cd workers && npm i
WORKER_PREFIX=memory. SUPABASE_DB_URL=$SUPABASE_DB_URL node index.js
```
5) **Admin**:
```bash
cd app && npm i && npm run dev
```
6) **Cron**: add repo secrets and enable `.github/workflows/cron.yml`.

### Notes
- RLS policies are conservative; adjust to your auth model.
- Handlers are stubs; plug in Whisper/embeddings/etc.
