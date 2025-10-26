# Production Deployment Checklist

**Mundo Tango ESA LIFE CEO Platform**  
**Target: 100% Production-Ready Status**

---

## 🎯 Pre-Deployment Validation (MUST COMPLETE)

### ✅ **STREAM 1: Observability**
- [ ] Set `ENABLE_OBSERVABILITY=true` in environment
- [ ] Add `GRAFANA_API_KEY` secret
- [ ] Add `GRAFANA_INSTANCE_ID` secret
- [ ] Add `GRAFANA_ENDPOINT` (default: `https://otlp-gateway-prod-us-central-0.grafana.net/otlp`)
- [ ] Verify metrics are being exported (check Grafana Cloud)
- [ ] Verify traces are being collected (check Jaeger)
- [ ] Set up cost spike alerts (>$10/session)
- [ ] Set up latency alerts (p95 >3s)
- [ ] Test Grafana dashboard access

**Verification Command:**
```bash
curl http://localhost:5000/api/health | grep -i observability
```

---

### ✅ **STREAM 2: Human Approval Gates**
- [ ] Test approval request creation for file deletion
- [ ] Test approval request creation for package.json edit
- [ ] Verify ApprovalModal UI displays correctly
- [ ] Test approval workflow (admin approves operation)
- [ ] Test rejection workflow (admin rejects operation)
- [ ] Verify pending requests expire after timeout
- [ ] Test approval queue cleanup (max 100 requests)
- [ ] Verify only super admins can approve/reject

**Verification Command:**
```bash
npm run test:integration -- approval-flow.test.ts
```

---

### ✅ **STREAM 3: Terminal Security**
- [ ] Verify generic "npm run" is blocked
- [ ] Test whitelisted commands execute successfully
- [ ] Test blacklisted commands are blocked
- [ ] Verify audit trail captures all executions
- [ ] Test risk assessment accuracy
- [ ] Verify failed commands are logged
- [ ] Test high-risk command identification
- [ ] Review audit statistics dashboard

**Verification Command:**
```bash
npm run test:integration -- terminal-security.test.ts
```

---

### ✅ **STREAM 4: E2E Testing**
- [ ] Install Playwright: `npm install -D @playwright/test`
- [ ] Run full E2E suite: `npm run test:e2e`
- [ ] Verify point→select workflow passes
- [ ] Verify chat→apply workflow passes
- [ ] Verify save→git commit workflow passes
- [ ] Test error recovery scenarios
- [ ] Verify WCAG AA compliance passes
- [ ] Test keyboard navigation
- [ ] Verify performance tests (<3s load time)
- [ ] Test responsive preview switching

**Verification Command:**
```bash
npx playwright test tests/e2e/visual-editor.spec.ts --headed
```

---

### ✅ **STREAM 5: Accessibility**
- [ ] Run axe-core accessibility scan
- [ ] Verify no WCAG AA violations
- [ ] Test keyboard navigation (Tab, Arrow keys, Enter, Esc)
- [ ] Test screen reader (NVDA on Windows / VoiceOver on Mac)
- [ ] Verify all interactive elements have ARIA labels
- [ ] Test focus indicators are visible
- [ ] Verify color contrast ratios meet WCAG AA
- [ ] Test with assistive technologies

**Verification Command:**
```bash
npm run test:a11y
```

---

## 🔒 Security Checklist

### Authentication & Authorization
- [ ] JWT_SECRET is strong (32+ characters random)
- [ ] JWT_REFRESH_SECRET is set (different from JWT_SECRET)
- [ ] Session timeout is configured (default: 7 days)
- [ ] Super admin role verification is enforced
- [ ] RBAC/ABAC policies are active

### API Security
- [ ] Rate limiting is enabled
- [ ] CORS is configured correctly
- [ ] Input validation (Zod) on all endpoints
- [ ] SQL injection protection (Drizzle ORM)
- [ ] XSS protection headers set
- [ ] CSRF protection enabled

### Data Protection
- [ ] Database backups configured (PostgreSQL)
- [ ] Object storage backups enabled (Replit)
- [ ] .env file is in .gitignore
- [ ] Secrets are in environment variables (not code)
- [ ] PII filtering is active in logs

### Terminal & File Safety
- [ ] YOLO mode is OFF by default (`ENABLE_YOLO_MODE=false`)
- [ ] File edit backups are enabled
- [ ] Terminal allow-list is enforced
- [ ] High-risk operations require approval
- [ ] Audit trail is logging all commands

---

## 🚀 Performance Checklist

### Latency Targets
- [ ] p50 latency <1s (median response time)
- [ ] p95 latency <3s (95th percentile)
- [ ] p99 latency <5s (99th percentile)
- [ ] AI response streaming starts <2s
- [ ] Visual Editor load time <3s

**Measurement:**
```bash
npm run benchmark:performance
```

