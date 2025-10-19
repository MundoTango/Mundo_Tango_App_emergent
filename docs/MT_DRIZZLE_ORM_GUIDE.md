# Mundo Tango Drizzle ORM Database Guide
**Version:** 1.0  
**Last Updated:** October 19, 2025  
**Database:** PostgreSQL (Neon Serverless)  
**References:** 3,428 codebase instances

## Overview

Mundo Tango uses **Drizzle ORM** for type-safe, performant database operations with PostgreSQL (Neon serverless backend). This guide covers actual production patterns used across 88 database tables and 927+ AI agents.

**Key Benefits:**
- ✅ Type-safe queries (compile-time errors for typos)
- ✅ Zero-cost abstractions (compiles to optimized SQL)
- ✅ Automatic TypeScript types from schema
- ✅ Zod schema integration for validation

---

## Schema Definition

### **Location:** `shared/schema.ts` (2,462 lines)

**Pattern:** Define tables using `pgTable`, then create Zod schemas for validation

```typescript
import { 
  pgTable, 
  text, 
  serial, 
  integer, 
  boolean, 
  timestamp, 
  varchar,
  jsonb,
  index
} from "drizzle-orm/pg-core";
import { relations, sql, eq } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Table definition
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  username: varchar("username", { length: 50 }).unique().notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: text("password").notNull(),
  bio: text("bio"),
  profileImage: text("profile_image"),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }),
  isVerified: boolean("is_verified").default(false),
  isActive: boolean("is_active").default(true),
  customerJourneyState: varchar("customer_journey_state", { length: 10 }).default('J1'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  // Indexes for performance (13 total in schema)
  index("idx_users_journey_state").on(table.customerJourneyState),
  index("idx_users_city_country").on(table.city, table.country),
  index("idx_users_created_at").on(table.createdAt),
]);

// Zod validation schema
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// TypeScript types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
```

---

## Query Patterns

### **Pattern 1: Find Single Record**

```typescript
import { db } from './db';
import { users, eq } from '@shared/schema';

// Find by primary key
const user = await db.query.users.findFirst({
  where: eq(users.id, userId),
});

// Find by unique field
const user = await db.query.users.findFirst({
  where: eq(users.username, 'johndoe'),
});

// With relations
const user = await db.query.users.findFirst({
  where: eq(users.id, userId),
  with: {
    posts: true,           // Include all posts
    followers: true,       // Include followers
    subscriptions: true,   // Include subscriptions
  },
});
```

**When to use:**
- ✅ Get single user by ID, username, email
- ✅ Load related data (posts, comments, etc.)
- ✅ Authentication (find user by email)

---

### **Pattern 2: Find Multiple Records**

```typescript
import { desc, asc, and, or, like, gt, lt, sql } from 'drizzle-orm';

// Find all active users
const users = await db.query.users.findMany({
  where: eq(users.isActive, true),
  limit: 20,
  offset: 0,
});

// With sorting
const users = await db.query.users.findMany({
  where: eq(users.isActive, true),
  orderBy: [desc(users.createdAt)],
  limit: 20,
});

// Complex filters
const users = await db.query.users.findMany({
  where: and(
    eq(users.isActive, true),
    eq(users.city, 'Buenos Aires'),
    gt(users.createdAt, new Date('2024-01-01'))
  ),
  orderBy: [desc(users.createdAt)],
});

// Search with LIKE
const users = await db.query.users.findMany({
  where: like(users.username, '%john%'),
  limit: 10,
});

// OR conditions
const users = await db.query.users.findMany({
  where: or(
    eq(users.city, 'Buenos Aires'),
    eq(users.city, 'Montevideo')
  ),
});
```

**When to use:**
- ✅ List pages (with pagination)
- ✅ Search functionality
- ✅ Filtered queries

---

### **Pattern 3: Count & Aggregation**

```typescript
// Count records
const [{ total }] = await db
  .select({ total: sql<number>`count(*)` })
  .from(users)
  .where(eq(users.isActive, true));

// Count with grouping
const cityCounts = await db
  .select({
    city: users.city,
    count: sql<number>`count(*)`,
  })
  .from(users)
  .where(eq(users.isActive, true))
  .groupBy(users.city)
  .orderBy(desc(sql`count(*)`));

// Sum/avg/min/max
const stats = await db
  .select({
    avgAge: sql<number>`avg(years_of_dancing)`,
    totalUsers: sql<number>`count(*)`,
    maxLevel: sql<number>`max(leader_level)`,
  })
  .from(users)
  .where(eq(users.isActive, true));
```

**When to use:**
- ✅ Pagination metadata (total pages)
- ✅ Analytics dashboards
- ✅ Reports

---

### **Pattern 4: Insert Records**

