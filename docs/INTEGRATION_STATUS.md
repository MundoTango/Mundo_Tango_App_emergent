# Integration Status - Source of Truth

**Last Updated:** October 20, 2025  
**Purpose:** Definitive reference for all external integrations (implemented vs planned)  
**Methodology:** MB.MD (Mapping-Breakdown-Mitigation-Deployment)

---

## ✅ FULLY IMPLEMENTED Integrations

### 1. Replit OAuth
- **Status:** ✅ IMPLEMENTED
- **Purpose:** Authentication and user session management
- **Files:** 
  - `server/replitAuth.ts`
  - `server/middleware/replitAuth.ts`
- **Usage:** JWT-based auth with RBAC and ABAC support
- **Environment Variables:** Auto-configured by Replit

### 2. PostgreSQL Database (Drizzle ORM)
- **Status:** ✅ IMPLEMENTED
- **Purpose:** Primary data storage
- **Files:**
  - `server/db/index.ts`
  - `shared/schema.ts` (88 tables)
  - `drizzle.config.ts`
- **Features:** Schema-first, JSON columns, optimized indexes
- **Environment Variables:** `DATABASE_URL` (auto-provided by Replit)
- **Commands:**
  - `npm run db:push` - Push schema changes
  - `npm run db:push --force` - Force push on data-loss warnings

### 3. Replit Object Storage
- **Status:** ✅ IMPLEMENTED (Oct 20, 2025)
- **Purpose:** Native file storage with ACL support
- **Files:**
  - `server/objectStorage.ts`
  - `server/objectAcl.ts`
  - `client/src/components/ObjectUploader.tsx`
- **Features:** Public/private uploads, presigned URLs, ACL policies
- **Blueprint:** `blueprint:javascript_object_storage` (added Oct 20)
- **Environment Variables:**
  - `PUBLIC_OBJECT_SEARCH_PATHS` - Comma-separated bucket paths
  - `PRIVATE_OBJECT_DIR` - Private bucket directory
- **Packages:** `@google-cloud/storage`, `@uppy/core`, `@uppy/react`, `@uppy/dashboard`, `@uppy/aws-s3`

### 4. Socket.io (WebSocket)
- **Status:** ✅ IMPLEMENTED
- **Purpose:** Real-time WebSocket communication
- **Files:**
  - `server/services/websocketService.ts` (WebSocketService class)
  - `server/services/realTimeNotifications.ts`
  - `client/src/contexts/socket-context.tsx`
  - `client/src/lib/socketClient.ts`
- **Features:** Event-driven, room-based communication, real-time notifications
- **Note:** Socket.io is the ONLY WebSocket implementation; `ws` library removed Oct 20 as dead code
- **Packages:** `socket.io`, `socket.io-client`

### 5. PostHog Analytics
- **Status:** ✅ IMPLEMENTED (Oct 20, 2025)
- **Purpose:** Product analytics with client/server tracking
- **Files:**
  - `client/src/lib/posthog.ts` - Client init, identify, track, reset
  - `client/src/hooks/use-posthog.ts` - Page tracking hook
  - `server/services/posthog.ts` - Server-side event tracking
- **Integration Points:**
  - `client/src/App.tsx` - Initialization on app load
  - `client/src/contexts/auth-context.tsx` - User identify on login, reset on logout
  - `server/routes.ts` - Server-side initialization
- **Environment Variables:**
  - Client: `VITE_POSTHOG_API_KEY`, `VITE_POSTHOG_HOST`, `VITE_POSTHOG_ENABLE`
  - Server: `POSTHOG_API_KEY`, `POSTHOG_HOST`, `POSTHOG_ENABLE`
- **Packages:** `posthog-js`, `posthog-node`

### 6. Leaflet Maps
- **Status:** ✅ IMPLEMENTED
- **Purpose:** Open-source mapping library for location services
- **Files:**
  - `client/src/components/LeafletMap.tsx`
  - `client/src/components/EnhancedCommunityMap.tsx`
  - `client/src/components/EventMap.tsx`
- **Features:** Location tagging, community discovery, event mapping
- **Note:** NOT using Google Maps API; using Leaflet (open-source, no API key needed)
- **Packages:** `leaflet`, `@types/leaflet`

### 7. React Query (TanStack Query)
- **Status:** ✅ IMPLEMENTED
- **Purpose:** Server state management and caching
- **Files:**
  - `client/src/lib/queryClient.ts`
  - Throughout frontend components
- **Version:** v5 (object-form only)
- **Packages:** `@tanstack/react-query`, `@tanstack/react-query-persist-client`

---

## 🟡 PARTIALLY IMPLEMENTED Integrations

