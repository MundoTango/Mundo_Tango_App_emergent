# Maintenance Procedures - Mundo Tango Platform
**Version**: 1.0  
**Date**: October 17, 2025  
**Status**: ACTIVE

---

## 🎯 **MAINTENANCE PHILOSOPHY**

**Preventive > Reactive**: Regular maintenance prevents emergencies

**Key Principles**:
1. **Never break production** - Test changes thoroughly
2. **Document everything** - Future you will thank you
3. **Automate repetitive tasks** - Let agents handle routine work
4. **Monitor continuously** - Catch issues early
5. **Plan for rollback** - Always have an escape route

---

## 📅 **MAINTENANCE SCHEDULE**

### **Daily** (Automated):
- ✅ Health checks (every 5 minutes)
- ✅ Error log monitoring
- ✅ Performance metrics collection
- ✅ Backup verification
- ✅ Security scan (dependencies)

### **Weekly** (Manual):
- [ ] Review error logs for patterns
- [ ] Check database performance
- [ ] Review slow queries
- [ ] Verify backup restores (test 1 backup)
- [ ] Update dependencies (security patches)
- [ ] Review user feedback
- [ ] Check disk space usage

### **Monthly**:
- [ ] Full dependency audit (`npm audit`)
- [ ] Performance review (Lighthouse audit)
- [ ] Security review (penetration test)
- [ ] Database cleanup (old sessions, expired tokens)
- [ ] Documentation updates
- [ ] Agent health review (all 276 agents)
- [ ] Cost optimization review

### **Quarterly**:
- [ ] Major dependency updates
- [ ] Infrastructure review
- [ ] Disaster recovery drill
- [ ] Security audit (external)
- [ ] Performance benchmarking
- [ ] User satisfaction survey
- [ ] Roadmap adjustment

---

## 🔧 **ROUTINE MAINTENANCE TASKS**

### **Database Maintenance**:

#### **Weekly Vacuum** (PostgreSQL):
```sql
-- Analyze tables for query planner
ANALYZE;

-- Vacuum to reclaim storage
VACUUM;

-- Full vacuum (monthly, during low-traffic)
VACUUM FULL;
```

#### **Index Rebuilding** (if needed):
```sql
-- Rebuild index if fragmented
REINDEX INDEX idx_posts_user_created;

-- Rebuild all indexes for table
REINDEX TABLE posts;
```

#### **Cleanup Old Data**:
```sql
-- Delete expired sessions (older than 30 days)
DELETE FROM sessions 
WHERE created_at < NOW() - INTERVAL '30 days';

-- Archive old notifications (older than 90 days)
INSERT INTO notifications_archive 
SELECT * FROM notifications 
WHERE created_at < NOW() - INTERVAL '90 days';

DELETE FROM notifications 
WHERE created_at < NOW() - INTERVAL '90 days';
```

---

### **Log Management**:

#### **Log Rotation**:
```bash
# Rotate logs weekly
logrotate /etc/logrotate.d/mundo-tango

# Keep logs for 30 days
find /var/log/mundo-tango -name "*.log" -mtime +30 -delete
```

#### **Error Log Review**:
```bash
# Check for critical errors
grep "ERROR" /var/log/mundo-tango/app.log | tail -100

# Check for authentication failures
grep "AUTH_FAILED" /var/log/mundo-tango/app.log | wc -l

# Check for 500 errors
grep "HTTP/500" /var/log/mundo-tango/access.log | tail -50
```

---

### **Dependency Management**:

#### **Security Updates**:
```bash
# Check for vulnerabilities
npm audit

# Fix automatically (if safe)
npm audit fix

# Fix breaking changes manually
npm audit fix --force  # ⚠️ Test after this!

# Update specific package
npm update <package-name>
```

#### **Version Updates**:
```bash
# Check outdated packages
npm outdated

# Update to latest compatible versions
npm update

# Update to latest (may break)
npm install <package>@latest
```

**⚠️ Always test after updates!**

---

### **Cache Management**:

#### **Clear Redis Cache**:
```typescript
// Clear all cache
await redis.flushall();

// Clear specific pattern
const keys = await redis.keys('user:*');
await Promise.all(keys.map(key => redis.del(key)));

// Clear expired keys
await redis.scan(0, 'COUNT', 100).then(async (result) => {
  const keys = result[1];
  for (const key of keys) {
    const ttl = await redis.ttl(key);
    if (ttl === -1) {
      await redis.del(key); // No expiry set, clean up
    }
  }
});
```

#### **Clear Client Cache**:
```typescript
// Invalidate React Query cache
queryClient.invalidateQueries();

// Clear specific query
queryClient.invalidateQueries({ queryKey: ['/api/events'] });
```

---

### **File System Cleanup**:

#### **Remove Orphaned Files**:
```bash
# Find orphaned uploads (not in database)
find /uploads -type f -mtime +90 > /tmp/all_files.txt
# Compare with database records
# Delete files not in database
```

#### **Compress Old Logs**:
```bash
# Compress logs older than 7 days
find /var/log/mundo-tango -name "*.log" -mtime +7 -exec gzip {} \;
```

---

## 🚨 **EMERGENCY PROCEDURES**

### **Server Down**:

**Immediate Actions**:
1. Check server status
2. Review error logs
3. Restart server if needed
4. Notify users (status page)

