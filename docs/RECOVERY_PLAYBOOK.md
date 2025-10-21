# Mundo Tango Recovery Playbook
**MB.MD 5-Minute Environment Recovery System**

> **When to use**: Storage corruption, ENOTEMPTY errors, catastrophic build failures, or "everything is broken"

---

## 🚨 Quick Decision Tree

```
Is your workspace broken?
│
├─ YES → Storage corruption (ENOTEMPTY, build fails, server won't start)
│   ├─ Try: kill 1 (VM reboot) → Still broken?
│   └─ → Use Method 1A: Fresh Branch via Replit UI (RECOMMENDED, 3-5 min)
│
└─ NO → Just need to rebuild packages?
    └─ Use Method 2: Bootstrap In-Place (5 min)
```

---

## Method 1A: Fresh Branch via Replit UI (RECOMMENDED)
**Use when**: Storage corruption, git authentication errors, or need clean environment
**Time**: 3-5 minutes
**Advantage**: No git auth issues, automatic code pull, cleanest recovery

### Steps

#### 1. Ensure Code is Committed (in old corrupted repl)
```bash
# Check you have no uncommitted changes
git status

# If you have changes, commit them
git add .
git commit -m "Save work before creating fresh branch"
git push origin <your-branch>
```

#### 2. Create Fresh Branch via Replit UI
1. Click the **Version Control** icon (left sidebar)
2. Click **"Create new branch from..."** dropdown
3. Select your GitHub branch (e.g., `fresh-mundo-tango`)
4. Replit automatically:
   - ✅ Pulls latest code from GitHub
   - ✅ Creates clean VM and storage
   - ✅ Avoids all git authentication issues

#### 3. Run Bootstrap Script
In the new branch's shell:
```bash
./scripts/bootstrap-env.sh
```

**Expected output**:
```
✅ BOOTSTRAP COMPLETE
Time: 180-240s
Environment ready for development! 🚀
```

#### 4. Verify Everything Works
```bash
./scripts/health-check.sh
```

**Expected**: All 7 checks pass ✅

#### 5. Resume Development
```bash
npm run dev
```

Visit preview URL → You're back to coding!

---

## Method 1B: Fresh Fork (Alternative)
**Use when**: Branch creation UI unavailable or prefer forking
**Time**: 5-10 minutes

### What Gets Preserved ✅
- ✅ All git commits and branches
- ✅ All code (Mr Blue AI, MT platform, 350+ agents)
- ✅ All documentation
- ✅ Database schemas (will be recreated)

### What Gets Recreated 🔄
- 🔄 `node_modules/` (fresh, no corruption)
- 🔄 Linux VM (clean filesystem)
- 🔄 PostgreSQL database (schema recreated from code)

### Steps

#### 1. Ensure Code is Committed
```bash
# Check you have no uncommitted changes
git status

# If you have changes, commit them
git add .
git commit -m "Save work before fork"
git push origin <your-branch>
```

#### 2. Fork Repl
1. Click the **3 dots** menu on this repl
2. Select **"Fork Repl"**
3. Wait 30-60 seconds for fork to complete
4. New repl opens with your code intact

#### 3. Run Bootstrap Script
In the new repl's shell:
```bash
./scripts/bootstrap-env.sh
```

**Expected output**:
```
✅ BOOTSTRAP COMPLETE
Time: 180-240s
Environment ready for development! 🚀
```

#### 4. Verify Everything Works
```bash
chmod +x scripts/health-check.sh
./scripts/health-check.sh
```

**Expected**: All 7 checks pass ✅

#### 5. Resume Development
```bash
npm run dev
```

Visit preview URL → You're back to coding!

---

## Method 2: Bootstrap In-Place
**Use when**: No storage corruption, just need fresh packages

### Steps

```bash
# Clean everything
rm -rf node_modules package-lock.json dist
npm cache clean --force

# Run bootstrap
chmod +x scripts/bootstrap-env.sh
./scripts/bootstrap-env.sh

# Verify
./scripts/health-check.sh
```

**Time**: 5-8 minutes

---

## Understanding the Bootstrap Script

### What It Does (5 Phases)

#### Phase 1: Pre-flight Checks
- ✅ Verifies git repository
- ✅ Checks Node version
- ✅ Detects previous corruption

#### Phase 2: Deep Clean
- 🧹 Removes `node_modules/`
- 🧹 Deletes lock files
- 🧹 Clears npm cache
- 🧹 Kills zombie processes

