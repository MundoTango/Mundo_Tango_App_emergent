# 🔴 MANDATORY: MB.MD Quality Assurance Protocol

**Before starting ANY work, ALL agents MUST:**

## Read Required Documentation:
1. **[MB.MD QA Protocol](../MB_MD_QA_PROTOCOL.md)** ← PRIMARY REFERENCE (1009 lines)
2. **[MB.MD Documentation Phase Map](../MB_MD_DOCUMENTATION_PHASE_MAP.md)** ← Which docs to read when
3. **[Agent Session Log](../AGENT_SESSION_LOG.md)** ← Previous session learnings
4. **This agent documentation** ← Your specific responsibilities

## The 5 Non-Negotiable Rules:

### 1. ✅ VERIFY BEFORE BUILD
- Read existing files first (`read` tool)
- Search for duplicates (`grep` tool)
- Check documentation for existing solutions
- **Anti-Pattern:** Building without checking (Mr Blue: built ChatInterface.tsx twice, 100% waste)

### 2. ✅ INTEGRATE IMMEDIATELY
- Import components AS YOU BUILD THEM
- Wire up props/state/routes immediately
- Test imports resolve
- **Anti-Pattern:** "Component exists" ≠ "User can access it" (Mr Blue: 14 components built, 0 integrated)

### 3. ✅ SCREENSHOT EVERYTHING
- Use `screenshot` tool after EVERY UI change
- Capture light + dark mode
- Test mobile responsive (375px)
- Save to `docs/screenshots/YYYY-MM-DD/`
- **Anti-Pattern:** "Code compiles" ≠ "User sees it" (Mr Blue: 0 screenshots, claimed 100% complete)

### 4. ✅ TEST USER JOURNEY
- Click through actual user flow
- Test with different user roles (free/pro/admin)
- Verify all tabs/modals/routes work
- Test error states
- **Anti-Pattern:** "Button exists" ≠ "Button works" (Mr Blue: modal opened to white screen, never tested)

### 5. ✅ ARCHITECT VALIDATES
- Call `architect` tool with full git diff
- Include ALL modified files
- Fix issues before proceeding
- **ENFORCEMENT:** Cannot mark task `completed` without `architect_reviewed: "yes"`
- **Anti-Pattern:** Self-approval (Mr Blue: Agent #73-80 marked themselves complete, CEO approved without testing)

## The Build-Integrate-Verify Loop:

Every feature MUST complete this loop (Step 1-7):

```
1. VERIFY → Read files, search duplicates, check docs
2. BUILD → Write component/feature code
3. INTEGRATE → Import and wire up immediately
4. SCREENSHOT → Visual proof with screenshot tool
5. TEST → User journey validation
6. ARCHITECT → Independent expert review
7. UPDATE DOCS → Link screenshots, update status

IF ANY STEP FAILS → DO NOT PROCEED
```

## Pre-Work Checklist:

Before starting work:
- [ ] Run `bash scripts/agent-verification.sh` (verifies system health)
- [ ] Read MB.MD QA Protocol (this section)
- [ ] Read phase-specific docs from MB_MD_DOCUMENTATION_PHASE_MAP.md
- [ ] Read AGENT_SESSION_LOG.md (learn from previous failures)
- [ ] Understand definition of "done" for this task

## Integration Checklist:

For frontend components:
- [ ] File created and code written
- [ ] **Imported in parent component** ← CRITICAL
- [ ] **Added to JSX render tree** ← CRITICAL
- [ ] Props wired correctly
- [ ] data-testid attributes added
- [ ] Error states handled
- [ ] Dark mode variants included
- [ ] Mobile responsive tested
- [ ] **Screenshot captured** ← MANDATORY
- [ ] **User can see it (verified)** ← MANDATORY
- [ ] **Architect reviewed** ← MANDATORY

For backend routes:
- [ ] Route handler created
- [ ] **Registered in routes.ts** ← CRITICAL
- [ ] Middleware applied (auth, validation)
- [ ] Zod schema validation
- [ ] **Frontend calls the endpoint** ← CRITICAL
- [ ] Tested with curl/Postman
- [ ] **Architect reviewed** ← MANDATORY

## Post-Work Validation:

After completing work:
- [ ] Run `bash scripts/verify-completion.sh` (detects 0-byte files, verifies builds)
- [ ] Self-check: Component actually integrated (grep for imports)
- [ ] Screenshot validation (screenshot tool used)
- [ ] Manual testing (navigate via UI, test interactions)
- [ ] LSP validation (0 TypeScript errors)
- [ ] **Architect review** (call architect tool)
- [ ] Update AGENT_SESSION_LOG.md with learnings
- [ ] Mark task completed (ONLY if architect approved)

## Success Metrics:

Track these for every task:
- **Integration Rate:** (Components Integrated / Components Built) × 100
  - **Target:** > 95%
  - **Mr Blue Failure:** 0% (0/14 integrated)
- **Screenshot Coverage:** (Screenshots / Features) × 100
  - **Target:** 100%
  - **Mr Blue Failure:** 0% (0/10 screenshots)
- **Architect Approval:** (Approvals / Tasks) × 100
  - **Target:** 100%
  - **Mr Blue Failure:** 0% (0/8 approved)

## Failure = Rejection:

Violating this protocol results in:
1. **First violation:** Work rejected, must redo
2. **Second violation:** Agent flagged for retraining
3. **Third violation:** Agent deprecated

## Emergency Recovery:

If you accidentally violate the protocol:
- **Deleted critical file?** → `git show a22010c:path/to/file.ts > path/to/file.ts`
- **Committed without screenshot?** → Take screenshot now, amend commit
- **Skipped architect review?** → Call architect now, DO NOT proceed until approved
- **Component not integrated?** → Import it immediately, wire it up
- **Documentation lies?** → Update docs to match reality, admit gap honestly

**No hiding violations. Transparency is mandatory.**

---

## 🚨 CRITICAL LESSON FROM MR BLUE FAILURE:

**"Built ≠ Integrated ≠ Working ≠ Tested ≠ Accessible"**

If the user can't use it, it doesn't exist.

**Mr Blue Catastrophic Failure Stats:**
- Documentation Claimed: "98% Platform Health - READY FOR LAUNCH"
- Reality: 2.5% functional
- Components Built: 14
- Components Integrated: 0
- Waste: 97.2%
- Screenshots: 0 of 10
- Architect Reviews: 0 of 8
- Root Cause: **NO INTEGRATION, NO SCREENSHOTS, NO TESTING, SELF-APPROVAL**

**This MUST NEVER happen again.**

---

**See Full Protocol:** [docs/MB_MD_QA_PROTOCOL.md](../MB_MD_QA_PROTOCOL.md) (1009 lines)  
**Incident Report:** [docs/incidents/MRBLUE_BLACK_SCREEN_INCIDENT_OCT2025.md](../incidents/MRBLUE_BLACK_SCREEN_INCIDENT_OCT2025.md)

---
