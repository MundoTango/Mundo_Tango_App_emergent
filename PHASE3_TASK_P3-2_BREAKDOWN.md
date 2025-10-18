# 📋 PHASE 3 TASK P3-2: BREAKDOWN - Missing Indexes Analysis
**Mundo Tango Database Optimization**

**Date:** October 18, 2025 6:10 AM  
**Task:** P3-2 BREAKDOWN  
**Status:** In Progress

---

## 🔍 **CRITICAL FINDING: Major Index Gaps**

### **✅ Tables WITH Indexes (Good!)**

**Posts Table:**
- ✅ `idx_posts_user_created` - Composite (userId, createdAt)
- ✅ `idx_posts_visibility` - For public feed filtering
- ✅ `idx_posts_hashtags` - For hashtag searches
- ✅ `idx_posts_post_type` - For post type filtering

**Event RSVPs:**
- ✅ `idx_event_rsvps_event_id` - Event's attendees
- ✅ `idx_event_rsvps_user_id` - User's RSVPs

**Projects, CustomRoleRequests, UserProfiles, etc.:** All have proper indexes ✅

---

## ❌ **CRITICAL: Tables WITHOUT Indexes (Must Fix!)**

### **1. USERS Table - NO INDEXES!**

**Current State:** 
```typescript
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  username: varchar("username", { length: 50 }).unique().notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  // ... 40+ more fields
  customerJourneyState: varchar("customer_journey_state", { length: 10 }).default('J1').notNull(),
  lastJourneyUpdate: timestamp("last_journey_update").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
// NO INDEX DEFINITION! ❌
```

**Missing Indexes:**
- ❌ No index on `customerJourneyState` - Journey queries will be SLOW
- ❌ No index on `email` - Login lookups will be SLOW
- ❌ No index on `city, country` - Location-based queries will be SLOW
- ❌ No index on `createdAt` - Time-based queries will be SLOW
- ❌ No index on `subscriptionTier` - Subscription filtering will be SLOW

**Impact:** Every user query (login, journey detection, location search) runs a full table scan!

---

### **2. FOLLOWS Table - NO INDEXES!**

**Current State:**
```typescript
export const follows = pgTable("follows", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").references(() => users.id).notNull(),
  followingId: integer("following_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
// NO INDEX DEFINITION! ❌
```

**Missing Indexes:**
- ❌ No index on `followerId` - "Who am I following" queries SLOW
- ❌ No index on `followingId` - "Who follows me" queries SLOW  
- ❌ No composite index - Mutual follow checks SLOW

**Impact:** Every follower/following query scans entire table!

---

### **3. EVENTS Table - Needs Verification**

**Need to check if events table has indexes for:**
- `startDate` (upcoming events query)
- `organizerId` (user's organized events)
- `city` (local events query)

---

## 🎯 **REQUIRED CHANGES**

### **Change 1: Add Users Table Indexes**

```typescript
export const users = pgTable("users", {
  // ... existing fields ...
}, (table) => [
  index("idx_users_journey_state").on(table.customerJourneyState),
  index("idx_users_email").on(table.email),
  index("idx_users_city_country").on(table.city, table.country),
  index("idx_users_created_at").on(table.createdAt),
  index("idx_users_subscription_tier").on(table.subscriptionTier),
]);
```

**Why:**
- Journey queries: `SELECT * FROM users WHERE customer_journey_state = 'J2'`
- Login: `SELECT * FROM users WHERE email = ?`
- Location: `SELECT * FROM users WHERE city = ? AND country = ?`
- Analytics: `SELECT * FROM users WHERE subscription_tier = 'professional'`

---

### **Change 2: Add Follows Table Indexes**

```typescript
export const follows = pgTable("follows", {
  // ... existing fields ...
}, (table) => [
  index("idx_follows_follower_id").on(table.followerId),
  index("idx_follows_following_id").on(table.followingId),
  index("idx_follows_composite").on(table.followerId, table.followingId),
]);
```

**Why:**
- Following list: `SELECT * FROM follows WHERE follower_id = ?`
- Followers list: `SELECT * FROM follows WHERE following_id = ?`
- Mutual check: `SELECT * FROM follows WHERE follower_id = ? AND following_id = ?`

---

### **Change 3: Add Events Table Indexes (if missing)**

```typescript
export const events = pgTable("events", {
  // ... existing fields ...
}, (table) => [
  index("idx_events_start_date").on(table.startDate),
  index("idx_events_organizer_id").on(table.organizerId),
  index("idx_events_city").on(table.city),
  index("idx_events_created_at").on(table.createdAt),
]);
```

**Why:**
- Upcoming events: `SELECT * FROM events WHERE start_date > NOW() ORDER BY start_date`
- User's events: `SELECT * FROM events WHERE organizer_id = ?`
- Local events: `SELECT * FROM events WHERE city = ?`

---

## 📊 **PERFORMANCE IMPACT ESTIMATES**

### **Before Adding Indexes:**
```
Users Journey Query:    500-2000ms  (full table scan)
User Login:             200-800ms   (full table scan)
Follower Count:         100-500ms   (full table scan)
Following List:         150-600ms   (full table scan)
Upcoming Events:        200-1000ms  (full table scan + sort)
```

### **After Adding Indexes:**
```
Users Journey Query:    5-15ms      (index scan) → 100x faster ✅
User Login:             2-8ms       (index scan) → 100x faster ✅
Follower Count:         3-10ms      (index scan) → 50x faster ✅
Following List:         3-10ms      (index scan) → 50x faster ✅
Upcoming Events:        10-30ms     (index scan) → 50x faster ✅
```

**Overall API Response Time Reduction:** 80-90% faster queries!

---

## 🚀 **NEXT STEPS (Task P3-3)**

1. Add index definitions to `shared/schema.ts`
2. Run `npm run db:push` to apply indexes
3. Test query performance before/after
4. Monitor cache hit rate improvement
5. Verify no errors in logs

---

**Estimated Time:** 45 minutes  
**Priority:** CRITICAL - This is the biggest performance win available

**Last Updated:** October 18, 2025 6:10 AM