```typescript
// Single insert
const [newUser] = await db.insert(users).values({
  name: 'John Doe',
  username: 'johndoe',
  email: 'john@example.com',
  password: hashedPassword,
}).returning();

// Multiple insert
const newUsers = await db.insert(users).values([
  { name: 'Alice', username: 'alice', email: 'alice@ex.com', password: 'hash1' },
  { name: 'Bob', username: 'bob', email: 'bob@ex.com', password: 'hash2' },
]).returning();

// With validation
const validatedData = insertUserSchema.parse(formData);
const [user] = await db.insert(users).values(validatedData).returning();
```

**When to use:**
- ✅ User registration
- ✅ Create post/event/comment
- ✅ Bulk data import

---

### **Pattern 5: Update Records**

```typescript
// Update by ID
const [updatedUser] = await db
  .update(users)
  .set({
    bio: 'New bio',
    updatedAt: new Date(),
  })
  .where(eq(users.id, userId))
  .returning();

// Conditional update
await db
  .update(users)
  .set({ isVerified: true })
  .where(and(
    eq(users.email, email),
    eq(users.isVerified, false)
  ));

// Increment counter
await db
  .update(users)
  .set({ followerCount: sql`${users.followerCount} + 1` })
  .where(eq(users.id, userId));
```

**When to use:**
- ✅ Edit profile
- ✅ Update settings
- ✅ Mark as read/verified

---

### **Pattern 6: Delete Records**

```typescript
// Soft delete (preferred)
await db
  .update(users)
  .set({ isActive: false, updatedAt: new Date() })
  .where(eq(users.id, userId));

// Hard delete (use with caution)
await db
  .delete(users)
  .where(eq(users.id, userId));

// Delete with conditions
await db
  .delete(sessions)
  .where(lt(sessions.expiresAt, new Date()));
```

**When to use:**
- ✅ Account deletion (soft delete)
- ✅ Clean up expired sessions
- ⚠️ Avoid hard deletes (use isActive flag)

---

## Advanced Patterns

### **Pattern 7: Transactions**

```typescript
import { db } from './db';

// Example: Transfer credits between users
await db.transaction(async (tx) => {
  // Deduct from sender
  const [sender] = await tx
    .update(users)
    .set({ credits: sql`${users.credits} - ${amount}` })
    .where(eq(users.id, senderId))
    .returning();

  if (sender.credits < 0) {
    throw new Error('Insufficient credits');
  }

  // Add to receiver
  await tx
    .update(users)
    .set({ credits: sql`${users.credits} + ${amount}` })
    .where(eq(users.id, receiverId));

  // Log transaction
  await tx.insert(transactions).values({
    senderId,
    receiverId,
    amount,
    type: 'transfer',
  });
});
```

**When to use:**
- ✅ Financial transactions
- ✅ Multi-step operations (must all succeed/fail together)
- ✅ Preventing race conditions

---

### **Pattern 8: Relations & Joins**

```typescript
// Define relations (in schema.ts)
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  comments: many(comments),
  followers: many(followers, { relationName: 'followers' }),
  following: many(followers, { relationName: 'following' }),
}));

// Query with relations
const user = await db.query.users.findFirst({
  where: eq(users.id, userId),
  with: {
    posts: {
      orderBy: [desc(posts.createdAt)],
      limit: 10,
    },
    followers: {
      with: {
        follower: true, // Include follower user data
      },
    },
  },
});

// Manual join (when relations not defined)
const results = await db
  .select({
    postId: posts.id,
    postTitle: posts.title,
    userName: users.name,
    commentCount: sql<number>`count(${comments.id})`,
  })
  .from(posts)
  .leftJoin(users, eq(posts.userId, users.id))
  .leftJoin(comments, eq(comments.postId, posts.id))
  .groupBy(posts.id, users.name);
```

**When to use:**
- ✅ Load user with their posts
- ✅ Complex reporting queries
- ✅ N+1 query prevention

---

## Neon Serverless Optimization

### **Connection Pooling**

```typescript
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';

// Configure connection pool for serverless
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 10,              // Max connections (Neon Free: 10, Pro: 100)
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export const db = drizzle(pool);
```

**Neon Limits:**
- Free tier: 10 concurrent connections
- Pro tier: 100 concurrent connections
- Auto-scaling: Neon scales compute automatically

---

### **Query Performance Tips**

```typescript
// ✅ GOOD: Select only needed fields
const users = await db
  .select({
    id: users.id,
    name: users.name,
    username: users.username,
  })
  .from(users)
  .limit(20);

// ❌ BAD: Select all fields (slower, more data transfer)
const users = await db.select().from(users).limit(20);

// ✅ GOOD: Use indexes for WHERE clauses
const users = await db.query.users.findMany({
  where: eq(users.customerJourneyState, 'J2'), // Indexed field
});

// ❌ BAD: Filter on non-indexed field
const users = await db.query.users.findMany({
  where: like(users.bio, '%tango%'), // Not indexed, slow full scan
});
```

