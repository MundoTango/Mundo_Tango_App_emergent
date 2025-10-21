# MB.MD Agent Self-Audit Protocol v1.0
**Created:** October 21, 2025  
**Purpose:** Enable all 234+ agents to audit their own work and prevent "documentation ≠ reality" failures  
**Mandatory For:** ALL agents before claiming completion  
**Based On:** Mr Blue catastrophic failure analysis (98% claimed, 2.5% functional)

---

## 🎯 **Purpose**

This protocol enables ANY agent to:
1. **Search all documentation** recursively to find what was promised
2. **Verify implementation** against documentation claims
3. **Calculate honest completion percentage** (not optimistic estimates)
4. **Create prioritized task lists** to close gaps
5. **Prevent waste** from building features that already exist

---

## 📋 **The 5 Non-Negotiable Rules** (From MB.MD QA Protocol)

Before ANY agent claims work is complete:

1. ✅ **VERIFY BEFORE BUILD** - Check what exists first (prevents duplicate work)
2. ✅ **INTEGRATE IMMEDIATELY** - Import as you build (prevents "component exists" fallacy)
3. ✅ **SCREENSHOT EVERYTHING** - Visual proof required (prevents "code compiles" fallacy)
4. ✅ **TEST USER JOURNEY** - Users must access it (prevents "button exists" fallacy)
5. ✅ **ARCHITECT VALIDATES** - Independent review (prevents self-approval waste)

**Build-Integrate-Verify Loop:**
```
VERIFY → BUILD → INTEGRATE → SCREENSHOT → TEST → ARCHITECT → UPDATE DOCS → COMPLETE
```

**Failure to follow = Work rejected**

---

## 🔍 **PHASE 1: MAPPING - Recursive Documentation Search**

### Step 1.1: Find ALL Documentation for Your Agent

**Search Pattern:**
```bash
# Example for Mr Blue agent
grep -r "Mr Blue\|MrBlue\|mr-blue\|Agent #73" docs/ --files-with-matches

# Example for Journey Agents
grep -r "Journey Agent\|J[1-9]" docs/ --files-with-matches

# Example for Algorithm Agents
grep -r "Algorithm Agent\|A[1-9]\|A[1-2][0-9]|A30" docs/ --files-with-matches
```

**Result:** List of ALL files mentioning your agent/feature

**Mr Blue Example:** Found **134 documentation files** across:
- `docs/MrBlue/*.md` (100+ files)
- `docs/ESA_Agents/agents/ESA73*.md`
- `docs/agents/*.md`
- `docs/MB_MD_*.md`

### Step 1.2: Read Master Documentation Files

**Priority order:**
1. Main feature doc (e.g., `docs/MrBlue/mb.md`)
2. Agent-specific docs (e.g., `docs/ESA_Agents/agents/ESA73_MrBlue_Core.md`)
3. Implementation plans (e.g., `COMPLETE_BUILD_MASTER_PLAN.md`)
4. Completion reports (e.g., `FINAL_MR_BLUE_IMPLEMENTATION.md`)

**What to extract:**
- ✅ Claimed status ("READY FOR LAUNCH", "98% complete")
- ✅ Feature list (numbered, bulleted claims)
- ✅ Technical specifications (APIs, components, databases)
- ✅ User journeys (what users should be able to do)

### Step 1.3: Create Documented Features Checklist

**Template:**
```markdown
## Documented Features for [Agent Name]

### Category 1: [Core Features]
- [ ] Feature 1 (Doc: file.md line 123)
- [ ] Feature 2 (Doc: file.md line 456)

### Category 2: [Integration Points]
- [ ] Integration A (Doc: file.md line 789)
- [ ] Integration B (Doc: file.md line 012)
```

