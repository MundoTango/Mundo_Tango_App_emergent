# Neon PostgreSQL Production Best Practices
**Version:** 1.0  
**Last Updated:** October 19, 2025  
**Audience:** Database administrators, backend engineers

## Overview

Mundo Tango uses **Neon PostgreSQL** (serverless) as the primary database, managed through Replit's built-in database integration. This guide covers production-ready patterns, optimization, and disaster recovery.

---

## Neon PostgreSQL Architecture

### **What is Neon?**

Neon is a **serverless PostgreSQL** service that separates compute from storage:

**Traditional PostgreSQL:**
```
Client → Postgres Server (always running) → Storage
        Cost: Always paying for compute
```

**Neon Serverless:**
```
Client → HTTP/WebSocket API → Postgres (auto-scales) → Storage
        Cost: Pay only for active compute time
```

**Benefits for MT Platform:**
- ✅ Auto-scaling (0 to thousands of connections)
- ✅ Near-instant cold starts (<1s)
- ✅ Pay-per-query pricing (cost-effective for variable load)
- ✅ Built-in connection pooling
- ✅ Branching (database copies for testing)

---

## Connection Patterns

### **1. Neon HTTP Driver (Recommended for MT)**

```typescript
// Uses HTTP fetch, works in serverless environments
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

// No connection pooling needed - HTTP is stateless
// Each query is a new HTTP request
const users = await db.query.users.findMany();
```

**Advantages:**
- ✅ Serverless-friendly (no persistent connections)
- ✅ Auto-retries on connection errors
- ✅ Works with edge functions
- ✅ No connection limit issues

**Disadvantages:**
- ❌ Slightly higher latency (~50ms vs ~10ms for direct connection)
- ❌ No transaction support (use WebSocket driver for transactions)

---

### **2. Neon WebSocket Driver (For Transactions)**

```typescript
// Uses WebSocket, required for transactions
import { neonConfig, Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

// Transaction support
await db.transaction(async (tx) => {
  await tx.insert(users).values({ name: 'Alice' });
  await tx.insert(profiles).values({ userId: 1, bio: 'Developer' });
});
```

**When to Use:**
- Multi-step operations requiring rollback
- Financial transactions (payments, subscriptions)
- Batch operations that must be atomic

---

### **3. Traditional Postgres Driver (Not Recommended)**

```typescript
// Regular 'pg' driver - NOT optimized for Neon
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Works, but doesn't leverage Neon's serverless benefits
```

**When to Use:**
- Migrating from traditional Postgres
- Tools that don't support Neon drivers (pg_dump, etc.)

---

## Schema Design

### **Drizzle ORM Schema (shared/schema.ts)**

```typescript
import { pgTable, serial, varchar, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core';

// Example: Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  bio: text('bio'),
  metadata: jsonb('metadata'), // Flexible JSON storage
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  // Indexes for query performance
  emailIdx: index('users_email_idx').on(table.email),
}));

// Drizzle automatically generates TypeScript types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
```

**Best Practices:**
1. Use `serial` for auto-increment IDs (simplest)
2. Add indexes on frequently queried columns
3. Use `jsonb` for flexible/nested data (better than separate tables)
4. Always add timestamps (createdAt, updatedAt) for debugging

---

## Migration Strategy

### **Drizzle Push (Recommended for MT)**

```bash
# Apply schema changes directly to database
npm run db:push

# With force (skips confirmation, useful for CI/CD)
npm run db:push --force
```

**How it Works:**
1. Drizzle compares `shared/schema.ts` to actual database
2. Generates SQL to sync (ALTER TABLE, CREATE INDEX, etc.)
3. Applies changes directly (no migration files)

**Advantages:**
- ✅ Fast iteration (no migration file generation)
- ✅ Auto-syncs schema with code
- ✅ Perfect for development/prototyping

**Disadvantages:**
- ❌ No migration history
- ❌ Can be destructive (drops columns if removed from schema)

---

### **Drizzle Migrate (For Production)**

```bash
# Generate migration files
npx drizzle-kit generate:pg

# Apply migrations
npx drizzle-kit push:pg
```

**When to Use:**
- Production databases with live data
- Need to review SQL before applying
- Team collaboration (migrations in Git)

---

## Query Optimization

