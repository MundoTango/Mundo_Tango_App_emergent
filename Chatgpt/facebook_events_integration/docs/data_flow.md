# Data Flow
FB Page → Webhook → /api/webhooks/facebook → Fetch → Upsert → Notify
Nightly cron → re-fetch linked → diff → upsert.
