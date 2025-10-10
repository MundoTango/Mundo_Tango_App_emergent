# RUN-AUDIT Instructions
## Systematic Page Audit Execution Protocol

**Purpose:** Step-by-step instructions for AI agents to systematically audit all 100+ pages  
**Based on:** ESA_ORCHESTRATION.md systematic methodology  
**Framework:** ESA 61x21 - 35-Agent Automated Testing System  
**Last Updated:** October 10, 2025

---

## 📋 BEFORE STARTING: Read These Files

**MUST READ FIRST:**
1. `docs/pages/esa-tools/AUDIT-PROGRESS-TRACKER.md` - Check current status
2. `docs/pages/esa-tools/standardized-page-audit.md` - Understand methodology
3. `docs/pages/page-audit-registry.json` - Know all pages

---

## 🎯 EXECUTION PROTOCOL

### STEP 1: Check Progress Tracker

```bash
# Open tracker document
cat docs/pages/esa-tools/AUDIT-PROGRESS-TRACKER.md
```

**Find:**
- Current completion status (X of 79 pages)
- Next page marked "🔲 NOT STARTED" or "⚠️ NEEDS FIXES"
- Priority queue order

**Note the page key** (e.g., "events", "housing-marketplace")

---

### STEP 2: Run the Audit

```bash
# Execute audit on the identified page
npm run audit-page <page-key>

# Example:
npm run audit-page events
```

**Capture:**
- Overall Score (0-100)
- Status (EXCELLENT/GOOD/NEEDS IMPROVEMENT/CRITICAL)
- Critical Issues count
- High Priority Issues count
- Agent findings

---

### STEP 3: Analyze Results

**Decision Tree:**

#### If Score >= 90 (CERTIFIED) ✅
- Status: **CERTIFIED - Production Ready**
- Action: Mark complete in tracker
- Next: Go to Step 5

#### If Score 85-89 (CONDITIONAL) ⚠️
- Status: **CONDITIONAL - Deployable with improvements**
- Action: List all medium/high priority issues
- Next: Go to Step 4 (optional fixes)

#### If Score < 85 (NEEDS WORK) ❌
- Status: **NEEDS WORK - Fix required**
- Action: List ALL issues by priority
- Next: **MUST** go to Step 4 (mandatory fixes)

---

### STEP 4: Review Issues and Propose Fixes

**🚨 CRITICAL: AUDIT-ONLY MODE - NO AUTO-FIXING**

**Priority Order:**
1. 🔴 **Critical Issues** - Report to user immediately
2. 🟠 **High Priority** - Report before marking complete
3. 🟡 **Medium Priority** - Report if score < 90
4. 🔵 **Low Priority** - Document for future

**For Each Issue - REPORT ONLY:**

```markdown
📋 Issue: No cache invalidation found in mutations
📍 Location: client/src/pages/events.tsx:line 45
🔍 Evidence:
const mutation = useMutation({
  mutationFn: api.create,
  // ❌ Missing onSuccess cache invalidation
});

✅ Recommended Fix: Use existing pattern from approved-patterns.md section 3.2
Reference: Events page (line 67) already has this pattern:
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['/api/events'] });
}

⏸️ AWAITING USER APPROVAL before implementing
```

**NEVER Auto-Fix During Audit:**
- ❌ Do NOT modify any files during audit
- ❌ Do NOT create new components/utilities
- ✅ ONLY report findings with specific locations
- ✅ ONLY suggest fixes using existing patterns
- ✅ ALWAYS reference approved solutions from docs

**After User Reviews Issues:**
1. User reviews all findings
2. User approves specific fixes
3. THEN make approved changes
4. Re-run audit to verify
5. Repeat until score >= 90

---

### STEP 5: Update Progress Tracker

**Open:** `docs/pages/esa-tools/AUDIT-PROGRESS-TRACKER.md`

**Update the page entry:**

```markdown
## [Category] - [Page Display Name]

**Status:** ✅ COMPLETE (CERTIFIED)  
**Score:** 99/100  
**Date:** 2025-10-10  
**Issues Fixed:** 
- Fixed cache invalidation in mutations
- Added dark mode variants
**Agent Results:**
- Performance: 100/100 ✅
- Frontend: 100/100 ✅
- Design: 95/100 ✅
```

**Update Summary Stats:**
- Increment completed count
- Add to category completion %
- Update platform average score

---

### STEP 6: Save Audit Report

**Reports auto-save to:** `docs/audit-reports/`

**Verify file exists:**
```bash
ls -la docs/audit-reports/<page-key>-*.json
```

**If detailed markdown needed:**
- Copy report structure from `FULL-ESA-61x21-AUDIT-MEMORIES-2025-10-09.md`
- Include all 35 agent findings
- Save as `FULL-ESA-61x21-AUDIT-<PAGE>-<DATE>.md`

---

### STEP 7: Move to Next Page

**Go back to STEP 1**

```bash
# Check tracker for next page
cat docs/pages/esa-tools/AUDIT-PROGRESS-TRACKER.md | grep "🔲 NOT STARTED" | head -1
```