### **1. Use Indexes**

```typescript
// BAD: No index - full table scan (slow for >1000 rows)
const user = await db.query.users.findFirst({
  where: eq(users.email, 'alice@example.com'),
});

// GOOD: Add index in schema
export const users = pgTable('users', {
  email: varchar('email', { length: 255 }).notNull().unique(),
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email), // ← This!
}));
```

**Index Guidelines:**
- ✅ Columns in WHERE clauses
- ✅ Columns in JOIN conditions
- ✅ Columns in ORDER BY
- ❌ Don't over-index (slows INSERT/UPDATE)

---

### **2. Limit Results**

```typescript
// BAD: Loads 10,000 rows into memory
const allPosts = await db.query.posts.findMany();

// GOOD: Paginate
const posts = await db.query.posts.findMany({
  limit: 20,
  offset: page * 20,
  orderBy: [desc(posts.createdAt)],
});
```

**Always use pagination for user-facing lists.**

---

### **3. Select Only Needed Columns**

```typescript
// BAD: Loads full user object (including large bio field)
const user = await db.query.users.findFirst({
  where: eq(users.id, userId),
});

// GOOD: Select specific columns
const user = await db.select({
  id: users.id,
  name: users.name,
  email: users.email,
}).from(users).where(eq(users.id, userId)).limit(1);
```

---

### **4. Use Relations Wisely**

```typescript
// BAD: N+1 query problem
const posts = await db.query.posts.findMany();
for (const post of posts) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, post.userId),
  });
  console.log(user.name);
}
// Executes 1 + N queries!

// GOOD: Single query with JOIN
const posts = await db.query.posts.findMany({
  with: {
    user: true, // Drizzle joins automatically
  },
});
posts.forEach(post => console.log(post.user.name));
// Executes 1 query!
```

---

## Performance Monitoring

### **1. Query Performance Analysis**

```sql
-- Enable pg_stat_statements (Neon has this enabled)
-- Find slow queries (>100ms average)
SELECT
  query,
  calls,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC
LIMIT 10;
```

**Targets:**
- Simple SELECT: <10ms
- JOIN (2-3 tables): <50ms
- Complex aggregation: <200ms
- Full-text search: <100ms

---

### **2. Connection Monitoring**

```sql
-- Active connections
SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active';

-- Long-running queries (>5s)
SELECT pid, query, state, now() - query_start AS duration
FROM pg_stat_activity
WHERE state = 'active' AND now() - query_start > interval '5 seconds';

-- Kill long-running query
SELECT pg_terminate_backend(pid);
```

**Neon Connection Limits:**
- Free tier: 100 connections
- Paid tiers: 1000+ connections
- Auto-scales, so rarely hit limits

---

## Backup and Recovery

### **1. Neon Automatic Backups**

**Neon provides:**
- ✅ Continuous backups (every change logged)
- ✅ Point-in-time recovery (restore to any second)
- ✅ 7-day retention (free tier), 30+ days (paid)

