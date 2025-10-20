# S6: API Key Inventory & Request List

**Date:** October 20, 2025  
**Purpose:** Track all required API keys for production deployment

## API Keys Status

### ✅ HAVE (Confirmed in Secrets)
1. **ANTHROPIC_API_KEY** - Claude AI (present)
2. **GEMINI_API_KEY** - Google AI (present)
3. **JIRA_API_TOKEN** - Jira integration (present)
4. **JIRA_DOMAIN** - Jira workspace (present)
5. **JIRA_EMAIL** - Jira authentication (present)
6. **LOCATIONIQ_API_KEY** - Geocoding (present)
7. **MESHY_API_KEY** - 3D models (present)
8. **STRIPE_SECRET_KEY** - Payments (present)
9. **VITE_STRIPE_PUBLIC_KEY** - Frontend Stripe (present)

### 🔴 NEED (Missing - User Action Required)

#### P0 - CRITICAL (Blocking Production)
1. **SENTRY_DSN**
   - **Purpose:** Error tracking and monitoring
   - **Why Critical:** Cannot debug production issues without it
   - **Cost:** Free (10k events/month)
   - **Get From:** https://sentry.io/signup/
   - **Setup:** 10 minutes
   - **Action:** Create account → New project → Copy DSN

2. **VITE_SENTRY_DSN**
   - **Purpose:** Frontend error tracking
   - **Same as:** SENTRY_DSN (can be same value)
   - **Action:** Copy from Sentry project settings

3. **STRIPE_WEBHOOK_SECRET**
   - **Purpose:** Verify Stripe webhook signatures
   - **Why Critical:** Required for payment processing
   - **Get From:** Stripe Dashboard → Webhooks → Add endpoint
   - **Endpoint URL:** `https://mundotango.com/api/stripe/webhook`
   - **Events to listen for:**
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

#### P1 - HIGH (Important for Features)
4. **OPENAI_API_KEY**
   - **Purpose:** AI content enhancement, chat features
   - **Status:** May already have (need to verify)
   - **Cost:** ~$0.002 per 1K tokens
   - **Get From:** https://platform.openai.com/api-keys
   - **Action:** Verify if exists, otherwise create

#### P2 - OPTIONAL (Nice to Have)
5. **VITE_OPENREPLAY_PROJECT_KEY**
   - **Purpose:** Session replay for UX debugging
   - **Cost:** Free (1k sessions/month)
   - **Get From:** https://openreplay.com/signup
   - **Decision:** User decides if needed
   - **Action:** Skip for MVP OR sign up and configure

6. **POSTHOG_API_KEY** (Verify)
   - **Status:** May be configured, needs verification
   - **Purpose:** Server-side analytics
   - **Action:** Verify in PostHog dashboard

### 🟡 DECIDE (Integration Decisions)

7. **NOTION_API_KEY**
   - **Purpose:** CMS integration
   - **Decision:** Keep or remove?
   - **Get From:** https://www.notion.so/my-integrations
   - **Action:** User decides based on content strategy

8. **SUPABASE_URL** + **SUPABASE_ANON_KEY** + **SUPABASE_SERVICE_ROLE_KEY**
   - **Purpose:** Alternative database (redundant with Drizzle)
   - **Decision:** Remove (recommended)
   - **Action:** Clean up Supabase code

9. **N8N_API_KEY** + **N8N_BASE_URL**
   - **Purpose:** Workflow automation
   - **Decision:** Defer to post-launch
   - **Action:** Remove for now, document for future

### 📋 Auto-Provided by Replit
- **DATABASE_URL** - PostgreSQL connection (✅ automatic)
- **REPLIT_OBJECT_STORAGE** - File storage (✅ automatic)

---

## Request Template for User

### Critical (Need Now):
```
Please provide these API keys to complete production setup:

1. SENTRY_DSN
   - Sign up: https://sentry.io/signup/
   - Create new project → Copy DSN
   - Also copy to VITE_SENTRY_DSN

2. STRIPE_WEBHOOK_SECRET
   - Stripe Dashboard → Webhooks → Add endpoint
   - Endpoint: https://mundotango.com/api/stripe/webhook
   - Copy webhook secret

3. Verify OPENAI_API_KEY exists in secrets
```

### Optional (Decide):
```
Please decide on these integrations:

1. OpenReplay session replay?
   - YES: Sign up at https://openreplay.com and provide VITE_OPENREPLAY_PROJECT_KEY
   - NO: Skip this feature

2. Keep Notion CMS integration?
   - YES: Provide NOTION_API_KEY and document content workflow
   - NO: Remove integration (recommended)

3. Keep Supabase?
   - Recommended: REMOVE (redundant with PostgreSQL/Drizzle)
   - Action: Clean up code

4. n8n workflow automation?
   - Recommended: DEFER to post-launch
   - Action: Document for future
```

---

## Environment Variables Checklist

### Required for Production:
- [x] DATABASE_URL (auto)
- [x] STRIPE_SECRET_KEY
- [x] VITE_STRIPE_PUBLIC_KEY
- [ ] STRIPE_WEBHOOK_SECRET **← NEED**
- [ ] SENTRY_DSN **← NEED**
- [ ] VITE_SENTRY_DSN **← NEED**
- [?] OPENAI_API_KEY (verify)
- [x] LOCATIONIQ_API_KEY

### Optional:
- [?] VITE_OPENREPLAY_PROJECT_KEY (decide)
- [?] POSTHOG_API_KEY (verify)
- [?] NOTION_API_KEY (decide)

### Recommended to Remove:
- [ ] SUPABASE_* (redundant)
- [ ] N8N_* (defer)

---

## Setup Priority Order

1. **TODAY:** Get Sentry DSN (10 min)
2. **TODAY:** Set up Stripe webhook (15 min)
3. **TODAY:** Verify OpenAI key exists
4. **THIS WEEK:** Make integration decisions (OpenReplay, Notion, Supabase, n8n)
5. **BEFORE LAUNCH:** Test all integrations end-to-end

---

## Verification Script

After adding keys, verify with:
```bash
# Check environment variables
curl http://localhost:5000/api/integrations/status

# Should return:
# {
#   "status": "healthy",
#   "integrations": {
#     "sentry": { "status": "healthy" },
#     "stripe": { "status": "healthy", "webhookConfigured": true },
#     ...
#   }
# }
```

---

## Cost Summary

**Monthly costs with all integrations:**
- Sentry: $0 (free tier)
- Stripe: Variable (2.9% + 30¢ per transaction)
- OpenAI: ~$20-50/month (usage-based)
- OpenReplay: $0 (free tier) or skip
- PostHog: $0 (free tier)
- Notion: $0 (free tier) or remove
- Supabase: Remove
- n8n: Defer

**Total predictable monthly cost:** ~$0-50 (mostly OpenAI usage)
