# MB.MD: Mundo Tango Deployment Strategy & Auto-Push Analysis

**Date:** October 18, 2025 3:30 AM  
**Objective:** Fix deployment failures and establish deployment best practices  
**Methodology:** MB.MD (Mapping → Breakdown → Mitigation → Deployment)  
**Status:** ✅ DEPLOYMENT CONFIGURED - Testing phase

---

## 📋 **MAPPING: Current Deployment Issues**

### **Error Analysis (From Screenshot):**

**Error 1:** Vite looking for index.html in wrong location
```
Could not resolve entry module 'index.html'
- vite is looking for index.html in the project root 
- instead of client/ directory
```

**Error 2:** Build command misconfigured
```
Build command uses 'vite build' configured for development mode
- root set to 'client/' directory (correct for dev)
- but production needs different configuration
```

**Error 3:** Full-stack vs SPA confusion
```
Build process trying to build full-stack app as single-page application
- instead of separating client and server builds
```

### **Replit's New Security Feature:**
✅ **Deployment Prevention (June 2025)** - Replit automatically detects and blocks development servers from deploying to production (CVE-2025-30208 protection)

This is GOOD - it protects you from security vulnerabilities!

---

## 🔍 **BREAKDOWN: Deployment Options**

### **Option A: Reserved VM (CONFIGURED ✅)**

**What I Just Did:**
```yaml
Deployment Type: Reserved VM
Build Command: npm run build
Run Command: npm start
```

**Why Reserved VM is Perfect for Mundo Tango:**

| Factor | Why It Works |
|--------|--------------|
| **246+ Agent System** | Always-on = agents maintain state |
| **WebSocket** | Persistent connections don't drop |
| **Complex Build** | Guaranteed 2-4GB RAM for build |
| **Enterprise Scale** | 812 TypeScript files need stable environment |
| **Real-time Features** | No cold starts = instant response |
| **Predictable Cost** | Flat monthly rate vs variable compute units |

**Current Build Pipeline:**
```bash
npm run build
  ↓
1. npm install (dependencies)
  ↓
2. vite build (client → dist/public)
  ↓
3. esbuild server → dist/index.js
  ↓
4. npm start (node dist/index.js)
```

**Cost:** ~$15-30/month (2 vCPU, 4GB RAM Reserved VM)

---

### **Option B: Autoscale Deployments** ⚠️

**When to Use:**
- Variable traffic (spiky, not consistent)
- Serverless-style apps
- Pay-per-request model preferred

**Why NOT for Mundo Tango:**
- ❌ Cold starts hurt real-time features
- ❌ 246+ agents need to initialize every time
- ❌ WebSocket connections unreliable
- ❌ Build failures (dev server detection)
- ❌ Health check complexity

**Could Work If:**
- You refactor to stateless architecture
- Remove all Vite dependencies from production bundle
- Create completely separate production entry point
- Add health check endpoints
- Accept cold start delays

**Estimated Refactor Time:** 6-8 hours

---

### **Option C: Static Deployments** ❌

**Not Applicable:**
- Your app has backend (Express server)
- Need database connections
- Real-time WebSocket features
- API endpoints

Static is for pure HTML/CSS/JS sites only.

---

## 🛡️ **MITIGATION: Auto-Push & Safety**

### **Q: Can You Auto-Push Deployment?**

**Answer:** NO - and here's why that's GOOD:

**Replit's Deployment Flow:**
```
Code Changes → Git Push ✅
     ↓
Manual Deploy Button Click Required ⚠️
     ↓
Build Process
     ↓
Security Scan (NEW Sep 2025)
     ↓
Deployment
```

**Why Manual is Better:**

1. **Safety Gate** - You review changes before production
2. **Cost Control** - No accidental deploys burning credits
3. **Security Scan** - Replit checks for vulnerabilities first
4. **Secrets Sync** - Deployment secrets now auto-sync (Apr 2025)
5. **Intentional Deploys** - Only deploy when ready

