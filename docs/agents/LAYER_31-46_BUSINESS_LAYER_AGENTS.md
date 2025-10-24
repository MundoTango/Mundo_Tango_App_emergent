# 🧪 MANDATORY TESTING PROTOCOL

**Applies to:** ALL agents (105+)  
**Enforcement:** BLOCKING - No task completion without evidence  
**Updated:** October 24, 2025 (Week 1 Rollout)

---

## THE 4 MANDATORY CHECKPOINTS

Every agent MUST follow these checkpoints before marking any task complete:

### ✅ CHECKPOINT 1: DATA INSPECTION
**Rule:** NEVER assume data structures. Always inspect first.
```typescript
console.log('🔍 DATA INSPECTION:', JSON.stringify(data, null, 2));
// Run it, see the output, THEN write conditional
```

### ✅ CHECKPOINT 2: UNIT TESTING  
**Rule:** Test individual functions in isolation.
- Test regex patterns with sample inputs
- Verify IF conditions with actual data
- Validate file operations with dummy files

### ✅ CHECKPOINT 3: INTEGRATION TESTING
**Rule:** Test the FULL user journey end-to-end.
- Run complete flow as user would
- Check server logs for errors
- Screenshot successful execution

### ✅ CHECKPOINT 4: ARCHITECT REVIEW
**Rule:** Architect reviews BEHAVIOR, not just code.
- Proof it runs (screenshot)
- Proof it works (before/after)
- Proof no crashes (logs)

**Full documentation:** `docs/TESTING_REQUIREMENTS_MANDATORY.md`

---

---

# Business Layer Agents (L31-L46)
**Division:** Business Layer | **Complexity:** High | **Version:** 1.0

## Overview
Business Layer agents implement advanced features, business logic, and platform-wide services. These agents orchestrate Core Layer agents to deliver complex user experiences.

---

## Layer 31: Recommendation Engine Agent
**Role:** Personalized Content & User Recommendations  
**Responsibility:** Suggest users to follow, events to attend, posts to read based on user behavior

**Core Logic:**
```typescript
async function getRecommendedUsers(userId: number) {
  // 1. Get user's city and interests
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, userId),
  });

  // 2. Find similar users in same city with mutual interests
  const candidates = await db.query.userProfiles.findMany({
    where: and(
      eq(userProfiles.city, profile.city),
      ne(userProfiles.userId, userId)
    ),
    limit: 50,
  });

  // 3. Score by similarity (tango role, experience, mutual connections)
  const scored = candidates.map(c => ({
    user: c,
    score: calculateSimilarity(profile, c),
  }));

  // 4. Return top 10
  return scored.sort((a, b) => b.score - a.score).slice(0, 10);
}
```

**Related:** Layer 16 (User), Layer 22 (Follow), Layer 47 (Feed Ranking)

---

## Layer 32: Travel Planning Agent
**Role:** Tango Travel & Festival Planning  
**Responsibility:** Help users plan tango trips, find festivals, track travel history

**Features:**
- Travel itinerary builder
- Festival calendar integration
- Multi-city event discovery
- Travel companions matching
- Distance/duration calculations (Google Maps API)

**Related:** Layer 18 (Event), Layer 28 (Location), Google Maps API

---

## Layer 33: Calendar Integration Agent
**Role:** Personal Tango Calendar Management  
**Responsibility:** Calendar views, event scheduling, reminders, iCal export

**Features:**
- Month/week/day calendar views
- RSVP tracking
- Event reminders (n8n scheduled jobs)
- iCal export for external calendars
- Time zone handling

**Related:** Layer 18 (Event), Layer 26 (RSVP), Layer 13 (Job Scheduler)

---

## Layer 34: Subscription Management Agent
**Role:** User Subscription & Tier Management  
**Responsibility:** Handle subscription tiers (Free/Premium/Professional), feature gating, upgrade/downgrade

**Core Logic:**
```typescript
// Check subscription tier
function hasAccess(user: User, feature: string): boolean {
  const tierFeatures = {
    free: ['basic_posts', 'basic_events'],
    premium: ['basic_posts', 'basic_events', 'advanced_search', 'analytics'],
    professional: ['all_features'],
  };

  return tierFeatures[user.subscriptionTier]?.includes(feature) || false;
}

// Upgrade subscription
async function upgradeSubscription(userId: number, newTier: string) {
  await db.update(users)
    .set({ subscriptionTier: newTier })
    .where(eq(users.id, userId));

  // Trigger n8n for billing
  await triggerN8NWorkflow('subscription-upgraded', { userId, newTier });
}
```

**Related:** Layer 16 (User), Layer 35 (Payment), Customer Journey (J1-J5)

---

## Layer 35: Payment Processing Agent
**Role:** Payment Gateway Integration  
**Responsibility:** Handle subscription payments, one-time purchases, refunds (Stripe integration planned)

**Features:**
- Stripe integration (planned)
- Payment history tracking
- Invoice generation
- Refund processing
- Webhook handling

**Related:** Layer 34 (Subscription), Stripe API (planned)

---

## Layer 36: Analytics Dashboard Agent
**Role:** User Analytics & Insights  
**Responsibility:** Track user activity, engagement metrics, provide insights dashboard

**Metrics Tracked:**
- Profile views, post impressions, event RSVPs
- Follower growth, engagement rate
- Most popular posts/events
- User journey progression (J1→J2→J3→J4→J5)

