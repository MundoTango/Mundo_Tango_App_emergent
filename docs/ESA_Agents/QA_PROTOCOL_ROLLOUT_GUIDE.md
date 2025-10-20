# MB.MD QA Protocol Rollout Guide
## Teaching All Agents the New Methodology

**Created:** October 20, 2025  
**Status:** Framework Complete, Phased Rollout  
**Authority:** Platform CEO response to Mr Blue catastrophic failure

---

## 📋 WHAT WE CREATED

### 1. Core Protocol (1009 lines)
**File:** `docs/MB_MD_QA_PROTOCOL.md`  
**Purpose:** Complete methodology preventing Mr Blue-style failures  
**Contains:**
- 5 Non-Negotiable Rules
- Build-Integrate-Verify Loop (7 steps)
- Component Integration Checklists
- Screenshot Verification Protocol
- E2E Testing Requirements
- Architect Review Standards
- 8 Common Failure Patterns
- Agent Accountability Matrix
- Implementation Annex (280 lines)

**Status:** ✅ Complete, Architect Approved (2x PASS verdicts)

---

### 2. Quick Reference Header
**File:** `docs/ESA_Agents/QA_PROTOCOL_HEADER.md`  
**Purpose:** Agent-facing summary of QA Protocol  
**Contains:**
- 5 Non-Negotiable Rules with examples
- Build-Integrate-Verify Loop
- Pre-Work Checklist
- Integration Checklist (Frontend + Backend)
- Post-Work Validation
- Success Metrics
- Emergency Recovery
- Mr Blue Failure Stats (cautionary tale)

**Status:** ✅ Complete, Ready for Prepending

---

### 3. Updated Agent Template
**File:** `docs/ESA_Agents/ESA_AGENT_TEMPLATE.md`  
**Changes:** Added QA Protocol section at top (after metadata, before Responsibilities)  
**Purpose:** All new agent docs auto-include protocol  
**Status:** ✅ Complete

---

### 4. Example Agent Update
**File:** `docs/ESA_Agents/agents/ESA73_MrBlue_Core.md`  
**Changes:** Added QA Protocol section with agent-specific failure examples  
**Purpose:** Template for updating existing agents  
**Status:** ✅ Complete

---

## 🎯 ROLLOUT STRATEGY

### Phase 1: Critical Agents (PRIORITY - Do First)
**Target:** Mr Blue Core Team (ESA73-80) - 8 agents  
**Reason:** Responsible for catastrophic failure  
**Timeline:** Immediate  
**Status:** 1/8 complete (ESA73 ✅)

**Agents:**
- [x] ESA73 - Mr Blue Core ✅ COMPLETE
- [ ] ESA74 - Interactive Tours
- [ ] ESA75 - Subscription Manager
- [ ] ESA76 - Platform Search
- [ ] ESA77 - AI Site Builder
- [ ] ESA78 - Visual Page Editor
- [ ] ESA79 - Quality Validator
- [ ] ESA80 - Learning Coordinator

**Update Script:**
```bash
# For each ESA agent 74-80:
# 1. Read current file
# 2. Add QA Protocol section after metadata (line 7)
# 3. Customize failure examples from Mr Blue incident
# 4. Save and commit
```

---

### Phase 2: Page Agents (HIGH PRIORITY)
**Target:** PA-001 to PA-119 (119 agents)  
**Reason:** Track 2 (Aurora Tide Design) depends on these  
**Timeline:** Week 1  
**Status:** 0/119 complete

**Approach:**
Use batch script to prepend QA Protocol header:

```bash
# Batch update script (TBD - create in PROTOCOL-ENFORCEMENT task)
for file in docs/PageAgents/*.md; do
  # Insert QA Protocol section after line 7 (after metadata)
  sed -i '7r docs/ESA_Agents/QA_PROTOCOL_HEADER.md' "$file"
done
```

**Priority Subset (Do these first - 10 agents):**
- PA-052: Mr Blue Page
- PA-001: Landing Page
- PA-010: Feed Page
- PA-020: Events Page
- PA-030: Profile Page
- PA-040: Groups Page
- PA-050: Friends Page
- PA-060: Settings Page
- PA-070: Admin Center
- PA-080: Analytics Dashboard