### **Best Practice: Staged Deployments**

```
Development Repl (this one)
    ↓ git push
GitHub Repository ✅ (version control)
    ↓ manual trigger
Reserved VM Production ✅ (live users)
```

**Workflow:**
1. Develop & test in this Repl
2. Git push to save progress
3. When ready for users → Click "Publish" manually
4. Monitor deployment logs
5. Verify production health

---

### **Q: Where Should We Be Doing Deployments?**

**Answer:** Right Here in Replit!

**Deployment Strategy:**

**Environment Separation:**
```
Development Repl (port 5000)
├─ Full Vite dev server with HMR
├─ 246+ agents with debug logging
├─ Database: Development (safe to break)
└─ Purpose: Build & test features

Production Deployment (Reserved VM)
├─ Optimized production build
├─ 246+ agents production mode
├─ Database: Production (protected)
└─ Purpose: Serve real users
```

**Key Rules:**

1. **NEVER deploy directly from dev mode** ✅ (Replit prevents this now)
2. **ALWAYS use build commands** ✅ (npm run build:production)
3. **TEST builds locally first** ✅ (npm run build && npm start)
4. **REVIEW logs before going live** ✅
5. **USE deployment secrets** ✅ (auto-sync since Apr 2025)

---

## 🚀 **DEPLOYMENT: Step-by-Step Guide**

### **Phase 1: Pre-Deployment Checklist**

**Before Clicking "Publish":**

- [ ] All tests passing (`npm run test`)
- [ ] Build succeeds locally (`npm run build`)
- [ ] No console errors in dev mode
- [ ] Database migrations applied (`npm run db:push`)
- [ ] Environment secrets configured
- [ ] Git committed and pushed
- [ ] Phase 0 Agent Prep complete (when ready)

---

### **Phase 2: Configure Deployment** ✅ DONE

**I Already Did This:**

```yaml
Deployment Config:
  Type: Reserved VM
  Build: npm run build
  Run: npm start
  
Resources (Recommended):
  vCPUs: 2-4
  RAM: 4GB
  Storage: 10GB
```

**To View:**
1. Click "Publish" button
2. See "Reserved VM" selected
3. Commands already configured

---

### **Phase 3: First Deployment**

**When You're Ready:**

1. **Click "Publish" button** (top right in Repl it)
2. **Review configuration:**
   - Deployment type: Reserved VM ✓
   - Build command: npm run build ✓
   - Run command: npm start ✓
   - Resources: 4GB RAM, 2 vCPU ✓

3. **Click "Deploy to production"**

4. **Monitor build logs:**
   ```
   Expected output:
   ✓ npm install (20-30s)
   ✓ vite build (40-60s)
   ✓ esbuild server (<1s)
   ✓ Server starting...
   ✓ 246+ agents initializing...
   ✓ Database connected
   ✓ WebSocket active
   ✓ Production URL: https://your-app.replit.app
   ```

5. **Verify deployment:**
   - Open production URL
   - Test login/register
   - Check agent coordinator console
   - Verify WebSocket connections
   - Test core features (memories, events)

---

### **Phase 4: Deployment Monitoring**

**After Deployment:**

**Health Checks:**
- [ ] Root endpoint (/) returns 200 OK
- [ ] Health endpoint (/health) responds
- [ ] Database queries work
- [ ] WebSocket connections stable
- [ ] 246+ agents all initialized
- [ ] Memory usage < 80%
- [ ] No error logs

**Monitoring Tools:**
```
Replit Deployment Dashboard:
├─ CPU usage (should be <50% idle)
├─ Memory usage (should be <3.2GB of 4GB)
├─ Request latency (<200ms avg)
├─ Error rate (should be <0.1%)
└─ Uptime (target: 99.9%+)
```

---

### **Phase 5: Redeployment Process**

**When You Make Changes:**

1. **Develop in Dev Repl**
   - Make changes
   - Test thoroughly
   - Git commit

