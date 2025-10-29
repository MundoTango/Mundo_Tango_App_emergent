# New Repository Migration Guide
**Status:** Backup Option (Use If Orphan Branch Fails)
**Date:** October 17, 2025
**Risk Level:** HIGH - Requires Database Migration

---

## ⚠️ CRITICAL WARNING

**This guide is for creating a COMPLETELY NEW REPOSITORY.**

**Risks:**
- ❌ Requires manual database migration (pg_dump → pg_restore)
- ❌ Loses all Git history (unless you import)
- ❌ More complex setup
- ❌ Potential data loss if migration fails
- ❌ Downtime during migration

**✅ RECOMMENDED INSTEAD: Orphan Branch Strategy**
- Preserves Git history
- Same database (no migration)
- Lower risk
- Faster execution

**Only use this guide if:**
1. Orphan branch failed for some reason
2. You want completely separate project
3. You're ready to handle database migration manually

---

## 📋 PRE-MIGRATION CHECKLIST

### Critical Backups
- [ ] Full database backup (pg_dump)
- [ ] Code backup (tar.gz)
- [ ] All Replit Secrets documented
- [ ] Environment variables listed
- [ ] API keys saved securely
- [ ] Tested database restore locally

### Verification
- [ ] Current site is accessible (screenshot)
- [ ] User data exported
- [ ] All integrations documented
- [ ] Dependencies listed (package.json)
- [ ] Database schema documented

---

## 🗄️ PHASE 1: DATABASE MIGRATION PREPARATION

### Step 1: Export Current Database

```bash
# 1. Create comprehensive backup
pg_dump $DATABASE_URL \
  --format=custom \
  --verbose \
  --file="mundo-tango-migration-$(date +%Y%m%d).dump"

# 2. Verify backup integrity
pg_restore --list mundo-tango-migration-*.dump | head -50

# 3. Export as SQL (human-readable backup)
pg_dump $DATABASE_URL \
  --format=plain \
  --file="mundo-tango-migration-$(date +%Y%m%d).sql"

# 4. Export schema only (for reference)
pg_dump $DATABASE_URL \
  --schema-only \
  --file="schema-snapshot-$(date +%Y%m%d).sql"
```

### Step 2: Document Database Structure

```bash
# List all tables
psql $DATABASE_URL -c "\dt"

# Count rows in each table
psql $DATABASE_URL << 'SQL'
SELECT 
  schemaname,
  tablename,
  pg_total_relation_size(schemaname||'.'||tablename) AS size,
  (SELECT COUNT(*) FROM schemaname||'.'||tablename) AS rows
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY size DESC;
SQL

# Export to CSV for records
psql $DATABASE_URL -c "\copy (SELECT * FROM users) TO 'users-export.csv' CSV HEADER"
# Repeat for each critical table
```

### Step 3: Verify Backup

```bash
# Create test database (local testing)
createdb mundo_tango_test

# Test restore
pg_restore -d mundo_tango_test \
  --verbose \
  mundo-tango-migration-*.dump

# Verify data
psql mundo_tango_test -c "SELECT COUNT(*) FROM users;"

# Cleanup test
dropdb mundo_tango_test
```

---

## 🆕 PHASE 2: CREATE NEW REPLIT PROJECT

### Step 1: Create New Replit

1. **Go to Replit Dashboard**
2. **Click "Create Repl"**
3. **Select:**
   - Template: Node.js
   - Name: `mundo-tango-fresh` (or your choice)
   - Privacy: Private

### Step 2: Configure New Replit

```bash
# In new Repl terminal

# 1. Install Nix modules
# (Should auto-detect from .replit config)

# 2. Create PostgreSQL database
# In Replit: Tools > Database > Create PostgreSQL Database

# 3. Verify DATABASE_URL
echo $DATABASE_URL
# Should show new database connection string
```

### Step 3: Setup Git (Optional - Import History)

