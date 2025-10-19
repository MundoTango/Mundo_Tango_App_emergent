# Replit Production Troubleshooting Guide
**Version:** 1.0  
**Last Updated:** October 19, 2025  
**Audience:** On-call engineers, support team

## Overview

Quick reference guide for diagnosing and resolving common production issues on Mundo Tango's Replit Reserved VM deployment.

---

## Quick Diagnosis Checklist

**When users report "site is down":**

1. [ ] Check if site loads: Visit https://mundotango.replit.app
2. [ ] Check health endpoint: `curl https://mundotango.replit.app/health`
3. [ ] Check Replit status: https://status.replit.com
4. [ ] Check server logs: Replit Shell → `cat /tmp/server.log | tail -100`
5. [ ] Check system resources: `free -h && top -bn1`
6. [ ] Check database: `psql $DATABASE_URL -c "SELECT 1"`

---

## Common Issues and Solutions

### **Issue 1: "Site Won't Load" (502 Bad Gateway)**

**Symptoms:**
- Users see Replit error page
- Health check fails
- Browser shows "502 Bad Gateway"

**Diagnosis:**
```bash
# Check if server is running
ps aux | grep node

# Check port binding
netstat -tulpn | grep :5000

# Check recent logs
cat /tmp/server.log | tail -50
```

**Common Causes:**

**A) Server Crashed**
```bash
# Logs show:
# "TypeError: Cannot read property 'x' of undefined"
# "Process exited with code 1"

# Fix: Restart server
npm run start

# Or use Replit UI: Stop → Run
```

**B) Server Bound to Wrong Port/Host**
```javascript
// Check server/index.ts
app.listen(5000, '0.0.0.0'); // ✅ CORRECT

// Not:
app.listen(3000, 'localhost'); // ❌ WRONG
```

**C) Build Failed**
```bash
# Check build logs
cat .replit.log | grep "build failed"

# Re-run build
npm run build

# Check for TypeScript errors
npm run typecheck
```

**Time to Resolve:** 2-5 minutes

---

### **Issue 2: "Slow Performance" (Pages Load Slow)**

**Symptoms:**
- Pages take >5 seconds to load
- API responses timeout
- Users complain about lag

**Diagnosis:**
```bash
# Check CPU/Memory
top -bn1 | head -20

# Check active connections
netstat -an | grep ESTABLISHED | wc -l

# Check database query performance
psql $DATABASE_URL -c "
  SELECT query, mean_exec_time, calls
  FROM pg_stat_statements
  ORDER BY mean_exec_time DESC
  LIMIT 10;
"
```

**Common Causes:**

**A) High CPU Usage (>90%)**
```bash
# Find CPU-intensive process
ps aux --sort=-%cpu | head -10

# If Node.js:
# - Check for infinite loops in code
# - Review recent deployments
# - Restart server to clear state
```

**B) Memory Leak**
```bash
# Check memory usage
free -h
# If Used >3.5GB → Memory leak likely

# Find memory-intensive process
ps aux --sort=-%mem | head -10

# Restart server (temporary fix)
npm run start

# Long-term: Profile memory with heapdump
npm install heapdump
# Then analyze with Chrome DevTools
```

**C) Slow Database Queries**
```sql
-- Find slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC;

-- Check for missing indexes
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0; -- Unused indexes

-- Add index if needed
CREATE INDEX posts_user_id_idx ON posts(user_id);
```

**D) External API Timeout**
```typescript
// Check Anthropic/Gemini API calls
// Add timeout and error handling

const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

try {
  const response = await fetch('https://api.anthropic.com/...', {
    signal: controller.signal,
  });
} catch (error) {
  if (error.name === 'AbortError') {
    console.error('API timeout');
    // Return cached response or error message
  }
} finally {
  clearTimeout(timeout);
}
```

**Time to Resolve:** 10-30 minutes

---

### **Issue 3: "Database Errors"**

**Symptoms:**
- "Connection refused"
- "Too many connections"
- "Query timeout"

**Diagnosis:**
```bash
# Test database connection
psql $DATABASE_URL -c "SELECT version();"

# Check active connections
psql $DATABASE_URL -c "
  SELECT COUNT(*) FROM pg_stat_activity
  WHERE state = 'active';
"

# Check connection limit
psql $DATABASE_URL -c "
  SHOW max_connections;
"
```

