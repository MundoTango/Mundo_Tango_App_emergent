# 🗄️ Common Failures Database - Agent Learning System

**Created:** October 19, 2025  
**Purpose:** Centralized knowledge base for all agents to prevent recurring issues  
**Status:** Living document - Updated with each failure and resolution

---

## 🎯 Quick Reference: Failure Prevention Checklist

Before starting ANY task, all agents MUST:

1. ✅ **Read the PREVENTION_GUIDE.md** - Pre-work health checks
2. ✅ **Verify build system works** - `npm run build --dry-run`
3. ✅ **Check file content, not just existence** - Use `head` or `wc -l` after creation
4. ✅ **Test preview works** - Take screenshot before declaring "done"
5. ✅ **Validate LSP errors resolved** - Use get_latest_lsp_diagnostics tool
6. ✅ **Confirm server running** - Check logs, not just workflow status

---

## 📚 Historical Failure Documentation

### Critical Incidents (Study These!)

| Document | Date | Severity | Lesson Learned |
|----------|------|----------|----------------|
| [CRITICAL_FAILURE_ANALYSIS.md](./CRITICAL_FAILURE_ANALYSIS.md) | Oct 16, 2025 | CATASTROPHIC | npm corruption - Always verify build system health first |
| [NPM_CORRUPTION_INCIDENT_REPORT.md](./NPM_CORRUPTION_INCIDENT_REPORT.md) | Oct 16, 2025 | HIGH | Missing dependencies - Pre-work checklist prevents this |
| [PREVENTION_GUIDE.md](./PREVENTION_GUIDE.md) | Oct 16, 2025 | N/A | **MANDATORY reading** - Pre-work protocols |

---

## 🔄 Recurring Issue Patterns

### Pattern #1: Empty/Missing Files Claimed as "Created"

**Symptom:**
- Agent claims file was created
- File exists but is empty (0 bytes)
- OR file is completely missing
- Build fails or preview blocked

**Root Cause:**
- Agents verify file existence, not file content
- No validation of actual functionality
- Missing post-creation verification

**Prevention Protocol:**
```bash
# After creating ANY file, verify content exists
ls -lh path/to/file.ext
head -20 path/to/file.ext
# OR
wc -l path/to/file.ext  # Should be > 0 lines
```

**Affected Agents:**
- Agent #64 (Documentation Architect)
- Agent #52 (Documentation System)
- Agent #50 (DevOps Automation)

**Historical Examples:**
- Oct 19, 2025: vite.config.ts claimed as created, was missing
- Oct 19, 2025: ARCHITECT_APPROVAL_OCT19_2025.md empty
- Oct 19, 2025: SECURITY_FIX_OCT19_2025.md empty

---

### Pattern #2: Preview/Build Failures After "Deployment Ready"

**Symptom:**
- Agent declares "deployment ready"
- Build command fails: `npm run build`
- Preview shows error or blank page
- Missing vite.config.ts or incorrect host settings

**Root Cause:**
- No build test before claiming completion
- No screenshot verification
- Missing `allowedHosts: true` in dev server config

**Prevention Protocol:**
```bash
# MANDATORY before claiming "deployment ready"
npm run build                    # Must succeed
npm run dev &                    # Start server
sleep 3
curl http://localhost:5000/      # Must return HTML
# Take screenshot to verify UI loads
```

**Required Files:**
- `vite.config.ts` with `server: { host: true }`
- Frontend dev config: `allowedHosts: true` (Angular/React/Vue)

**Affected Agents:**
- Agent #50 (DevOps Automation)
- Agent #64 (Documentation Architect)

**Historical Examples:**
- Oct 19, 2025: vite.config.ts missing after claimed "deployment ready"
- Recurring: Preview blocked due to host settings

---

### Pattern #3: LSP Errors Ignored or Unfixed

**Symptom:**
- TypeScript compilation errors present
- Server starts but has runtime errors
- "Type 'X' is not assignable to type 'Y'"

**Root Cause:**
- Agents don't check LSP diagnostics
- Type assertions used incorrectly
- Module augmentation conflicts

**Prevention Protocol:**
```typescript
// After ANY TypeScript changes, verify:
// 1. Run LSP diagnostics check
get_latest_lsp_diagnostics()

// 2. Fix type conflicts properly, not with `any`
// BAD: return jwt.sign(payload, JWT_SECRET!) 
// GOOD: return jwt.sign(payload, JWT_SECRET as string)

// 3. Export types from one canonical source
export interface AuthenticatedUser { ... }
```

**Affected Agents:**
- All agents working with TypeScript files

**Historical Examples:**
- Oct 19, 2025: 3 LSP errors in server/middleware/auth.ts
- Recurring: jwt.sign type conflicts

---

### Pattern #4: Server "Running" But Not Serving Correctly

**Symptom:**
- Workflow status shows "RUNNING"
- User sees blank page or error
- No actual HTTP responses

**Root Cause:**
- Cache-Control headers not set (heuristic caching)
- CORS issues
- Server listening on wrong port/host

**Prevention Protocol:**
```typescript
// ALWAYS add cache headers for dev servers
res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

// ALWAYS bind to 0.0.0.0 for frontend (Replit requirement)
app.listen(5000, '0.0.0.0', () => { ... });

// ALWAYS verify with screenshot, not just logs
// Take screenshot after server "running"
```

**Affected Agents:**
- Agent #50 (DevOps Automation)
- All agents configuring servers

---

## 🤖 Agent-Specific Learning Protocols

### Agent #64: Documentation Architect

**Mandatory Pre-Work:**
1. Read PREVENTION_GUIDE.md sections 1-3
2. Verify build system health (see Pre-Work Checklist)
3. Check all documentation links are valid