```bash
# If you want to preserve Git history:

# Clone from old repo
git clone <your-old-repo-url> .

# Or add old repo as remote
git remote add old-repo <your-old-repo-url>
git fetch old-repo
git checkout old-repo/main
```

---

## 📦 PHASE 3: CODE MIGRATION

### Step 1: Transfer Code Files

**Option A: Direct Copy (Fresh Start)**
```bash
# In OLD Repl, create archive
tar -czf mundo-tango-code.tar.gz \
  client/ server/ shared/ docs/ \
  package.json vite.config.ts tailwind.config.ts \
  tsconfig.json drizzle.config.ts replit.md

# Download archivo from old Repl
# Upload to new Repl
# Extract
tar -xzf mundo-tango-code.tar.gz
```

**Option B: Git Clone (With History)**
```bash
# In NEW Repl
git clone <your-repo-url> .
git checkout main
```

### Step 2: Install Dependencies

```bash
# Fresh install
rm -rf node_modules package-lock.json
npm install --force

# Verify
npm list --depth=0
```

### Step 3: Update Configurations

```bash
# Create new .replit (Reserved VM)
cat > .replit << 'EOF'
modules = ["nodejs-20", "postgresql-16"]

[deployment]
deploymentTarget = "vm"
build = ["npm", "install", "--production"]
run = ["npm", "start"]

[[ports]]
localPort = 5000
externalPort = 80
exposeLocalhost = true
EOF
```

---

## 🗄️ PHASE 4: DATABASE MIGRATION (CRITICAL)

### Step 1: Prepare New Database

```bash
# In NEW Repl

# 1. Verify new database is empty
psql $DATABASE_URL -c "\dt"

# 2. Create schema using Drizzle
npm run db:push

# 3. Verify tables created
psql $DATABASE_URL -c "\dt"
```

### Step 2: Transfer Database Backup

```bash
# Copy backup file to new Repl
# (Upload mundo-tango-migration-*.dump)

# Verify file
ls -lh *.dump
```

### Step 3: Restore Database

```bash
# ⚠️ CRITICAL: This will populate the new database

# Restore with verbose output
pg_restore -d $DATABASE_URL \
  --verbose \
  --clean \
  --if-exists \
  mundo-tango-migration-*.dump

# Or if that fails, use SQL dump
psql $DATABASE_URL < mundo-tango-migration-*.sql
```

### Step 4: Verify Migration

```bash
# 1. Check table counts
psql $DATABASE_URL << 'SQL'
SELECT 
  tablename,
  (xpath('/row/cnt/text()', 
    xml_count))[1]::text::int AS row_count
FROM (
  SELECT 
    tablename,
    query_to_xml(
      format('SELECT COUNT(*) AS cnt FROM %I.%I', 
        schemaname, tablename),
      false, true, ''
    ) AS xml_count
  FROM pg_tables
  WHERE schemaname = 'public'
) AS counts
ORDER BY tablename;
SQL

# 2. Verify specific data
psql $DATABASE_URL -c "SELECT * FROM users LIMIT 5;"
psql $DATABASE_URL -c "SELECT * FROM posts LIMIT 5;"

# 3. Check foreign keys
psql $DATABASE_URL -c "
  SELECT conname, conrelid::regclass, confrelid::regclass
  FROM pg_constraint
  WHERE contype = 'f';"

# 4. Verify indexes
psql $DATABASE_URL -c "\di"
```

---

## 🔐 PHASE 5: SECRETS & ENVIRONMENT

### Step 1: Transfer Secrets

**In NEW Repl:**
1. Go to Tools > Secrets
2. Add each secret from old Repl:
   - ANTHROPIC_API_KEY
   - GEMINI_API_KEY
   - JIRA_API_TOKEN
   - JIRA_DOMAIN
   - JIRA_EMAIL
   - LOCATIONIQ_API_KEY
   - MESHY_API_KEY
   - (Any others you have)

### Step 2: Verify Environment

```bash
# Check all secrets are set
env | grep -E "(ANTHROPIC|GEMINI|JIRA|LOCATIONIQ|MESHY|DATABASE_URL)"

# Should see all values (masked)
```