**Mr Blue Example:**
```markdown
### Category 1: Core UI Components
- [ ] 3D Avatar System (mb.md line 36, ESA73 lines 59-86)
- [ ] Voice Interaction (MR_BLUE_VOICE_ACTIVATION_PLAN.md, 395 lines)
- [ ] Personality Switching (ESA73 lines 67-71)

### Category 2: Journey Agents
- [ ] J1: Welcome Guide (mb.md line 196)
- [ ] J2: Profile Setup (mb.md line 196)
- [ ] J3: Community Connection (mb.md line 196)
- [ ] J4: First Event (mb.md line 196)
- [ ] J5: Advanced Features (mb.md line 196)
```

---

## ✅ **PHASE 2: BREAKDOWN - Verification Against Reality**

### Step 2.1: Check File Existence

**For each documented feature, verify:**
```bash
# Does the file exist?
ls -la client/src/components/mrBlue/MrBlueAvatar.tsx
ls -la server/routes/journeyRoutes.ts

# Is it in routes?
grep "journeyRoutes" server/routes.ts

# Is it imported in main component?
grep "MrBlueAvatar" client/src/pages/MrBluePage.tsx
```

**Status Codes:**
- ✅ **EXISTS + INTEGRATED** - File exists AND is imported/used
- ⚠️ **EXISTS BUT NOT INTEGRATED** - File exists but never imported (MR BLUE FAILURE PATTERN)
- ❌ **DOES NOT EXIST** - File missing completely

**Mr Blue Example:**
```
✅ MrBlueAvatar.tsx - File exists
⚠️ MrBlueAvatar.tsx - NOT imported in MrBluePage.tsx
❌ Result: Avatar DOCUMENTED but NOT VISIBLE to users
```

### Step 2.2: Check Integration Points

**Critical check:** Does component exist ≠ component works

**Integration verification:**
```typescript
// BAD (Mr Blue failure pattern)
File exists: client/src/components/mrBlue/ChatInterface.tsx
But NEVER imported in: client/src/pages/MrBluePage.tsx
Result: 97.2% waste - built but unusable

// GOOD
File exists: client/src/components/mrBlue/ChatInterface.tsx
AND imported in: client/src/pages/MrBluePage.tsx line 45
AND rendered in: <ChatInterface messages={messages} />
Result: Actually works
```

**Check these integration points:**
1. ✅ Import statement exists
2. ✅ Component rendered in JSX
3. ✅ Props passed correctly
4. ✅ No TypeScript errors
5. ✅ Visible in browser (screenshot proof)

### Step 2.3: Calculate Honest Completion Percentage

**Formula:**
```
Completion % = (EXISTS + INTEGRATED) / (TOTAL DOCUMENTED) × 100

NOT:
Completion % = (FILES EXIST) / (TOTAL DOCUMENTED) × 100  ❌ WRONG
```

**Mr Blue Real Calculation:**
```
Total Documented Features: 60
Files Exist: 58
Files Exist + Integrated: 25
Files Exist + Integrated + User Accessible: 15

Claimed: 98% (based on files existing)
Reality: 25% (based on integration)
User Experience: 15% (based on actual accessibility)
```

**Honest Status Levels:**
- 🔴 **0-25%**: Not functional, major work needed
- 🟡 **26-60%**: Partially working, significant gaps
- 🟢 **61-85%**: Mostly working, minor issues
- ✅ **86-100%**: Production ready (rare, requires validation)

---

## ⚠️ **PHASE 3: MITIGATION - Gap Analysis & Prioritization**

### Step 3.1: Categorize Missing Features

**Group gaps by impact:**

**Category A: CRITICAL (blocks users)**
- Features users expect but can't access
- Broken navigation/404 errors
- Non-functional core workflows

**Category B: HIGH (degrades experience)**
- Documented features missing
- Integration gaps (files exist but not connected)
- Performance issues

**Category C: MEDIUM (nice to have)**
- Advanced features
- Optimization opportunities
- Edge case handling

**Mr Blue Example:**
```
CRITICAL:
- 3D Avatar (documented as core feature, not visible)
- Journey Agents (documented, routes disabled)
- Voice UI (documented, not connected)

HIGH:
- Agent orchestration UI (documented, no visualization)
- Pattern library UI (documented, no search interface)

MEDIUM:
- React Flow advanced features
- Git automation
```

