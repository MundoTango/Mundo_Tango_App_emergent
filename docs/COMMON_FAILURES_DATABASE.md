# Common Failures Database - Agent Learning System

**Last Updated:** October 19, 2025  
**Purpose:** Document recurring failure patterns and prevention protocols for AI agents

## Overview

This database tracks critical failures that have occurred in the Mundo Tango platform development and provides systematic prevention protocols to ensure AI agents learn from historical issues.

## Critical Failure Patterns

### Pattern 1: Split-Brain Vite Configuration (Oct 19, 2025)

**Severity:** CRITICAL  
**Impact:** Deployment failure, UI blocked requests, build system collapse

**Root Cause:**
- Development mode used inline Vite config in `server/vite.ts`
- Build/deployment mode required `vite.config.ts` file at project root
- Package.json line 8 (`cp vite.config.ts dist/`) assumed file existed
- Missing canonical config file caused build failures

**Symptoms:**
- `npm run build` fails with "vite.config.ts not found"
- UI shows "blocked request" errors in browser
- Server runs but frontend doesn't load
- Split configuration between dev and production

**Prevention Protocol:**
1. ✅ **Canonical Configuration:** Always maintain `vite.config.ts` at project root
2. ✅ **Import in Dev:** Server should import and use canonical config, not duplicate
3. ✅ **Verification:** Run `scripts/agent-verification.sh` before claiming completion
4. ✅ **Build Test:** Always test `npm run build` succeeds before deployment claims

**Resolution:**
- Created canonical `vite.config.ts` with `host: true` and proper client root
- Updated `server/vite.ts` to import from canonical file
- Verified build script dependency chain

**Agent Responsibility:**
- Agent #50 (DevOps): Must verify build system health
- Agent #52 (Documentation): Must validate file content, not just existence
- Agent #64 (Documentation Architect): Must ensure configuration consistency

### Pattern 2: Empty Documentation Files (Oct 19, 2025)

**Severity:** HIGH  
**Impact:** Missing critical documentation, incomplete knowledge transfer

**Root Cause:**
- Agents in Plan mode create empty placeholder files
- Files claimed as "created" but contain 0 bytes
- No verification of file content after creation
- Documentation appears complete but lacks actual information

**Symptoms:**
- `ls` shows files exist
- `wc -l` shows 0 lines
- `cat` shows empty content
- Agent claims work complete but files are hollow

**Examples Detected:**
- `SECURITY_FIX_OCT19_2025.md` - created empty, needed security fix content
- `COMMON_FAILURES_DATABASE.md` - created in Plan mode, didn't persist

**Prevention Protocol:**
1. ✅ **Content Verification:** Always verify file has content (> 5 lines minimum)
2. ✅ **Build Mode Only:** Create documentation files in Build mode only
3. ✅ **Automated Detection:** Run `scripts/agent-verification.sh` to detect empty files
4. ✅ **Pre-commit Hook:** Install hook via `scripts/install-pre-commit-hook.sh`

**Resolution:**
- Updated verification script with empty file detection (Section 4)
- Created pre-commit hook to block empty .md files
- Re-generated all empty documentation with actual content

**Agent Responsibility:**
- Agent #52 (Documentation): Must verify content exists after creation
- Agent #64 (Documentation Architect): Must review documentation completeness
- All agents: Never claim file created without verifying content

### Pattern 3: Missing Middleware/Utility Files (Oct 19, 2025)

**Severity:** CRITICAL  
**Impact:** Server startup failure, runtime crashes

**Root Cause:**
- Files created in Plan mode don't persist
- Import statements reference non-existent modules
- No build-time verification catches missing files
- Runtime failure occurs only on server startup

**Examples:**
- `server/middleware/errorHandler.ts` - claimed created but missing
- `server/utils/apiResponse.ts` - claimed created but missing

**Symptoms:**
```
Error: Cannot find module './errorHandler'
Require stack:
- /home/runner/workspace/server/middleware/auth.ts
```

**Prevention Protocol:**
1. ✅ **File Existence:** Verify file exists before moving to next task
2. ✅ **Content Validation:** Check file has proper exports/imports
3. ✅ **Server Restart:** Always restart workflow after creating infrastructure files
4. ✅ **Log Review:** Check server logs for import errors

**Resolution:**
- Created missing files with proper content
- Exported functions that matched import statements
- Verified server startup successful

**Agent Responsibility:**
- Agent #50 (DevOps): Must verify server starts without module errors
- All agents: Create files in Build mode, verify immediately

## Agent Learning Protocols

### Pre-Work Verification Checklist

Before starting ANY task involving file creation or modification:

1. **Check Current State**
   ```bash
   ./scripts/agent-verification.sh
   ```

2. **Identify Dependencies**
   - What files does this task depend on?
   - Are they present and non-empty?
   - Do they have proper content?

3. **Review Historical Failures**
   - Have we seen this pattern before?
   - What went wrong last time?
   - What prevention measures exist?

### Post-Work Verification Checklist

After completing ANY task:

