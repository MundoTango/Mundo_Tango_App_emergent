# 🛡️ DEPLOYMENT STABILITY PLAN
**Mundo Tango - Preventing File Deletions & Build Failures**

**Date:** October 18, 2025 5:45 AM  
**Methodology:** MB.MD  
**Priority:** CRITICAL

---

## 🎯 **PROBLEM STATEMENT**

**What Happened:**
- Critical files deleted multiple times (vite.config.ts, agent folders, pages)
- Build failures due to missing files
- Server crashes from missing dependencies
- Lost 2+ hours restoring files from git

**Root Causes:**
1. Platform-level checkpoint rollbacks
2. No pre-deployment file integrity checks
3. No automated backup of critical files
4. No build validation before deployment
5. Documentation Agent has wrong scope (can't prevent deletions)

---

## 🔍 **MB.MD MAPPING: Current Protection Gaps**

### **What We Have:**
- ✅ Git history (can restore files manually)
- ✅ Documentation Agent (ESA Layer 52) - Documents changes
- ✅ Build system (catches errors after they happen)

### **What We're Missing:**
- ❌ Pre-deployment file integrity checks
- ❌ Automated critical file backup
- ❌ Build validation before publish
- ❌ File deletion prevention hooks
- ❌ Critical file registry

---

## 📋 **BREAKDOWN: Multi-Layer Protection Strategy**

### **Layer 1: Critical File Registry** (Prevent Deletions)

Create a manifest of files that must NEVER be deleted:

```json
{
  "criticalFiles": [
    "vite.config.ts",
    "package.json",
    "drizzle.config.ts",
    "server/index.ts",
    "server/routes.ts",
    "server/db.ts",
    "client/src/App.tsx",
    "client/src/main.tsx"
  ],
  "criticalDirectories": [
    "server/agents/",
    "server/routes/",
    "server/services/",
    "client/src/pages/",
    "client/src/contexts/",
    "shared/"
  ],
  "masterDocuments": [
    "MT_MASTER_REBUILD_PLAN.md",
    "_MT_MASTER_GUIDELINE.md",
    "WHERE_ARE_WE_NOW.md",
    "MB_MD_DEPLOYMENT_STRATEGY.md",
    "COMPLETE_AGENT_INVENTORY.md",
    "AGENT_ORG_CHART.md"
  ]
}
```

### **Layer 2: Pre-Deployment Checks** (Catch Issues Early)

**Script:** `scripts/pre-deploy-check.ts`

Runs BEFORE every deployment:
1. ✅ Verify all critical files exist
2. ✅ Check all imports resolve
3. ✅ Validate TypeScript compiles
4. ✅ Test build completes
5. ✅ Verify agent folders present
6. ✅ Check documentation integrity
7. ✅ Confirm database schema synced

**Blocks deployment if ANY check fails.**

### **Layer 3: Automated Backup** (Quick Recovery)

**Daily Backup Cron:**
- Snapshot critical files to `.backups/` directory
- Keep last 7 days of backups
- Exclude from git (in .gitignore)
- Can restore in 30 seconds vs 30 minutes

### **Layer 4: Build Validation** (Test Before Deploy)

**Script:** `scripts/validate-build.ts`

Runs before publish:
1. ✅ `npm run build` succeeds
2. ✅ No TypeScript errors
3. ✅ All pages compile
4. ✅ All routes load
5. ✅ Server starts successfully
6. ✅ Critical API endpoints respond

### **Layer 5: Documentation Agent Enhancement** (Track Changes)

**Updated ESA Layer 52 Responsibilities:**

**CAN DO:**
- ✅ Track which files were modified
- ✅ Log when files are added/removed
- ✅ Alert when master documents change
- ✅ Maintain file change history
- ✅ Generate file integrity reports

**CANNOT DO:**
- ❌ Prevent git operations (platform-level)
- ❌ Block file deletions (filesystem-level)
- ❌ Stop checkpoint rollbacks (Replit platform)

**NEW: File Integrity Monitoring**
- Every 5 minutes, verify critical files exist
- If missing, alert immediately and attempt auto-restore from backup
- Log all file system changes

---

## 🛠️ **MITIGATION: Implementation Plan**

### **Immediate Actions (Next 30 Minutes):**

**1. Create Critical File Registry**
```bash
scripts/critical-files.json
```

**2. Create Pre-Deployment Check Script**
```bash
scripts/pre-deploy-check.ts
```

**3. Update package.json Scripts**
```json
{
  "scripts": {
    "predeploy": "tsx scripts/pre-deploy-check.ts",
    "deploy": "npm run build && echo 'Ready for deployment'",
    "integrity-check": "tsx scripts/file-integrity-check.ts",
    "backup": "tsx scripts/backup-critical-files.ts"
  }
}
```

**4. Create Automated Backup Script**
```bash
scripts/backup-critical-files.ts
```

**5. Update Documentation Agent**
```bash
server/agents/layer52-documentation-system-agent.ts
```
Add file monitoring capabilities.

### **Medium-Term Actions (Next 2-4 Hours):**

**6. Create Build Validation Script**
```bash
scripts/validate-build.ts
```

**7. Add GitHub Actions CI/CD**
```yaml
.github/workflows/deploy-check.yml
```
Runs all checks automatically on push.

**8. Create Recovery Documentation**
```bash
EMERGENCY_RECOVERY.md
```
Step-by-step guide to restore from backups.

**9. Add File Change Monitoring**
```bash
server/services/fileIntegrityService.ts
```

---

## 🚀 **DEPLOYMENT: Making It Work**

### **Deployment Workflow (New Process):**

```
1. Developer makes changes
   ↓
2. Git commit + push
   ↓
3. PRE-DEPLOYMENT CHECKS RUN
   ├─ Critical files exist? ✓
   ├─ TypeScript compiles? ✓
   ├─ Build succeeds? ✓
   ├─ Tests pass? ✓
   └─ All checks pass? ✓
   ↓
4. BACKUP CREATED
   └─ Critical files saved to .backups/
   ↓
5. BUILD VALIDATION
   ├─ Production build ✓
   ├─ Server starts ✓
   └─ All routes load ✓
   ↓
6. DEPLOY TO PRODUCTION
   └─ Reserved VM deployment
   ↓
7. POST-DEPLOYMENT VERIFICATION
   ├─ Server responding? ✓
   ├─ API endpoints working? ✓
   └─ Frontend loading? ✓
   ↓
8. SUCCESS ✅ or ROLLBACK ⚠️
```

### **If Deployment Fails:**

1. **Automatic Rollback** to last working checkpoint
2. **Alert Notification** via console + logs
3. **Recovery Mode** - restore from latest backup
4. **Root Cause Analysis** - check what failed
5. **Fix & Re-Deploy** - address issue, retry

---

## 📊 **SUCCESS METRICS**

**Before (Current State):**
- ⚠️ Files deleted: 15+ times in 6 hours
- ⚠️ Build failures: 8+ in 6 hours
- ⚠️ Recovery time: 30-60 minutes per incident
- ⚠️ Zero automated checks
- ⚠️ Manual restoration only

**After (Target State):**
- ✅ Files deleted: 0 (prevented by checks)
- ✅ Build failures: <1 per week (caught pre-deploy)
- ✅ Recovery time: <5 minutes (automated)
- ✅ 100% automated validation
- ✅ Instant alerts + auto-recovery

---

## 🔧 **TECHNICAL IMPLEMENTATION**

### **1. Critical File Registry (`scripts/critical-files.json`)**

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-10-18",
  "criticalFiles": {
    "build": [
      "vite.config.ts",
      "tsconfig.json",
      "tsconfig.node.json",
      "package.json",
      "drizzle.config.ts"
    ],
    "server": [
      "server/index.ts",
      "server/routes.ts",
      "server/db.ts",
      "server/storage.ts",
      "server/vite.ts"
    ],
    "client": [
      "client/src/App.tsx",
      "client/src/main.tsx",
      "client/index.html"
    ],
    "agents": [
      "server/agents/agent-coordinator.ts",
      "server/agents/journey-agents/index.ts",
      "server/agents/leadership/index.ts",
      "server/agents/mr-blue/index.ts"
    ],
    "documentation": [
      "MT_MASTER_REBUILD_PLAN.md",
      "_MT_MASTER_GUIDELINE.md",
      "WHERE_ARE_WE_NOW.md",
      "replit.md"
    ]
  },
  "requiredDirectories": [
    "server/agents/journey-agents",
    "server/agents/leadership",
    "server/agents/mr-blue",
    "server/routes",
    "server/services",
    "client/src/pages",
    "client/src/contexts",
    "shared"
  ]
}
```

### **2. Pre-Deployment Check Script**

```typescript
// scripts/pre-deploy-check.ts
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const CRITICAL_FILES = require('./critical-files.json');

