# 🚀 PRODUCTION DEPLOYMENT GUIDE - MUNDO TANGO
**Created:** Week 4-6 (October 24, 2025)  
**Status:** Production-Ready  

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### ✅ **Environment Configuration**
- [ ] Copy `.env.production.example` to `.env.production`
- [ ] Fill in all production API keys and secrets
- [ ] Configure DATABASE_URL with production database
- [ ] Set CORS_ORIGIN to production domain
- [ ] Generate secure SESSION_SECRET (min 32 chars)

### ✅ **Security Hardening**
- [ ] Enable HTTPS/SSL certificate
- [ ] Configure rate limiting (100 req/15min)
- [ ] Enable CSRF protection
- [ ] Set secure cookie options (`secure: true`, `sameSite: 'strict'`)
- [ ] Disable development error messages
- [ ] Enable Helmet.js security headers

### ✅ **Database Migration**
- [ ] Run database migrations: `npm run db:push`
- [ ] Verify schema matches production requirements
- [ ] Create database backups schedule
- [ ] Test database connection in production

### ✅ **Monitoring Setup**
- [ ] Configure Sentry for error tracking
- [ ] Enable PostHog analytics
- [ ] Set up OpenReplay session replay
- [ ] Configure Plausible Analytics
- [ ] Set up uptime monitoring (e.g., UptimeRobot)

### ✅ **Performance Optimization**
- [ ] Enable production build: `npm run build:production`
- [ ] Configure CDN for static assets
- [ ] Enable compression middleware
- [ ] Set `NODE_ENV=production`
- [ ] Optimize images and media
- [ ] Enable browser caching headers

### ✅ **Testing**
- [ ] Run full test suite: `npm test`
- [ ] Test all critical user journeys
- [ ] Load test with production data
- [ ] Verify mobile responsiveness
- [ ] Test payment flows (if applicable)
- [ ] Verify email/SMS delivery

---

## 🔧 DEPLOYMENT STEPS

### **Step 1: Build Application**
```bash
npm run build:production
```

This will:
- Build frontend with Vite
- Bundle server with esbuild
- Prune dev dependencies
- Clean npm cache

### **Step 2: Database Setup**
```bash
# Run migrations
npm run db:push

# Verify connection
node -e "import('./dist/index.js')"
```

### **Step 3: Start Production Server**
```bash
npm start
```

Server runs on port 5000 by default.

### **Step 4: Configure Reverse Proxy**

**Nginx Example:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### **Step 5: Enable SSL**
```bash
# Using Let's Encrypt (Certbot)
sudo certbot --nginx -d your-domain.com
```

---

## 📊 MONITORING & MAINTENANCE

### **Health Checks**
- **Endpoint:** `/api/health`
- **Expected Response:** `200 OK` with system status

### **Error Tracking (Sentry)**
- Dashboard: https://sentry.io
- Alert on errors > 10/hour
- Weekly digest enabled

### **Performance Monitoring (PostHog)**
- Dashboard: https://app.posthog.com
- Track: Page views, user sessions, feature usage
- Alerts: Performance degradation

### **Session Replay (OpenReplay)**
- Dashboard: https://app.openreplay.com
- Capture: User sessions, errors, rage clicks
- Privacy: Sanitize sensitive data

### **Database Backups**
- **Frequency:** Daily at 2 AM UTC
- **Retention:** 30 days
- **Location:** Encrypted cloud storage
- **Test Restores:** Monthly

---

## 🚨 ROLLBACK PROCEDURES

### **Immediate Rollback (< 1 hour)**
```bash
# Revert to previous deployment
git revert HEAD
npm run build:production
npm start
```