### Cost Targets
- [ ] Average cost per session <$5
- [ ] Cost spike alerts configured (>$10/session)
- [ ] Multi-model orchestration active (Claude/GPT-4/Gemini)
- [ ] Token usage tracking operational
- [ ] Cost dashboard accessible in Grafana

### Autonomous Runtime
- [ ] Target: 60 minutes minimum autonomous runtime
- [ ] Goal: 200 minutes (Replit Agent 3 level)
- [ ] Self-testing loops functional (max 20 iterations)
- [ ] Self-healing triggers on failure
- [ ] Checkpointing every 10 minutes

---

## 📊 Monitoring & Alerting

### Required Dashboards (Grafana)
- [ ] Latency Dashboard (p50, p95, p99)
- [ ] Cost Tracking Dashboard (per session, total)
- [ ] Error Rate Dashboard (4xx, 5xx by endpoint)
- [ ] Autonomous Runtime Dashboard (duration, success rate)
- [ ] User Activity Dashboard (active users, sessions)

### Required Alerts
- [ ] Cost spike alert (>$10/session) → Slack/Email
- [ ] Latency degradation (p95 >3s) → Slack/Email
- [ ] Error rate spike (>5%) → Slack/Email
- [ ] Database connection failure → PagerDuty
- [ ] Server downtime → PagerDuty

### Health Checks
- [ ] `/api/health` endpoint returns 200
- [ ] Database connectivity check passes
- [ ] Redis connectivity check passes (if enabled)
- [ ] Object storage connectivity check passes
- [ ] AI model API connectivity check passes

---

## 🌐 Deployment Steps

### 1. Pre-Flight Validation
```bash
# Run all tests
npm run test:unit
npm run test:integration
npm run test:e2e

# Check TypeScript
npm run typecheck

# Check linting
npm run lint

# Run security audit
npm audit --audit-level=moderate
```

### 2. Database Migration
```bash
# Dry run to see what will change
npm run db:push --dry-run

# Apply schema changes
npm run db:push --force

# Verify migration success
npm run db:verify
```

### 3. Environment Configuration
```bash
# Set production environment
export NODE_ENV=production

# Verify all secrets are set
npm run verify:secrets

# Test database connection
npm run test:db
```

### 4. Deploy to Production
```bash
# Build production assets
npm run build

# Start production server
npm run start:production

# Verify deployment health
curl https://your-domain.com/api/health
```

### 5. Post-Deployment Validation
```bash
# Smoke test critical paths
npm run test:smoke

# Check observability
# → Verify metrics in Grafana
# → Verify traces in Jaeger

# Monitor for 30 minutes
# → Watch error logs
# → Monitor latency dashboards
# → Check cost tracking
```

---

## 🔄 Rollback Plan

### Automatic Rollback Triggers
- Server fails health check 3 times in 5 minutes
- Error rate exceeds 10% for 2 minutes
- p95 latency exceeds 10s for 2 minutes
- Database connection lost

### Manual Rollback Steps
```bash
# 1. Identify last known good commit
git log --oneline -10

# 2. Rollback to previous version
git revert <commit-hash>

# 3. Redeploy
npm run deploy:production

# 4. Verify health
curl https://your-domain.com/api/health
```

### Database Rollback
```bash
# Restore from latest backup
npm run db:restore --backup=<timestamp>

# Verify data integrity
npm run db:verify
```

---

## 📈 Success Metrics (First 7 Days)

### Stability
- [ ] Uptime >99.5%
- [ ] Zero critical incidents
- [ ] Error rate <1%
- [ ] Average latency <2s

### Functionality
- [ ] Visual Editor used by >10 users
- [ ] Approval flow tested in production
- [ ] Terminal commands executed safely
- [ ] Zero security incidents

### Performance
- [ ] Average session cost <$3
- [ ] Autonomous runtime >60 minutes
- [ ] Self-healing success rate >90%
- [ ] User satisfaction score >4.5/5

---

## 🆘 Emergency Contacts

| Role | Contact | Availability |
|------|---------|--------------|
| Platform Lead | your-email@mundotango.life | 24/7 |
| DevOps Engineer | devops@mundotango.life | 24/7 |
| Database Admin | dba@mundotango.life | Business hours |
| Security Team | security@mundotango.life | 24/7 |

---

## 📝 Sign-Off

Once all checklist items are complete:

**Validated by:**
- [ ] Tech Lead: _________________ Date: _______
- [ ] QA Engineer: ______________ Date: _______
- [ ] Security Lead: _____________ Date: _______
- [ ] Product Owner: ____________ Date: _______

**Production Deployment Approved:** ☐ YES  ☐ NO

**Deployment Date/Time:** _______________  
**Deployed by:** _______________

---

*Last Updated: October 26, 2025*  
*Version: 1.0 (MB.MD Phase 3)*