**Repeat until:**
- ✅ All 79 pages = COMPLETE
- ✅ Platform average >= 90
- ✅ Zero critical issues platform-wide

---

## 🚨 CRITICAL RULES

### MUST DO:
1. ✅ **Always read tracker first** - Never skip this
2. ✅ **Fix issues before moving on** - If score < 90
3. ✅ **Update tracker after each page** - Never forget
4. ✅ **Re-run audit after fixes** - Verify improvements
5. ✅ **Save reports** - Documentation is critical

### NEVER DO:
1. ❌ Skip reading the tracker
2. ❌ Mark page complete if score < 90
3. ❌ Move to next page with unfixed critical issues
4. ❌ Forget to update completion stats
5. ❌ Lose track of which page you're on

---

## 📊 Quality Gates

**Page Certification Requirements:**
- Overall score >= 90
- Zero critical issues
- Zero high priority issues (or documented exceptions)
- All critical agents passing:
  - Agent #2 (Frontend) >= 90
  - Agent #5 (Business Logic) >= 90
  - Agent #7-9 (Platform) >= 90
  - Agent #14 (Code Quality) >= 90

**Platform Certification Requirements:**
- All 79 pages certified (90+)
- Platform average >= 90
- Zero critical issues across platform
- 95%+ translation coverage everywhere

---

## 🔄 Category-Based Execution

**For systematic category auditing:**

```bash
# Audit entire category
npm run audit:category SOCIAL

# This will audit all pages in SOCIAL category
# Then fix issues and update tracker for each
```

**Categories (Priority Order):**
1. **AUTH** (2 pages) - Security critical
2. **CORE** (20 pages) - Essential features
3. **SOCIAL** (13 pages) - User engagement
4. **HOUSING** (8 pages) - Marketplace
5. **SETTINGS** (9 pages) - User preferences
6. **LIFECYCLE** (9 pages) - Life CEO features
7. **ADMIN** (15 pages) - Admin tools
8. **ANALYTICS** (3 pages) - Dashboards

---

## 📈 Progress Tracking

**Check platform health anytime:**

```bash
# View all pages and status
npm run audit:list

# Run full platform audit
npm run audit:all

# Check specific category
npm run audit:category SOCIAL
```

**Tracker shows:**
- ✅ Completed pages (with scores)
- 🔲 Not started pages
- ⚠️ Needs fixes (score < 90)
- 📊 Category completion %
- 🎯 Platform average score

---

## 🎯 Success Criteria

### Per Page:
- [x] Score >= 90
- [x] Zero critical issues
- [x] Zero high priority issues
- [x] All critical agents passing
- [x] Updated in tracker

### Platform-Wide:
- [ ] 79/79 pages certified
- [ ] Platform average >= 90
- [ ] Zero critical issues
- [ ] All categories 100% complete

---

## 📚 Reference Documents

**Primary:**
1. `ESA_ORCHESTRATION.md` - Master orchestration guide
2. `docs/pages/esa-tools/standardized-page-audit.md` - 35-agent methodology
3. `docs/pages/esa-tools/AUDIT-PROGRESS-TRACKER.md` - Progress tracking
4. `docs/pages/page-audit-registry.json` - Page mappings

**Examples:**
- `docs/audit-reports/FULL-ESA-61x21-AUDIT-MEMORIES-2025-10-09.md` - 91/100 (CERTIFIED)
- `docs/audit-reports/events-*.json` - 99/100 (EXCELLENT)

**Supporting:**
- `ESA.md` - 61 Technical Layers
- `docs/pages/design-systems/aurora-tide.md` - Design system
- `docs/platform-handoff/approved-patterns-2025-10-10.md` - Approved patterns

---

## 🔁 Execution Loop

**Standard Loop (for AI agents):**

```
1. Read AUDIT-PROGRESS-TRACKER.md
2. Find next "NOT STARTED" page
3. Run: npm run audit-page <page-key>
4. If score < 90: Fix issues and re-audit
5. Update tracker with results
6. Go to step 1

REPEAT until all 79 pages complete
```

---

## 💬 User Communication

**After Each Page:**
```
✅ Page audited: <Page Name>
📊 Score: <score>/100 (<status>)
🔍 Issues: <critical> critical, <high> high priority
✅ Fixed: <list of fixes>
📝 Updated tracker

Next: <next page name> or "All pages complete!"
```

**After Category:**
```
✅ Category complete: <CATEGORY>
📊 Pages: <count> audited
📈 Average: <avg score>/100
🎯 Issues: <summary>

Next category: <name> or "All categories complete!"
```

---

## 🎉 Completion

**When all 79 pages certified:**

1. Generate final platform report
2. Update tracker to 100% complete
3. Save summary to `docs/audit-reports/PLATFORM-CERTIFICATION-<DATE>.md`
4. Celebrate! 🎊

**Final Report Includes:**
- Platform average score
- Category breakdown
- Top performing pages
- Improvement timeline
- Certification status

---

**STATUS:** Ready for execution  
**USAGE:** Reference this file when user says "Run the audit" or "Follow RUN-AUDIT.md"  
**NEXT:** Create/update AUDIT-PROGRESS-TRACKER.md to track all 79 pages