### **Database Rollback**
```bash
# Restore from snapshot
curl -X POST http://localhost:5000/api/mrblue/autonomous/restore-snapshot/SNAPSHOT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **Emergency Maintenance Mode**
```bash
# Enable maintenance mode
export MAINTENANCE_MODE=true
npm start
```

---

## 📈 SCALING STRATEGIES

### **Vertical Scaling (Single Server)**
- **CPU:** 4+ cores
- **RAM:** 8GB+ recommended
- **Storage:** SSD 50GB+

### **Horizontal Scaling (Multiple Servers)**
1. **Load Balancer:** Nginx/HAProxy
2. **Session Store:** Redis for shared sessions
3. **Database:** PostgreSQL with read replicas
4. **File Storage:** Replit Object Storage (already configured)

### **Performance Targets**
- **Page Load:** < 2 seconds (95th percentile)
- **API Response:** < 200ms (p95)
- **Uptime:** 99.9% (43 minutes downtime/month)
- **Error Rate:** < 0.1%

---

## 🔐 SECURITY BEST PRACTICES

### **API Rate Limiting**
- General: 100 requests/15 minutes per IP
- Authentication: 5 failed attempts/hour per IP
- Autonomous Mode: 10 requests/minute per user

### **Input Validation**
- All API inputs validated with Zod schemas
- SQL injection protection (Drizzle ORM)
- XSS prevention (sanitized outputs)
- CSRF tokens on all mutations

### **Secrets Management**
- Never commit secrets to Git
- Use environment variables
- Rotate secrets quarterly
- Use Replit Secrets for sensitive data

---

## 📝 POST-DEPLOYMENT VERIFICATION

### **Critical Checks (First 24 Hours)**
- [ ] Homepage loads correctly
- [ ] User authentication works
- [ ] Database queries successful
- [ ] No 500 errors in logs
- [ ] Payment processing working (if enabled)
- [ ] Email delivery functional
- [ ] Mobile app responsive
- [ ] WebSocket connections stable
- [ ] Search functionality working
- [ ] File uploads successful

### **Performance Checks**
- [ ] Server response time < 200ms
- [ ] Memory usage < 80%
- [ ] CPU usage < 70%
- [ ] No memory leaks
- [ ] Cache hit rate > 80%

### **Monitoring Alerts Setup**
- [ ] Error rate > 1%
- [ ] Response time > 1 second
- [ ] Database connection failures
- [ ] Disk space < 10GB
- [ ] Memory usage > 90%

---

## 🎯 PRODUCTION OPTIMIZATION CHECKLIST

### **Frontend**
- [x] Vite production build enabled
- [x] Code splitting implemented
- [x] Lazy loading for routes
- [x] Image optimization
- [x] Font optimization
- [x] CSS minification
- [x] JavaScript minification
- [x] Tree shaking enabled

### **Backend**
- [x] Compression middleware enabled
- [x] Database connection pooling
- [x] Query optimization
- [x] Response caching
- [x] Static file caching
- [x] Gzip compression
- [x] HTTP/2 enabled

### **Database**
- [x] Indexes on foreign keys
- [x] Query optimization
- [x] Connection pooling (50 max)
- [x] Read replicas (if needed)
- [x] Automated backups

---

## 📞 SUPPORT & TROUBLESHOOTING

### **Common Issues**

**1. Server Won't Start**
```bash
# Check logs
tail -f logs/production.log

# Verify environment
node -e "console.log(process.env.DATABASE_URL)"

# Test database connection
psql $DATABASE_URL
```

**2. High Memory Usage**
```bash
# Check Node.js heap usage
node --expose-gc dist/index.js

# Enable garbage collection
NODE_OPTIONS="--max-old-space-size=2048 --expose-gc"
```

**3. Database Connection Errors**
```bash
# Verify connection
psql $DATABASE_URL

# Check connection pool
SELECT count(*) FROM pg_stat_activity;
```

---

## 🎓 DEPLOYMENT TIMELINE

**Week 4:** Environment setup, monitoring, security
**Week 5:** Performance optimization, load testing
**Week 6:** Final validation, production deployment

**Status:** ✅ **READY FOR PRODUCTION**

---

**Agent Responsible:**
- Agent #127 (Deployment Safety Engineer)
- Agent #50 (DevOps Automation)
- Agent #48 (Performance Monitoring)