```bash
# Check if server is running
ps aux | grep node

# Check port availability
netstat -tuln | grep 5000

# Restart server
npm run start

# Check logs for errors
tail -f /var/log/mundo-tango/app.log
```

---

### **Database Issues**:

**Symptoms**: Slow queries, connection errors, high CPU

```sql
-- Check active queries
SELECT pid, now() - pg_stat_activity.query_start AS duration, query
FROM pg_stat_activity
WHERE state = 'active'
ORDER BY duration DESC;

-- Kill long-running query
SELECT pg_cancel_backend(12345); -- pid from above

-- Check database size
SELECT pg_size_pretty(pg_database_size('mundo_tango'));

-- Check table sizes
SELECT 
  table_name, 
  pg_size_pretty(pg_total_relation_size(table_name::regclass))
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY pg_total_relation_size(table_name::regclass) DESC;
```

---

### **High Traffic Surge**:

**Symptoms**: Slow response times, timeouts

**Actions**:
1. Enable aggressive caching
2. Increase server resources
3. Enable rate limiting
4. Offload to CDN

```typescript
// Temporary rate limiting
app.use(rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10 // Reduce from 100 to 10
}));

// Increase cache TTL
redis.setex(key, 3600, value); // 1 hour instead of 5 minutes
```

---

### **Security Breach**:

**Immediate Actions**:
1. **Isolate**: Disconnect affected systems
2. **Assess**: Identify breach scope
3. **Notify**: Inform users if PII exposed
4. **Patch**: Fix vulnerability
5. **Review**: Conduct post-mortem

```bash
# Change all secrets immediately
# Revoke all JWT tokens
# Force password resets
# Review access logs
```

---

## 🔒 **BACKUP & RESTORE**

### **Automated Backups**:

```bash
# Daily database backup (automated)
pg_dump mundo_tango > /backups/db_$(date +%Y%m%d).sql

# Keep 30 days of backups
find /backups -name "db_*.sql" -mtime +30 -delete

# Backup to cloud storage
aws s3 cp /backups/db_$(date +%Y%m%d).sql s3://mundo-tango-backups/
```

### **Restore Procedures**:

```bash
# Restore from backup
psql mundo_tango < /backups/db_20251017.sql

# Restore specific table
pg_restore -t users /backups/db_20251017.sql

# Point-in-time recovery
# (requires WAL archiving - set up in production)
```

---

## 📊 **MONITORING DASHBOARDS**

### **Key Metrics to Watch**:

```typescript
// System Health
{
  server: {
    uptime: 864000, // seconds
    cpu: 45, // %
    memory: 65, // %
    disk: 30 // %
  },
  database: {
    connections: 15, // active
    queryTime: 120, // ms avg
    cacheHitRate: 0.85 // 85%
  },
  application: {
    requestsPerSecond: 50,
    responseTimeP95: 350, // ms
    errorRate: 0.02, // 2%
    activeUsers: 234
  },
  agents: {
    total: 276,
    active: 276,
    healthScore: 99.7 // %
  }
}
```

---

## 🎓 **BEST PRACTICES**

### **Before Making Changes**:
1. ✅ Create Replit checkpoint
2. ✅ Commit to GitHub
3. ✅ Test in development
4. ✅ Document the change
5. ✅ Have rollback plan

### **After Making Changes**:
1. ✅ Verify change works
2. ✅ Monitor for errors
3. ✅ Update documentation
4. ✅ Commit to GitHub
5. ✅ Create clean point checkpoint

### **Communication**:
- Notify users of planned maintenance
- Provide status updates during incidents
- Post-mortem after major issues
- Celebrate successful updates

---

## ✅ **MAINTENANCE CHECKLIST**

### **Daily**:
- [ ] Check error logs
- [ ] Review performance metrics
- [ ] Verify backups completed

### **Weekly**:
- [ ] Update security patches
- [ ] Review slow queries
- [ ] Test backup restore
- [ ] Clean up old sessions

### **Monthly**:
- [ ] Full dependency audit
- [ ] Security review
- [ ] Performance benchmarking
- [ ] Documentation review
- [ ] Cost optimization

### **Quarterly**:
- [ ] Major updates
- [ ] Disaster recovery drill
- [ ] External security audit
- [ ] Roadmap review

---

## 🚀 **AUTOMATION OPPORTUNITIES**

### **Already Automated**:
- ✅ Health checks
- ✅ Error logging
- ✅ Daily backups
- ✅ Security scans

### **Can Be Automated**:
- ⚠️ Dependency updates (Dependabot)
- ⚠️ Database vacuum
- ⚠️ Log rotation
- ⚠️ Cache invalidation
- ⚠️ Performance testing
- ⚠️ Backup verification

### **Should Stay Manual**:
- Manual testing after updates
- Security decisions
- User communication
- Architecture changes

---

## 📚 **DOCUMENTATION UPDATES**

**After every maintenance task**:
1. Update this file if procedure changed
2. Document lessons learned
3. Update runbooks for common issues
4. Share knowledge with team

---

## 📞 **EMERGENCY CONTACTS**

**Who to contact when**:
- **Server down**: Layer 50 (DevOps Agent) + Agent #0 (CEO)
- **Security breach**: Layer 49 (Security Agent) + Admin
- **Database issues**: Layer 5 (Database Agent)
- **High traffic**: Layer 48 (Performance Agent)

---

**Maintenance is ongoing - never complete, always improving!**

*For questions, consult Layer 50 (DevOps & Deployment Agent)*
