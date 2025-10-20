# TRACK 6 (S6): Production Runbook - Mundo Tango

**Created:** October 20, 2025  
**Purpose:** Deployment procedures, incident response, and production operations

## 🚀 Deployment Procedures

### Pre-Deployment Checklist
- [ ] All tests passing (E2E, integration, unit)
- [ ] Security audit complete (no critical vulnerabilities)
- [ ] Performance benchmarks met (Lighthouse >90)
- [ ] Database backup verified
- [ ] Rollback plan documented
- [ ] Monitoring dashboards ready
- [ ] On-call schedule confirmed

### Domain & SSL Setup

**Required:**
- Domain: `mundotango.com` (or similar)
- SSL Certificate: Let's Encrypt (auto-renew)
- DNS Provider: Cloudflare (recommended) or Route53

**DNS Configuration:**
```
Type    Name    Value                           TTL
A       @       <production-ip>                 300
A       www     <production-ip>                 300
CNAME   api     <backend-domain>                300
TXT     @       "v=spf1 include:_spf.mx ... ~all"  3600
```

**SSL Certificate (Certbot):**
```bash
sudo certbot --nginx -d mundotango.com -d www.mundotango.com
sudo certbot renew --dry-run  # Test auto-renewal
```

### Deployment Steps (Docker)

**1. Build Images**
```bash
# Frontend
docker build -f Dockerfile.frontend -t mundotango/frontend:latest .

# Backend
docker build -f Dockerfile.backend -t mundotango/backend:latest .

# Tag with version
docker tag mundotango/frontend:latest mundotango/frontend:v1.0.0
docker tag mundotango/backend:latest mundotango/backend:v1.0.0
```

**2. Push to Registry**
```bash
docker login
docker push mundotango/frontend:v1.0.0
docker push mundotango/backend:v1.0.0
```

**3. Deploy to Production**
```bash
# Pull latest images
docker-compose pull

# Stop old containers
docker-compose down

# Start new containers
docker-compose up -d

# Verify health
docker-compose ps
curl http://localhost/health
curl http://localhost:5000/api/health
```

**4. Database Migrations**
```bash
# IMPORTANT: Always backup first!
pg_dump mundotango > backup_$(date +%Y%m%d_%H%M%S).sql

# Run migrations
npm run db:push

# Verify migration
psql mundotango -c "SELECT * FROM information_schema.tables WHERE table_schema = 'public';"
```

### Blue-Green Deployment

**Setup:**
```bash
# Green (new version)
docker-compose -f docker-compose.green.yml up -d

# Test green environment
curl http://green.mundotango.com/health

# Switch traffic (nginx or load balancer)
# Update DNS or load balancer to point to green

# Monitor for 1 hour
# If stable, remove blue environment
# If issues, switch back to blue
```

### Rollback Procedure

**Immediate Rollback (< 5 minutes):**
```bash
# Option 1: Docker rollback
docker-compose down
docker-compose up -d mundotango/frontend:v0.9.0 mundotango/backend:v0.9.0

# Option 2: Database rollback
pg_restore -d mundotango backup_YYYYMMDD_HHMMSS.sql

# Option 3: DNS rollback (if using blue-green)
# Point DNS back to previous environment
```

---

## 🚨 Incident Response

### Severity Levels

**P0 - Critical (Response: Immediate)**
- Production down (500 errors, >50% traffic affected)
- Data loss or corruption
- Security breach
- Payment processing failure

**P1 - High (Response: <1 hour)**
- Partial outage (10-50% traffic affected)
- Performance degradation (>5s response times)
- Critical feature broken (auth, payments)

**P2 - Medium (Response: <4 hours)**
- Non-critical feature broken
- Minor performance issues
- UI bugs affecting user experience

**P3 - Low (Response: <24 hours)**
- Cosmetic issues
- Documentation updates
- Feature requests

### Incident Response Steps

