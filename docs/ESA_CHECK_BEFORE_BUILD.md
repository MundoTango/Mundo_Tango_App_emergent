# ESA CHECK_BEFORE_BUILD Protocol
**Version:** 1.0  
**Status:** ✅ Active  
**Referenced by:** 106 agent files across ESA LIFE CEO framework

## Purpose
The CHECK_BEFORE_BUILD protocol ensures agents validate system health, dependencies, and context BEFORE executing any build or deployment tasks. This prevents cascading failures and regression bugs.

## Core Principles

### 1. **Zero-Trust Verification**
Never assume infrastructure is healthy. Always verify explicitly.

### 2. **Build Prerequisites Validation**
All dependencies must exist and be functional before code execution.

### 3. **Context Awareness**
Agents must understand current system state before making changes.

---

## Mandatory Pre-Build Checks

### ✅ **PHASE 1: Critical File Integrity**
```bash
# Run before ANY build work
bash scripts/agent-verification.sh
```

**Validates:**
- ✅ Critical files exist (vite.config.ts, errorHandler.ts, apiResponse.ts)
- ✅ No 0-byte files (empty file detection)
- ✅ Build system health (vite, tsx, esbuild installed)
- ✅ Server can start successfully
- ✅ MB.MD phase documentation available

**Failure Response:** STOP immediately. Restore files from Git before proceeding.

---

### ✅ **PHASE 2: Dependency Health**
```bash
# Verify package integrity
npm list --depth=0
```

**Validates:**
- ✅ All package.json dependencies installed
- ✅ No missing peer dependencies
- ✅ No conflicting versions

**Failure Response:** Run `npm install` or investigate npm corruption (see `docs/NPM_CORRUPTION_INCIDENT_REPORT.md`)

---

### ✅ **PHASE 3: Database Connectivity**
```bash
# Test database connection
node -e "import('drizzle-orm').then(() => console.log('DB OK'))"
```

**Validates:**
- ✅ DATABASE_URL environment variable exists
- ✅ PostgreSQL connection successful
- ✅ Drizzle ORM can access schema

**Failure Response:** Check Replit Secrets, verify Neon DB status

---

### ✅ **PHASE 4: Build System Test**
```bash
# Verify TypeScript compilation
npx tsc --noEmit
```

**Validates:**
- ✅ No TypeScript errors
- ✅ All imports resolve correctly
- ✅ Type definitions consistent

**Failure Response:** Fix LSP errors before building (use `get_latest_lsp_diagnostics`)

---

### ✅ **PHASE 5: Documentation Context**
**Validates:**
- ✅ Agent has read phase-appropriate documentation (MB.MD methodology)
- ✅ Required reading completed (see `docs/MB_MD_DOCUMENTATION_PHASE_MAP.md`)
- ✅ Previous session logs reviewed (see `docs/AGENT_SESSION_LOG.md`)

**Failure Response:** Read required docs before proceeding

---

## Build Phase Integration

### **Before Starting Work:**
1. Run `bash scripts/agent-verification.sh`
2. Answer MB.MD phase prompt (MAPPING/BREAKDOWN/MITIGATION/DEPLOYMENT)
3. Read phase-specific documentation
4. Verify all 5 phases pass

### **During Work:**
- Monitor for file changes that might break dependencies
- Re-verify if modifying critical files (vite.config, package.json)

### **After Completing Work:**
1. Run `bash scripts/verify-completion.sh`
2. Confirm workflow restarts successfully
3. Test routes or take screenshot
4. Update `docs/AGENT_SESSION_LOG.md`

---

## Common Failure Patterns

### ❌ **Pattern 1: Missing Critical Files**
**Symptom:** vite.config.ts, errorHandler.ts, apiResponse.ts missing  
**Root Cause:** Agent deleted files without checking  
**Prevention:** Always run CHECK_BEFORE_BUILD before editing  
**Recovery:** Restore from Git (see replit.md for commit hashes)

### ❌ **Pattern 2: Dependency Drift**
**Symptom:** Build succeeds locally but fails in production  
**Root Cause:** package.json out of sync with node_modules  
**Prevention:** Verify `npm list` before deploying  
**Recovery:** `npm ci` (clean install)

### ❌ **Pattern 3: Database Schema Mismatch**
**Symptom:** Drizzle queries fail at runtime  
**Root Cause:** Code uses schema that doesn't exist in DB  
**Prevention:** Always `npm run db:push` after schema changes  
**Recovery:** Review migration logs, use `--force` if needed

---

## Integration with Other ESA Protocols

**Related Protocols:**
- `ESA_PARALLEL_BY_DEFAULT.md` - Verify independence before parallel execution
- `ESA_WORKLOAD_BALANCING.md` - Check system load before starting heavy tasks
- `ESA_PERFORMANCE_METRICS.md` - Baseline performance before changes
- `ESA_AGENT_CERTIFICATION.md` - Agents must pass CHECK_BEFORE_BUILD to certify

---

## Enforcement

### **Automated Enforcement:**
- Git pre-commit hooks (blocks commits that delete critical files)
- `agent-verification.sh` script (must pass before work)
- `verify-completion.sh` script (must pass before claiming done)

### **Agent Accountability:**
- Agents that skip CHECK_BEFORE_BUILD cause regressions
- Documented in `docs/AGENT_SESSION_LOG.md`
- Repeated failures trigger re-training

---

## Success Metrics

**System Health Indicators:**
- ✅ Zero build failures from missing files
- ✅ 100% pre-work verification completion rate
- ✅ <1% regression bugs from skipped checks
- ✅ All agents pass certification

**Target:** 100% compliance across all 927+ agents

---

## Training Resources

**Must Read Before Using This Protocol:**
1. `docs/COMPREHENSIVE_AGENT_ONBOARDING_PROTOCOL.md` - Agent learning system
2. `docs/PREVENTION_GUIDE.md` - Common failure patterns
3. `docs/AGENT_SESSION_LOG.md` - Historical failures
4. `docs/MB_MD_DOCUMENTATION_PHASE_MAP.md` - Phase-based reading

**Quick Reference:**
- ✅ Run `agent-verification.sh` FIRST
- ✅ Answer MB.MD phase prompt
- ✅ Read required docs
- ✅ Verify all checks pass
- ✅ Start work only after green light

---

**Protocol Owner:** Documentation Agent (Layer #52)  
**Last Updated:** October 19, 2025  
**Review Cycle:** Monthly or after major incidents
