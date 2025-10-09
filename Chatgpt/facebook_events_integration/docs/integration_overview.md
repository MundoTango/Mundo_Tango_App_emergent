# Integration Overview

- Graph API version: env `FB_GRAPH_VERSION` (default v19.0)
- Scopes: public_profile, email, pages_show_list, pages_read_engagement, pages_manage_events
- Sync: Webhook-first; polling fallback; nightly drift verification.
- Model: see `supabase/migrations/001_fb_events.sql`.
- Security: RLS, encrypted tokens, webhook verification.
