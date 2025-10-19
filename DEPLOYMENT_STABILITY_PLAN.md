# Deployment Stability Plan - Multi-Layer Protection System

**Created:** October 19, 2025  
**Status:** DOCUMENTED (NOT YET IMPLEMENTED)  
**Priority:** CRITICAL - Prevent production outages  
**Methodology:** MB.MD (Mapping→Breakdown→Mitigation→Deployment)

## ⚠️ **CRITICAL DISCLAIMER**

**This plan is ASPIRATIONAL** - Most protection layers described below are **NOT YET IMPLEMENTED**.

**What EXISTS:**
- ✅ Git version control (basic protection)
- ✅ Manual file verification (ad-hoc only)
- ✅ TypeScript compilation checks (build-time only)

**What DOES NOT EXIST:**
- ❌ Critical File Registry (scripts/critical-files.json)
- ❌ Pre-Deployment Checks (scripts/pre-deploy-check.ts)
- ❌ File Integrity Monitoring (Documentation Agent Layer 52)
- ❌ Automated Git Recovery
- ❌ Pre-commit hooks
- ❌ Automated tests for file protection
- ❌ PostgreSQL documentation backup
- ❌ Recovery commands (npm run restore-docs)

**See:** `FILE_DELETION_INCIDENT_REPORT.md` for why this system is needed

## 🎯 **Executive Summary**

Comprehensive 5-layer file protection system designed to prevent production-breaking file deletions, catch errors before deployment, and enable instant recovery. **Current implementation: 20%** (only Layer 4-5 partially active).

**Incident That Triggered This Plan:**  
October 19, 2025 - Vite HMR file deletion bug caused 8 files to disappear, server crashed 4 times in 30 minutes, work blocked for 90 minutes. See `FILE_DELETION_INCIDENT_REPORT.md` for full details.

**Goal:** Never allow file deletion to break production deployment again.

## 🛡️ **5-Layer Protection Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: Critical File Registry (Prevention)                │ ❌ NOT IMPLEMENTED
│ - Maintains list of protected files                          │
│ - Blocks deletion of critical files via pre-commit hooks    │
│ - ~85 critical files tracked                                 │
└─────────────────────────────────────────────────────────────┘
                            ⬇
┌─────────────────────────────────────────────────────────────┐
│ Layer 2: Pre-Deployment Checks (Validation)                 │ ❌ NOT IMPLEMENTED
│ - Verifies all imports resolve                               │
│ - Runs TypeScript compilation                                │
│ - Checks file existence before deploy                        │
└─────────────────────────────────────────────────────────────┘
                            ⬇
┌─────────────────────────────────────────────────────────────┐
│ Layer 3: File Integrity Monitoring (Real-time)              │ ❌ NOT IMPLEMENTED
│ - Documentation Agent (Layer 52) monitors every 60 seconds  │
│ - Alerts on unexpected file deletions                        │
│ - Automatic recovery from git                                │
└─────────────────────────────────────────────────────────────┘
                            ⬇
┌─────────────────────────────────────────────────────────────┐
│ Layer 4: Git Version Control (Recovery)                     │ ✅ PARTIALLY ACTIVE
│ - All changes committed to git                               │
│ - Ability to rollback to any point                           │
│ - Manual recovery process (no automation)                    │
└─────────────────────────────────────────────────────────────┘
                            ⬇