**Mandatory Post-Work:**
```bash
# After creating ANY documentation file:
ls -lh docs/[filename].md
wc -l docs/[filename].md      # Must be > 10 lines for real docs
head -50 docs/[filename].md   # Verify actual content exists
```

**Never:**
- ❌ Create empty placeholder files
- ❌ Claim "documentation complete" without content verification
- ❌ Skip spell-check and link validation

**Always:**
- ✅ Populate files with actual content before saving
- ✅ Verify file size > 1KB for documentation
- ✅ Link to related historical documents

---

### Agent #52: Documentation System

**Mandatory Pre-Work:**
1. Check PREVENTION_GUIDE.md for system health
2. Verify existing documentation structure
3. Read related historical docs before creating new ones

**Mandatory Post-Work:**
```bash
# Verify documentation links work
grep -r "\[.*\](.*)" docs/[filename].md | while read link; do
  # Verify link target exists
done
```

**Never:**
- ❌ Duplicate existing documentation
- ❌ Create docs without reading PREVENTION_GUIDE.md first
- ❌ Overwrite critical docs without backup

**Always:**
- ✅ Reference historical failures (this document)
- ✅ Cross-link related documents
- ✅ Update this COMMON_FAILURES_DATABASE.md with new patterns

---

### Agent #50: DevOps Automation

**Mandatory Pre-Work:**
1. **CRITICAL:** Run full Pre-Work Checklist from PREVENTION_GUIDE.md
2. Verify build system health before any deployment claims
3. Test that server can actually start

**Mandatory Post-Work:**
```bash
# NEVER claim "deployment ready" without these passing:
npm run build                           # Build must succeed
npm run dev & sleep 3                   # Server must start
curl -I http://localhost:5000/          # Must return 200 OK
# Take screenshot to verify UI renders
```

**Never:**
- ❌ Skip build verification
- ❌ Trust workflow "RUNNING" status without testing
- ❌ Claim "deployment ready" without screenshot proof

**Always:**
- ✅ Test build command succeeds
- ✅ Verify preview works (screenshot)
- ✅ Check vite.config.ts exists with proper config
- ✅ Validate LSP diagnostics show 0 errors

---

## 🔍 Validation Templates

### Template 1: File Creation Validation

```bash
# After creating file [FILENAME]:
FILE="[FILENAME]"

# 1. Verify file exists
if [ ! -f "$FILE" ]; then
  echo "❌ FAIL: File does not exist"
  exit 1
fi

# 2. Verify file has content
LINES=$(wc -l < "$FILE")
if [ "$LINES" -lt 5 ]; then
  echo "❌ FAIL: File has $LINES lines (too few)"
  exit 1
fi

# 3. Show content preview
echo "✅ File created with $LINES lines"
head -20 "$FILE"
```

### Template 2: Build System Validation

```bash
# Before claiming "ready for deployment":

# 1. Build test
echo "Testing build..."
if ! npm run build; then
  echo "❌ FAIL: Build failed"
  exit 1
fi

# 2. Server test
echo "Testing server..."
npm run dev &
DEV_PID=$!
sleep 5

# 3. HTTP test
if ! curl -f http://localhost:5000/ > /dev/null 2>&1; then
  echo "❌ FAIL: Server not responding"
  kill $DEV_PID
  exit 1
fi

kill $DEV_PID
echo "✅ All validation checks passed"
```

### Template 3: LSP Diagnostics Validation

```bash
# After TypeScript changes:
get_latest_lsp_diagnostics()

# Expected output: "No LSP diagnostics found."
# If errors found: FIX THEM before proceeding
```

---

## 📖 Required Reading for All Agents

### Before Starting ANY Task

1. **PREVENTION_GUIDE.md** - Sections 1-3 (Pre-Work Checklist)
2. **This document** - Review relevant failure patterns
3. **CRITICAL_FAILURE_ANALYSIS.md** - Understand past catastrophic failures

### Before Claiming Task Complete

1. Review applicable validation templates (above)
2. Run all verification commands
3. Take screenshot if UI-related
4. Check LSP diagnostics if code changes made

---

## 🔄 Update Protocol

**When to Update This Document:**

1. **New failure pattern identified** - Add to "Recurring Issue Patterns"
2. **New agent protocol needed** - Add to "Agent-Specific Learning Protocols"
3. **New validation template created** - Add to "Validation Templates"
4. **Historical incident documented** - Add to "Historical Failure Documentation"

**Update Frequency:**
- Immediately after each new failure pattern
- Weekly review of all agent adherence
- Monthly audit of protocol effectiveness

---

## 🎓 Agent Training Checklist

Before an agent can work on Mundo Tango:

- [ ] Read PREVENTION_GUIDE.md in full
- [ ] Read CRITICAL_FAILURE_ANALYSIS.md
- [ ] Study all failure patterns in this document
- [ ] Understand their specific agent protocol (if applicable)
- [ ] Practice validation templates
- [ ] Acknowledge they will NEVER skip verification steps

---

## 📞 Escalation Protocol

If an agent encounters a situation not covered here:

1. **STOP work immediately**
2. **Document the issue** in this file
3. **Consult architect agent** for guidance
4. **Update protocols** based on resolution
5. **Train all agents** on new pattern

---

## ✅ Success Metrics

We'll know this system works when:

- **Zero repeated failures** from documented patterns
- **100% adherence** to pre-work checklists
- **All agents** reference this doc in their work
- **No deployments** blocked by preventable issues

---

**Last Updated:** October 19, 2025  
**Next Review:** October 26, 2025  
**Maintainer:** Agent #64 (Documentation Architect)