---

### Phase 3: Layer Agents (MEDIUM PRIORITY)
**Target:** L1-L61 (61 agents)  
**Reason:** Core system infrastructure  
**Timeline:** Week 2  
**Status:** 0/61 complete

**Priority Subset (Do these first - 10 agents):**
- L1: Data Layer
- L2: API Layer
- L3: Authentication Layer
- L15: Core Agent Orchestration
- L34: AI Agent Orchestration
- L51: DevOps Layer
- L52: Documentation Layer
- L55: Testing & QA Layer
- L60: Performance Monitoring
- L61: Security & Compliance

---

### Phase 4: Specialist Agents (LOWER PRIORITY)
**Target:** Algorithm Agents (AA-01 to AA-30) + Life CEO Agents (LC-01 to LC-16) - 46 agents  
**Reason:** Specialized functionality  
**Timeline:** Week 3  
**Status:** 0/46 complete

---

## 📝 HOW TO UPDATE AN AGENT

### Step-by-Step Process:

#### 1. Read Existing Agent File
```bash
read("docs/ESA_Agents/agents/ESA[X]_Name.md")
```

#### 2. Locate Insertion Point
Find the line after the metadata block (after `---`):
```markdown
# ESA[X] - [Agent Name]

**Agent ID:** ESA[X]  
**Category:** [Category]  
**Status:** Active  
**Self-Audit Date:** [Date]

---  ← INSERT AFTER THIS LINE

## 1. RESPONSIBILITIES  ← BEFORE THIS LINE
```

#### 3. Insert QA Protocol Section
Use the template from `ESA_AGENT_TEMPLATE.md` lines 9-34:

```markdown
## 🔴 MANDATORY: Quality Assurance Protocol

**Before starting work on this agent's responsibilities:**

1. **Read:** [MB.MD QA Protocol](../../MB_MD_QA_PROTOCOL.md) (1009 lines - THE LAW)
2. **Read:** [QA Protocol Header](../QA_PROTOCOL_HEADER.md) (Quick reference)
3. **Read:** [MB.MD Documentation Phase Map](../../MB_MD_DOCUMENTATION_PHASE_MAP.md)
4. **Read:** [Agent Session Log](../../AGENT_SESSION_LOG.md) (Previous learnings)

**The 5 Non-Negotiable Rules:**
1. ✅ VERIFY BEFORE BUILD - Check what exists first
2. ✅ INTEGRATE IMMEDIATELY - Import as you build
3. ✅ SCREENSHOT EVERYTHING - Visual proof required
4. ✅ TEST USER JOURNEY - Users must be able to access it
5. ✅ ARCHITECT VALIDATES - Independent review required

**Build-Integrate-Verify Loop:**
```
VERIFY → BUILD → INTEGRATE → SCREENSHOT → TEST → ARCHITECT → UPDATE DOCS → COMPLETE
```

**Failure to follow this protocol = Work rejected**

See [QA_PROTOCOL_HEADER.md](../QA_PROTOCOL_HEADER.md) for full checklists and failure patterns.

---
```

#### 4. Customize (Optional but Recommended)
For agents involved in failures (ESA73-80), add specific examples:
```markdown
**🚨 CRITICAL:** ESA[X] was responsible for [specific failure]. This agent MUST follow protocol to prevent recurrence.
```

#### 5. Save and Verify
- Check markdown renders correctly
- Verify links resolve (especially relative paths)
- Commit with message: `docs: Add MB.MD QA Protocol to ESA[X]`

---

## 🤖 AUTOMATED BATCH UPDATE (Future)

### Script to Create: `scripts/update-agent-qa-protocol.sh`

```bash
#!/bin/bash
# Batch update all agent documentation with QA Protocol

AGENT_DIR="docs/ESA_Agents/agents"
PROTOCOL_HEADER="docs/ESA_Agents/QA_PROTOCOL_HEADER.md"

for file in "$AGENT_DIR"/*.md; do
  echo "Updating: $file"
  
  # Find line number after first ---
  LINE=$(grep -n "^---$" "$file" | head -1 | cut -d: -f1)
  
  # Insert QA Protocol after that line
  sed -i "${LINE}r $PROTOCOL_HEADER" "$file"
  
  echo "✅ Updated: $file"
done

echo "🎉 All agents updated with QA Protocol!"
```