1. **Verify File Content**
   ```bash
   wc -l <filename>  # Should be > 5 lines
   cat <filename>    # Should show actual content
   ```

2. **Test Build System**
   ```bash
   npm run build  # Must succeed
   ```

3. **Restart Server**
   ```bash
   # Workflow auto-restarts
   # Check logs for errors
   ```

4. **Take Screenshot** (if UI work)
   ```bash
   # Verify preview loads
   # No "blocked request" errors
   ```

### Agent-Specific Protocols

#### Agent #50 (DevOps Layer)

**Mandatory Checks Before Claiming "Deployment Ready":**

1. ✅ Verify `vite.config.ts` exists with proper configuration
2. ✅ Run `npm run build` successfully
3. ✅ Verify `package.json` scripts don't reference missing files
4. ✅ Check server logs for module import errors
5. ✅ Run `scripts/agent-verification.sh --build-test`

**Never:**
- ❌ Claim deployment ready without testing build
- ❌ Assume configuration files exist without verification
- ❌ Skip log review after server restart

#### Agent #52 (Documentation Agent)

**Mandatory Checks Before Claiming Documentation Complete:**

1. ✅ Verify all .md files have content (not 0 bytes)
2. ✅ Check documentation cross-references are valid
3. ✅ Ensure code examples are accurate
4. ✅ Validate links point to existing files
5. ✅ Run `scripts/agent-verification.sh` for file integrity

**Never:**
- ❌ Create empty placeholder files
- ❌ Claim documentation exists without verifying content
- ❌ Work in Plan mode for documentation creation

#### Agent #64 (Documentation Architect)

**Mandatory Checks Before Architecture Sign-off:**

1. ✅ Verify all referenced files exist with proper content
2. ✅ Check configuration consistency (dev vs prod)
3. ✅ Validate dependency chains
4. ✅ Ensure documentation completeness
5. ✅ Review historical failure patterns

**Never:**
- ❌ Approve architecture without verifying build
- ❌ Skip verification of critical configuration files
- ❌ Assume files exist based on agent claims alone

## Automated Verification Tools

### scripts/agent-verification.sh

**Purpose:** Automated health check for build system and documentation

**Usage:**
```bash
# Standard verification
./scripts/agent-verification.sh

# With build test (slower but comprehensive)
./scripts/agent-verification.sh --build-test
```

**Checks:**
1. Build system health (npm, node, vite, tsx)
2. Critical files exist with content
3. Documentation integrity
4. Empty file detection
5. Optional: Full build test

**When to Run:**
- ✅ Before claiming any task complete
- ✅ After creating/modifying configuration files
- ✅ Before deployment claims
- ✅ After documentation updates

### scripts/install-pre-commit-hook.sh

**Purpose:** Install Git pre-commit hook to prevent empty documentation files

**Usage:**
```bash
./scripts/install-pre-commit-hook.sh
```

**Protection:**
- Blocks commits with empty .md files
- Validates staged documentation has content
- Prevents hollow documentation from entering repository

## Cross-References

**Related Documentation:**
- `docs/PREVENTION_GUIDE.md` - Comprehensive prevention strategies
- `docs/CRITICAL_FAILURE_ANALYSIS.md` - Detailed failure analysis
- `SECURITY_FIX_OCT19_2025.md` - Security fix documentation

**Agent Files:**
- `agents/layer-50-devops-agent.md` - Agent #50 protocols
- `agents/layer-52-documentation-agent.md` - Agent #52 protocols  
- `agents/layer-64-documentation-architect.md` - Agent #64 protocols

## Failure Prevention Summary

### The Three Golden Rules

1. **Verify Content, Not Existence**
   - File existence ≠ File has content
   - Always check line count and actual content
   - Never trust "file created" claims without verification

2. **Build Must Always Succeed**
   - `npm run build` is the ultimate test
   - No deployment claims without successful build
   - Test build before claiming work complete

3. **Split-Brain Configurations are Deadly**
   - Maintain canonical configuration files
   - Import from canonical, never duplicate
   - Dev and production must use same config source

### Success Metrics

**Before this system:**
- ❌ vite.config.ts went missing multiple times
- ❌ Empty documentation files created
- ❌ Server failures due to missing modules
- ❌ Build failures discovered late

**After this system:**
- ✅ Automated detection of empty files
- ✅ Verification script catches issues early
- ✅ Agent protocols prevent recurring failures
- ✅ Pre-commit hooks block hollow documentation

## Continuous Improvement

This database should be updated whenever:

1. **New Failure Pattern Discovered**
   - Document root cause
   - Create prevention protocol
   - Update agent responsibilities

2. **Prevention Measure Added**
   - Document new tool/script
   - Update verification checklist
   - Cross-reference related docs

3. **Agent Protocol Updated**
   - Note what changed and why
   - Update agent-specific sections
   - Ensure all agents informed

---

**Maintained By:** Documentation Agent (Layer 52)  
**Review Cycle:** After each critical incident  
**Version:** 1.0.0