**Common Causes:**

**A) Connection String Invalid**
```bash
# Verify DATABASE_URL
echo $DATABASE_URL
# Should be: postgresql://user:pass@host/db

# If missing, check Replit Secrets
# Tools → Secrets → DATABASE_URL
```

**B) Too Many Connections (Neon Limit)**
```typescript
// Neon free tier: 100 connections max

// Fix: Use Neon HTTP driver (no pooling needed)
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);

// Or reduce pool size
import { Pool } from 'pg';
const pool = new Pool({
  max: 10, // Reduce from default 20
});
```

**C) Database Unreachable (Neon Down)**
```bash
# Check Neon status
curl https://neon.tech/status

# If down: Wait for Neon to recover
# Meanwhile: Show maintenance page
```

**Time to Resolve:** 5-15 minutes

---

### **Issue 4: "WebSocket Connection Failed"**

**Symptoms:**
- Mr Blue AI chat doesn't work
- Real-time updates not showing
- Console error: "WebSocket connection failed"

**Diagnosis:**
```javascript
// Client-side console
const socket = io();
socket.on('connect_error', (err) => {
  console.error('Connection error:', err);
});
```

**Common Causes:**

**A) Server Not Running Socket.io**
```typescript
// Check server/index.ts
import { Server } from 'socket.io';

const io = new Server(server, {
  cors: {
    origin: process.env.REPLIT_DOMAINS?.split(','),
    credentials: true,
  },
});

// Missing io.on('connection') handler?
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
});
```

**B) CORS Configuration Wrong**
```typescript
// Server allows connections from all domains
const io = new Server(server, {
  cors: {
    origin: '*', // ❌ Too permissive in prod
  },
});

// Should be:
const io = new Server(server, {
  cors: {
    origin: process.env.REPLIT_DOMAINS?.split(','),
    credentials: true,
  },
});
```

**C) Client Connecting to Wrong URL**
```typescript
// Client-side
// ❌ WRONG
const socket = io('http://localhost:5000');

// ✅ CORRECT (relative URL)
const socket = io();
```

**Time to Resolve:** 5-10 minutes

---

### **Issue 5: "Deployment Failed"**

**Symptoms:**
- Replit shows "Build failed"
- Deployment stuck in progress
- Old version still running

**Diagnosis:**
```bash
# Check deployment logs
cat .replit.log | tail -100

# Check for build errors
npm run build

# Check TypeScript compilation
npx tsc --noEmit
```

**Common Causes:**

**A) TypeScript Errors**
```bash
# Fix TypeScript errors
npx tsc --noEmit
# Output shows all errors

# Common fixes:
# - Add missing imports
# - Fix type mismatches
# - Add '!' for non-null assertions
```

**B) Missing Dependencies**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Or use clean install
npm ci
```

**C) Out of Disk Space**
```bash
# Check disk usage
df -h

# Clean up if needed
npm prune --production
rm -rf .cache .vite-cache
rm -rf client/dist server/dist
```

**Time to Resolve:** 10-30 minutes

---

### **Issue 6: "Environment Variable Missing"**

**Symptoms:**
- Error: "Missing ANTHROPIC_API_KEY"
- Features not working
- "undefined is not a function"

**Diagnosis:**
```bash
# Check if secret exists
echo $ANTHROPIC_API_KEY

# List all environment variables
env | grep -E "(API_KEY|SECRET|TOKEN)"
```

**Fix:**
```
1. Replit UI → Tools → Secrets
2. Add missing secret
3. Restart server (no deploy needed)
```

**Time to Resolve:** 2-5 minutes

---

## Emergency Procedures

### **Procedure 1: Rollback Deployment**

**When:** Critical bug in production, need immediate rollback

**Steps:**
1. Identify last known good commit:
```bash
git log --oneline -10
```

2. Revert to good commit:
```bash
git revert <bad-commit-hash>
git push origin main
```

3. Or use Replit UI:
```
Deployments → History → Rollback to previous version
```

**Time: 2-5 minutes**

---

### **Procedure 2: Emergency Maintenance Mode**

**When:** Need to take site offline for critical fixes

**Steps:**
1. Create maintenance page:
```html
<!-- public/maintenance.html -->
<!DOCTYPE html>
<html>
<head>
  <title>Maintenance - Mundo Tango</title>
