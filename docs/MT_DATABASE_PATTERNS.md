# Mundo Tango Database Patterns
**Version:** 1.0  
**Last Updated:** October 19, 2025  
**Status:** ✅ Active - Mandatory for all database work

## Overview

This document defines database design patterns, schema conventions, and query optimization strategies for Mundo Tango's PostgreSQL database (Neon serverless) using Drizzle ORM.

**Current Scale:**
- 88 database tables
- 13 optimized indexes
- Sub-millisecond query performance targets

---

## Database Technology Stack

```
Application Layer (TypeScript)
         │
         ▼
Drizzle ORM (Type-safe query builder)
         │
         ▼
Neon HTTP Driver (Serverless PostgreSQL)
         │
         ▼
PostgreSQL 16 (Managed by Neon)
```

**Why Neon:**
- ✅ Serverless (auto-scales, pay-per-use)
- ✅ Instant cold starts (<1s)
- ✅ Point-in-time recovery (disaster recovery)
- ✅ Branching (test database copies)
- ✅ HTTP/WebSocket drivers (no connection pooling needed)

---

## Schema Design Principles

### **1. Single Source of Truth (shared/schema.ts)**

```typescript
// shared/schema.ts - THE authoritative schema
import { pgTable, serial, varchar, text, timestamp, integer } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  bio: text('bio'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Auto-generated TypeScript types
export type User = typeof users.$inferSelect;      // For reading
export type InsertUser = typeof users.$inferInsert; // For writing
```

**Benefits:**
- ✅ TypeScript types auto-generated from schema
- ✅ Impossible to have type/DB mismatch
- ✅ Single file to understand entire data model

---

### **2. Naming Conventions**

**Table Names:**
- Lowercase, plural, snake_case
- Examples: `users`, `posts`, `memory_likes`, `city_groups`

**Column Names:**
- Lowercase, snake_case
- Examples: `user_id`, `created_at`, `is_premium`

**Index Names:**
- Format: `{table}_{column(s)}_idx`
- Examples: `users_email_idx`, `posts_user_id_created_at_idx`

**Foreign Key Names:**
- Format: `{table}_{column}_fkey`
- Examples: `posts_user_id_fkey`, `comments_post_id_fkey`

---

### **3. Standard Columns**

**Every table should have:**

```typescript
export const tableName = pgTable('table_name', {
  // Primary key (serial for auto-increment)
  id: serial('id').primaryKey(),
  
  // Timestamps (for debugging, auditing)
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  
  // Soft delete (optional, for critical data)
  deletedAt: timestamp('deleted_at'),
  
  // Other columns...
});
```

**When to omit timestamps:**
- Junction tables (many-to-many)
- Purely lookup/reference tables
- High-volume logging tables (use indexes sparingly)

---

## Data Types

### **Primary Keys**

```typescript
// ✅ RECOMMENDED: Serial (auto-increment integer)
id: serial('id').primaryKey()

// ✅ ALTERNATIVE: UUID (for distributed systems, public IDs)
id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID())

// ❌ AVOID: Manual string IDs
id: varchar('id', { length: 50 }).primaryKey() // Hard to manage
```

**When to use UUID:**
- Need globally unique IDs across multiple databases
- Want to hide sequential ID patterns (security)
- Distributed system (multiple servers generating IDs)

**When to use Serial:**
- Single database
- Performance critical (integers are faster)
- Don't care about exposing sequential IDs

**MT Platform Choice:** Serial (simpler, faster for single DB)

---

### **Text Fields**

```typescript
// Short text (names, emails)
name: varchar('name', { length: 255 }).notNull()

// Medium text (descriptions, bios)
bio: varchar('bio', { length: 1000 })

// Long text (content, articles)
content: text('content').notNull()

// Unlimited text with search
content: text('content').notNull(),
// Add full-text search index:
// CREATE INDEX posts_content_fts ON posts USING gin(to_tsvector('english', content))
```

**Guidelines:**
- Use `varchar` for known max length (<1000 chars)
- Use `text` for unlimited or >1000 chars
- Add length constraints for user input validation

---

### **Numbers**

```typescript
// Integers
age: integer('age').notNull()
viewCount: integer('view_count').notNull().default(0)

// Decimals (prices, ratings)
price: numeric('price', { precision: 10, scale: 2 }) // $999,999.99

// Floats (less precise, faster)
rating: real('rating') // 4.5 stars
```

---

### **Booleans**

```typescript
// Boolean fields
isPremium: boolean('is_premium').notNull().default(false)
isVerified: boolean('is_verified').notNull().default(false)

// Nullable for tri-state (yes/no/unknown)
emailConsent: boolean('email_consent') // null = not asked yet
```

---

### **Dates and Times**

```typescript
// Timestamp with timezone (RECOMMENDED)
createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()

// Date only (birthdays, event dates)
birthDate: date('birth_date')

// Time only (daily reminder time)
reminderTime: time('reminder_time')
```

