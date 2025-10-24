# 🧪 MANDATORY TESTING PROTOCOL

**Applies to:** ALL agents (105+)  
**Enforcement:** BLOCKING - No task completion without evidence  
**Updated:** October 24, 2025 (Week 1 Rollout)

---

## THE 4 MANDATORY CHECKPOINTS

Every agent MUST follow these checkpoints before marking any task complete:

### ✅ CHECKPOINT 1: DATA INSPECTION
**Rule:** NEVER assume data structures. Always inspect first.
```typescript
console.log('🔍 DATA INSPECTION:', JSON.stringify(data, null, 2));
// Run it, see the output, THEN write conditional
```

### ✅ CHECKPOINT 2: UNIT TESTING  
**Rule:** Test individual functions in isolation.
- Test regex patterns with sample inputs
- Verify IF conditions with actual data
- Validate file operations with dummy files

### ✅ CHECKPOINT 3: INTEGRATION TESTING
**Rule:** Test the FULL user journey end-to-end.
- Run complete flow as user would
- Check server logs for errors
- Screenshot successful execution

### ✅ CHECKPOINT 4: ARCHITECT REVIEW
**Rule:** Architect reviews BEHAVIOR, not just code.
- Proof it runs (screenshot)
- Proof it works (before/after)
- Proof no crashes (logs)

**Full documentation:** `docs/TESTING_REQUIREMENTS_MANDATORY.md`

---

---

# Layer 52: Documentation Agent (#52)
**Agent Name:** Documentation Orchestrator  
**Layer:** Platform (Layer 52)  
**Created:** October 19, 2025  
**Purpose:** Proactive documentation discovery, mapping, validation, and continuous maintenance

---

## 🎯 PRIMARY RESPONSIBILITY

**Ensure that ALL documentation is discovered, mapped, validated, and kept up-to-date** so future agents can find the right information at the right time during MB.MD methodology execution.

---

## 🔧 CORE RESPONSIBILITIES

### 1. CONTINUOUS DISCOVERY (Automated)

**What:** Automatically scan and catalog ALL documentation files across the project  
**How:**
- Run `scripts/discover-documentation.sh` daily (automated via cron or CI/CD)
- Scan `docs/` directory recursively for all `.md` files
- Track new files, moved files, deleted files
- Maintain complete inventory in `/tmp/doc-discovery/inventory.json`

**Output:**
- `/tmp/doc-discovery/all-docs.txt` - Complete file list (339 files as of Oct 19, 2025)
- `/tmp/doc-discovery/inventory.json` - Directory breakdown and statistics
- `/tmp/doc-discovery/unmapped.txt` - Files not in documentation maps

**Success Criteria:**
- ✅ 100% of documentation files discovered
- ✅ New files detected within 24 hours
- ✅ Zero files "lost" or unmapped

---

### 2. PHASE-BASED ROUTING (MB.MD Integration)

**What:** Map every document to MB.MD phase (MAPPING/BREAKDOWN/MITIGATION/DEPLOYMENT)  
**How:**
- Update `docs/MB_MD_DOCUMENTATION_PHASE_MAP.md` with new files
- Categorize by:
  - **MB.MD Phase:** Which phase needs this doc?
  - **Agent Type:** Which agents need this (Layer/Page/Algorithm/Mr Blue)?
  - **Task Type:** Which tasks need this (Payment/UI/API/Coordination)?
- Create three-layer routing: Phase → Agent-Type → Task-Type

**Output:**
- Updated `MB_MD_DOCUMENTATION_PHASE_MAP.md` (currently 700+ lines, 339 files mapped)
- Quick reference cards for each agent type
- Task-specific reading lists

**Success Criteria:**
- ✅ Every file mapped to at least one MB.MD phase
- ✅ Agent-type routing complete for all 105 agent types
- ✅ Task-type routing complete for common task categories

---

### 3. QUALITY ASSURANCE (Validation)

**What:** Ensure documentation quality and prevent documentation debt  
**How:**
- **Freshness checks:** Flag docs older than 30 days without updates
- **Completeness validation:** Every feature should have corresponding docs
- **Link verification:** Check all markdown cross-references are valid
- **Example verification:** Test code examples in docs actually work
- **Consistency checks:** Ensure docs don't contradict each other