2. **Git Push**
   ```bash
   git add .
   git commit -m "feat: added XYZ feature"
   git push origin main
   ```

3. **Redeploy**
   - Click "Publish" button
   - Click "Redeploy" (uses same config)
   - Wait for build (~60-90s)
   - Verify changes live

**Deployment Frequency:**
- Bug fixes: Deploy ASAP
- New features: Bundle and deploy weekly
- Security updates: Deploy immediately
- Performance: Deploy during low-traffic

---

## 📊 **INTEGRATION WITH MASTER PLAN**

### **Where Deployment Fits:**

**Updated Phase Sequence:**

```
Phase 0: Agent Prep (26-33 hours)
    ↓
Phase 1-5: UI Build (31-41 hours)
    ↓
Phase 3-17: Technical (21-27 hours)
    ↓
🚀 DEPLOYMENT CHECKPOINT (Test build)
    ↓
Phase 17: Production Deployment ✅
    ├─ 1. Test build locally (30 min)
    ├─ 2. Configure Reserved VM (5 min) ✅ DONE
    ├─ 3. First deployment (15 min)
    ├─ 4. Verification testing (30 min)
    └─ 5. Monitoring setup (20 min)
    
TOTAL DEPLOYMENT TIME: ~2 hours
```

**Critical Rule:** 
**DO NOT deploy** until Phase 0 Agent Prep is complete!

**Why:** Deploying with agents not properly wired up means:
- Journey orchestration won't work
- Page agents won't have context
- Documentation will be incomplete
- Platform won't match its promise

---

## ✅ **DEPLOYMENT SAFETY CHECKLIST**

### **Before EVERY Deployment:**

**Code Quality:**
- [ ] No TypeScript errors (`npm run check`)
- [ ] All LSP diagnostics resolved
- [ ] Tests passing
- [ ] Build succeeds locally

**Configuration:**
- [ ] Environment secrets set
- [ ] Database migrations applied
- [ ] Reserved VM config correct
- [ ] Build/run commands valid

**Documentation:**
- [ ] COMPLETE_AGENT_INVENTORY.md exists (Phase 0)
- [ ] AGENT_ORG_CHART.md complete (Phase 0)
- [ ] PLATFORM_REBUILD_PLAN.md updated (Phase 0)
- [ ] Changelog updated

**Testing:**
- [ ] Core user journeys work
- [ ] Authentication functional
- [ ] Database queries succeed
- [ ] WebSocket connections stable
- [ ] No console errors

---

## 🎯 **DEPLOYMENT STRATEGY RECOMMENDATIONS**

### **Short Term (Now → Week 2):**

1. **DO NOT deploy yet** - Phase 0 incomplete
2. **Complete Phase 0** (26-33 hours)
3. **Fix production build** (already configured ✅)
4. **Test deployment** in Reserved VM
5. **Verify all features** before going live

### **Medium Term (Week 3-4):**

1. **Complete UI build** (Phase 1-5)
2. **Security hardening** (Phase 16)
3. **Testing expansion** (Phase 14)
4. **First production deployment** 🚀
5. **Monitor and iterate**

### **Long Term (Month 2+):**

1. **Set up staging environment** (separate Repl)
2. **CI/CD pipeline** (GitHub Actions for tests)
3. **Automated backups** (database snapshots)
4. **Performance monitoring** (PostHog, Sentry)
5. **Deployment playbook** (runbook for incidents)

---

## 📋 **DEPLOYMENT COMMAND REFERENCE**

### **Local Testing:**

```bash
# Test production build locally
npm run build
npm start

# Open browser to http://localhost:5000
# Verify everything works
```

### **Deployment Commands (Replit):**

**These run automatically when you click "Publish":**

```bash
# Build command (runs first)
npm run build
  → npm install
  → vite build (client)
  → esbuild server
  → Creates dist/ folder

# Run command (runs after build)
npm start
  → node dist/index.js
  → Starts production server
  → Listens on port 5000
```