**Restore via Neon Dashboard:**
1. Go to Neon console
2. Select database
3. Click "Restore" → Choose timestamp
4. Creates new branch (doesn't overwrite)

---

### **2. Manual Export (pg_dump)**

```bash
# Export entire database
pg_dump $DATABASE_URL > backup.sql

# Export specific tables
pg_dump $DATABASE_URL -t users -t posts > partial_backup.sql

# Export schema only (no data)
pg_dump $DATABASE_URL --schema-only > schema.sql
```

**Schedule with cron:**
```bash
# Backup daily at 2 AM
0 2 * * * pg_dump $DATABASE_URL | gzip > /backups/db_$(date +\%Y\%m\%d).sql.gz
```

---

### **3. Restore from Backup**

```bash
# Restore from SQL dump
psql $DATABASE_URL < backup.sql

# Restore compressed backup
gunzip -c backup.sql.gz | psql $DATABASE_URL
```

---

## Disaster Recovery Plan

### **Scenario 1: Accidental Data Deletion**

**Example:** `DELETE FROM users WHERE id = 123;` (oops, deleted wrong user)

**Recovery:**
1. Check Neon backup (point-in-time restore to 5 minutes ago)
2. Create branch from backup
3. Export deleted user data:
```sql
SELECT * FROM users WHERE id = 123;
```
4. Re-insert into production:
```sql
INSERT INTO users (id, email, name, ...) VALUES (...);
```

**Time to Recover:** <10 minutes

---

### **Scenario 2: Database Corruption**

**Example:** Schema migration went wrong, tables broken

**Recovery:**
1. Stop all writes (maintenance mode)
2. Restore Neon to last known good state (30 minutes ago)
3. Re-apply correct migration
4. Resume writes

**Time to Recover:** <30 minutes

---

### **Scenario 3: Complete Data Loss**

**Example:** Neon account deleted or catastrophic failure

**Recovery:**
1. Restore from most recent pg_dump backup
2. Create new Neon database
3. Import backup:
```bash
psql $NEW_DATABASE_URL < backup.sql
```
4. Update DATABASE_URL in Replit secrets
5. Restart application

**Time to Recover:** 1-2 hours (if daily backups maintained)

---

## Security Best Practices

### **1. Connection String Protection**

```bash
# NEVER commit to Git
# ❌ BAD
DATABASE_URL=postgresql://user:password@host/db

# ✅ GOOD - Use Replit Secrets
echo $DATABASE_URL # Only accessible in runtime
```

---

### **2. Row-Level Security (RLS)**

```sql
-- Enable RLS on tables with user data
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own posts
CREATE POLICY user_posts_policy ON posts
  FOR SELECT
  USING (user_id = current_setting('app.user_id')::INTEGER);
```

**In Drizzle:**
```typescript
// Set user context before queries
await db.execute(sql`SET app.user_id = ${req.user.id}`);

// Now queries automatically filtered by RLS
const posts = await db.query.posts.findMany(); // Only returns user's posts
```

---

### **3. SQL Injection Prevention**

```typescript
// ❌ NEVER use string concatenation
const unsafe = await db.execute(
  sql`SELECT * FROM users WHERE email = '${userInput}'`
);

// ✅ ALWAYS use parameterized queries
const safe = await db.query.users.findFirst({
  where: eq(users.email, userInput), // Drizzle escapes automatically
});
```

---

## Cost Optimization

**Neon Pricing (Estimated):**
- Free tier: 500MB storage, 100 compute hours/month
- Pro: $20/month for 10GB storage, unlimited compute
- Pay-as-you-go: $0.10/compute hour

**Optimization Strategies:**

### **1. Reduce Query Frequency**

```typescript
// ❌ BAD: Query on every request
app.get('/api/stats', async (req, res) => {
  const stats = await db.query.users.findMany();
  res.json({ count: stats.length });
});

// ✅ GOOD: Cache for 5 minutes
const cache = { stats: null, timestamp: 0 };
app.get('/api/stats', async (req, res) => {
  if (Date.now() - cache.timestamp > 5 * 60 * 1000) {
    cache.stats = await db.query.users.findMany();
    cache.timestamp = Date.now();
  }
  res.json({ count: cache.stats.length });
});
```

---

### **2. Use Read Replicas (Neon Pro)**

```typescript
// Write to primary
await db.insert(users).values({ name: 'Alice' });

// Read from replica (lower cost)
const users = await replicaDb.query.users.findMany();
```

---

### **3. Archive Old Data**

```sql
-- Move posts >1 year old to archive table
CREATE TABLE posts_archive AS
SELECT * FROM posts WHERE created_at < NOW() - INTERVAL '1 year';

DELETE FROM posts WHERE created_at < NOW() - INTERVAL '1 year';
```

---

## Integration with ESA Protocols

**CHECK_BEFORE_BUILD:**
```typescript
// Verify database connectivity before deployment
try {
  await db.execute(sql`SELECT 1`);
  console.log('✅ Database connected');
} catch (error) {
  console.error('❌ Database connection failed:', error);
  process.exit(1);
}
```

**PERFORMANCE_METRICS:**
```typescript
// Track query performance
const start = Date.now();
const result = await db.query.posts.findMany();
const duration = Date.now() - start;

if (duration > 100) {
  logMetric('slow_query', { query: 'posts.findMany', duration });
}
```

---

**Document Owner:** Database Architecture (Layer #1)  
**Review Cycle:** Monthly  
**Last Updated:** October 19, 2025
