# Mundo Tango — Facebook Events Integration

This package implements **Facebook → Mundo Tango** event linking, import, and continuous sync.

## Quick Start (Replit)
1. Copy `.env.example` to `.env` and fill in secrets.
2. `npm install`
3. Apply database SQL in `supabase/migrations/001_fb_events.sql` (psql, Supabase SQL editor, or CLI).
4. (Optional) Deploy edge function in `supabase/functions/sync_event`.
5. `npm run dev` then open `/events/import/facebook`.
6. Set the webhook to `/api/webhooks/facebook` in your Meta app.