### 8. Sentry (Error Tracking)
- **Status:** 🟡 PARTIALLY IMPLEMENTED (LSP errors fixed Oct 20)
- **Purpose:** Application monitoring and error tracking
- **Files:**
  - `client/src/lib/sentry.ts` - Client-side tracking
  - `server/lib/sentry.ts` - Server-side tracking (updated for Sentry v9)
  - `client/src/services/monitoring/sentry.ts` - Monitoring service
- **Sentry v9 Updates (Oct 20):**
  - Removed deprecated `tracing` option from `httpIntegration()`
  - Removed deprecated `expressRequestHandler()` and `expressTracingHandler()`
  - Updated `monitorRoute()` to use `scope.setTransactionName()`
- **Environment Variables:**
  - Client: `VITE_SENTRY_DSN`, `VITE_APP_VERSION`
  - Server: `SENTRY_DSN`, `APP_VERSION`, `NODE_ENV`
- **Packages:** `@sentry/react` (v9.40.0), `@sentry/node` (v9.40.0), `@sentry/profiling-node`
- **TODO:**
  - [ ] Add environment variables to .env.example
  - [ ] Test error tracking in production
  - [ ] Verify performance monitoring

### 9. OpenReplay (Session Replay)
- **Status:** 🟡 PARTIALLY IMPLEMENTED
- **Purpose:** Session recording and user behavior tracking
- **Files:**
  - `client/src/services/monitoring/openreplay.ts` - Full OpenReplay service (320 lines)
  - `client/src/services/monitoring/index.ts` - Monitoring orchestration
  - `client/src/components/OpenReplayProvider.tsx`
  - `client/src/lib/openreplay-enhanced.ts`
- **Features Implemented:**
  - Privacy controls (mask PII, sanitize network data)
  - Rage click detection
  - Error tracking
  - User identification
  - Page view tracking
- **Environment Variables:** `VITE_OPENREPLAY_PROJECT_KEY`, `VITE_ENABLE_OPENREPLAY`
- **Packages:** `@openreplay/tracker`
- **TODO:**
  - [ ] Add API key to environment
  - [ ] Enable in production
  - [ ] Verify privacy settings

### 10. Plausible Analytics
- **Status:** 🟡 PARTIALLY IMPLEMENTED (LSP error fixed Oct 20)
- **Purpose:** Privacy-first web analytics
- **Files:**
  - `client/src/lib/analytics.ts` - Event tracking (131 lines)
  - `client/src/hooks/useAnalytics.ts`
  - `client/index.html` - Script loading
- **Features:**
  - Custom event tracking
  - Page views
  - Revenue tracking
  - No cookies, GDPR compliant
- **Integration:** Loaded via script tag in HTML, initialized in App.tsx
- **Domain:** `mundo-tango.replit.dev`
- **TODO:**
  - [ ] Verify domain configuration
  - [ ] Test event tracking
  - [ ] Set up dashboard

### 11. Stripe (Payments)
- **Status:** 🟡 PARTIALLY IMPLEMENTED (LSP errors fixed Oct 20)
- **Purpose:** Payment processing and subscriptions
- **Files:**
  - `server/services/paymentService.ts` (380 lines) - Full payment service
  - `server/services/marketplaceService.ts` - Marketplace payments
  - `shared/subscriptionSchema.ts` - Subscription data models
  - `server/scripts/create-payment-tables.sql` - Database schema
- **Stripe v18 Updates (Oct 20):**
  - Fixed `current_period_start` / `current_period_end` type issues
  - Fixed `stripe` null pointer issues (use `getStripe()`)
  - Fixed `payment_intent` typing on Invoice objects
  - Fixed subscription ID type conversion
- **Features:**
  - Customer creation/management
  - Subscription creation/cancellation
  - Webhook handling (subscription/payment events)
  - Payment status tracking
- **Environment Variables:** `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID_BASIC`
- **Packages:** `stripe` (v18.3.0), `@stripe/react-stripe-js`, `@stripe/stripe-js`
- **TODO:**
  - [ ] Add environment variables
  - [ ] Set up webhook endpoint
  - [ ] Test payment flow end-to-end
  - [ ] Configure product/price IDs

### 12. Supabase
- **Status:** 🟡 PARTIALLY IMPLEMENTED
- **Purpose:** Alternative auth and database (potentially redundant)
- **Files:**
  - `server/supabaseClient.ts` - Client initialization
  - References in `server/routes.ts`, `shared/schema.ts`
- **Clients:**
  - Service client (admin operations)
  - Auth client (user authentication)