---

### **JSON Data**

```typescript
// JSONB (binary JSON, faster queries)
metadata: jsonb('metadata').$type<{
  tags: string[];
  settings: Record<string, any>;
}>()

// Usage
await db.insert(users).values({
  name: 'Alice',
  metadata: {
    tags: ['tango', 'dancer'],
    settings: { theme: 'dark' },
  },
});

// Query JSON field
const users = await db.query.users.findMany({
  where: sql`metadata->>'theme' = 'dark'`,
});
```

**When to use JSON:**
- ✅ Flexible/nested data (user settings, preferences)
- ✅ Variable schema (different users have different fields)
- ✅ Non-relational data (analytics, logs)

**When NOT to use JSON:**
- ❌ Data you'll frequently query/join on → Use columns
- ❌ Data with strict structure → Use relations

---

## Relationships

### **1. One-to-Many (Most Common)**

```typescript
// User has many posts
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }),
});

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 200 }),
  userId: integer('user_id').notNull().references(() => users.id),
});

// Drizzle relations
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
}));

// Query with relation
const userWithPosts = await db.query.users.findFirst({
  where: eq(users.id, 1),
  with: {
    posts: true, // Automatically joins
  },
});
```

---

### **2. Many-to-Many**

```typescript
// Users <-> Groups (many-to-many)

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
});

export const groups = pgTable('groups', {
  id: serial('id').primaryKey(),
});

// Junction table
export const usersToGroups = pgTable('users_to_groups', {
  userId: integer('user_id').notNull().references(() => users.id),
  groupId: integer('group_id').notNull().references(() => groups.id),
  role: varchar('role', { length: 50 }).notNull().default('member'),
  joinedAt: timestamp('joined_at').defaultNow(),
}, (table) => ({
  // Composite primary key
  pk: primaryKey(table.userId, table.groupId),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  groups: many(usersToGroups),
}));

export const groupsRelations = relations(groups, ({ many }) => ({
  users: many(usersToGroups),
}));

// Query
const userGroups = await db.query.users.findFirst({
  where: eq(users.id, 1),
  with: {
    groups: {
      with: {
        group: true, // Get full group data
      },
    },
  },
});
```

---

### **3. One-to-One**

```typescript
// User has one profile
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
});

export const profiles = pgTable('profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().unique().references(() => users.id),
  bio: text('bio'),
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
}));
```

---

## Indexing Strategy

### **1. When to Index**

**✅ Index these columns:**
- Foreign keys (`user_id`, `post_id`)
- Columns in WHERE clauses (frequently queried)
- Columns in ORDER BY (sorting)
- Unique constraints (`email`)

**❌ Don't index these:**
- Low cardinality (few unique values, e.g., boolean)
- Rarely queried columns
- Very large text fields (use full-text search instead)

---

### **2. Single-Column Indexes**

```typescript
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(), // Auto-indexed
  name: varchar('name', { length: 255 }),
}, (table) => ({
  // Explicit index on email (if not using unique())
  emailIdx: index('users_email_idx').on(table.email),
}));
```

---

### **3. Composite Indexes (Multiple Columns)**

```typescript
export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  // Composite index for queries like:
  // WHERE user_id = 1 ORDER BY created_at DESC
  userCreatedIdx: index('posts_user_id_created_at_idx')
    .on(table.userId, table.createdAt.desc()),
}));
```

**Index column order matters:**
- Most selective column first
- Column in WHERE before ORDER BY

---

### **4. Partial Indexes**

```typescript
export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  deletedAt: timestamp('deleted_at'),
}, (table) => ({
  // Index only non-deleted posts (saves space)
  activePostsIdx: index('posts_active_idx')
    .on(table.id)
    .where(sql`deleted_at IS NULL`),
}));
```

---

### **5. Full-Text Search Indexes**

```typescript
export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
});

// Create via SQL (Drizzle doesn't support GIN indexes yet)
// Run manually or in migration:
await db.execute(sql`
  CREATE INDEX posts_content_fts 
  ON posts 
  USING gin(to_tsvector('english', content))
`);

// Query
const results = await db.execute(sql`
  SELECT * FROM posts 
  WHERE to_tsvector('english', content) @@ to_tsquery('tango & dance')
`);
```

---

## Query Optimization

### **1. N+1 Query Problem**

```typescript
// ❌ BAD: N+1 queries (1 for posts + N for users)
const posts = await db.query.posts.findMany();
for (const post of posts) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, post.userId),
  });
  console.log(user.name);
}
// Executes 1 + N queries!

// ✅ GOOD: Single query with join
const posts = await db.query.posts.findMany({
  with: {
    user: true, // Drizzle automatically joins
  },
});
posts.forEach(post => console.log(post.user.name));
// Executes 1 query!
```