┌─────────────────────────────────────────────────────────────┐
│ Layer 5: PostgreSQL Backup (Documentation)                  │ ❌ NOT IMPLEMENTED
│ - 394 markdown files backed up to database                   │
│ - Quick recovery via SQL queries                             │
│ - npm run restore-docs (not implemented)                     │
└─────────────────────────────────────────────────────────────┘
```

## 📋 **Layer 1: Critical File Registry (❌ NOT IMPLEMENTED)**

### **MB.MD PHASE 1: MAPPING - Protected Files**

#### **File: `scripts/critical-files.json`** (Does NOT exist)
```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-10-19T03:00:00Z",
  "protectedFiles": {
    "core_infrastructure": [
      "server/index.ts",
      "server/routes.ts",
      "server/db.ts",
      "client/src/App.tsx",
      "client/src/main.tsx",
      "shared/schema.ts",
      "vite.config.ts",
      "package.json",
      "tsconfig.json",
      "drizzle.config.ts"
    ],
    "middleware": [
      "server/middleware/auth.ts",
      "server/middleware/validation.ts",
      "server/middleware/errorHandler.ts",
      "server/middleware/cors.ts",
      "server/middleware/responseTime.ts",
      "server/middleware/apiResponse.ts"
    ],
    "contexts": [
      "client/src/contexts/auth-context.tsx",
      "client/src/contexts/socket-context.tsx",
      "client/src/contexts/TenantContext.tsx",
      "client/src/contexts/LocationBiasContext.tsx",
      "client/src/contexts/theme-context.tsx"
    ],
    "agents": [
      "server/agents/*.ts"
    ],
    "documentation": [
      "replit.md",
      "AGENT_LEARNING.md",
      "MT_MASTER_REBUILD_PLAN.md",
      "FILE_DELETION_INCIDENT_REPORT.md",
      "DEPLOYMENT_STABILITY_PLAN.md",
      "PHASE_14_LCP_OPTIMIZATION_COMPLETION_REPORT.md",
      "VERIFIED_SYSTEM_INVENTORY.md",
      "PHASE_16-20_UI_POLISH_REVISED_PLAN.md",
      "docs/**/*.md"
    ],
    "scripts": [
      "scripts/*.ts",
      "scripts/*.js"
    ]
  },
  "totalProtectedFiles": 85
}
```

### **Implementation: Pre-commit Hook**

**File: `.husky/pre-commit`** (Does NOT exist)
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run file protection check
npm run integrity-check

# Block commit if critical files are being deleted
node scripts/check-deleted-files.js

# If check passes, allow commit
exit 0
```

**File: `scripts/check-deleted-files.js`** (Does NOT exist)
```javascript
const { execSync } = require('child_process');
const criticalFiles = require('./critical-files.json');

// Get list of deleted files in this commit
const deletedFiles = execSync('git diff --cached --name-only --diff-filter=D')
  .toString()
  .trim()
  .split('\n')
  .filter(Boolean);

// Check if any critical files are being deleted
const protectedFiles = Object.values(criticalFiles.protectedFiles).flat();
const deletedCriticalFiles = deletedFiles.filter(file => 
  protectedFiles.some(pattern => matchesPattern(file, pattern))
);

if (deletedCriticalFiles.length > 0) {
  console.error('❌ COMMIT BLOCKED: Attempting to delete critical files:');
  deletedCriticalFiles.forEach(file => console.error(`  - ${file}`));
  console.error('\n⚠️  If you must delete these files:');
  console.error('   1. Get approval from team lead');
  console.error('   2. Update scripts/critical-files.json');
  console.error('   3. Use --no-verify flag to bypass this check');
  process.exit(1);
}

console.log('✅ No critical files deleted - commit allowed');
```

## ⚡ **Layer 2: Pre-Deployment Checks (❌ NOT IMPLEMENTED)**

### **File: `scripts/pre-deploy-check.ts`** (Does NOT exist)