#### Phase 3: Dependency Installation
- 📦 Fresh `npm install` (~1345 packages)
- 📦 Verifies critical packages (Express, Vite, React, etc.)
- 📦 Detects ENOTEMPTY errors → recommends fresh branch via Replit UI (Method 1A)

#### Phase 4: Database Setup
- 🗄️ Syncs Drizzle schema to PostgreSQL
- 🗄️ Creates all tables from `shared/schema.ts`
- 🗄️ Uses `--force` if needed (data loss warning handled)

#### Phase 5: Health Check
- 🏥 Tests server startup (15 sec)
- 🏥 Checks for common errors
- 🏥 Reports timing and status

---

## Common Scenarios

### Scenario 1: "npm install gives ENOTEMPTY error"
```bash
# Try VM reboot first
kill 1

# Wait 30 seconds, then try
npm install

# Still broken? → Create fresh branch via Replit UI (Method 1A)
```

### Scenario 2: "Server won't start - Cannot find module 'finalhandler'"
**Cause**: Incomplete package installation

**Fix**:
```bash
./scripts/bootstrap-env.sh
```

### Scenario 3: "Build fails with esbuild EPIPE error"
**Cause**: esbuild binary corruption

**Fix**:
```bash
# Nuclear option
rm -rf node_modules
npm cache clean --force
./scripts/bootstrap-env.sh
```

### Scenario 4: "Everything was working yesterday, now nothing works"
**Likely cause**: Replit storage corruption incident

**Fix**: Create fresh branch via Replit UI (Method 1A - RECOMMENDED) or fork repl (Method 1B)

### Scenario 5: "I just want to start fresh but keep my code"
**Fix**: 
```bash
git commit -am "Save current state"
git push
# Then create fresh branch via Replit UI (Method 1A)
```

---

## Corruption Prevention

### Daily Habits
- ✅ Commit frequently (`git commit` every 30-60 min)
- ✅ Push to remote (`git push` at end of session)
- ✅ Never Ctrl+C during npm install (let it fail naturally)
- ✅ Run health check before claiming "done"

### Red Flags (Run Bootstrap Immediately)
- 🚩 `ENOTEMPTY` errors during npm install
- 🚩 `EPIPE` errors from esbuild/tsx
- 🚩 "Cannot find module" for packages that exist
- 🚩 Server starts but immediately crashes
- 🚩 Build succeeds but `dist/` is empty

### When to Use Each Recovery Method

| Symptom | Action |
|---------|--------|
| npm install fails once | Bootstrap in-place (Method 2) |
| npm install fails 3+ times | Fresh branch via Replit UI (Method 1A) |
| ENOTEMPTY after `kill 1` | Fresh branch via Replit UI (Method 1A) |
| Git authentication errors | Fresh branch via Replit UI (Method 1A) |
| esbuild EPIPE errors | Bootstrap first (Method 2), then Method 1A if persists |
| Load average >10 | Fresh branch via Replit UI (Method 1A - VM overloaded) |
| "Cannot find module" for core packages | Bootstrap in-place (Method 2) |

---

## Troubleshooting Bootstrap Script

### "Bootstrap failed at Phase 3 (npm install)"
**Check**:
```bash
cat /tmp/bootstrap-npm-install.log | grep -i "error"
```

**If ENOTEMPTY**: Create fresh branch via Replit UI (Method 1A - storage corruption)  
**If timeout**: Increase timeout in script or retry  
**If "no space"**: Contact Replit support

### "Phase 4 database push failed"
**Check**:
```bash
echo $DATABASE_URL
```

**If empty**: Database not configured (non-blocking)  
**If "connection refused"**: Database not started (restart workflow)  
**If "data loss"**: Expected - script uses `--force` to override

### "Phase 5 server test failed"
**Check**:
```bash
cat /tmp/bootstrap-server-test.log
```

**Common issues**:
- Missing env vars → Set in Replit Secrets
- Port 5000 in use → `kill 1` to reboot VM
- Module errors → Bootstrap didn't complete (re-run)

---

## Health Check Reference

### What Gets Tested