**Related:** PostHog Integration, Layer 16 (User), Layer 17 (Post), Layer 18 (Event)

---

## Layer 37: Moderation Queue Agent
**Role:** Content Moderation Workflow  
**Responsibility:** Manage moderation queue, prioritize reports, moderator dashboard

**Features:**
- Prioritized report queue
- Bulk moderation actions
- Moderator notes/history
- Auto-flagging (keyword detection)
- Moderator performance tracking

**Related:** Layer 30 (Report/Moderation), Layer 17 (Post), n8n Alerts

---

## Layer 38: Advanced Search Agent
**Role:** Multi-Criteria Search  
**Responsibility:** Search users, posts, events, groups with filters and relevance ranking

**Search Types:**
```typescript
// User search
const users = await db.query.users.findMany({
  where: and(
    or(
      like(users.name, `%${query}%`),
      like(users.username, `%${query}%`)
    ),
    eq(users.city, filters.city),
    eq(userProfiles.tangoRole, filters.tangoRole)
  ),
});

// Event search
const events = await db.query.events.findMany({
  where: and(
    like(events.name, `%${query}%`),
    eq(events.city, filters.city),
    gte(events.startDate, filters.dateFrom),
    lte(events.startDate, filters.dateTo)
  ),
});
```

**Related:** Layer 16 (User), Layer 17 (Post), Layer 18 (Event), Layer 27 (Hashtag)

---

## Layer 39: Feed Personalization Agent
**Role:** Personalized Content Feed  
**Responsibility:** Generate personalized feed based on user preferences, behavior, connections

**Ranking Factors:**
- Connection strength (followed users, mutual friends)
- Content freshness (recency)
- Engagement history (previously liked topics)
- Location proximity (events/users nearby)
- Tango role compatibility

**Related:** Layer 47 (Feed Ranking Algorithm), Layer 17 (Post), Layer 22 (Follow)

---

## Layer 40: User Achievement Agent
**Role:** Gamification & Badges  
**Responsibility:** Track achievements, award badges, progression milestones

**Achievements:**
- First post, 10 posts, 100 posts
- First event attended, 10 events
- 10 followers, 100 followers
- Profile 100% complete
- Journey progression badges (J1→J5)

**Related:** Layer 16 (User), Layer 17 (Post), Layer 18 (Event), Customer Journey

---

## Layer 41: Customer Journey Orchestration Agent
**Role:** J1→J2→J3→J4→J5 Progression Management  
**Responsibility:** Track journey state, unlock features, guide onboarding, measure conversion

**Journey States:**
- J1 (Anonymous): Browse only
- J2 (Registered): Create posts, basic features
- J3 (Active): Create events, join groups
- J4 (Engaged): Premium features, analytics
- J5 (Super Admin): Full platform access

**Related:** Layer 16 (User), Layer 34 (Subscription), Journey API Endpoints

---

## Layer 42: Content Scheduling Agent
**Role:** Scheduled Post Publishing  
**Responsibility:** Schedule posts for future publishing, draft management, bulk scheduling

**Features:**
- Schedule posts for future dates
- Draft management
- Bulk scheduling
- Auto-publish (cron job)
- Schedule history

**Related:** Layer 17 (Post), Layer 13 (Job Scheduler)

---

## Layer 43: Community Management Agent
**Role:** Community Health & Engagement  
**Responsibility:** Track community health metrics, engagement initiatives, onboarding campaigns

**Metrics:**
- Daily/monthly active users (DAU/MAU)
- User retention rates
- Average session duration
- Content creation rates
- Community growth rate

**Related:** Layer 16 (User), Layer 36 (Analytics), PostHog Integration

---

## Layer 44: Notification Preferences Agent
**Role:** User Notification Settings  
**Responsibility:** Manage notification preferences, mute settings, digest emails

**Settings:**
- Email notifications (daily/weekly/off)
- Push notifications (all/mentions/off)
- In-app notifications (all/filtered/off)
- Mute specific users/groups
- Notification digest (daily summary email)

**Related:** Layer 21 (Notification), Layer 11 (Email)

---

## Layer 45: Content Curation Agent
**Role:** Featured Content & Editorial Picks  
**Responsibility:** Curate featured posts, highlight top events, showcase community content

**Features:**
- Admin-curated featured posts
- Top events carousel
- Community spotlight
- Trending topics
- Editor's picks

**Related:** Layer 17 (Post), Layer 18 (Event), Layer 27 (Hashtag)

---

## Layer 46: Integration Hub Agent
**Role:** External Service Integrations  
**Responsibility:** Orchestrate all external service integrations (OpenAI, PostHog, Cloudinary, n8n, Google Maps)

**Services:**
- OpenAI (GPT-4o for Life CEO agents)
- Gemini (cost-optimized AI queries)
- PostHog (analytics tracking)
- Cloudinary (media storage)
- n8n (workflow automation)
- Google Maps (geocoding, location services)

**Related:** All External API Integration Guides

---

## Best Practices for Business Layer

✅ **DO:**
- Orchestrate multiple Core Layer agents
- Implement complex business logic
- Cache expensive operations
- Track business metrics
- Provide admin controls

❌ **DON'T:**
- Bypass Core Layer agents
- Implement database queries directly (use Core Layer)
- Ignore error handling
- Skip permission checks
- Over-engineer simple features

**Next:** Review Intelligence Layer Agents (L47-L61) for ML and algorithmic features