```typescript
import { existsSync } from 'fs';
import { execSync } from 'child_process';
import criticalFiles from './critical-files.json';

interface CheckResult {
  passed: boolean;
  category: string;
  message: string;
  errors?: string[];
}

const checks: CheckResult[] = [];

// Check 1: Critical files exist
console.log('🔍 Checking critical files...');
const allFiles = Object.values(criticalFiles.protectedFiles).flat();
const missingFiles = allFiles.filter(file => !existsSync(file));

if (missingFiles.length === 0) {
  checks.push({
    passed: true,
    category: 'File Integrity',
    message: `All ${allFiles.length} critical files present`
  });
} else {
  checks.push({
    passed: false,
    category: 'File Integrity',
    message: `${missingFiles.length} critical files missing`,
    errors: missingFiles
  });
}

// Check 2: TypeScript compilation
console.log('🔍 Checking TypeScript compilation...');
try {
  execSync('tsc --noEmit', { stdio: 'pipe' });
  checks.push({
    passed: true,
    category: 'TypeScript',
    message: 'No TypeScript errors'
  });
} catch (error) {
  checks.push({
    passed: false,
    category: 'TypeScript',
    message: 'TypeScript compilation failed',
    errors: [error.stdout?.toString() || 'Unknown error']
  });
}

// Check 3: Import validation
console.log('🔍 Checking import statements...');
try {
  execSync('tsx scripts/validate-imports.ts', { stdio: 'pipe' });
  checks.push({
    passed: true,
    category: 'Imports',
    message: 'All imports resolve correctly'
  });
} catch (error) {
  checks.push({
    passed: false,
    category: 'Imports',
    message: 'Broken imports detected',
    errors: [error.stdout?.toString() || 'Unknown error']
  });
}

// Check 4: Agent system
console.log('🔍 Checking agent files...');
const agentCount = execSync('find server/agents -name "*.ts" | wc -l')
  .toString()
  .trim();

if (parseInt(agentCount) >= 84) {
  checks.push({
    passed: true,
    category: 'Agents',
    message: `${agentCount} agent files present`
  });
} else {
  checks.push({
    passed: false,
    category: 'Agents',
    message: `Only ${agentCount}/84 agent files found`
  });
}

// Print results
console.log('\n' + '='.repeat(60));
console.log('📊 PRE-DEPLOYMENT CHECK RESULTS');
console.log('='.repeat(60));

const failed = checks.filter(c => !c.passed);
const passed = checks.filter(c => c.passed);

console.log(`\n✅ PASSED: ${passed.length}/${checks.length} checks`);
passed.forEach(c => console.log(`  ✓ ${c.category}: ${c.message}`));

if (failed.length > 0) {
  console.log(`\n❌ FAILED: ${failed.length}/${checks.length} checks`);
  failed.forEach(c => {
    console.log(`  ✗ ${c.category}: ${c.message}`);
    if (c.errors) {
      c.errors.forEach(e => console.log(`    - ${e}`));
    }
  });
  console.log('\n⚠️  DEPLOYMENT BLOCKED - Fix errors above\n');
  process.exit(1);
}

console.log('\n✅ All checks passed - deployment allowed\n');
process.exit(0);
```

### **NPM Script Addition** (NOT added to package.json)

```json
{
  "scripts": {
    "integrity-check": "tsx scripts/pre-deploy-check.ts",
    "predeploy": "npm run integrity-check"
  }
}
```

## 📡 **Layer 3: File Integrity Monitoring (❌ NOT IMPLEMENTED)**

### **Documentation Agent - Layer 52 Integration**

**File: `server/agents/documentation-agent.ts`** (Needs update)

```typescript
// Add to existing Documentation Agent (Layer 52)
import { existsSync } from 'fs';
import criticalFiles from '../../scripts/critical-files.json';

export class DocumentationAgent {
  private lastFileCheck: Map<string, boolean> = new Map();
  
  // Monitor critical files every 60 seconds
  async monitorFileIntegrity() {
    setInterval(() => {
      this.checkCriticalFiles();
    }, 60000); // Check every minute
  }
  
  private async checkCriticalFiles() {
    const allFiles = Object.values(criticalFiles.protectedFiles).flat();
    
    for (const file of allFiles) {
      const exists = existsSync(file);
      const wasPresent = this.lastFileCheck.get(file) ?? true;
      
      // File was deleted!
      if (wasPresent && !exists) {
        console.error(`🚨 CRITICAL FILE DELETED: ${file}`);
        
        // Attempt automatic recovery from git
        try {
          execSync(`git checkout HEAD -- ${file}`);
          console.log(`✅ Auto-recovered ${file} from git`);
        } catch (error) {
          console.error(`❌ Failed to recover ${file} - manual intervention required`);
          // Send alert to admin/developer
          this.sendAlert({
            severity: 'CRITICAL',
            type: 'FILE_DELETION',
            file,
            timestamp: new Date().toISOString()
          });
        }
      }
      
      this.lastFileCheck.set(file, exists);
    }
  }
  
  private async sendAlert(alert: any) {
    // Implementation: Send to Slack, email, or monitoring system
  }
}
```

