# S1: Integration Decision Matrix

**Date:** October 20, 2025  
**Purpose:** Make informed decisions about optional integrations

## Decision Framework

For each integration, evaluate:
1. **Business Value** - Does it solve a real user need?
2. **Technical Necessity** - Is it required for core functionality?
3. **Maintenance Burden** - How much ongoing effort?
4. **Cost** - Subscription fees, API costs, developer time
5. **Alternatives** - Can we use something simpler?

---

## ✅ KEEP - Required for Production

### 1. PostgreSQL + Drizzle ORM
**Status:** ✅ Fully working  
**Decision:** KEEP (critical)  
**Reasoning:** Primary data store, no alternative  
**Action:** None needed

### 2. Replit Object Storage
**Status:** ✅ Fully working  
**Decision:** KEEP (critical)  
**Reasoning:** File uploads (avatars, media, attachments)  
**Action:** None needed

### 3. Socket.io
**Status:** ✅ Fully working  
**Decision:** KEEP (critical)  
**Reasoning:** Real-time messaging, notifications, events  
**Action:** None needed

### 4. PostHog Analytics
**Status:** ✅ Fully working  
**Decision:** KEEP (important)  
**Reasoning:** User behavior tracking, product analytics  
**Action:** Verify events tracking correctly

### 5. Leaflet + LocationIQ
**Status:** ✅ Fully working  
**Decision:** KEEP (important)  
**Reasoning:** Maps, location search, event locations  
**Action:** Verify LocationIQ API key for geocoding

### 6. React Query (TanStack)
**Status:** ✅ Fully working  
**Decision:** KEEP (critical)  
**Reasoning:** Client-side caching, data fetching  
**Action:** None needed

---

## 🟡 DECIDE - Need User Input

### 7. Sentry (Error Tracking)
**Status:** 🟡 Partially implemented (no DSN)  
**Business Value:** HIGH - Production error monitoring  
**Technical Necessity:** HIGH - Critical for debugging  
**Maintenance:** LOW - Set and forget  
**Cost:** Free tier available (10k events/month)

**RECOMMENDATION:** ✅ KEEP & COMPLETE  
**Action Required:**
- [ ] Get SENTRY_DSN from user OR create free Sentry account
- [ ] Add DSN to environment variables
- [ ] Test error capture: `throw new Error("Sentry test")`
- [ ] Configure error boundaries in React

**Timeline:** 1 hour to complete

---

### 8. Stripe (Payments)
**Status:** 🟡 Partially implemented (no webhook)  
**Business Value:** HIGH - Revenue generation  
**Technical Necessity:** HIGH - Required for paid features  
**Maintenance:** MEDIUM - Webhook management, testing  
**Cost:** 2.9% + 30¢ per transaction

**RECOMMENDATION:** ✅ KEEP & COMPLETE  
**Action Required:**
- [ ] Create Stripe webhook endpoint (`/api/stripe/webhook`)
- [ ] Get STRIPE_WEBHOOK_SECRET from Stripe dashboard
- [ ] Test payment flow end-to-end
- [ ] Add subscription management UI

**Timeline:** 4-6 hours to complete

---

### 9. OpenAI (AI Features)
**Status:** 🟡 Service exists, needs testing  
**Business Value:** MEDIUM - Content enhancement, chat features  
**Technical Necessity:** LOW - Nice to have, not critical  
**Maintenance:** LOW - Stable API  
**Cost:** Variable (~$0.002 per 1K tokens)

**RECOMMENDATION:** ✅ KEEP (if budget allows)  
**Action Required:**
- [ ] Verify OPENAI_API_KEY exists in secrets
- [ ] Test chat completion endpoint
- [ ] Test content enhancement features
- [ ] Monitor usage and costs

**Alternative:** Remove AI features if cost is a concern  
**Timeline:** 2 hours to test

---

### 10. OpenReplay (Session Replay)
**Status:** 🔴 Not configured  
**Business Value:** MEDIUM - UX debugging, user insights  
**Technical Necessity:** LOW - Nice to have  
**Maintenance:** LOW - Client-side script  
**Cost:** Free tier (1k sessions/month)

**RECOMMENDATION:** 🟡 OPTIONAL - Decide based on need  
**Pros:**
- Visual debugging of user sessions
- Understand user behavior
- Catch UX issues before users report

**Cons:**
- Privacy concerns (recording user sessions)
- Storage costs at scale
- Redundant with PostHog for basic analytics

**Action Required IF KEEPING:**
- [ ] Get VITE_OPENREPLAY_PROJECT_KEY
- [ ] Add privacy notice to Privacy Policy
- [ ] Enable in frontend
- [ ] Test recording

**Timeline:** 1 hour to set up  
**Decision:** User decides

---

### 11. Plausible Analytics
**Status:** ✅ Script tag exists  
**Business Value:** LOW - Redundant with PostHog  
**Technical Necessity:** LOW - Duplicate analytics  
**Maintenance:** LOW - Just a script tag  
**Cost:** $9/month minimum

**RECOMMENDATION:** 🔴 REMOVE (redundant)  
**Reasoning:**
- PostHog already provides analytics
- Paying for two analytics is wasteful
- Plausible is privacy-first but PostHog can be configured similarly

**Action Required:**
- [ ] Remove Plausible script from index.html
- [ ] Remove from CSP headers

**Timeline:** 10 minutes  
**Savings:** $9/month

---

### 12. Notion CMS
**Status:** 🟡 Integration exists, orphaned pages  
**Business Value:** LOW - Content management  
**Technical Necessity:** LOW - Static content can be in code  
**Maintenance:** MEDIUM - API integration, content sync  
**Cost:** Free tier available