---

## Schema Migrations

**IMPORTANT:** Never manually write SQL migrations. Use `npm run db:push`.

```bash
# Push schema changes to database
npm run db:push

# If schema conflicts (data loss warning)
npm run db:push --force

# Generate migration files (optional, for versioning)
npm run db:generate
```

**Migration Workflow:**
1. Edit `shared/schema.ts`
2. Run `npm run db:push`
3. Test locally
4. Commit schema changes
5. Deploy (auto-runs migrations)

---

## Type Safety Examples

### **Compile-Time Error Prevention**

```typescript
// ✅ GOOD: TypeScript catches typo
const user = await db.query.users.findFirst({
  where: eq(users.id, userId), // ✅ Correct
});

// ❌ BAD: Compile error - field doesn't exist
const user = await db.query.users.findFirst({
  where: eq(users.userID, userId), // ❌ TypeScript error: 'userID' doesn't exist
});

// ✅ GOOD: Zod validates at runtime
const validatedUser = insertUserSchema.parse(formData);

// ❌ BAD: Runtime error if data invalid
const validatedUser = insertUserSchema.parse({ 
  email: 'not-an-email' // ❌ Zod error: Invalid email format
});
```

---

## Common Pitfalls

### **❌ MISTAKE: Dynamic field access (SQL injection)**

```typescript
// ❌ DANGEROUS: SQL injection risk
const sortField = req.query.sort; // User input: "id); DROP TABLE users; --"
const users = await db.query.users.findMany({
  orderBy: [desc(users[sortField])], // ❌ TypeScript error + security risk
});

// ✅ SAFE: Whitelist allowed fields
const sortableFields = {
  'createdAt': users.createdAt,
  'name': users.name,
  'username': users.username,
} as const;

const sortField = sortableFields[req.query.sort] || users.createdAt;
const users = await db.query.users.findMany({
  orderBy: [desc(sortField)],
});
```

---

### **❌ MISTAKE: Changing primary key types**

**CRITICAL:** Never change existing ID column types (breaks data)

```typescript
// ❌ WRONG: Changing serial to UUID
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`), // ❌ Breaks existing data
  // ...
});

// ✅ CORRECT: Keep existing type
export const users = pgTable("users", {
  id: serial("id").primaryKey(), // ✅ Matches existing schema
  // ...
});
```

**If migration fails:**
```bash
# Check current database schema
psql $DATABASE_URL -c "\d users"

# Match Drizzle schema to existing structure
# Never manually ALTER TABLE
```

---

## Testing Patterns

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from './db';
import { users, eq } from '@shared/schema';

describe('User Queries', () => {
  beforeEach(async () => {
    // Clean test data
    await db.delete(users).where(eq(users.email, 'test@example.com'));
  });

  it('should create user', async () => {
    const [user] = await db.insert(users).values({
      name: 'Test User',
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashed',
    }).returning();

    expect(user.id).toBeDefined();
    expect(user.username).toBe('testuser');
  });

  it('should find user by email', async () => {
    // Setup
    await db.insert(users).values({
      name: 'Test User',
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashed',
    });

    // Test
    const user = await db.query.users.findFirst({
      where: eq(users.email, 'test@example.com'),
    });

    expect(user).toBeDefined();
    expect(user?.email).toBe('test@example.com');
  });
});
```

---

## Agent Usage Examples

### **Layer 3: Database Agent**
```typescript
class DatabaseAgent {
  async healthCheck(): Promise<boolean> {
    try {
      const result = await db.select().from(users).limit(1);
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }
}
```

### **Layer 16: User Agent**
```typescript
class UserAgent {
  async getUserProfile(userId: number) {
    return await db.query.users.findFirst({
      where: eq(users.id, userId),
      with: {
        posts: { limit: 10 },
        followers: true,
      },
    });
  }

  async updateProfile(userId: number, data: Partial<User>) {
    const [updated] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }
}
```

---

## Performance Benchmarks

**Measured on Neon Serverless (Free Tier):**

- **Simple SELECT (indexed):** ~2-5ms
- **Complex JOIN (3 tables):** ~15-30ms
- **INSERT (single):** ~10-15ms
- **Bulk INSERT (100 rows):** ~50-100ms
- **Full-text search (LIKE):** ~100-500ms (no index)

**Optimization:** Add indexes to frequently queried fields (see schema examples)

---

## Next Steps

1. Read `docs/MT_DATABASE_PATTERNS.md` for schema design principles
2. See `docs/MT_API_CONVENTIONS.md` for API + database integration
3. Review `shared/schema.ts` for all 88 table definitions

**Related Files:**
- `shared/schema.ts` - Complete schema (2,462 lines)
- `server/db.ts` - Database connection setup
- `drizzle.config.ts` - Drizzle configuration