## 🔄 **Layer 4: Git Version Control (✅ PARTIALLY ACTIVE)**

### **Current Status: Manual Recovery Only**

**What Works:**
- All changes committed to git automatically
- Can view file history: `git log --follow <file>`
- Can restore deleted files manually: `git checkout HEAD~1 -- <file>`

**What Doesn't Work:**
- No automated recovery
- No pre-commit validation
- No protection against forced deletions
- No backup branches

### **Improvement Plan** (NOT implemented)

**Automated Recovery Script:** `scripts/recover-deleted-file.sh`
```bash
#!/bin/bash

FILE=$1

if [ -z "$FILE" ]; then
  echo "Usage: ./recover-deleted-file.sh <filepath>"
  exit 1
fi

# Find last commit where file existed
LAST_COMMIT=$(git rev-list -n 1 HEAD -- "$FILE")

if [ -z "$LAST_COMMIT" ]; then
  echo "❌ File never existed in git history: $FILE"
  exit 1
fi

# Restore file
git checkout "$LAST_COMMIT" -- "$FILE"
echo "✅ Restored $FILE from commit $LAST_COMMIT"
git log -1 --format="%h %s" "$LAST_COMMIT"
```

**NPM Script:** (NOT in package.json)
```json
{
  "scripts": {
    "recover:file": "bash scripts/recover-deleted-file.sh"
  }
}
```

## 💾 **Layer 5: PostgreSQL Backup (❌ NOT IMPLEMENTED)**

### **Documentation Backup Strategy**

**Table Schema:** `documentation_backups`
```sql
CREATE TABLE documentation_backups (
  id SERIAL PRIMARY KEY,
  file_path VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  backup_date TIMESTAMP DEFAULT NOW(),
  file_hash VARCHAR(64), -- SHA-256 hash for integrity
  UNIQUE(file_path, file_hash)
);

CREATE INDEX idx_doc_backups_path ON documentation_backups(file_path);
CREATE INDEX idx_doc_backups_date ON documentation_backups(backup_date DESC);
```

**Backup Script:** `scripts/backup-docs.ts` (Does NOT exist)
```typescript
import { db } from '../server/db';
import { readFileSync, readdirSync } from 'fs';
import { createHash } from 'crypto';
import { join } from 'path';

async function backupDocumentation() {
  const docsDir = 'docs';
  const files = getAllMarkdownFiles(docsDir);
  
  let backed = 0;
  let skipped = 0;
  
  for (const file of files) {
    const content = readFileSync(file, 'utf-8');
    const hash = createHash('sha256').update(content).digest('hex');
    
    try {
      await db.execute(`
        INSERT INTO documentation_backups (file_path, content, file_hash)
        VALUES ($1, $2, $3)
        ON CONFLICT (file_path, file_hash) DO NOTHING
      `, [file, content, hash]);
      
      backed++;
    } catch (error) {
      skipped++;
    }
  }
  
  console.log(`✅ Backed up ${backed} files (${skipped} unchanged)`);
}

function getAllMarkdownFiles(dir: string): string[] {
  const files: string[] = [];
  // Recursive directory traversal
  // ... implementation
  return files;
}
```

