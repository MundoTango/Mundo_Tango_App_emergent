# Mundo Tango - Service Registry
**Last Updated:** October 20, 2025  
**Purpose:** Backend services catalog to prevent duplicate implementation  
**Status:** All production services catalogued

---

## 🧠 AI & RECOMMENDATION SERVICES

### Memories Feed Algorithm
**Location:** `server/services/memoriesFeedAlgorithm.ts`  
**Status:** ✅ Production Ready (650+ lines, sophisticated AI)  
**Class:** `MemoriesFeedAlgorithm`

**Features:**
- Hybrid feed algorithm (80% friends + 20% discovery)
- 4-factor scoring: temporal, social, emotional, content
- "On This Day" memories (1-5 years ago)
- Friend closeness boosting
- Sentiment analysis
- Diversity filters
- Filter support: all/following/nearby
- Tag filtering
- Privacy controls: public/friends/private
- Location-based (PostGIS)

**Methods:**
```typescript
static async generateMemoriesFeed(
  userId: number,
  limit: number = 20,
  preferences?: { temporal, social, emotional, contentWeight },
  filters?: { filterType, tags, visibility, location }
): Promise<{ memories, algorithm }>

static async getUserMemoryPreferences(userId: number)
```

**Integration Status:** ❌ NOT CONNECTED  
**Missing:** API endpoint `/api/memories/feed`

---

### Recommendation Engine
**Location:** `server/services/recommendationEngineService.ts`  
**Status:** ✅ Production Ready (516 lines, ML-powered)  
**Instance:** `recommendationEngineService`

**Features:**
- Collaborative filtering
- Content-based recommendations
- Context-aware: home_feed, events, users, groups, discover
- User profiling (preferences, behavior, demographics)
- Score-based ranking
- Behavioral tracking
- Auto-refresh (4 hours)
- Cleanup automation (7 days)

**Methods:**
```typescript
async generateRecommendations(
  userId: string,
  context: 'home_feed' | 'events' | 'users' | 'groups' | 'discover',
  limit = 10
): Promise<RecommendationItem[]>

async updateUserProfile(userId: string, updates: Partial<UserProfile>)

async trackUserAction(
  userId: string,
  action: 'view' | 'like' | 'attend' | 'join' | 'follow',
  targetId: string,
  targetType: 'event' | 'user' | 'group' | 'post'
)
```

**Integration Status:** ❌ NOT CONNECTED  
**Missing:** API endpoints `/api/recommendations/*`

---

## 🔍 SEARCH & DISCOVERY

### Mention Cache Service
**Location:** `server/services/mentionCache.ts`  
**Status:** ✅ Production Ready  
**Class:** `MentionCacheService`

**Features:**
- User mention caching
- Fast @username lookups
- Auto-refresh
- Fuzzy matching support

---

## 📊 ANALYTICS & MONITORING

### Activity Logging Service
**Location:** Various  
**Status:** ✅ Production Ready  
**Features:**
- User action tracking
- Event logging
- Performance metrics
- Error tracking

---

## 🔐 AUTHENTICATION & AUTHORIZATION

### Auth Services
**Status:** ✅ Production Ready  
**Features:**
- Replit OAuth
- JWT token management
- Session management
- RBAC (Role-Based Access Control)
- ABAC (Attribute-Based Access Control)
- Password hashing (bcrypt)

---

## 📨 MESSAGING & NOTIFICATIONS

### Socket.io Real-Time Service
**Location:** `server/index.ts`  
**Status:** ✅ Production Ready  
**Features:**
- WebSocket connections
- Room-based broadcasting
- Event-driven architecture
- Connection lifecycle management
- Reconnection handling

**Events:**
- User joins/leaves
- New messages
- Post updates
- Reactions
- Typing indicators

---

## 💳 PAYMENT SERVICES

### Stripe Integration
**Location:** Various `server/services/stripe*.ts`  
**Status:** 🟡 Partial (needs webhook completion)  
**Features:**
- Payment processing
- Subscription management
- Event payments
- Customer management
- Invoice handling

**Integration Status:** 🟡 PARTIAL  
**Missing:** Webhook endpoint completion

---

## 📍 LOCATION SERVICES

### LocationIQ Integration
**Status:** ✅ Production Ready  
**Features:**
- Geocoding
- Reverse geocoding
- Address search
- Map data

---

## 🗄️ DATABASE SERVICES

### Drizzle ORM
**Status:** ✅ Production Ready (88 tables)  
**Features:**
- Type-safe queries
- Schema migrations
- Relation management
- JSON column support
- PostGIS spatial queries

**Tables:**
- Users, Posts, Events, Groups, Friends
- Messages, Notifications, Reactions
- Profiles, Media, Comments
- Bookings, Listings, Payments
- And 70+ more...

---

## 🔄 BACKGROUND JOBS

### Job Queue (if implemented)
**Status:** 🟡 Needs Verification  
**Features:**
- Email sending
- Image processing
- Report generation
- Cleanup tasks

---

## 🚫 DO NOT REBUILD

### Services That Already Exist:
❌ Feed Algorithm - Use `memoriesFeedAlgorithm.ts`  
❌ Recommendation Engine - Use `recommendationEngineService.ts`  
❌ Auth System - Already complete  
❌ Socket.io Real-time - Already integrated  
❌ Drizzle ORM - All 88 tables ready

---

## 🔌 INTEGRATION PRIORITY MATRIX

### P0 (Must Connect This Week):
1. **Memories Feed Algorithm**
   - Create `/api/memories/feed` endpoint
   - Connect to `MemoriesFeedAlgorithm.generateMemoriesFeed()`
   - Add filter UI to MemoriesPage
   - Test hybrid vs chronological

2. **Recommendation Engine**
   - Create `/api/recommendations` endpoint
   - Add recommendation widgets
   - Track user behavior
   - Enable auto-refresh

### P1 (Should Connect Next Week):
3. **Privacy Controls UI**
   - Add visibility selector to post creator
   - Add privacy indicators to cards
   - Test visibility filtering

4. **Stripe Webhooks**
   - Complete webhook handlers
   - Test payment flow
   - Enable event payments

### P2 (Can Connect Later):
5. **Enhanced Analytics**
6. **Advanced Search**
7. **Notification System Enhancement**

---

## 📋 API ENDPOINT GAPS

### Existing Endpoints (21 total):
✅ Event API (7 endpoints)  
✅ Profile API (6 endpoints)  
✅ Groups API (8 endpoints)

### Missing Endpoints (High Priority):
❌ `/api/memories/feed` - Connect to feed algorithm  
❌ `/api/recommendations` - Connect to recommendation engine  
❌ `/api/preferences/privacy` - Privacy settings  
❌ `/api/analytics/track` - User action tracking

---

## 🔧 SERVICE ACTIVATION CHECKLIST

### For Each Service:
- [ ] Verify service code works (unit tests)
- [ ] Create API endpoint(s)
- [ ] Add Zod validation schemas
- [ ] Connect to frontend hooks
- [ ] Add error handling
- [ ] Document in API docs
- [ ] Add to monitoring

---

## 📚 RELATED DOCUMENTATION
- `docs/COMPONENT_REGISTRY.md` - Frontend components
- `docs/MT_COMPLETION_REALITY_CHECK.md` - Integration gaps
- `docs/API_DOCUMENTATION.md` - API endpoint docs
- `docs/MT_MASTER_PLAN_100PCT.md` - Overall roadmap