**1. Detect (Monitoring Alerts)**
- Sentry error spike
- PostHog metric anomaly
- Uptime monitoring alert
- User reports

**2. Assess**
- Severity level (P0-P3)
- Impact scope (% users affected)
- Root cause hypothesis

**3. Communicate**
- Internal: Slack incident channel
- External: Status page update
- Stakeholders: Email/SMS notification

**4. Mitigate**
- P0: Immediate rollback or hotfix
- P1: Deploy fix within 1 hour
- P2-P3: Schedule fix in next release

**5. Resolve**
- Deploy permanent fix
- Verify resolution
- Update status page

**6. Post-Mortem**
- Document timeline
- Identify root cause
- Create action items
- Update runbook

### Common Issues & Solutions

**Issue: Database Connection Timeout**
```bash
# Check database health
docker-compose exec database pg_isready

# Restart database
docker-compose restart database

# Check connection pool
# Increase pool size in DATABASE_URL
# ?connection_limit=20
```

**Issue: High Memory Usage**
```bash
# Check memory
docker stats

# Restart backend (clears memory)
docker-compose restart backend

# Scale horizontally (if configured)
docker-compose up -d --scale backend=3
```

**Issue: Slow API Response**
```bash
# Check server logs
docker-compose logs backend --tail=100

# Check database slow queries
SELECT * FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;

# Enable query caching
# Add Redis or enable React Query cache
```

---

## 📊 Monitoring & Alerting

### Health Endpoints

**Server Health:**
```bash
GET /api/health
Response: { "status": "ok", "timestamp": "..." }
```

**Database Health:**
```bash
GET /api/health/db
Response: { "status": "connected", "latency": "5ms" }
```

**Integration Health:**
```bash
GET /api/integrations/status
Response: {
  "stripe": "connected",
  "sentry": "connected",
  "openai": "connected"
}
```

### Sentry Dashboards

**Error Tracking:**
- Error rate >1% → P1 alert
- Critical error → P0 alert
- Performance degradation (>2s) → P2 alert

**Custom Metrics:**
- User registrations/hour
- Payment success rate
- WebSocket connection count
- API response times (p50, p95, p99)

### Alert Rules

**Uptime Monitoring (UptimeRobot):**
- Check every 5 minutes
- Alert after 2 failed checks
- Notify: Email + SMS + Slack

**Performance Monitoring (Sentry):**
- LCP >2.5s → Warning
- FID >100ms → Warning
- Error rate >1% → Critical

---

## 🔒 Security Procedures

### SSL Certificate Renewal
```bash
# Auto-renewal (runs daily via cron)
0 0 * * * certbot renew --quiet

# Manual renewal
sudo certbot renew

# Verify expiry
echo | openssl s_client -servername mundotango.com -connect mundotango.com:443 2>/dev/null | openssl x509 -noout -dates
```

### Secrets Rotation
```bash
# Rotate every 90 days
# 1. Generate new secret
# 2. Update environment variable
# 3. Deploy new version
# 4. Revoke old secret
```

### Database Backups

**Automated Backups (Daily):**
```bash
#!/bin/bash
# /etc/cron.daily/backup-mundotango
DATE=$(date +%Y%m%d)
pg_dump mundotango | gzip > /backups/mundotango_$DATE.sql.gz
find /backups -name "mundotango_*.sql.gz" -mtime +30 -delete
```

**Restore from Backup:**
```bash
gunzip mundotango_20251020.sql.gz
psql mundotango < mundotango_20251020.sql
```

---

## 📞 On-Call Schedule

**Primary:** Engineering Lead  
**Secondary:** Backend Engineer  
**Escalation:** CTO

**Contact Methods:**
- Slack: #incidents channel
- Phone: Emergency only (P0)
- Email: For P1-P3

---

## 📝 Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-10-20 | Initial runbook created | Agent |
| TBD | Post-launch updates | Team |