**Recovery Script:** `scripts/restore-docs.ts` (Does NOT exist)
```typescript
import { db } from '../server/db';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

async function restoreDocumentation(targetDate?: string) {
  const query = targetDate
    ? `SELECT DISTINCT ON (file_path) * FROM documentation_backups 
       WHERE backup_date <= $1 ORDER BY file_path, backup_date DESC`
    : `SELECT DISTINCT ON (file_path) * FROM documentation_backups 
       ORDER BY file_path, backup_date DESC`;
  
  const result = await db.query(query, targetDate ? [targetDate] : []);
  
  for (const row of result.rows) {
    mkdirSync(dirname(row.file_path), { recursive: true });
    writeFileSync(row.file_path, row.content);
  }
  
  console.log(`✅ Restored ${result.rowCount} documentation files`);
}
```

**NPM Scripts:** (NOT in package.json)
```json
{
  "scripts": {
    "backup-docs": "tsx scripts/backup-docs.ts",
    "restore-docs": "tsx scripts/restore-docs.ts"
  }
}
```

## ✅ **Implementation Roadmap**

### **Phase 1: Critical File Registry (2-3 hours)**
- [ ] Create `scripts/critical-files.json`
- [ ] List all 85 critical files
- [ ] Create `scripts/check-deleted-files.js`
- [ ] Test with dummy deletion

### **Phase 2: Pre-Deployment Checks (3-4 hours)**
- [ ] Create `scripts/pre-deploy-check.ts`
- [ ] Create `scripts/validate-imports.ts`
- [ ] Add npm scripts (integrity-check, predeploy)
- [ ] Test on current codebase

### **Phase 3: Pre-commit Hooks (1-2 hours)**
- [ ] Install husky: `npm install -D husky`
- [ ] Initialize: `npx husky install`
- [ ] Create `.husky/pre-commit` hook
- [ ] Test with protected file deletion attempt

### **Phase 4: File Integrity Monitoring (3-4 hours)**
- [ ] Update Documentation Agent (Layer 52)
- [ ] Add file monitoring logic
- [ ] Implement auto-recovery
- [ ] Set up alerting system

### **Phase 5: PostgreSQL Backup (2-3 hours)**
- [ ] Create database table
- [ ] Write backup script
- [ ] Write recovery script
- [ ] Set up automated daily backups

### **Phase 6: Testing & Validation (2-3 hours)**
- [ ] Create `scripts/test-file-protection.ts`
- [ ] Test all 5 layers independently
- [ ] Test recovery scenarios
- [ ] Document results

**Total Implementation Time:** 13-19 hours (2-3 days)

## 🎯 **Success Criteria**

- [ ] All 5 protection layers operational
- [ ] Pre-commit hooks block critical file deletion
- [ ] Pre-deployment checks catch broken imports
- [ ] Documentation Agent monitors in real-time
- [ ] Automated recovery works for common scenarios
- [ ] PostgreSQL backup has 394+ files
- [ ] Recovery time < 5 minutes for any incident
- [ ] Zero production outages due to file deletion

## 📊 **Current Implementation Status**

| Layer | Status | Completion | Notes |
|-------|--------|------------|-------|
| Layer 1: File Registry | ❌ Not Started | 0% | Critical-files.json doesn't exist |
| Layer 2: Pre-Deploy | ❌ Not Started | 0% | No scripts exist |
| Layer 3: Monitoring | ❌ Not Started | 0% | Agent exists but no monitoring |
| Layer 4: Git | ✅ Partial | 50% | Manual recovery only |
| Layer 5: DB Backup | ❌ Not Started | 0% | No table or scripts |

**Overall Implementation:** 10% (Only git version control partially working)

---

**Plan Status:** 📋 **DOCUMENTED BUT NOT IMPLEMENTED**  
**Priority:** 🚨 **CRITICAL** - Required for production deployment  
**Next Step:** Begin Phase 1 implementation (Critical File Registry)