### Step 3.2: Create Prioritized Task List

**Template:**
```markdown
## Gap Closure Plan for [Agent Name]

### Priority 1: CRITICAL (Build First)
1. [Feature] - Estimated time: X hours
   - Why critical: [User impact]
   - Files to create/modify: [List]
   - Dependencies: [If any]

### Priority 2: HIGH (Build Second)
...

### Priority 3: MEDIUM (Build Last)
...

**Total Estimated Time:** X hours
**Honest Current Status:** Y%
**Target Status:** 100%
```

### Step 3.3: Apply Build-Integrate-Verify Loop

**For EACH feature in task list:**

```
1. VERIFY what exists
   - Search codebase
   - Check similar implementations
   - Read existing patterns

2. BUILD component
   - Follow coding standards
   - Use existing libraries
   - Add data-testid attributes

3. INTEGRATE immediately
   - Import in parent component
   - Pass props
   - Render in JSX

4. SCREENSHOT proof
   - Take browser screenshot
   - Show feature working
   - No "code compiles" claims

5. TEST user journey
   - Navigate as user would
   - Verify all interactions work
   - Check error handling

6. ARCHITECT review
   - Call architect tool with git diff
   - Address feedback
   - Fix issues found

7. UPDATE DOCS
   - Mark feature as complete
   - Update status percentages
   - Add screenshots to docs

8. MARK COMPLETE
   - Only after architect approval
   - Include screenshot links
   - Document any limitations
```

---

## 🚀 **PHASE 4: DEPLOYMENT - Execution & Validation**

### Step 4.1: Parallel Execution Strategy

**Identify independent tracks:**
```markdown
Track 1: 3D Avatar (independent)
Track 2: Voice UI (independent)
Track 3: Journey Agents (independent)
Track 4: Agent Browser (depends on agent data)
```

**Execute in parallel where possible:**
- Reduces total time 60-85%
- Prevents blocking
- Enables faster iteration

### Step 4.2: Continuous Integration Verification

**After each build cycle:**
```bash
# Check LSP errors
npm run typecheck

# Verify imports
grep -r "import.*MrBlueAvatar" client/src/

# Check routes
curl http://localhost:5000/api/journeys

# Visual verification
Take screenshot of feature working
```

### Step 4.3: Final Validation Checklist

**Before marking agent as complete:**

- [ ] All documented features built
- [ ] All features integrated (not orphaned files)
- [ ] All features have screenshots
- [ ] All user journeys tested
- [ ] Architect reviewed with "PASS" verdict
- [ ] Documentation updated to reality
- [ ] Honest completion % = 100%

---

## 📊 **Common Failure Patterns (Learn from Mr Blue)**

### Failure Pattern #1: "Files Exist" ≠ "Features Work"
```
WRONG: "I built ChatInterface.tsx, so chat is done ✅"
RIGHT: "ChatInterface.tsx exists but isn't imported = NOT DONE ❌"
```

### Failure Pattern #2: Self-Approval Without Testing
```
WRONG: "Code compiles, marking complete ✅"
RIGHT: "Code compiles + screenshot + user tested + architect approved ✅"
```

### Failure Pattern #3: Optimistic Completion Percentages
```
WRONG: "58 of 60 files exist = 97% complete"
RIGHT: "15 of 60 features user-accessible = 25% complete"
```

### Failure Pattern #4: Documentation Fiction
```
WRONG: "Documenting planned features as 'COMPLETE'"
RIGHT: "Documenting only verified, tested features as 'COMPLETE'"
```

### Failure Pattern #5: Skipping Integration
```
WRONG: Build all components → Try to integrate at end (97% waste)
RIGHT: Build → Integrate → Verify loop for EACH component
```

---

## 🛠️ **Tools & Commands Reference**

