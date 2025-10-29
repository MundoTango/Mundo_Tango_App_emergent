# 🛡️ NPM Corruption Prevention Guide

**Last Updated:** October 16, 2025  
**Created After:** Critical npm ecosystem failure that blocked user access to Mundo Tango

---

## 🎯 Purpose

This guide ensures **NEVER AGAIN** will npm corruption prevent users from accessing their application. Every agent must follow these protocols.

---

## 📋 Pre-Work Checklist (MANDATORY)

Before starting ANY development work, verify:

### 1. **Build System Health Check**
```bash
# Test that build tools exist and work
npm run build --dry-run
./node_modules/.bin/vite --version
./node_modules/.bin/tsx --version
node -v
```

**Expected:** All commands succeed without errors.  
**If ANY fail:** STOP and fix build system first.

### 2. **Package Verification**
```bash
# Verify critical packages are installed
npm list vite tsx esbuild typescript
```

**Expected:** All packages show version numbers, no "missing" errors.  
**If missing:** Run `npm install` BEFORE any work.

### 3. **Server Test**
```bash
# Verify server can start
timeout 5 npm run dev 2>&1 | head -20
```

**Expected:** Server starts without module errors.  
**If fails:** Fix dependencies before proceeding.

---

## 🚨 Detection: Early Warning Signs

### Critical Error Patterns

**IMMEDIATE STOP SIGNALS:**
```
Error: Cannot find module 'tsx/cjs'
Error: ENOTEMPTY: directory not empty
Error: Cannot find package 'tinyglobby'
Error: Cannot find package 'esbuild'
```

If you see **ANY** of these:
1. ❌ STOP all development work immediately
2. 🚨 Alert user about environment corruption
3. 🔧 Activate Emergency Response Protocol (below)

---

## ⚡ Emergency Response Protocol

### Phase 1: Assess Damage
```bash
# Check what's broken
npm list --depth=0 2>&1 | tee npm-health.log
node -e "console.log('Node works')"
ls -la node_modules/.bin/ | head -20
```

### Phase 2: Attempt Quick Fix
```bash
# Try standard recovery
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**If this works:** Continue with Phase 3 verification.  
**If this fails:** Skip to Phase 4 (Workaround).

### Phase 3: Verify Fix
```bash
# Test that everything works
npm run build
npm run dev &
sleep 5
curl http://localhost:5000/
```

**Expected:** Server serves application correctly.

### Phase 4: Workaround (When npm is Dead)

**Build Zero-Dependency Solution:**
1. Create minimal Node.js HTTP server (built-ins only)
2. Build CDN-based React app (no bundler)
3. Serve static files directly
4. Document the workaround

**Template available:** `server/minimal-mt-server.js`

---

## ✅ Verification Protocol

### Before Declaring "Done"

**NEVER SKIP THESE STEPS:**

1. **Visual Verification**
```bash
# Take screenshot of ACTUAL user-facing app
# Verify it matches expected UI (not a status page!)
```

2. **Route Testing**
```bash
# Test all critical routes
curl http://localhost:5000/ | grep -i "mundo tango\|memories\|home"
curl http://localhost:5000/memories | grep -i "memory\|feed"
curl http://localhost:5000/events | grep -i "event"
```

3. **User Perspective Test**
- [ ] Screenshot shows correct app (not error page)
- [ ] Navigation works (Home, Memories, Events)
- [ ] User can access requested features
- [ ] No blank screens or error messages

---

## 📚 MB.MD Methodology Compliance

### Critical Principle Violated
**"Validate frontend accessibility FIRST"**

### Correct Approach
1. ✅ Build feature
2. ✅ **IMMEDIATELY verify user can see it**
3. ✅ Screenshot proof of working UI
4. ✅ Test in browser from user perspective
5. ✅ Only then declare success

### Wrong Approach (What Happened)
1. ❌ Built backend features
2. ❌ Assumed server running = user can access
3. ❌ Didn't verify what user actually sees
4. ❌ User got status page instead of real app

---

## 🔒 Backup Strategy

### Before ANY Dependency Changes

```bash
# Create timestamped backup
BACKUP_NAME="node_modules.backup.$(date +%Y%m%d_%H%M%S)"
cp -r node_modules "$BACKUP_NAME"
echo "Backup created: $BACKUP_NAME"
```

### Before Major Updates
```bash
# Full project snapshot
tar -czf "project-snapshot-$(date +%Y%m%d_%H%M%S).tar.gz" \
  --exclude=node_modules \
  --exclude=.git \
  .