</head>
<body>
  <h1>Scheduled Maintenance</h1>
  <p>We'll be back shortly. Estimated time: 30 minutes.</p>
</body>
</html>
```

2. Redirect all traffic:
```typescript
// server/index.ts
const MAINTENANCE_MODE = process.env.MAINTENANCE_MODE === 'true';

app.use((req, res, next) => {
  if (MAINTENANCE_MODE) {
    return res.sendFile(path.join(__dirname, '../public/maintenance.html'));
  }
  next();
});
```

3. Enable in Replit Secrets:
```
Tools → Secrets → Add
MAINTENANCE_MODE = true
```

4. After fix, disable:
```
Tools → Secrets → Delete MAINTENANCE_MODE
```

**Time: 1-2 minutes to enable/disable**

---

### **Procedure 3: Database Recovery**

**When:** Accidental data deletion or corruption

**Steps:**
1. Stop all writes (enable maintenance mode)

2. Create Neon database branch (point-in-time restore):
```
Neon Dashboard → Select Database → Restore → Choose timestamp
```

3. Export deleted/corrupted data from branch:
```bash
pg_dump $NEON_BRANCH_URL -t affected_table > recovery.sql
```

4. Import into production:
```bash
psql $DATABASE_URL < recovery.sql
```

5. Resume normal operations

**Time: 10-30 minutes**

---

## Monitoring Commands

```bash
# Real-time server logs
tail -f /tmp/server.log

# Real-time system resources
watch -n 1 'free -h && top -bn1 | head -10'

# Database connections
watch -n 5 'psql $DATABASE_URL -c "SELECT COUNT(*) FROM pg_stat_activity"'

# HTTP request rate
watch -n 1 'tail -100 /tmp/server.log | grep "GET\|POST" | wc -l'
```

---

## Contact Escalation

**Level 1: Self-Service (You)**
- Check this guide
- Review logs
- Restart services
- **Response Time:** Immediate

**Level 2: Team Lead**
- Complex issues
- Architecture changes needed
- **Response Time:** 30 minutes (business hours)

**Level 3: External Support**
- Replit Support: https://replit.com/support
- Neon Support: https://neon.tech/support
- **Response Time:** 1-4 hours

**Level 4: Emergency (P0 Outage)**
- All external services down
- Data breach suspected
- **Response Time:** Immediate escalation to all stakeholders

---

## Post-Incident Review

**After resolving a major incident:**

1. Document what happened
2. Root cause analysis (5 Whys)
3. Timeline of events
4. What worked / didn't work
5. Action items to prevent recurrence
6. Update this guide with learnings

**Template:**
```markdown
# Incident Report: [Title]
**Date:** 2025-10-19
**Duration:** 30 minutes
**Impact:** 50% of users couldn't login

## Timeline
- 14:00: Alert triggered (high error rate)
- 14:05: Identified database connection issue
- 14:10: Restarted database connections
- 14:15: Service restored
- 14:30: Confirmed full recovery

## Root Cause
DATABASE_URL environment variable was accidentally deleted during deployment

## Resolution
Re-added DATABASE_URL to Replit Secrets and restarted server

## Prevention
- Add DATABASE_URL validation to pre-deployment checks
- Document critical environment variables
- Set up alert for missing env vars

## Learnings
- Need better validation of environment variables before deploy
- Should have backup DATABASE_URL in case of accidental deletion
```

---

## Integration with ESA Protocols

**CHECK_BEFORE_BUILD:**
- Prevent issues through pre-deployment validation
- Catch missing env vars, build errors before deploy

**PERFORMANCE_METRICS:**
- Monitoring dashboard shows issues before users report
- Automated alerts for high CPU, memory, error rate

**WORKLOAD_BALANCING:**
- System load monitoring prevents overload
- Graceful degradation during high traffic

---

**Document Owner:** Platform Enhancement Division (#8) + On-Call Team  
**Review Cycle:** After every major incident  
**Last Updated:** October 19, 2025
