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

# Layer 01: Database Connection Agent
**Division:** Foundation Layer  
**Category:** Data Infrastructure  
**Complexity:** High  
**Dependencies:** PostgreSQL, Drizzle ORM  
**Version:** 1.0 | **Last Updated:** October 19, 2025

## Agent Identity

**Role:** Database Connection Management & Query Orchestration  
**Responsibility:** Ensure reliable PostgreSQL connections, manage connection pooling, execute queries via Drizzle ORM, handle transaction management

**Key Files:**
- `server/db.ts` - Database connection and Drizzle instance
- `shared/schema.ts` - Complete database schema (88 tables)
- `drizzle.config.ts` - Drizzle configuration

---

## Architecture

### **Connection Pool**

```typescript
// server/db.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@shared/schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const db = drizzle(pool, { schema });
```

**Connection Limits:**
- Development: 20 max connections
- Production: Increase to 50+ for high traffic
- Each query borrows a connection from pool

---

## Core Responsibilities

### **1. Query Execution**

```typescript
// SELECT queries
const users = await db.query.users.findMany();
const user = await db.query.users.findFirst({
  where: eq(schema.users.id, userId),
});

// INSERT queries
const [newPost] = await db.insert(schema.posts).values({
  title: 'New Post',
  userId: 1,
}).returning();

// UPDATE queries
await db.update(schema.users)
  .set({ name: 'Updated Name' })
  .where(eq(schema.users.id, userId));

// DELETE queries
await db.delete(schema.posts)
  .where(eq(schema.posts.id, postId));
```

---

### **2. Transaction Management**

```typescript
// Atomic transactions
await db.transaction(async (tx) => {
  // Create post
  const [post] = await tx.insert(schema.posts).values({
    title: 'New Post',
    userId: 1,
  }).returning();

  // Update user stats
  await tx.update(schema.userProfiles)
    .set({ postCount: sql`${schema.userProfiles.postCount} + 1` })
    .where(eq(schema.userProfiles.userId, 1));

  // If any query fails, entire transaction rolls back
});
```

---

### **3. Relational Queries**

```typescript
// Posts with user data
const postsWithUsers = await db.query.posts.findMany({
  with: {
    user: true,
    comments: {
      with: {
        user: true,
      },
    },
  },
});

// Events with attendees
const eventWithAttendees = await db.query.events.findFirst({
  where: eq(schema.events.id, eventId),
  with: {
    attendees: {
      with: {
        user: true,
      },
    },
  },
});
```

---

### **4. Performance Optimization**

```typescript
// Use indexes for fast queries
const recentPosts = await db.query.posts.findMany({
  where: eq(schema.posts.isActive, true),
  orderBy: [desc(schema.posts.createdAt)],
  limit: 20,
});
// ↑ Uses idx_posts_created_at index

// Batch operations
const newPosts = await db.insert(schema.posts).values([
  { title: 'Post 1', userId: 1 },
  { title: 'Post 2', userId: 1 },
  { title: 'Post 3', userId: 1 },
]).returning();
```

---

## Agent Workflows

### **Workflow 1: User Registration**

```typescript
async function registerUser(data: InsertUser) {
  return await db.transaction(async (tx) => {
    // 1. Create user
    const [user] = await tx.insert(schema.users).values(data).returning();

    // 2. Create profile
    await tx.insert(schema.userProfiles).values({
      userId: user.id,
      bio: '',
      avatar: null,
    });

    // 3. Assign default role
    await tx.insert(schema.userRoles).values({
      userId: user.id,
      roleName: 'user',
    });

    // 4. Create welcome notification
    await tx.insert(schema.notifications).values({
      userId: user.id,
      type: 'welcome',
      content: 'Welcome to Mundo Tango!',
    });

    return user;
  });
}
```

---

### **Workflow 2: Post with Engagement**

```typescript
async function createPostWithEngagement(userId: number, postData: any) {
  return await db.transaction(async (tx) => {
    // 1. Create post
    const [post] = await tx.insert(schema.posts).values({
      ...postData,
      userId,
    }).returning();

    // 2. Update user post count
    await tx.update(schema.userProfiles)
      .set({ postCount: sql`${schema.userProfiles.postCount} + 1` })
      .where(eq(schema.userProfiles.userId, userId));

    // 3. Extract and create hashtags
    const hashtags = extractHashtags(postData.content);
    for (const tag of hashtags) {
      await tx.insert(schema.hashtags).values({
        name: tag,
        postId: post.id,
      }).onConflictDoNothing();
    }

    return post;
  });
}
```

---

## Error Handling

### **Connection Failures**

```typescript
async function safeQuery<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('Database connection refused');
      throw new Error('Database unavailable');
    } else if (error.code === '57P01') {
      console.error('Database admin shutdown');
      throw new Error('Database maintenance in progress');
    }
    throw error;
  }
}

// Usage
const user = await safeQuery(() =>
  db.query.users.findFirst({ where: eq(schema.users.id, userId) })
);
```

---

### **Transaction Rollback**

```typescript
try {
  await db.transaction(async (tx) => {
    const [post] = await tx.insert(schema.posts).values(data).returning();
    
    // This throws an error
    throw new Error('Intentional failure');
    
    // This never executes
    await tx.insert(schema.notifications).values({
      userId: post.userId,
      type: 'post_created',
    });
  });
} catch (error) {
  // Post was NOT created (rolled back)
  console.log('Transaction rolled back:', error.message);
}
```

---

## Performance Guidelines

### **✅ DO:**
- Use indexes for WHERE/ORDER BY clauses
- Batch insert/update operations when possible
- Use transactions for multi-step operations
- Limit query results (pagination)
- Select only needed columns

### **❌ DON'T:**
- Query inside loops (N+1 problem)
- Use `SELECT *` if you don't need all columns
- Execute transactions without error handling
- Forget to add indexes on foreign keys
- Keep transactions open longer than necessary

---

## Testing

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Database Connection Agent', () => {
  let testUser: User;

  beforeEach(async () => {
    // Create test user
    [testUser] = await db.insert(schema.users).values({
      email: 'test@example.com',
      name: 'Test User',
    }).returning();
  });

  afterEach(async () => {
    // Cleanup
    await db.delete(schema.users).where(eq(schema.users.id, testUser.id));
  });

  it('creates user with transaction', async () => {
    const user = await registerUser({
      email: 'new@example.com',
      name: 'New User',
    });

    expect(user.id).toBeDefined();

    const profile = await db.query.userProfiles.findFirst({
      where: eq(schema.userProfiles.userId, user.id),
    });

    expect(profile).toBeDefined();
  });
});
```

---

## Related Agents

- **Layer 02: Cache Management** - Reduce database load
- **Layer 15: Security/CORS** - Prevent SQL injection
- **Layer 47: Feed Ranking** - Optimized feed queries

**Next:** Read `docs/MT_DRIZZLE_ORM_GUIDE.md` for detailed ORM patterns