**RECOMMENDATION:** 🔴 REMOVE (unless actively used)  
**Reasoning:**
- Adds complexity for minimal benefit
- Content can be managed in React/Markdown
- Integration code exists but not actively used

**Action Required IF REMOVING:**
- [ ] Remove Notion integration code
- [ ] Move any Notion content to static files
- [ ] Remove NOTION_API_KEY from .env.example

**Action Required IF KEEPING:**
- [ ] Document content management workflow
- [ ] Create content editorial process
- [ ] Train team on Notion CMS

**Timeline:** 2 hours to remove OR 1 day to fully implement  
**Decision:** User decides based on content strategy

---

### 13. Supabase
**Status:** 🟡 Service exists, test routes active  
**Business Value:** LOW - Redundant with Drizzle + PostgreSQL  
**Technical Necessity:** LOW - Already have database layer  
**Maintenance:** HIGH - Two database layers to maintain  
**Cost:** Free tier available

**RECOMMENDATION:** 🔴 REMOVE (redundant)  
**Reasoning:**
- Mundo Tango already uses Drizzle ORM + PostgreSQL
- Supabase adds a second database layer (confusion, bugs)
- No unique features being used (auth, storage, realtime all covered)
- Maintenance burden of keeping schemas in sync

**Action Required:**
- [ ] Remove Supabase client initialization
- [ ] Remove Supabase test routes
- [ ] Remove SUPABASE_* env vars from .env.example
- [ ] Migrate any Supabase-only data to Drizzle (if exists)

**Timeline:** 2-3 hours  
**Risk:** LOW (appears unused in production paths)

---

### 14. n8n (Workflow Automation)
**Status:** 🔴 Not configured  
**Business Value:** MEDIUM - Automation potential  
**Technical Necessity:** LOW - Can build workflows in code  
**Maintenance:** HIGH - Workflow creation, debugging  
**Cost:** $20/month minimum

**RECOMMENDATION:** 🔴 DEFER to later stage  
**Reasoning:**
- Not needed for MVP launch
- Can add later when automation needs are clear
- Expensive for uncertain value
- Better to focus on core product first

**Action Required:**
- [ ] Remove n8n integration code (or mark as future)
- [ ] Document potential use cases for future
- [ ] Remove N8N_* env vars from .env.example

**Timeline:** 1 hour to remove  
**Future Timeline:** 1-2 weeks to implement workflows

---

## Summary Matrix

| Integration | Status | Recommendation | Action | Timeline | Priority |
|-------------|--------|----------------|--------|----------|----------|
| PostgreSQL | ✅ Working | ✅ KEEP | None | - | P0 |
| Object Storage | ✅ Working | ✅ KEEP | None | - | P0 |
| Socket.io | ✅ Working | ✅ KEEP | None | - | P0 |
| PostHog | ✅ Working | ✅ KEEP | Verify | 30min | P1 |
| Leaflet | ✅ Working | ✅ KEEP | Verify API | 30min | P1 |
| React Query | ✅ Working | ✅ KEEP | None | - | P0 |
| **Sentry** | 🟡 Partial | ✅ **COMPLETE** | Get DSN | 1hr | **P0** |
| **Stripe** | 🟡 Partial | ✅ **COMPLETE** | Webhook | 6hrs | **P0** |
| **OpenAI** | 🟡 Partial | ✅ **KEEP** | Test | 2hrs | P1 |
| OpenReplay | 🔴 Missing | 🟡 **DECIDE** | User choice | 1hr | P2 |
| Plausible | ✅ Script | 🔴 **REMOVE** | Remove script | 10min | P2 |
| Notion | 🟡 Partial | 🔴 **REMOVE** | Cleanup | 2hrs | P2 |
| Supabase | 🟡 Partial | 🔴 **REMOVE** | Cleanup | 3hrs | P1 |
| n8n | 🔴 Missing | 🔴 **DEFER** | Document | 1hr | P3 |

---

## Recommended Actions (Priority Order)

### IMMEDIATE (Today):
1. ✅ **Complete Sentry** - Critical for production error tracking
2. ✅ **Complete Stripe** - Required for payments/revenue
3. 🔴 **Remove Supabase** - Reduces complexity, prevents bugs
4. 🔴 **Remove Plausible** - Redundant, saves $9/month

### SHORT-TERM (This Week):
5. ✅ **Test OpenAI** - Verify AI features work
6. 🔴 **Remove Notion** - OR fully implement with content workflow
7. 🔴 **Remove n8n code** - Defer to post-launch

### DECISION NEEDED FROM USER:
- **OpenReplay:** Keep or skip? (Privacy + UX debugging)
- **Notion CMS:** Keep or remove? (Content management strategy)

---

## Cost Impact

**Current Monthly Cost (if all kept):**
- Sentry: $0 (free tier)
- Stripe: Variable (per transaction)
- OpenAI: ~$20-50/month (estimated)
- OpenReplay: $0 (free tier)
- Plausible: $9/month
- Notion: $0 (free tier)
- Supabase: $0 (free tier)
- n8n: $20/month

**After Recommended Cleanup:**
- Remove Plausible: -$9/month
- Remove n8n: -$20/month (not added)
- Remove Supabase: $0 saved (free tier)
- Remove Notion: $0 saved (free tier)

**Net Savings:** $29/month + reduced complexity

---

## Integration Health Check Endpoint

Created: `/api/integrations/status`

Returns:
```json
{
  "status": "healthy",
  "summary": {
    "total": 14,
    "healthy": 6,
    "degraded": 4,
    "down": 4
  },
  "integrations": {
    "postgresql": { "status": "healthy", "latency": 5 },
    "sentry": { "status": "down", "required": true },
    // ... all integrations
  }
}
```

**Use this endpoint to:**
- Monitor integration health
- Identify missing API keys
- Debug deployment issues
- Create status dashboard