---

## 🧪 PHASE 6: TESTING

### Step 1: Build Test

```bash
# Clean build
npm run build

# Check for errors
echo $?  # Should be 0
```

### Step 2: Start Application

```bash
# Start dev server
npm run dev

# Should start on port 5000
```

### Step 3: Manual Testing

**Checklist:**
- [ ] Homepage loads (http://localhost:5000)
- [ ] Mundo Tango design visible (Pierre Dubois profile, sidebar)
- [ ] Login works (test with existing user from migrated DB)
- [ ] Can create new post
- [ ] Can view posts
- [ ] Mr Blue AI button appears and works
- [ ] Visual Editor accessible
- [ ] Database queries work
- [ ] WebSocket real-time updates work
- [ ] All routes accessible
- [ ] No console errors

### Step 4: Database Integrity Check

```bash
# Run application-level checks
npm run test  # If you have tests

# Manual SQL checks
psql $DATABASE_URL << 'SQL'
-- Check for orphaned records
SELECT p.id, p.title 
FROM posts p 
LEFT JOIN users u ON p.user_id = u.id 
WHERE u.id IS NULL;

-- Verify foreign key constraints
SELECT * FROM pg_constraint WHERE contype = 'f';
SQL
```

---

## 🚀 PHASE 7: DEPLOYMENT

### Step 1: Configure Production Deployment

```bash
# Update .replit for production
cat > .replit << 'EOF'
modules = ["nodejs-20", "postgresql-16"]

[deployment]
deploymentTarget = "vm"
build = ["npm", "install", "--production", "--force"]
run = ["npm", "start"]

[[ports]]
localPort = 5000
externalPort = 80
exposeLocalhost = true
EOF
```

### Step 2: Deploy

1. Click "Deploy" button in Replit
2. Select "Reserved VM"
3. Configure:
   - Auto-deploy: On
   - Auto-scale: Off
   - Memory: 1GB (minimum)
4. Click "Deploy"

### Step 3: Verify Production

- [ ] Visit production URL
- [ ] Test login
- [ ] Test core features
- [ ] Check database connection
- [ ] Monitor logs for errors

---

## 🔄 PHASE 8: CUTOVER PLAN

### Pre-Cutover
- [ ] Announce maintenance window to users
- [ ] Final backup of old database
- [ ] Verify new system fully working
- [ ] Test rollback procedure

### Cutover Steps

1. **Stop old application**
   - Set maintenance mode
   - Stop accepting new writes

2. **Final data sync**
   ```bash
   # In OLD Repl, export latest data
   pg_dump $DATABASE_URL -Fc -f final-sync.dump
   
   # In NEW Repl, restore
   pg_restore -d $DATABASE_URL --clean final-sync.dump
   ```

3. **Switch DNS/URLs**
   - Update any external links
   - Redirect old URL to new

4. **Enable new system**
   - Start application
   - Monitor closely

### Rollback Plan

If migration fails:
```bash
# Return to old Repl
# Old system still has all data
# No changes were made to old database

# In NEW Repl, you can restore from backup
./scripts/restore-database.sh backups/database/mundo-tango-migration-*.dump
```

---

## 📊 PHASE 9: POST-MIGRATION

### Step 1: Monitoring

```bash
# Set up monitoring
# - Database connection pool status
# - Error rates
# - Response times
# - User activity

# Check logs
tail -f /var/log/app.log
```

### Step 2: Data Validation

```bash
# Compare record counts (old vs new)
# Old Repl:
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM posts;"

# New Repl (should match):
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM posts;"
```

### Step 3: Documentation Update

- [ ] Update README with new repo URL
- [ ] Document migration process
- [ ] Update deployment docs
- [ ] Archive old Repl (don't delete yet)

---

## ⚠️ COMMON PITFALLS

### Issue 1: Foreign Key Violations

**Problem:** Database restore fails due to foreign key constraints

**Solution:**
```bash
# Disable triggers during restore
pg_restore -d $DATABASE_URL \
  --disable-triggers \
  --verbose \
  backup.dump
```

### Issue 2: Sequence Reset

**Problem:** Auto-increment IDs start from 1 instead of continuing

**Solution:**
```sql
-- Fix sequences after restore
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('posts_id_seq', (SELECT MAX(id) FROM posts));
-- Repeat for all sequences
```

### Issue 3: Different PostgreSQL Versions

**Problem:** Backup from PG 15 won't restore to PG 14

**Solution:**
```bash
# Use SQL format instead of custom format
pg_dump $DATABASE_URL --format=plain -f backup.sql

# Then restore with psql
psql $DATABASE_URL < backup.sql
```

### Issue 4: Missing Extensions

**Problem:** Database uses extensions not available in new DB

**Solution:**
```sql
-- In new database, install extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- Then restore data
```

---

## ✅ FINAL CHECKLIST

### Pre-Migration
- [ ] Full database backup
- [ ] Code backup
- [ ] Secrets documented
- [ ] Test restore locally
- [ ] Rollback plan ready

### Migration
- [ ] New Repl created
- [ ] Code transferred
- [ ] Dependencies installed
- [ ] Database migrated
- [ ] Secrets configured
- [ ] Tests passing

### Post-Migration
- [ ] Production deployment
- [ ] Data validated
- [ ] Monitoring enabled
- [ ] Users notified
- [ ] Old Repl archived (not deleted)

---

## 🎯 WHEN TO USE THIS GUIDE

**Use New Repo Migration When:**
- ❌ Orphan branch completely failed
- ❌ Replit environment is corrupted beyond repair
- ❌ You want completely separate project
- ❌ Multiple irrecoverable build issues

**DON'T Use New Repo Migration When:**
- ✅ Orphan branch is an option (PREFERRED)
- ✅ Build issues can be fixed with fresh npm install
- ✅ Database is working fine
- ✅ Git history is important

---

## 📞 SUPPORT & TROUBLESHOOTING

### If Database Migration Fails

1. **Check backup integrity:**
   ```bash
   pg_restore --list backup.dump | wc -l
   # Should show hundreds/thousands of lines
   ```

2. **Try SQL format instead:**
   ```bash
   pg_dump $OLD_DATABASE_URL > backup.sql
   psql $NEW_DATABASE_URL < backup.sql
   ```

3. **Manual table-by-table:**
   ```bash
   # Export each table as CSV
   psql $OLD_DB -c "\copy users TO 'users.csv' CSV HEADER"
   
   # Import to new DB
   psql $NEW_DB -c "\copy users FROM 'users.csv' CSV HEADER"
   ```

### If Build Fails

1. Clear everything:
   ```bash
   rm -rf node_modules package-lock.json .vite
   npm cache clean --force
   npm install --force
   ```

2. Check Node version:
   ```bash
   node --version  # Should be v20.x
   npm --version   # Should be v10.x
   ```

3. Verify all files copied:
   ```bash
   ls -R client/ server/ shared/
   ```

---

## 🎯 RECOMMENDATION

**MB.MD + All Agents Recommendation:**

**❌ DO NOT use new repo migration unless absolutely necessary**

**✅ INSTEAD: Use orphan branch strategy**
- Same result (fresh build)
- Lower risk (no database migration)
- Preserves Git history
- Same environment (less can go wrong)
- 95% confidence vs 70% confidence

**This guide exists as:**
- Emergency backup option
- Reference for future migrations
- Documentation of the process

**But for YOUR situation:**
- Orphan branch is the right choice
- Database works fine
- Build system is the only issue
- No need for full migration

---

**STATUS:** Backup Option Guide Complete  
**USE WHEN:** Only if orphan branch fails  
**CONFIDENCE:** 70% (database migration risk)  
**PREFERRED:** Orphan branch (95% confidence)

---

**Created:** October 17, 2025  
**By:** MB.MD + Agent #82 (Deployment)  
**Purpose:** Emergency backup plan only