| Check | What It Does | Critical? |
|-------|-------------|-----------|
| 1. Environment | Verifies Node, packages, DATABASE_URL | ✅ Yes |
| 2. Critical Files | Checks 7 core files exist and have content | ✅ Yes |
| 3. Build System | Tests vite/tsx/esbuild binaries + TypeScript | ⚠️ TypeScript errors = warning |
| 4. Server Startup | Starts server for 15 sec, checks for crashes | ✅ Yes |
| 5. API Routes | Tests 5 core endpoints return responses | ⚠️ Some 404s OK |
| 6. Database | Verifies Drizzle schema sync | ⚠️ Optional if no DB |
| 7. UI Build | Full Vite build test | ⚠️ Build issues = warning |

### Exit Codes
- `0` = All pass OR warnings only
- `1` = Critical errors detected

### Expected Output
```
✅ ALL CHECKS PASSED
Platform is 100% functional
Duration: 45s

🎯 Platform Status: READY FOR DEVELOPMENT 🚀
```

---

## MB.MD Integration

### Before Starting Work
```bash
# Always verify environment health
./scripts/health-check.sh

# If fails, bootstrap
./scripts/bootstrap-env.sh
```

### After Major Changes
```bash
# Commit your work
git commit -am "Implemented feature X"

# Verify nothing broke
./scripts/health-check.sh
```

### Before Marking Task Complete
```bash
# Full validation
./scripts/health-check.sh

# Screenshot proof
# (If health check passes, take screenshot)
```

---

## Learning from Oct 21, 2025 Incident

### What Happened
- Replit storage layer corruption (Margarine filesystem bug)
- `npm install` entered infinite ENOTEMPTY loop
- `kill 1` rebooted VM but corruption persisted in storage
- Load average spiked to 19.45 (should be <2)
- Wasted 2+ hours fighting unfixable corruption

### What We Learned
1. **Storage corruption survives VM reboots** - it's in Replit's persistent layer
2. **ENOTEMPTY after reboot = create fresh branch via Replit UI (Method 1A)** - don't waste time
3. **High load average = overloaded VM** - use Method 1A for fresh resources
4. **Corruption spreads** - esbuild EPIPE started after npm ENOTEMPTY
5. **Manual package reinstalls make it worse** - use bootstrap instead

### Prevention Rules
- ✅ **Never** delete package-lock.json then run `npm ci` (requires lock file)
- ✅ **Always** use `npm install` for fresh installs (generates new lock)
- ✅ **Check** for ENOTEMPTY in logs before wasting time
- ✅ **Create fresh branch via Replit UI (Method 1A)** on first sign of persistent corruption
- ✅ **Bootstrap** instead of manual fixes (automated is better)

---

## Support & Escalation

### Self-Service (Try First)
1. Read this playbook
2. Run `./scripts/bootstrap-env.sh`
3. Run `./scripts/health-check.sh`
4. Check error logs in `/tmp/`

### Need Help? Check
- `docs/AGENT_SESSION_LOG.md` - What previous agents learned
- `docs/CRITICAL_FAILURE_ANALYSIS.md` - Known failure patterns
- `replit.md` - Current platform state

### Replit Platform Issues
- Storage corruption after Sept 2024: Create fresh branch via Replit UI (Method 1A)
- Read-only filesystem: https://report-read-only-repls.replit.app/
- Load average >20: VM overloaded, create fresh branch (Method 1A)
- Contact support: https://replit.com/support

---

## Quick Reference Card

### 🚨 Emergency Commands
```bash
# VM reboot (30 sec)
kill 1

# Bootstrap (5 min)
./scripts/bootstrap-env.sh

# Health check (1 min)
./scripts/health-check.sh

# Check for corruption
cat ~/.npm/_logs/*-debug-*.log | grep ENOTEMPTY
```

### 📊 Health Indicators
| Metric | Good | Warning | Critical |
|--------|------|---------|----------|
| Packages | 1345 | 1000-1344 | <1000 |
| Load avg | <2 | 2-10 | >10 |
| Server start | <10s | 10-15s | >15s or crash |
| Build time | <60s | 60-120s | >120s or fail |

### 🎯 Decision Matrix
| Problem | Quick Fix | If Fails |
|---------|-----------|----------|
| Build error | `npm run build` | Bootstrap (Method 2) |
| Server crash | Restart workflow | Bootstrap (Method 2) |
| npm warning | Ignore | N/A |
| ENOTEMPTY | `kill 1` | Fresh branch via Replit UI (Method 1A) |
| Multiple errors | Bootstrap (Method 2) | Fresh branch via Replit UI (Method 1A) |

---

**Last Updated**: October 21, 2025  
**Version**: 1.0 (Initial release)  
**Tested On**: Node v20.19.3, npm v10.9.2, Replit Nix environment