- **Environment Variables:** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`
- **Packages:** `@supabase/supabase-js`
- **TODO:**
  - [ ] Verify if actually used (may be redundant with Replit OAuth + PostgreSQL)
  - [ ] Remove if unused OR complete integration
  - [ ] Document usage if keeping

### 13. OpenAI GPT-4o
- **Status:** 🟡 PARTIALLY IMPLEMENTED
- **Purpose:** AI content enhancement and contextual responses
- **Files:**
  - `server/services/openaiService.ts` - OpenAI service (66 lines)
  - `server/services/lifeCEOChatService.ts` - Life CEO AI chat
  - `server/services/agentMemoryService.ts` - Agent memory with embeddings
  - `server/services/contentManagementService.ts` - Content moderation
  - `server/services/advancedAIService.ts` - Advanced AI features
- **Features:**
  - Text embeddings (`text-embedding-3-small`)
  - GPT-4o chat completions
  - Streaming responses
  - Fallback responses when API key missing
- **Environment Variables:** `OPENAI_API_KEY`
- **Packages:** `openai` (v5.8.2)
- **TODO:**
  - [ ] Add API key to environment
  - [ ] Complete AI feature integrations
  - [ ] Test streaming chat
  - [ ] Implement content moderation

### 14. Notion (CMS)
- **Status:** 🟡 PARTIALLY IMPLEMENTED
- **Purpose:** Content management system for tango stories/memories
- **Files:**
  - `server/notion.ts` (188 lines) - Full Notion API client
  - Demo data for testing (5 entries)
- **Features:**
  - Entry fetching
  - Type filtering (Memory, Event, Reflection, Note)
  - Rich text extraction
  - Multi-select tags
- **Environment Variables:** `NOTION_API_KEY`, `NOTION_DATABASE_ID`
- **Packages:** `@notionhq/client`
- **TODO:**
  - [ ] Verify if actively used
  - [ ] Complete integration OR remove
  - [ ] Switch from demo data to live Notion database

### 15. n8n (Workflow Automation)
- **Status:** 🟡 PARTIALLY IMPLEMENTED
- **Purpose:** Workflow automation and integrations
- **Files:**
  - `server/integrations/n8n-connector.ts` (203 lines) - Full connector
  - `server/routes/n8nRoutes.ts` - API routes
  - `server/routes/n8nIntegration.ts`
- **Features:**
  - User onboarding workflow triggers
  - HubSpot sync
  - TestSprite result processing
- **Configuration:**
  - API Key: Hardcoded in connector (should be env var)
  - Base URL: `https://mundotango.app.n8n.cloud/api/v1`
- **Environment Variables:** `N8N_API_KEY`, `N8N_BASE_URL`
- **Packages:** `node-fetch`
- **TODO:**
  - [ ] Move API key to environment variable
  - [ ] Set up workflows in n8n cloud
  - [ ] Test workflow triggers
  - [ ] Document workflow setup

---

## 🚧 PLANNED Integrations

### 16. Playwright (E2E Testing)
- **Status:** 🚧 PLANNED
- **Purpose:** End-to-end testing automation
- **Files:** Test infrastructure not yet created
- **Packages:** `@playwright/test` (v1.54.2) - installed but not configured
- **Priority:** HIGH (Stage S4)
- **Timeline:** 4-6 weeks

### 17. Docker (Containerization)
- **Status:** 🚧 PLANNED
- **Purpose:** Application containerization for deployment
- **Files:** Dockerfile not yet created
- **Priority:** MEDIUM (Stage S5)
- **Timeline:** 1 week

### 18. Nginx (Reverse Proxy)
- **Status:** 🚧 PLANNED
- **Purpose:** Reverse proxy for production
- **Priority:** MEDIUM (Stage S5)
- **Timeline:** 3-5 days

### 19. GitHub Actions (CI/CD)
- **Status:** 🚧 PLANNED
- **Purpose:** Continuous integration and deployment
- **Files:** `.github/workflows/` not yet created
- **Priority:** HIGH (Stage S5)
- **Timeline:** 1 week

---

## 🗑️ DEPRECATED/REMOVED Integrations

### 20. Cloudinary
- **Status:** 🗑️ REPLACED (Oct 20, 2025)
- **Replacement:** Replit Object Storage (native integration)
- **Reason:** Better native integration, simpler deployment
- **Packages:** `cloudinary` (still in package.json but not used)
- **Action:** Can be removed from package.json

### 21. Google Maps API
- **Status:** 🗑️ REPLACED
- **Replacement:** Leaflet (open-source)
- **Reason:** No API key needed, fully implemented
- **Packages:** `@googlemaps/js-api-loader`, `@react-google-maps/api` (installed but not actively used)
- **Note:** Some components may still have Google Maps references

### 22. Redis
- **Status:** 🗑️ REMOVED
- **Replacement:** React Query (client-side), in-memory cache (server-side)
- **Reason:** Simplified architecture, no separate cache layer needed
- **References:** Fallback logic exists in code ("Redis disabled, using in-memory cache")

