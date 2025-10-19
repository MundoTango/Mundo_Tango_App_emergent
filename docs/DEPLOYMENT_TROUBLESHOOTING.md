# Deployment Troubleshooting Guide
**Owner:** Layer #50 (DevOps Automation)  
**Created:** October 19, 2025  
**Purpose:** Comprehensive guide to diagnosing and fixing deployment failures

---

## 🚨 Common Deployment Failures

### 1. react-router-dom Resolution Error

**Symptoms:**
```
Build failed: "Could not resolve entry module 'react-router-dom'"
Missing or corrupted node_modules - npm install completed in 10s
Vite build is looking for react-router-dom but it should be bundled as part of the vendor chunk
```

**Root Cause:**
- Incomplete npm install (10 seconds = corrupted)
- Vite manualChunks configuration expects react-router-dom
- Package not actually installed despite being in package.json

**Solution:**
```bash
# 1. Clear npm cache and node_modules
rm -rf node_modules package-lock.json
npm cache clean --force

# 2. Reinstall dependencies (should take 30+ seconds)
npm install

# 3. Verify react-router-dom is installed
npm list react-router-dom
# Should show: react-router-dom@x.x.x

# 4. Test build locally
npm run build

# 5. If still failing, check vite.config.ts manualChunks
```

---

### 2. Autoscale Deployment Type Issues

**Symptoms:**
```
Build expects to be installed as a dependency
Your application has a production server (index-novite.ts) that imports Vite dependencies indirectly through routes
```

**Root Cause:**
- Autoscale deployment doesn't support complex build processes
- Backend imports frontend Vite dependencies
- Server architecture not compatible with Autoscale

**Solution:**
Switch to **Reserved VM** deployment type:

1. Go to Replit Deployment settings
2. Change from "Autoscale (GCE)" to "Reserved VM"
3. Reserved VM supports:
   - Real-time features (WebSocket, persistent connections)
   - Complex build processes
   - Server memory state
   - Long-running background jobs

**When to use each:**
- **Autoscale:** Simple stateless websites, static sites, basic APIs
- **Reserved VM:** Production apps with WebSocket, complex builds, server state (Mundo Tango needs this!)

---

### 3. Vite manualChunks Dependency Issues

**Symptoms:**
```
vite.config.ts expects dependencies in manualChunks but they're missing
Build fails with "cannot find module" errors
```

**Root Cause:**
vite.config.ts has hardcoded manualChunks that expect specific packages

**Solution:**
Update `vite.config.ts` to handle missing dependencies gracefully:

```typescript
manualChunks: (id) => {
  const node_modules = id.includes('node_modules');
  
  if (!node_modules) return;
  
  // Safely check if packages exist before chunking
  if (id.includes('react') || id.includes('react-dom')) {
    return 'react';
  }
  
  // Only chunk react-router-dom if it exists
  if (id.includes('react-router-dom')) {
    return 'react-router-dom';
  }
  
  // All other vendor code
  return 'vendor';
}
```

---

### 4. Missing Environment Variables

**Symptoms:**
```
Build succeeds but deployment crashes
"Missing required environment variable" errors in logs
```

**Solution:**
```bash
# Check which env vars are required
grep -r "process.env\." server/ client/

# Add to Replit Secrets (NOT .env file for production):
# 1. Open Replit Secrets panel
# 2. Add each required variable
# 3. Redeploy
```

---

### 5. Database Connection Failures

**Symptoms:**
```
Deployment starts but immediately crashes
"Cannot connect to database" in logs
```

**Solution:**
1. Check DATABASE_URL is set in Replit Secrets
2. Verify database is running (Replit Database pane)
3. Test connection:
```bash
npm run db:push --force
```

---

## 🔍 Deployment Diagnostics Checklist

### Pre-Deployment Checks

- [ ] **Dependencies installed:** `npm list` shows no missing packages
- [ ] **Build succeeds locally:** `npm run build` completes without errors
- [ ] **Environment variables set:** All required secrets in Replit Secrets panel
- [ ] **Database migrated:** `npm run db:push` succeeded
- [ ] **TypeScript compiles:** No `tsc` errors
- [ ] **Deployment type correct:** Reserved VM for Mundo Tango (not Autoscale)

### During Deployment

- [ ] **Build logs show success:** No "Module not found" errors
- [ ] **Deployment completes:** Reaches "Deployment successful" message
- [ ] **Health check passes:** App responds to HTTP requests

### Post-Deployment

- [ ] **App loads in browser:** No blank screen or errors
- [ ] **WebSocket connects:** Real-time features working
- [ ] **Database accessible:** Data loads correctly
- [ ] **Authentication works:** Users can log in

---

## 🛠️ Deployment Recovery Procedures

### If Deployment Fails Mid-Build

```bash
# 1. Stop the deployment
# 2. Clear Replit cache
# 3. Reinstall dependencies
rm -rf node_modules package-lock.json .next .vite
npm cache clean --force
npm install

# 4. Test build locally
npm run build

# 5. Retry deployment
```

### If Deployment Succeeds But App Crashes

```bash
# 1. Check deployment logs
# 2. Verify environment variables
# 3. Test database connection
# 4. Check for missing dependencies

# 5. Rollback if needed (use Replit Deployments history)
```

---

## 📊 Deployment Performance

**Expected Build Times:**
- npm install: 30-60 seconds (if 10s = corrupted!)
- TypeScript compile: 15-30 seconds
- Vite build: 20-40 seconds
- Total deployment: 2-3 minutes

**If deployment takes >5 minutes:**
- Check for network issues
- Verify no circular dependencies
- Review build configuration

---

## 🚀 Production Deployment Best Practices

1. **Test locally first:** Always run `npm run build` locally
2. **Use Reserved VM:** For Mundo Tango's architecture
3. **Monitor deployments:** Watch logs during deployment
4. **Keep dependencies minimal:** Reduce build time
5. **Version control:** Tag releases before deploying
6. **Rollback plan:** Know how to revert to previous deployment

---

## 📝 Related Documentation

- `DEPENDENCY_MANAGEMENT.md` - Managing npm packages
- `REPLIT_DEPLOYMENT_PATTERNS.md` - Replit-specific deployment
- `PREVENTION_GUIDE.md` - Preventing deployment failures
- `NPM_CORRUPTION_INCIDENT_REPORT.md` - Known npm issues

---

**Last Updated:** October 19, 2025  
**Maintained By:** Layer #50 (DevOps Automation)
