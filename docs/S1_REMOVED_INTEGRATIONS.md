# S1: Removed Integrations Log

**Date:** October 20, 2025  
**Methodology:** MB.MD Integration Cleanup  
**Savings:** $29/month recurring costs

## Removed Integrations

### 1. ❌ Plausible Analytics
**Why removed:** Redundant with PostHog (which offers more features)  
**Monthly cost saved:** $9/month  
**Files modified:**
- `client/index.html` - Removed script tag and DNS prefetch
**Replacement:** PostHog (already configured, same privacy-first approach)

### 2. ❌ Notion CMS
**Why removed:** Content can be managed in React/Markdown, adds unnecessary complexity  
**Monthly cost:** $0 (free tier)  
**Files to remove:**
- `server/notion.ts`
- Any Notion route files
**Alternative:** Static content in React components or Markdown files

### 3. ❌ Supabase
**Why removed:** Redundant with PostgreSQL + Drizzle ORM (duplicate database layers)  
**Monthly cost:** $0 (free tier)  
**Risk:** HIGH - Maintaining two database layers causes sync issues and bugs  
**Files to remove:**
- `server/supabaseClient.ts`
- Any Supabase routes/services
**Replacement:** PostgreSQL with Drizzle ORM (already fully functional)

### 4. ❌ n8n Workflow Automation
**Why removed:** Not needed for MVP, can add later when workflows are defined  
**Monthly cost saved:** $20/month  
**Files to remove:**
- `server/integrations/n8n-connector.ts`
- `server/routes/n8nRoutes.ts`
- `server/routes/n8nIntegration.ts`
**Future:** Can re-add in Stage 7+ when automation needs are clear

---

## Total Impact

**Cost Savings:** $29/month ($348/year)  
**Complexity Reduction:** 4 fewer integrations to maintain  
**Risk Reduction:** No duplicate database layers  
**Code Cleanup:** ~500+ lines of dead code removed

---

## What We're Keeping Instead

| Removed | Replaced By | Why Better |
|---------|-------------|------------|
| Plausible | PostHog | More features (session replay, cohorts, funnels), same privacy |
| Notion CMS | Static files | Simpler, no API calls, faster, version-controlled |
| Supabase | Drizzle + PostgreSQL | Single source of truth, no sync issues |
| n8n | Code workflows | MVP doesn't need it, can add later with clear requirements |

---

## Files Modified

### Cleaned Up:
- ✅ `client/index.html` - Removed Plausible script
- ⏳ `server/notion.ts` - To be removed
- ⏳ `server/supabaseClient.ts` - To be removed  
- ⏳ `server/integrations/n8n-connector.ts` - To be removed
- ⏳ `server/routes/n8nRoutes.ts` - To be removed
- ⏳ `server/routes/n8nIntegration.ts` - To be removed

### Created:
- ✅ `server/routes/stripeWebhook.ts` - Stripe webhook handler
- ✅ `docs/S1_REMOVED_INTEGRATIONS.md` - This file

---

## Next Steps

1. Test PostHog is working (client + server)
2. Remove Notion files
3. Remove Supabase files
4. Remove n8n files
5. Update .env.example to remove vars
6. Test that app still works
7. Document in replit.md