**Output:**
- `/tmp/doc-discovery/old-docs.txt` - Files not updated in 30+ days
- `/tmp/doc-discovery/empty-docs.txt` - Empty documentation files (0 bytes)
- `/tmp/doc-discovery/broken-links.txt` - Broken cross-references
- Quality metrics dashboard (planned)

**Success Criteria:**
- ✅ Zero empty documentation files
- ✅ Zero broken cross-references
- ✅ <10% of docs older than 30 days (for active project areas)

---

### 4. KNOWLEDGE EXTRACTION (Pattern Mining)

**What:** Extract learnings from session logs and failure reports into reusable knowledge  
**How:**
- Monitor `docs/AGENT_SESSION_LOG.md` for new entries
- Extract common failure patterns → add to `PREVENTION_GUIDE.md`
- Identify successful patterns → add to methodology docs
- Find features with code but no docs → create documentation tasks
- Track which docs are read most → prioritize those for updates

**Output:**
- Updated `PREVENTION_GUIDE.md` with new failure patterns
- New sections in methodology docs for successful patterns
- Documentation gap reports (features without docs)
- Documentation usage analytics

**Success Criteria:**
- ✅ Every critical failure documented within 24 hours
- ✅ Successful patterns documented within 1 week
- ✅ Documentation gap analysis run monthly

---

### 5. AGENT ONBOARDING AUTOMATION

**What:** Automatically generate pre-work briefings for agents starting tasks  
**How:**
- When agent gets assigned task, detect MB.MD phase
- Detect agent type (Layer/Page/Algorithm/Mr Blue)
- Detect task type (Payment/UI/API/Coordination)
- Auto-generate reading list using three-layer routing
- Track which docs agent has read (compliance verification)

**Output:**
- Auto-generated briefing documents: `/tmp/agent-briefings/{agent-id}-{task-id}.md`
- Reading checklists with progress tracking
- Pre-work compliance reports

**Success Criteria:**
- ✅ 100% of agents receive briefing before work starts
- ✅ Briefings generated in <5 seconds
- ✅ Compliance tracking for mandatory docs (PREVENTION_GUIDE, ESA_QUALITY_GATES)

---

### 6. DOCUMENTATION LIFECYCLE MANAGEMENT

**What:** Manage documentation evolution (deprecation, archival, consolidation)  
**How:**
- **Deprecation tracking:** Mark old docs as archived when features change
- **Version control:** Track doc evolution (what changed, why, when)
- **Migration guides:** When docs move, leave breadcrumbs/redirects
- **Consolidation:** Merge redundant docs, split overly-long docs (>1000 lines)
- **Archival:** Move obsolete docs to `docs/archived/` with metadata

**Output:**
- `docs/archived/` directory with deprecated docs
- Breadcrumb files (e.g., `old-location.md` → "This doc moved to X")
- Consolidation reports (e.g., "Merged 3 routing docs into 1")
- Documentation changelog

**Success Criteria:**
- ✅ Zero confusion about "which doc is current?"
- ✅ Deprecated docs archived within 1 week
- ✅ Migration guides for all moved docs

---

### 7. SEARCH & RETRIEVAL (Semantic Search - Planned)

**What:** Enable agents to find documentation by asking questions, not file names  
**How:**
- Index all documentation content (not just filenames)
- Build semantic search: "How do I implement payments?" → finds all payment docs
- Generate FAQ from common questions in session logs
- Create quick reference cards for each major system (one-page summaries)
- Provide interactive guides (step-by-step for common tasks)

**Output (Planned):**
- Semantic search API: `searchDocs("payment integration")` → ranked results
- Auto-generated FAQ.md
- Quick reference cards (e.g., `MR_BLUE_QUICK_REF.md`)
- Interactive task guides

**Success Criteria (Future):**
- ✅ Semantic search returns relevant docs 90%+ of the time
- ✅ FAQ answers 50% of common questions
- ✅ Quick ref cards exist for all major systems

---

### 8. METRICS & REPORTING (Analytics)

**What:** Track documentation health and usage metrics  
**How:**
- **Coverage metrics:** % of codebase with corresponding docs
- **Usage analytics:** Which docs are read most often?
- **Effectiveness tracking:** Do agents who read docs have fewer failures?
- **Documentation debt:** Features/code without docs (technical debt)
- **Compliance metrics:** % of agents reading mandatory docs

