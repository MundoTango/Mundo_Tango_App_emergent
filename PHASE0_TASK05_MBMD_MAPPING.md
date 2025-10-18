# Phase 0 Task 0.5: Journey Orchestration - MB.MD MAPPING

**Date:** October 18, 2025 4:50 AM  
**Methodology:** MB.MD (Mapping → Breakdown → Mitigation → Deployment)  
**Phase:** MAPPING COMPLETE

---

## 📋 **MAPPING: What Exists vs What's Needed**

### ✅ **What We Have:**

**1. User State Tracking (partial):**
- `users.isOnboardingComplete` - Boolean (completed or not)
- `users.subscriptionTier` - 'free', 'basic', 'enthusiast', 'professional', 'enterprise'
- `users.formStatus` - Integer status code
- `users.codeOfConductAccepted` - Boolean

**2. Analytics Infrastructure:**
- ✅ PostHog service (`client/src/services/monitoring/posthog.ts`)
- ✅ Event tracking system (`trackEvent()`)
- ✅ Funnel tracking (`guest_to_host` example exists)
- ✅ Feature flags system
- ✅ Session recording capabilities
- ✅ Plausible Analytics integration

**3. Journey-related Tables (NOT what we need):**
- ❌ `userJourneys` - For **travel planning journeys** (tango trips), not customer journey state
- ❌ `journeyActivities` - For **travel activities**, not customer lifecycle