async function checkCriticalFiles() {
  console.log('🔍 Checking critical files...');
  let missing = [];
  
  for (const [category, files] of Object.entries(CRITICAL_FILES.criticalFiles)) {
    for (const file of files) {
      if (!fs.existsSync(file)) {
        missing.push({ category, file });
      }
    }
  }
  
  if (missing.length > 0) {
    console.error('❌ CRITICAL FILES MISSING:');
    missing.forEach(({ category, file }) => {
      console.error(`   ${category}: ${file}`);
    });
    process.exit(1);
  }
  
  console.log('✅ All critical files present');
}

async function checkTypeScript() {
  console.log('🔍 Checking TypeScript compilation...');
  try {
    execSync('tsc --noEmit', { stdio: 'inherit' });
    console.log('✅ TypeScript compiles successfully');
  } catch (error) {
    console.error('❌ TypeScript compilation failed');
    process.exit(1);
  }
}

async function testBuild() {
  console.log('🔍 Testing production build...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build succeeds');
  } catch (error) {
    console.error('❌ Build failed');
    process.exit(1);
  }
}

async function main() {
  console.log('🛡️  PRE-DEPLOYMENT CHECKS\n');
  
  await checkCriticalFiles();
  await checkTypeScript();
  await testBuild();
  
  console.log('\n✅ ALL CHECKS PASSED - SAFE TO DEPLOY');
}