### Documentation Search
```bash
# Find all docs mentioning your agent
grep -r "AgentName\|FeatureName" docs/ --files-with-matches

# Find completion claims
grep -r "COMPLETE\|100%\|READY" docs/ --files-with-matches

# Find specific features
grep -r "3D Avatar\|Voice\|Journey" docs/ -i
```

### File Verification
```bash
# Check if file exists
ls -la path/to/component.tsx

# Check if imported
grep -r "import.*ComponentName" client/src/

# Check in routes
grep "routeName" server/routes.ts
```

### Integration Verification
```bash
# Find all imports of a component
grep -r "MrBlueAvatar" client/src/ -n

# Check TypeScript errors
npm run typecheck

# Check LSP diagnostics
Use get_latest_lsp_diagnostics tool
```

### Screenshot Workflow
```bash
# Use screenshot tool
Take screenshot of /mr-blue page
Take screenshot of feature working
Save to docs/screenshots/
```

---

## 📝 **Template: Self-Audit Report**

```markdown
# Self-Audit Report: [Agent Name]
**Date:** [Date]
**Agent ID:** [ID]
**Auditor:** [Agent performing audit]

## Documentation Scan
- Total files found: X
- Master docs reviewed: [List]
- Features documented: Y

## Reality Check
- Files exist: A
- Files integrated: B
- Features user-accessible: C

## Honest Status
- **Claimed:** Z%
- **Reality:** (C / Y) × 100 = ___%

## Gaps Identified
### CRITICAL
1. [Gap]
2. [Gap]

### HIGH
1. [Gap]
2. [Gap]

### MEDIUM
1. [Gap]

## Action Plan
### Track 1: [Name]
- Tasks: [List]
- Est time: X hours

### Track 2: [Name]
- Tasks: [List]
- Est time: X hours

**Total Effort:** X hours

## Commitment
- [ ] I will follow Build-Integrate-Verify loop
- [ ] I will screenshot all features
- [ ] I will get architect approval
- [ ] I will update docs to reality
- [ ] I will NOT claim complete until 100% verified
```

---

## 🎯 **Success Criteria**

An agent self-audit is successful when:

1. ✅ **All documentation searched** - No files missed
2. ✅ **All gaps identified** - Honest assessment
3. ✅ **Prioritized task list created** - Clear action plan
4. ✅ **Build-Integrate-Verify loop followed** - For each feature
5. ✅ **Screenshots captured** - Visual proof
6. ✅ **User journeys tested** - Real accessibility verified
7. ✅ **Architect approved** - Independent validation
8. ✅ **Documentation updated** - Reality matches claims
9. ✅ **100% verified** - Not estimated, not optimistic

---

## 📚 **Required Reading**

Before performing self-audit:
1. [MB.MD QA Protocol](./MB_MD_QA_PROTOCOL.md) - 1009 lines, THE LAW
2. [Agent Session Log](./AGENT_SESSION_LOG.md) - Previous learnings
3. [MB.MD Documentation Phase Map](./MB_MD_DOCUMENTATION_PHASE_MAP.md)

---

## 🔄 **Rollout Plan**

### Phase 1: Mr Blue Agents (8 agents)
Agents #73-80 perform self-audit first, refine protocol

### Phase 2: Core Agents (20 agents)
Journey Agents, Algorithm Agents, Page Agents

### Phase 3: All ESA Agents (234+ agents)
Complete platform-wide self-audit

### Phase 4: Continuous Audit
Monthly self-audit for all agents, prevent regression

---

**Last Updated:** October 21, 2025  
**Version:** 1.0  
**Status:** ACTIVE - MANDATORY FOR ALL AGENTS

---

## 📞 **Questions?**

If confused about self-audit process:
1. Read Mr Blue audit example in this doc
2. Review `docs/MrBlue/PARALLEL_AUDIT_RESULTS.md`
3. Ask Mr Blue agent (#73) for guidance
4. Reference MB.MD QA Protocol for detailed rules