**4. Agent Infrastructure:**
- ✅ agent-coordinator.ts ready to load journey agents
- ✅ Category #6 slot reserved for Journey Agents (J1-J8)
- ⚠️  Expected import path: `./journey-agents/index` (doesn't exist yet)

---

## ❌ **What We DON'T Have:**

**1. Customer Journey State Tracking:**
- ❌ No `customer_journey_state` field in users table
- ❌ No journey transition tracking
- ❌ No journey milestone completion tracking

**2. Journey Detection Logic:**
- ❌ No algorithm to detect which journey (J1-J4) user is on
- ❌ No transition triggers (new user → active user → power user → admin)

**3. Journey Agents:**
- ❌ No `server/agents/journey-agents/` directory
- ❌ No J1-J4 agent files
- ❌ No journey orchestration service

**4. Journey Analytics:**
- ❌ No journey-specific event tracking
- ❌ No journey funnel definitions (only `guest_to_host` example exists)
- ❌ No journey milestone events

---

## 🎯 **Journey Specifications (from COMPLETE_AGENT_INVENTORY.md)**

### **J1: New User Journey**
**Purpose:** Onboarding, first-time experience  
**Triggers:**
- User just registered (`isOnboardingComplete === false`)
- No memories/posts created yet
- No events attended
- Free tier subscription

**Key Milestones:**
1. Registration complete
2. Profile setup (bio, tango roles, experience)
3. First connection made
4. First event browsed
5. First memory/post created
6. Code of conduct accepted

**Transition to J2:** When user has:
- Completed onboarding (`isOnboardingComplete === true`)
- Created at least 1 post/memory
- Has at least 1 connection
- Active for 7+ days

---

### **J2: Active User Journey**
**Purpose:** Regular engagement, content consumption  
**Triggers:**
- Completed J1 onboarding
- Active user (logs in regularly)
- Consumes content (views memories, events)
- Basic social interactions

**Key Milestones:**
1. Regular login pattern (3+ times/week)
2. Engaged with 10+ memories
3. Attended first event
4. Created 5+ memories
5. Has 5+ connections
6. Joined a community/group

**Transition to J3:** When user shows power user behavior:
- Created 20+ memories
- 20+ connections
- Organized or led an event
- Subscription upgrade considered/completed
- Advanced feature usage (hashtags, location tags, AI features)

---

### **J3: Power User Journey**
**Purpose:** Advanced features, content creation  
**Triggers:**
- High engagement metrics
- Content creator behavior
- Community leadership potential
- Advanced feature usage

**Key Milestones:**
1. Created 50+ memories
2. Organized 3+ events
3. 50+ connections
4. Subscription tier: basic+
5. Used AI enhancement features
6. Contributed to community moderation

**Transition to J4:** When user is promoted to admin:
- `isSuperAdmin === true`
- Or platform management responsibilities assigned

---

### **J4: Super Admin Journey**
**Purpose:** Platform management, analytics  
**Triggers:**
- Super admin status (`isSuperAdmin === true`)
- Platform management access

**Key Features:**
- ESA Mind Map access
- Visual Editor access
- Analytics dashboard access
- Agent monitoring
- User management capabilities

---

## 🔍 **Journey Detection Algorithm (BREAKDOWN)**

```typescript
function detectUserJourney(user: User, userMetrics: UserMetrics): 'J1' | 'J2' | 'J3' | 'J4' {
  // J4: Super Admin (highest priority)
  if (isSuperAdmin(user)) {
    return 'J4';
  }
  
  // J3: Power User
  if (
    userMetrics.memoriesCount >= 50 &&
    userMetrics.connectionsCount >= 50 &&
    userMetrics.eventsOrganized >= 3 &&
    (user.subscriptionTier === 'basic' || 
     user.subscriptionTier === 'enthusiast' || 
     user.subscriptionTier === 'professional')
  ) {
    return 'J3';
  }
  
  // J2: Active User
  if (
    user.isOnboardingComplete &&
    userMetrics.memoriesCount >= 1 &&
    userMetrics.connectionsCount >= 1 &&
    userMetrics.daysSinceRegistration >= 7
  ) {
    return 'J2';
  }
  
  // J1: New User (default)
  return 'J1';
}
```

---

## 📊 **Data Model Design (BREAKDOWN)**

### **Option A: Add field to users table (SIMPLE - RECOMMENDED)**

```typescript
// Add to users table in shared/schema.ts
customerJourneyState: varchar("customer_journey_state", { length: 10 })
  .default('J1')
  .notNull(), // 'J1', 'J2', 'J3', 'J4'

lastJourneyUpdate: timestamp("last_journey_update").defaultNow(),
```

**Pros:**
- Simple, direct lookup
- No additional table needed
- Easy to query

**Cons:**
- No journey history tracking
- Can't see transitions over time

---

### **Option B: New journey_state table (COMPLEX)**

```typescript
export const customerJourneyStates = pgTable("customer_journey_states", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  journeyState: varchar("journey_state", { length: 10 }).notNull(), // 'J1'-'J4'
  transitionedAt: timestamp("transitioned_at").defaultNow(),
  previousState: varchar("previous_state", { length: 10 }),
  metrics: jsonb("metrics"), // Snapshot of metrics at transition
});
```

**Pros:**
- Full history tracking
- Can analyze journey transitions
- Metrics snapshots

**Cons:**
- More complex queries
- Additional table maintenance

---

## ✅ **RECOMMENDATION: Option A (Simple Field)**

**Rationale:**
- Phase 0 goal is to get agents **operational**
- Can add history tracking later (Phase 3-17)
- Simpler implementation = faster completion
- Journey state detection can still run on every request

---

## 🛡️ **MITIGATION STRATEGIES**

**1. Performance:**
- ❓ **Risk:** Journey detection on every request could be slow
- ✅ **Solution:** Cache journey state, recalculate only on key events

**2. State Drift:**
- ❓ **Risk:** User metrics change but journey state doesn't update
- ✅ **Solution:** Scheduled job + event-triggered recalculation

**3. Analytics Overhead:**
- ❓ **Risk:** Too many journey events could overwhelm PostHog
- ✅ **Solution:** Track only milestone events, not every detection

**4. Agent Load Failure:**
- ❓ **Risk:** Journey agents might not load (like Life CEO agents)
- ✅ **Solution:** Error boundaries, graceful fallback, console warnings

---

## 🚀 **DEPLOYMENT PLAN (Next Steps)**

### **Step 1: Add journey state field to users table**
- Edit `shared/schema.ts`
- Run `npm run db:push --force`
- Verify field added

### **Step 2: Create journey detection service**
- `server/services/journeyOrchestrationService.ts`
- Implement `detectUserJourney()`
- Implement `updateJourneyState()`

### **Step 3: Create journey agent files**
- `server/agents/journey-agents/j1-new-user-agent.ts`
- `server/agents/journey-agents/j2-active-user-agent.ts`
- `server/agents/journey-agents/j3-power-user-agent.ts`
- `server/agents/journey-agents/j4-super-admin-agent.ts`
- `server/agents/journey-agents/index.ts` (export all)

### **Step 4: Wire journey detection into app**
- Add journey detection to auth middleware
- Expose journey state via API (`/api/user/journey`)
- Frontend hook: `useUserJourney()`

### **Step 5: Add journey analytics**
- Journey transition events to PostHog
- Journey milestone events
- Funnel tracking for J1→J2→J3→J4

### **Step 6: Verification**
- Test journey detection with different user states
- Verify agent loading
- Check analytics events firing

---

## ✅ **MAPPING COMPLETE**

**Time Spent:** 30 minutes  
**Next Phase:** BREAKDOWN (detailed design)  
**Estimated Remaining:** 5.5 hours

---

**Last Updated:** October 18, 2025 4:50 AM  
**Methodology:** MB.MD