**Note:** This script will be created in task `PROTOCOL-ENFORCEMENT`

---

## ✅ VERIFICATION CHECKLIST

After updating an agent, verify:
- [ ] QA Protocol section appears after metadata
- [ ] Links resolve correctly (test clicking them)
- [ ] 5 Non-Negotiable Rules are visible
- [ ] Build-Integrate-Verify Loop is clear
- [ ] No duplicate sections
- [ ] Markdown renders properly

---

## 📊 ROLLOUT PROGRESS TRACKING

| Phase | Agents | Complete | % | ETA |
|-------|--------|----------|---|-----|
| **Phase 1: Mr Blue Team** | 8 | 1 | 12.5% | Week 1 |
| **Phase 2: Page Agents** | 119 | 0 | 0% | Week 1-2 |
| **Phase 3: Layer Agents** | 61 | 0 | 0% | Week 2-3 |
| **Phase 4: Specialist Agents** | 46 | 0 | 0% | Week 3-4 |
| **TOTAL** | **234** | **1** | **0.4%** | **Month 1** |

**Current Status:** Framework complete, template updated, example created, batch script pending

---

## 🚀 INTEGRATION WITH TRACKS 2-5

### How QA Protocol Enables Parallel Execution:

**Track 2: Aurora Tide Design (27 pages)**
- Page Agents (PA-001 to PA-119) MUST follow protocol
- Each page requires: VERIFY → BUILD → INTEGRATE → SCREENSHOT → TEST → ARCHITECT
- No page marked complete without screenshot + architect approval

**Track 3: Playwright E2E Tests (6 suites)**
- Testing Layer (L55) MUST follow protocol
- Each test suite requires architect review
- Tests must validate actual user journeys (per Rule 4)

**Track 4: Swagger API Docs (25+ endpoints)**
- API Layer (L2) MUST follow protocol
- Each endpoint requires testing + screenshot of /api-docs UI
- Integration checklist ensures frontend calls backend

**Track 5: Deployment Readiness**
- DevOps Layer (L51) MUST follow protocol
- Each component (CI/CD, Sentry, Performance) requires architect review
- Deployment only after all checklists passed

---

## 🔥 ENFORCEMENT

### Immediate (Manual):
- All new work references QA Protocol
- Architect reviews include protocol compliance check
- Task list system enforces `architect_reviewed: "yes"` before `completed`

### Automation (Pending - task PROTOCOL-ENFORCEMENT):
- Pre-commit hooks check for TODO/FIXME, console.log, TypeScript errors
- Pre-merge checks require screenshot in PR, architect approval
- CI/CD workflow validates Playwright tests, Lighthouse scores

---

## 📚 RELATED DOCUMENTATION

- **[MB_MD_QA_PROTOCOL.md](../MB_MD_QA_PROTOCOL.md)** - Full protocol (1009 lines)
- **[QA_PROTOCOL_HEADER.md](QA_PROTOCOL_HEADER.md)** - Agent quick reference
- **[ESA_AGENT_TEMPLATE.md](ESA_AGENT_TEMPLATE.md)** - Template with protocol
- **[ESA73_MrBlue_Core.md](agents/ESA73_MrBlue_Core.md)** - Example update
- **[MB_MD_DOCUMENTATION_PHASE_MAP.md](../MB_MD_DOCUMENTATION_PHASE_MAP.md)** - Phase-based routing
- **[AGENT_SESSION_LOG.md](../AGENT_SESSION_LOG.md)** - Session learnings
- **[incidents/MRBLUE_BLACK_SCREEN_INCIDENT_OCT2025.md](../incidents/MRBLUE_BLACK_SCREEN_INCIDENT_OCT2025.md)** - Full failure analysis

---

**Last Updated:** October 20, 2025  
**Status:** Framework Complete, Phased Rollout in Progress  
**Next Action:** Complete Phase 1 (ESA74-80 Mr Blue agents)