---

### **2. Pagination**

```typescript
// ❌ BAD: Load all data
const allPosts = await db.query.posts.findMany();
// Loads 10,000 rows into memory!

// ✅ GOOD: Paginate
const page = 1;
const pageSize = 20;

const posts = await db.query.posts.findMany({
  limit: pageSize,
  offset: (page - 1) * pageSize,
  orderBy: [desc(posts.createdAt)],
});

// Get total count (for pagination UI)
const [{ count }] = await db.select({ count: sql<number>`count(*)` })
  .from(posts);
```

---

### **3. Select Specific Columns**

```typescript
// ❌ BAD: Select all columns (including large text)
const users = await db.query.users.findMany();

// ✅ GOOD: Select only needed columns
const users = await db.select({
  id: users.id,
  name: users.name,
  email: users.email,
}).from(users);
```

---

### **4. Use EXPLAIN ANALYZE**

```typescript
// Analyze query performance
const plan = await db.execute(sql`
  EXPLAIN ANALYZE
  SELECT * FROM posts WHERE user_id = 123
`);

console.log(plan);
// Output shows:
// - Execution time
// - Index usage
// - Row counts
```

---

## Migration Strategy

### **Drizzle Push (Recommended for MT)**

```bash
# Edit schema
vim shared/schema.ts

# Apply changes to database
npm run db:push

# If data loss warning:
npm run db:push --force
```

**How it works:**
1. Drizzle compares `schema.ts` to actual database
2. Generates SQL to sync (ALTER TABLE, CREATE INDEX, etc.)
3. Applies changes directly

**⚠️ CRITICAL: Never change primary key types**
```typescript
// ❌ NEVER DO THIS (breaks everything)
// Before:
id: serial('id').primaryKey()

// After:
id: varchar('id').primaryKey() // ← BREAKS ALL FOREIGN KEYS!

// ✅ Keep ID type consistent
id: serial('id').primaryKey() // Always keep as serial
```

---

## Common Patterns

### **1. Soft Delete**

```typescript
export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 200 }),
  deletedAt: timestamp('deleted_at'),
});

// Soft delete
await db.update(posts)
  .set({ deletedAt: new Date() })
  .where(eq(posts.id, postId));

// Query only active
const activePosts = await db.query.posts.findMany({
  where: isNull(posts.deletedAt),
});
```

---

### **2. Optimistic Locking (Version Field)**

```typescript
export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 200 }),
  version: integer('version').notNull().default(0),
});

// Update with version check
const [updated] = await db.update(posts)
  .set({ 
    title: 'New title',
    version: sql`version + 1`,
  })
  .where(and(
    eq(posts.id, postId),
    eq(posts.version, currentVersion) // Ensures no concurrent update
  ))
  .returning();

if (!updated) {
  throw new Error('Concurrent modification detected');
}
```

---

### **3. Audit Trail**

```typescript
export const auditLog = pgTable('audit_log', {
  id: serial('id').primaryKey(),
  tableName: varchar('table_name', { length: 100 }).notNull(),
  recordId: integer('record_id').notNull(),
  action: varchar('action', { length: 20 }).notNull(), // INSERT, UPDATE, DELETE
  oldData: jsonb('old_data'),
  newData: jsonb('new_data'),
  userId: integer('user_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Log changes
async function updateUserWithAudit(userId: number, updates: Partial<User>) {
  const oldUser = await db.query.users.findFirst({ where: eq(users.id, userId) });
  
  const [newUser] = await db.update(users)
    .set(updates)
    .where(eq(users.id, userId))
    .returning();
  
  await db.insert(auditLog).values({
    tableName: 'users',
    recordId: userId,
    action: 'UPDATE',
    oldData: oldUser,
    newData: newUser,
    userId: req.user.id,
  });
  
  return newUser;
}
```

---

## Performance Targets

| Query Type | Target | Acceptable | Slow |
|------------|--------|------------|------|
| Simple SELECT | <10ms | <50ms | >100ms |
| JOIN (2-3 tables) | <50ms | <200ms | >500ms |
| Complex aggregation | <200ms | <500ms | >1s |
| Full-text search | <100ms | <300ms | >1s |

**If slow:**
1. Check if index exists
2. Run EXPLAIN ANALYZE
3. Optimize query or add index
4. Consider caching

---

## Integration with ESA Protocols

**CHECK_BEFORE_BUILD:**
- Test database connectivity before deploy
- Verify schema synced (`npm run db:push`)

**PERFORMANCE_METRICS:**
- Track query performance with pg_stat_statements
- Alert if queries exceed targets

**REUSABLE_COMPONENTS:**
- Reuse query patterns across services
- Create utility functions for common queries

---

**Document Owner:** Database Architecture (Layer #1)  
**Review Cycle:** Monthly or when schema changes  
**Last Updated:** October 19, 2025