### 23. ws (WebSocket Library)
- **Status:** 🗑️ REMOVED (Oct 20, 2025)
- **Replacement:** Socket.io (active implementation)
- **Reason:** Dead code, Socket.io handles all real-time communication
- **Files Removed:** `server/services/socketService.ts`
- **Cleanup:** Import removed from `server/routes.ts`

---

## Environment Variable Reference

### Required (Production)
```bash
DATABASE_URL=postgresql://...  # Auto-provided by Replit
```

### Optional (Analytics & Monitoring)
```bash
# PostHog (client)
VITE_POSTHOG_API_KEY=phc_...
VITE_POSTHOG_HOST=https://app.posthog.com
VITE_POSTHOG_ENABLE=true

# PostHog (server)
POSTHOG_API_KEY=phc_...
POSTHOG_HOST=https://app.posthog.com
POSTHOG_ENABLE=true

# Sentry (client)
VITE_SENTRY_DSN=https://...@sentry.io/...
VITE_APP_VERSION=1.0.0

# Sentry (server)
SENTRY_DSN=https://...@sentry.io/...
APP_VERSION=1.0.0

# OpenReplay
VITE_OPENREPLAY_PROJECT_KEY=...
VITE_ENABLE_OPENREPLAY=true

# Plausible (configured via HTML script tag)
# Domain: mundo-tango.replit.dev
```

### Optional (Payments & Subscriptions)
```bash
STRIPE_SECRET_KEY=sk_...
STRIPE_PRICE_ID_BASIC=price_...
```

### Optional (AI & Content)
```bash
OPENAI_API_KEY=sk-...
NOTION_API_KEY=secret_...
NOTION_DATABASE_ID=...
```

### Optional (Workflow Automation)
```bash
N8N_API_KEY=eyJhbGci...
N8N_BASE_URL=https://mundotango.app.n8n.cloud/api/v1
```

### Optional (Object Storage)
```bash
PUBLIC_OBJECT_SEARCH_PATHS=/bucket1/public,/bucket2/assets
PRIVATE_OBJECT_DIR=/bucket1/private
```

### Optional (Alternative Services - Verify Need)
```bash
# Supabase (may be redundant)
SUPABASE_URL=https://...supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
SUPABASE_ANON_KEY=eyJhbGci...
```

---

## Package Summary

### Fully Used
- `@google-cloud/storage` - Object Storage ✅
- `@tanstack/react-query` - State management ✅
- `drizzle-orm`, `drizzle-zod` - Database ORM ✅
- `leaflet` - Maps ✅
- `openai` - AI services 🟡
- `posthog-js`, `posthog-node` - Analytics ✅
- `socket.io`, `socket.io-client` - WebSocket ✅
- `stripe` - Payments 🟡
- `@uppy/core`, `@uppy/react`, `@uppy/dashboard`, `@uppy/aws-s3` - File uploads ✅

### Partially Used
- `@notionhq/client` - CMS 🟡
- `@openreplay/tracker` - Session replay 🟡
- `@sentry/react`, `@sentry/node` - Error tracking 🟡
- `@supabase/supabase-js` - May be redundant 🟡

### Installed But Unused (Can Remove)
- `cloudinary` - Replaced by Object Storage
- `@googlemaps/js-api-loader` - Replaced by Leaflet
- `@react-google-maps/api` - Replaced by Leaflet

### Installed For Future Use
- `@playwright/test` - E2E testing (Stage S4)

---

## Integration Health Dashboard (Proposed)

Create `/api/integrations/health` endpoint to check:
- ✅ Database connection
- ✅ Object Storage access
- ✅ Socket.io active connections
- 🟡 Sentry DSN configured
- 🟡 PostHog API key valid
- 🟡 OpenAI API key valid
- 🟡 Stripe API key valid
- 🟡 n8n connection test

---

## Next Steps

### Immediate (This Week)
1. ✅ Fix all LSP errors (DONE Oct 20)
2. ✅ Create comprehensive INTEGRATION_STATUS.md (DONE Oct 20)
3. [ ] Create `.env.example` with all variables
4. [ ] Test Sentry error tracking
5. [ ] Verify PostHog analytics

### Short-Term (Next 2 Weeks)
1. [ ] Complete or remove Supabase integration
2. [ ] Complete OpenAI GPT-4o integration
3. [ ] Set up Stripe payment flow
4. [ ] Test n8n workflows
5. [ ] Create integration health dashboard

### Medium-Term (Stage S1 Completion)
1. [ ] Remove unused packages (Cloudinary, Google Maps)
2. [ ] Implement integration smoke tests
3. [ ] Document all integration setup procedures
4. [ ] Create monitoring alerts for integration failures

---

**Maintained by:** Mundo Tango Engineering Team  
**Review Frequency:** Weekly during Stage S1, monthly thereafter  
**Last Review:** October 20, 2025  
**Next Review:** October 27, 2025