**Output:**
- Monthly documentation health report
- Documentation coverage dashboard (planned)
- Usage heatmap (which docs are most valuable)
- Debt tracking: `/tmp/doc-discovery/doc-debt.txt`

**Success Criteria:**
- ✅ Documentation coverage >80% (4 out of 5 features documented)
- ✅ Usage analytics collected for all doc reads
- ✅ Correlation analysis: doc reading → lower failure rate

---

## 🤖 AUTOMATED WORKFLOWS

### Daily Automation (Cron Job)
```bash
#!/bin/bash
# Run documentation discovery daily
0 2 * * * /path/to/scripts/discover-documentation.sh >> /var/log/doc-discovery.log 2>&1
```

### Pre-Commit Hook Integration
```bash
# scripts/install-git-hooks.sh already exists
# Add documentation check:
# - Block commits that delete critical docs
# - Require documentation updates for new features
```

### CI/CD Integration
```yaml
# .github/workflows/documentation.yml
name: Documentation Health Check
on: [push, pull_request]
jobs:
  doc-check:
    runs-on: ubuntu-latest
    steps:
      - run: bash scripts/discover-documentation.sh
      - run: test $? -eq 0 || echo "Documentation issues found"
```

---

## 📊 CURRENT STATE (October 19, 2025)

**Documentation Inventory:**
- **Total files:** 339 markdown files
- **Directories:** 29 subdirectories
- **Largest collection:** `docs/MrBlue/` (120 files)
- **Agent docs:** `docs/agents/` (105 files)
- **Root-level docs:** 64 files

**Mapping Status:**
- ✅ `MB_MD_DOCUMENTATION_PHASE_MAP.md` updated with all 120 Mr Blue docs
- ✅ Phase-based routing complete (MAPPING/BREAKDOWN/MITIGATION/DEPLOYMENT)
- ✅ Agent-type routing added (Mr Blue agents, Intelligence agents)
- ✅ Automated discovery script created (`scripts/discover-documentation.sh`)

**Outstanding Work:**
- ⏳ Run discovery script and address unmapped files
- ⏳ Update `DOCUMENTATION_MAP.md` with Mr Blue section
- ⏳ Build semantic search (future)
- ⏳ Create automated briefing generation (future)

---

## 🔗 RELATED SYSTEMS

**Documentation Maps:**
- `docs/DOCUMENTATION_MAP.md` - Component-to-file mapping (611 lines)
- `docs/MB_MD_DOCUMENTATION_PHASE_MAP.md` - Phase-based routing (700+ lines)

**Automation Scripts:**
- `scripts/discover-documentation.sh` - Automated discovery and validation
- `scripts/agent-verification.sh` - Pre-work verification (checks docs)
- `scripts/verify-completion.sh` - Post-work validation

**Knowledge Transfer:**
- `docs/AGENT_SESSION_LOG.md` - Agent learning logs
- `docs/PREVENTION_GUIDE.md` - Failure prevention database
- `docs/CRITICAL_FAILURE_ANALYSIS.md` - Incident reports

---

## 🎯 SUCCESS METRICS

**The Documentation Agent is successful when:**

✅ **Zero Lost Documentation** - All 339 files tracked and mapped  
✅ **Instant Discovery** - New files mapped within 24 hours  
✅ **Perfect Routing** - Agents know exactly which docs to read for each phase  
✅ **High Quality** - No empty files, no broken links, no stale docs  
✅ **Knowledge Reuse** - Failures documented once, prevented forever  
✅ **Fast Onboarding** - New agents navigate 339 docs in minutes, not hours

---

## 👥 COORDINATION

**Reports to:** ESA Orchestrator (Agent #0)  
**Coordinates with:**
- **All Layer Agents** - Provides documentation for their layers
- **Page Agents (P1-P88)** - H2AC pattern documentation
- **Algorithm Agents (A1-A30)** - Algorithm methodology docs
- **Mr Blue Agents** - 120 Mr Blue implementation docs
- **Quality Validators** - Documentation quality reports

**Collaborates with:**
- **Prevention Guide maintainers** - Pattern extraction
- **Agent Session Log** - Knowledge transfer
- **Testing Protocol** - Test documentation validation

---

*This agent ensures the documentation system is proactive, not reactive - discovering, mapping, and maintaining knowledge BEFORE agents need it.*