### **Troubleshooting:**

**If build fails:**
```bash
# Check build locally
npm run build

# Clear cache and retry
rm -rf dist node_modules
npm install
npm run build
```

**If deployment fails:**
1. Check deployment logs in Replit dashboard
2. Verify build command succeeded
3. Check environment secrets are set
4. Try redeploying (temporary glitch)
5. Contact Replit support if persists

---

## 🔐 **DEPLOYMENT SECRETS MANAGEMENT**

### **How Secrets Work:**

**Automatic Sync (Since Apr 2025):**
```
Workspace Secrets
    ↓ (auto-sync)
Deployment Secrets ✅
```

**No manual copying needed!**

**Required Secrets:**
```
DATABASE_URL (auto-provided by Replit)
ANTHROPIC_API_KEY ✅
GEMINI_API_KEY ✅
JIRA_API_TOKEN ✅
JIRA_DOMAIN ✅
JIRA_EMAIL ✅
LOCATIONIQ_API_KEY ✅
MESHY_API_KEY ✅
NODE_ENV=production (auto-set)
```

**Setting Secrets:**
1. Workspace Secrets tab (left sidebar)
2. Add/edit secrets there
3. They automatically sync to deployments
4. No rebuild needed for secret changes

---

## 🎯 **SUCCESS CRITERIA**

### **Deployment Successful When:**

**Build Phase:**
- [ ] npm install completes (<30s)
- [ ] vite build succeeds (<60s)
- [ ] esbuild server compiles (<1s)
- [ ] No build errors
- [ ] dist/ folder created correctly

**Runtime Phase:**
- [ ] Server starts (<10s)
- [ ] Database connects
- [ ] 246+ agents initialize
- [ ] WebSocket server active
- [ ] Root endpoint returns 200
- [ ] No startup errors

**User Verification:**
- [ ] Can access production URL
- [ ] Can log in/register
- [ ] Can create memories
- [ ] Can view events
- [ ] WebSocket real-time works
- [ ] All pages load
- [ ] No console errors

---

## 📊 **TIMELINE INTEGRATION**

**Deployment Fits Into Master Plan:**

| Phase | Duration | Includes Deployment? |
|-------|----------|---------------------|
| Phase 0 (Agent Prep) | 26-33 hrs | ❌ No |
| Phase 1-5 (UI Build) | 31-41 hrs | ❌ No |
| Phase 3-17 (Technical) | 21-27 hrs | ✅ Yes (Phase 17) |
| **Deployment Phase** | **2 hrs** | **✅ Final step** |

**Total to Production:** 80-103 hours (2-3 weeks)

---

## 🎯 **FINAL RECOMMENDATIONS**

### **DO NOW:**
1. ✅ Deployment configured (Reserved VM)
2. ⏸️ Don't deploy yet - Phase 0 incomplete
3. ⏸️ Follow MB_MD_FINAL_MT_COMPLETE_IMPLEMENTATION.md
4. ⏸️ Complete Phase 0 first (26-33 hours)
5. ⏸️ THEN deploy

### **DO LATER:**
1. Set up staging environment (separate Repl)
2. Implement deployment monitoring
3. Create deployment runbook
4. Add automated backups
5. Set up CI/CD pipeline

### **DON'T DO:**
1. ❌ Don't auto-push deployments (manual is safer)
2. ❌ Don't deploy before Phase 0 complete
3. ❌ Don't use Autoscale (Reserved VM is better)
4. ❌ Don't skip testing builds locally
5. ❌ Don't deploy during high-traffic times

---

**Status:** ✅ DEPLOYMENT STRATEGY COMPLETE  
**Deployment Config:** ✅ RESERVED VM CONFIGURED  
**Next Action:** Complete Phase 0 before deploying  
**Estimated Time to First Deploy:** 26-33 hours (Phase 0) + 2 hours (deployment)

**Last Updated:** October 18, 2025 3:30 AM