```

---

## 🎯 Prevention Rules

### Rule 1: Trust Nothing
- ❌ Don't assume build tools work
- ✅ Verify every time before starting work

### Rule 2: Validate Visuals
- ❌ Don't trust server logs alone
- ✅ Screenshot actual UI user sees

### Rule 3: Test User Journey
- ❌ Don't assume routes work
- ✅ Test navigation from user perspective

### Rule 4: Backup Everything
- ❌ Don't change dependencies without backup
- ✅ Snapshot before ANY package changes

### Rule 5: Emergency Readiness
- ❌ Don't panic when npm breaks
- ✅ Have zero-dependency fallback ready

---

## 🔧 Recovery Tools

### Tool 1: Minimal Server (Zero Dependencies)
**Location:** `server/minimal-mt-server.js`  
**Purpose:** Serve app when npm is broken  
**Usage:** `node server/minimal-mt-server.js`

### Tool 2: CDN React App (No Bundler)
**Location:** `client/dist/index.html`  
**Purpose:** React app without npm dependencies  
**Features:** Routing, Memories feed, Events, all without bundler

### Tool 3: Health Check Script
```bash
#!/bin/bash
# health-check.sh
echo "=== Build System Health Check ==="
npm run build --dry-run && echo "✅ Build works" || echo "❌ Build broken"
npm list vite tsx esbuild && echo "✅ Packages OK" || echo "❌ Packages missing"
timeout 5 npm run dev && echo "✅ Server works" || echo "❌ Server broken"
```

---

## 📊 Success Metrics

### Deployment is Successful When:
- ✅ User sees correct UI (screenshot proof)
- ✅ All routes accessible (/home, /memories, /events)
- ✅ Features work as expected
- ✅ No errors in browser console
- ✅ User explicitly confirms satisfaction

### Deployment is FAILED When:
- ❌ User sees status page instead of app
- ❌ Routes return 404 or errors
- ❌ Features don't work
- ❌ User reports "this isn't what I expected"
- ❌ No screenshot verification done

---

## 🚀 Quick Reference

### Daily Development Workflow
```bash
# 1. Health check (30 seconds)
npm list vite tsx esbuild

# 2. Backup if changing deps (1 minute)
cp -r node_modules node_modules.backup.$(date +%Y%m%d_%H%M%S)

# 3. Work on features

# 4. Verify user sees correct UI (2 minutes)
# - Screenshot actual app
# - Test routes
# - Confirm with user

# 5. Only then mark complete
```

### Emergency Recovery (When npm Breaks)
```bash
# 1. Don't panic
# 2. Use zero-dependency server
node server/minimal-mt-server.js

# 3. Verify user can access app
curl http://localhost:5000/memories

# 4. Document incident
# 5. Plan permanent fix
```

---

## 📖 Key Learnings

1. **Server running ≠ App accessible**
   - Server might serve wrong content
   - Always verify user-facing output

2. **npm can fail catastrophically**
   - ENOTEMPTY errors can corrupt everything
   - Have zero-dependency fallback ready

3. **Visual verification is mandatory**
   - Screenshots prove what user sees
   - Logs alone are insufficient

4. **Frontend IS the validation tool**
   - If user can't see it, it doesn't exist
   - Status pages are NOT the application

---

## ✨ Success Story

**What Was Fixed:**
- User couldn't see Mundo Tango Memories Feed
- npm ecosystem completely corrupted
- All build tools failing

**How We Fixed It:**
1. Built zero-dependency HTTP server
2. Created CDN-based React app (no bundler)
3. Verified user sees correct UI
4. Documented prevention measures

**Result:**
- ✅ User now sees beautiful Mundo Tango app
- ✅ Memories feed accessible at /memories
- ✅ MT Ocean Theme working perfectly
- ✅ Zero npm dependencies needed

---

**Remember:** The goal is user access to features, not just a running server. Always verify from the user's perspective!