main().catch(err => {
  console.error('❌ PRE-DEPLOYMENT CHECK FAILED:', err);
  process.exit(1);
});
```

### **3. File Integrity Service**

```typescript
// server/services/fileIntegrityService.ts
import fs from 'fs';
import path from 'path';

const CRITICAL_FILES = require('../../scripts/critical-files.json');

export class FileIntegrityService {
  private checkInterval: NodeJS.Timer | null = null;
  
  startMonitoring() {
    console.log('🛡️  File Integrity Monitoring started');
    
    // Check every 5 minutes
    this.checkInterval = setInterval(() => {
      this.performIntegrityCheck();
    }, 5 * 60 * 1000);
    
    // Initial check
    this.performIntegrityCheck();
  }
  
  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
  
  performIntegrityCheck() {
    let missing = [];
    
    for (const [category, files] of Object.entries(CRITICAL_FILES.criticalFiles)) {
      for (const file of files as string[]) {
        if (!fs.existsSync(file)) {
          missing.push({ category, file });
          console.error(`⚠️  CRITICAL FILE MISSING: ${file}`);
        }
      }
    }
    
    if (missing.length > 0) {
      this.attemptAutoRestore(missing);
    }
    
    return missing.length === 0;
  }
  
  attemptAutoRestore(missing: any[]) {
    console.log('🔧 Attempting auto-restore from backups...');
    // TODO: Implement restore from .backups/
  }
}
```

---

## 📖 **DOCUMENTATION AGENT UPDATE**

**ESA Layer 52 - Enhanced Responsibilities:**

### **Primary Functions (Unchanged):**
1. Track code changes in documentation
2. Maintain system architecture docs
3. Keep agent inventory current
4. Generate technical documentation

### **NEW: File Integrity Monitoring**
1. **Every 5 minutes:** Check critical files exist
2. **On file change:** Log what changed and when
3. **On missing file:** Alert + attempt restore
4. **Daily report:** File change summary

### **What It CANNOT Do:**
- ❌ Prevent git operations (platform level)
- ❌ Block file deletions (filesystem level)
- ❌ Stop rollbacks (Replit platform level)

**Why:** These are OS/platform-level operations outside agent scope.

**Solution:** Use pre-deployment checks + backups instead.

---

## ⚡ **QUICK RECOVERY GUIDE**

### **If Files Get Deleted Again:**

**Option 1: Restore from Backups (30 seconds)**
```bash
npm run restore-backup
```

**Option 2: Restore from Git (2 minutes)**
```bash
git show <commit>:<file> > <destination>
```

**Option 3: Use Replit Checkpoints (1 minute)**
Click "View Checkpoints" button in UI

---

## ✅ **IMPLEMENTATION CHECKLIST**

**Phase 1: Immediate (30 min)**
- [ ] Create `scripts/critical-files.json`
- [ ] Create `scripts/pre-deploy-check.ts`
- [ ] Create `scripts/backup-critical-files.ts`
- [ ] Update `package.json` scripts
- [ ] Test pre-deployment checks

**Phase 2: Short-term (2-4 hours)**
- [ ] Create `scripts/validate-build.ts`
- [ ] Create `server/services/fileIntegrityService.ts`
- [ ] Update Documentation Agent (Layer 52)
- [ ] Add to server startup
- [ ] Create `EMERGENCY_RECOVERY.md`

**Phase 3: Long-term (1-2 days)**
- [ ] GitHub Actions CI/CD
- [ ] Automated testing
- [ ] Performance monitoring
- [ ] Alert notifications

---

## 🎯 **FINAL OUTCOME**

**Zero file deletion incidents** through multi-layer protection:
1. **Prevention:** Pre-deployment checks block bad deploys
2. **Detection:** File monitoring catches deletions immediately
3. **Recovery:** Automated backups enable instant restoration
4. **Documentation:** Clear processes for manual intervention

**Result:** Stable, reliable deployments with <1% failure rate.

---

**Last Updated:** October 18, 2025 5:45 AM  
**Maintained by:** Development Team  
**Methodology:** MB.MD  
**Priority:** CRITICAL
