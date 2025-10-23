# 🚀 SIMULTANEOUS BUILD PLAN - Vibe Coding Complete Implementation (Oct 23, 2025)

## 🎯 **Executive Summary: MB.MD SIMULTANEOUS Mode**

This plan orchestrates **9 specialist agents** working in parallel, each responsible for recursive research and implementation of their domain. Every agent must research until they can successfully complete their job.

**Execution Mode:** SIMULTANEOUS (Learning #19 - All agents work at once)  
**Timeline:** 8 weeks to production-ready  
**Current Completion:** 60% → **Target:** 95%

---

## 📋 **OPEN SOURCE IMPLEMENTATION STATUS**

### **✅ Already Implemented**

| Library | Version | Status | Usage |
|---------|---------|--------|-------|
| **html2canvas** | 1.4.1 | ✅ INSTALLED | Screenshot capture (Line 190, package.json) |
| **playwright** | 1.56.1 | ✅ INSTALLED | Browser automation (Line 227) |
| **@playwright/test** | 1.54.2 | ✅ INSTALLED | Testing framework (Line 68) |
| **@anthropic-ai/sdk** | 0.67.0 | ✅ INSTALLED | Claude integration (Line 28) |
| **openai** | 5.8.2 | ✅ INSTALLED | GPT-4o integration (Line 220) |
| **@google/generative-ai** | 0.24.1 | ✅ INSTALLED | Gemini integration (Line 55) |
| **socket.io** | 4.8.1 | ✅ INSTALLED | Real-time streaming (Line 284) |
| **drizzle-orm** | 0.39.1 | ✅ INSTALLED | Database ORM (Line 172) |
| **zod** | 3.24.2 | ✅ INSTALLED | Schema validation (Line 309) |

**Total Implemented:** 9/14 core libraries ✅

---

### **❌ NOT Implemented (Requires Installation)**

| Library | Priority | Purpose | Agent Responsible |
|---------|----------|---------|-------------------|
| **diff** | P0 CRITICAL | Unified diff application | File Editing Specialist |
| **@babel/parser** | P0 CRITICAL | TypeScript AST parsing | Repository Mapping Specialist |
| **@babel/traverse** | P0 CRITICAL | AST traversal | Repository Mapping Specialist |
| **@langchain/langgraph** | P1 Important | Multi-agent orchestration | Multi-Agent Specialist |
| **@langchain/core** | P1 Important | LangChain core (dependency) | Multi-Agent Specialist |

**Total Missing:** 5/14 core libraries ❌

---

### **📚 Reference-Only (Study, Don't Install)**

| Pattern Source | Stars | Purpose | How to Use |
|----------------|-------|---------|------------|
| **Aider** | 28k⭐ | File editing algorithms | Clone, study `editblock_coder.py`, adapt patterns |
| **screenshot-to-code** | 53k⭐ | Vision → code generation | Clone, study GPT-4 Vision patterns |
| **Builder.io** | 3k⭐ | Visual editor patterns | Clone, study bidirectional sync |
| **Bolt.diy** | 7k⭐ | Full vibe coding platform | Clone, study file management |
| **Cline** | 12k⭐ | Browser automation | Clone, study self-correction loops |
| **Continue** | 20k⭐ | Context providers | Clone, study context gathering |

**Study Repositories:** 6 reference implementations ✅

---

## 👥 **THE 9 SPECIALIST AGENTS (SIMULTANEOUS Execution)**

### **Agent #1: Documentation Agent** 📚

**Responsibility:** Ensure all specialists have complete knowledge before building

**Recursive Research Protocol:**
```markdown
1. Read all 11 vibe coding research documents
2. Read MB.MD QA Protocol (5 Non-Negotiable Rules)
3. Read Integration Protocol (build → integrate → test → screenshot)
4. Create phase-specific checklists for each specialist
5. Monitor that ALL agents read their required docs before coding
6. Veto any build that starts without documentation verification
```

**Documents to Read (Priority Order):**
1. `docs/MB_MD_QA_PROTOCOL.md` (15 min) - THE LAW
2. `docs/AGENT_LEARNINGS.md` (30 min) - 19 learnings by phase
3. `docs/INTEGRATION_PROTOCOL.md` (15 min) - Component exists ≠ feature works
4. `docs/VIBE_CODING_RESEARCH_FINAL_SUMMARY_OCT_23_2025.md` (20 min) - Executive summary
5. All 11 vibe coding docs (10 hours total)

**Deliverables:**
- [ ] Verification checklist for each agent
- [ ] Daily standup: "Have all agents read their docs?"
- [ ] Veto power if any agent starts coding without reading

**Timeline:** Week 0 (before any building starts)

---

### **Agent #2: File Editing Specialist** 🔧

**Responsibility:** Implement reliable file editing (80%+ success rate)

**Missing Libraries:** `diff` (NOT INSTALLED) ❌

**Recursive Research Protocol:**
```markdown
1. Install diff library: npm install diff
2. Clone Aider: git clone https://github.com/Aider-AI/aider.git
3. Study editblock_coder.py (200 lines - core algorithm)
4. Study Aider's prompts (prompts/editblock.md)
5. Test unified diff vs whole file (benchmark 20 samples)
6. Implement UnifiedDiffEditor.ts
7. Implement SearchReplaceEditor.ts
8. Achieve 80%+ success rate (test with 50 samples)
9. If <80%, research WHY, adjust algorithm, retry
10. Document learnings for other agents
```

**Open Sources to Study:**
```bash
# 1. Aider (CRITICAL)
git clone https://github.com/Aider-AI/aider.git
cd aider
# Read:
# - aider/coders/editblock_coder.py (200 lines)
# - aider/coders/base_coder.py (300 lines)
# - aider/prompts/editblock.md (LLM prompt)

# 2. Diff library docs
npm install diff
# Read: https://www.npmjs.com/package/diff
```

**Deliverables:**
- [ ] `server/services/fileEditing/UnifiedDiffEditor.ts`
- [ ] `server/services/fileEditing/SearchReplaceEditor.ts`
- [ ] `server/services/fileEditing/DiffApplier.ts`
- [ ] `server/routes/vibeRoutes.ts` → `/api/vibe/edit-file` endpoint
- [ ] Unit tests (50 samples, 80%+ pass rate)
- [ ] Documentation: "How to use unified diff editor"

**Success Criteria:**
- 80%+ diff application success rate
- Fuzzy matching works (±2 lines tolerance)
- Handles LLM imprecision gracefully
- Clear error messages on failure

**Timeline:** Week 1-2

---

### **Agent #3: Repository Mapping Specialist** 🗺️

**Responsibility:** Compress 100k LOC → 5k tokens for AI context

**Missing Libraries:** `@babel/parser`, `@babel/traverse` (NOT INSTALLED) ❌

**Recursive Research Protocol:**
```markdown
1. Install Babel: npm install @babel/parser @babel/traverse @babel/types
2. Clone Aider: git clone https://github.com/Aider-AI/aider.git
3. Study repomap.py (500 lines - repository mapping)
4. Study Babel docs (AST parsing)
5. Test on Mundo Tango codebase (measure compression ratio)
6. Implement RepositoryMapper.ts
7. Achieve >15x compression (100k LOC → <7k tokens)
8. If <15x, research WHY, optimize algorithm, retry
9. Add dependency graph (import tracking)
10. Document compact representation format
```

**Open Sources to Study:**
```bash
# 1. Aider Repository Mapping (CRITICAL)
cd aider
# Read:
# - aider/repomap.py (500 lines)
# - aider/models/prompts.py (how compact map is sent to LLM)

# 2. Babel Documentation
# Read: https://babeljs.io/docs/en/babel-parser
# Study: AST node types, traversal patterns

# 3. Bloop (optional - semantic code search)
git clone https://github.com/BloopAI/bloop.git
# Read: src/query/semantic.rs (Rust - for patterns)
```

**Deliverables:**
- [ ] `server/services/repositoryMapping/ASTParser.ts`
- [ ] `server/services/repositoryMapping/CompactRepresentation.ts`
- [ ] `server/services/repositoryMapping/DependencyGraph.ts`
- [ ] `server/routes/vibeRoutes.ts` → `/api/vibe/map-repository` endpoint
- [ ] Benchmark report: compression ratio, parse time
- [ ] Documentation: "How to generate compact repository map"

**Success Criteria:**
- >15x compression ratio (100k LOC → <7k tokens)
- Parses entire Mundo Tango codebase (<5 seconds)
- Dependency graph tracks imports/exports correctly
- Finds symbol definitions and usages

**Timeline:** Week 3-4

---

### **Agent #4: Multi-Agent Orchestration Specialist** 🤖

**Responsibility:** Coordinate multiple AI agents via state graphs

**Missing Libraries:** `@langchain/langgraph`, `@langchain/core` (NOT INSTALLED) ❌

**Recursive Research Protocol:**
```markdown
1. Install LangGraph: npm install @langchain/langgraph @langchain/core
2. Clone LangGraph: git clone https://github.com/langchain-ai/langgraph.git
3. Study supervisor.py (150 lines - supervisor pattern)
4. Study hierarchical.py (200 lines - hierarchical agents)
5. Design state graph for Mundo Tango (4 agents: Manager, Editor, Verifier, Tester)
6. Implement VibeGraph.ts
7. Test with sample request ("Add login button")
8. Verify agents coordinate correctly
9. If failures, research WHY, adjust graph, retry
10. Add retry loops (max 3 attempts per task)
```

**Open Sources to Study:**
```bash
# 1. LangGraph (CRITICAL)
git clone https://github.com/langchain-ai/langgraph.git
cd langgraph
# Read:
# - examples/multi-agent/supervisor.py (supervisor pattern)
# - examples/multi-agent/hierarchical.py (hierarchical agents)
# - docs/concepts/low_level.md (state graphs)

# 2. CrewAI (reference - simpler but Python-only)
git clone https://github.com/joaomdmoura/crewAI.git
# Read: examples/trip_planner/main.py (role-based example)

# 3. AutoGen (reference - conversational)
git clone https://github.com/microsoft/autogen.git
# Read: notebook/agentchat_groupchat.ipynb (group chat)
```

**Deliverables:**
- [ ] `server/services/agents/VibeGraph.ts`
- [ ] `server/services/agents/ManagerAgent.ts`
- [ ] `server/services/agents/EditorAgent.ts`
- [ ] `server/services/agents/VerifierAgent.ts`
- [ ] `server/services/agents/TesterAgent.ts`
- [ ] `server/routes/vibeRoutes.ts` → `/api/vibe/execute` endpoint
- [ ] Test with 10 sample requests
- [ ] Documentation: "How multi-agent orchestration works"

**Success Criteria:**
- 4 agents coordinate via state graph
- Conditional edges work (retry on failure)
- State persists across agent transitions
- Max 3 retry attempts before giving up

**Timeline:** Week 5-6

---

### **Agent #5: Visual Editor Integration Specialist** 🎨

**Responsibility:** Bridge Visual Editor → Mr Blue with enhanced context

**Libraries:** html2canvas (ALREADY INSTALLED) ✅

**Recursive Research Protocol:**
```markdown
1. Verify html2canvas installed (check package.json line 190)
2. Clone screenshot-to-code: git clone https://github.com/abi/screenshot-to-code.git
3. Study GPT-4 Vision integration patterns
4. Clone Builder.io: git clone https://github.com/BuilderIO/builder.git
5. Study bidirectional visual ↔ code sync
6. Enhance client/src/lib/visual-editor/iframeMessaging.ts
7. Add computed styles extraction
8. Add screenshot capture (html2canvas)
9. Add source code tracking
10. Test click element → full context captured
11. If incomplete context, research WHY, enhance, retry
12. Create DiffPreviewCard component
13. Implement Apply Changes workflow
```

**Open Sources to Study:**
```bash
# 1. screenshot-to-code (CRITICAL)
git clone https://github.com/abi/screenshot-to-code.git
# Read:
# - backend/routes/generate_code.py (Vision → code)
# - frontend/src/components/PromptPanel.tsx (UI patterns)

# 2. Builder.io (CRITICAL)
git clone https://github.com/BuilderIO/builder.git
# Read:
# - packages/sdks/src/context/visual-editor.lite.ts (visual context)
# - packages/sdks/src/generators/react.ts (code generation)

# 3. dom-inspector patterns
# Study: Chrome DevTools source (Element Inspector)
```

**Deliverables:**
- [ ] Enhanced `client/src/lib/visual-editor/iframeMessaging.ts`
  - getComputedStyles()
  - captureScreenshot()
  - findSourceFile()
  - getReactSource()
- [ ] `client/src/components/visual-editor/DiffPreviewCard.tsx`
- [ ] `client/src/components/visual-editor/AISuggestionsPanel.tsx`
- [ ] `server/routes/chatProjectsRoutes.ts` enhanced with visual context
- [ ] Test: Click element → See full context in Mr Blue
- [ ] Documentation: "Visual Editor ↔ Mr Blue integration"

**Success Criteria:**
- Selected element includes computed styles, screenshot, source code
- DiffPreviewCard shows before/after comparison
- Apply button works (applies diff, refreshes preview)
- Auto-suggestions panel appears on element selection

**Timeline:** Week 7-8

---

### **Agent #6: Testing & Self-Correction Specialist** 🧪

**Responsibility:** Implement self-testing loops with AI vision analysis

**Libraries:** playwright (ALREADY INSTALLED) ✅

**Recursive Research Protocol:**
```markdown
1. Verify Playwright installed (check package.json line 227)
2. Clone Cline: git clone https://github.com/cline/cline.git
3. Study src/services/browser/BrowserSession.ts (400 lines)
4. Study screenshot → analyze → fix loop pattern
5. Enhance server/browserAutomation.ts
6. Add self-correction loop (max 3 retries)
7. Add AI vision analysis (Claude screenshot analysis)
8. Test with 10 sample features
9. Measure pass rate (should be >90% after retries)
10. If <90%, research WHY, enhance loop, retry
11. Document self-correction patterns
```

**Open Sources to Study:**
```bash
# 1. Cline Browser Automation (CRITICAL)
git clone https://github.com/cline/cline.git
cd cline
# Read:
# - src/services/browser/BrowserSession.ts (core automation)
# - src/services/browser/ClaudeBrowserService.ts (AI analysis)

# 2. Playwright Advanced Patterns
# Read: https://playwright.dev/docs/test-retry
# Study: Auto-retry, screenshot comparison

# 3. Anthropic Computer Use API
# Read: https://docs.anthropic.com/en/docs/build-with-claude/vision
# Study: Screenshot analysis patterns
```

**Deliverables:**
- [ ] Enhanced `server/browserAutomation.ts`
  - selfCorrectionLoop() (max 3 retries)
  - analyzeFailure() (Claude Vision)
  - generateFix() (based on screenshot analysis)
- [ ] `server/services/testing/PlaywrightEnhanced.ts`
- [ ] `server/routes/vibeRoutes.ts` → `/api/vibe/test` endpoint
- [ ] Test suite: 10 sample features
- [ ] Benchmark: Pass rate before/after self-correction
- [ ] Documentation: "Self-correction testing patterns"

**Success Criteria:**
- >90% test pass rate (after max 3 retries)
- Claude Vision correctly analyzes screenshot failures
- Auto-generates fix based on visual analysis
- Logs all retries for debugging

**Timeline:** Week 5-6 (parallel with Multi-Agent)

---

### **Agent #7: Tools Expansion Specialist** 🛠️

**Responsibility:** Expand from 11 → 41 tools (30 new tools)

**Libraries:** All dependencies already installed ✅

**Recursive Research Protocol:**
```markdown
1. Read existing server/services/tools/universalToolOrchestrator.ts
2. Identify 11 current tools (database, codebase, documentation)
3. Research Mundo Tango domain needs (events, profiles, groups, memories)
4. Design 30 new tools:
   - Event tools (5): create_event, search_events, rsvp_event, etc.
   - Profile tools (5): get_profile, update_profile, search_users, etc.
   - Group tools (5): create_group, join_group, search_groups, etc.
   - Memory tools (5): create_memory, search_memories, enhance_memory, etc.
   - Code tools (10): run_tests, lint_code, format_code, etc.
5. Implement each tool with proper error handling
6. Test each tool individually
7. Integrate into UniversalToolOrchestrator
8. Test tool calling from AI (Claude function calling)
9. If tool fails, research WHY, fix, retry
10. Document all 41 tools with examples
```

**Open Sources to Study:**
```bash
# 1. Continue.dev Context Providers (CRITICAL)
git clone https://github.com/continuedev/continue.git
cd continue
# Read:
# - core/context/providers/ (various context providers)
# - Study: How tools provide context to LLMs

# 2. Aider Tools
cd aider
# Read: aider/coders/ask_prompts.py (LLM tools)

# 3. OpenHands Tools
git clone https://github.com/All-Hands-AI/OpenHands.git
# Read: openhands/runtime/tools/ (tool implementations)
```

**Deliverables:**
- [ ] 30 new tool functions in `server/services/tools/`
  - Event tools (5 files)
  - Profile tools (5 files)
  - Group tools (5 files)
  - Memory tools (5 files)
  - Code tools (10 files)
- [ ] Enhanced `server/services/tools/universalToolOrchestrator.ts`
- [ ] Tool registry: all 41 tools documented
- [ ] Test each tool with sample inputs
- [ ] Integration test: AI calls tools correctly
- [ ] Documentation: "Complete tool catalog with examples"

**Success Criteria:**
- 41 total tools (11 existing + 30 new)
- All tools have proper TypeScript types
- All tools handle errors gracefully
- AI can successfully call tools via function calling
- Tango-specific tools work with domain entities

**Timeline:** Week 7-8 (parallel with Visual Editor)

---

### **Agent #8: Integration Specialist** 🔗

**Responsibility:** Wire everything together, ensure nothing is orphaned

**Recursive Research Protocol:**
```markdown
1. Read docs/INTEGRATION_PROTOCOL.md (MANDATORY)
2. Map all integration points:
   - File Editing → Mr Blue chat
   - Repository Mapping → AI context
   - Multi-Agent → Vibe execution
   - Visual Editor → Enhanced context
   - Testing → Self-correction
   - Tools → UniversalToolOrchestrator
3. Create integration checklist for each specialist
4. Monitor: Build + Import + Render + Wire + Test
5. Verify no component is orphaned (exists but not imported)
6. Run integration tests after each specialist completes
7. If integration fails, identify gap, create fix ticket
8. Coordinate with QA Agent for final validation
9. Screenshot proof for all user-facing features
10. Document complete integration map
```

**Documents to Read:**
1. `docs/INTEGRATION_PROTOCOL.md` (CRITICAL)
2. `docs/AGENT_LEARNINGS.md` (Learning #1: Integration Fallacy)
3. `docs/MB_MD_QA_PROTOCOL.md` (Rule 2: Integrate Immediately)

**Deliverables:**
- [ ] Integration map: visual diagram of all connections
- [ ] Integration checklist for each specialist
- [ ] Daily standup: "Are all components wired?"
- [ ] Integration test suite (E2E tests)
- [ ] Screenshot proof for all features
- [ ] Documentation: "Complete system integration guide"

**Success Criteria:**
- Zero orphaned components (all imported and rendered)
- All API routes connected to frontend
- All tool functions called correctly
- User journey works end-to-end
- Screenshot proof for every interactive element

**Timeline:** Week 1-8 (continuous, throughout all phases)

---

### **Agent #9: QA Agent** ✅

**Responsibility:** Final validation, veto power, ensure no broken features ship

**Recursive Research Protocol:**
```markdown
1. Read docs/QA_AGENT_PROTOCOL.md (CRITICAL - veto power)
2. Read docs/MB_MD_QA_PROTOCOL.md (5 Non-Negotiable Rules)
3. Create validation checklist for each specialist
4. Review ALL specialist work before approval
5. Test as regular user (not just super admin)
6. Verify screenshots show feature actually works
7. Run full integration test suite
8. Check for regressions (old features still work)
9. If ANY issue found, VETO and send back to specialist
10. Only approve when all 5 rules satisfied
```

**Documents to Read:**
1. `docs/QA_AGENT_PROTOCOL.md` (CRITICAL - enforcement guide)
2. `docs/MB_MD_QA_PROTOCOL.md` (THE LAW)
3. `docs/PHASE_VERIFICATION_CHECKLISTS.md` (quick reference)
4. `docs/AGENT_LEARNINGS.md` (19 learnings to check for)

**Validation Checklist (5 Non-Negotiables):**
```markdown
For EACH specialist's work:

✅ Rule 1: VERIFY BEFORE BUILD
- [ ] Agent read all required documentation?
- [ ] Agent summarized requirements before coding?
- [ ] Agent checked existing code for patterns?

✅ Rule 2: INTEGRATE IMMEDIATELY
- [ ] Component exists AND imported?
- [ ] Component rendered in JSX?
- [ ] Props passed correctly?
- [ ] Event handlers wired?

✅ Rule 3: SCREENSHOT EVERYTHING
- [ ] Screenshot taken showing feature?
- [ ] Screenshot shows AFTER clicking/opening?
- [ ] Visual proof user can access feature?

✅ Rule 4: TEST USER JOURNEY
- [ ] Tested as regular user (not just super admin)?
- [ ] All interactive elements work?
- [ ] Data saves correctly?
- [ ] Page reloads don't break state?

✅ Rule 5: ARCHITECT VALIDATES
- [ ] Independent review completed?
- [ ] No self-approval?
- [ ] All feedback addressed?

VETO if ANY checkbox unchecked ❌
```

**Deliverables:**
- [ ] QA report for each specialist (approve/reject)
- [ ] Regression test suite
- [ ] User journey test suite
- [ ] Screenshot gallery (all features)
- [ ] Final approval or veto with detailed reasoning
- [ ] Documentation: "QA validation results"

**Success Criteria:**
- ALL 5 rules validated for each specialist
- Zero regressions (old features still work)
- User journey works end-to-end
- Screenshot proof for all features
- No broken features ship to production

**Timeline:** Week 1-8 (continuous validation, final gate at Week 8)

---

## 📊 **SIMULTANEOUS EXECUTION MATRIX**

| Week | File Editing | Repo Mapping | Multi-Agent | Visual Editor | Testing | Tools | Integration | QA |
|------|-------------|--------------|-------------|---------------|---------|-------|-------------|-----|
| **0** | Read docs | Read docs | Read docs | Read docs | Read docs | Read docs | Read docs | Read docs |
| **1-2** | 🏗️ Build | Research | Research | Research | Research | Research | ✅ Validate | ✅ Review |
| **3-4** | ✅ Complete | 🏗️ Build | Research | Research | Research | Research | ✅ Validate | ✅ Review |
| **5-6** | - | ✅ Complete | 🏗️ Build | Research | 🏗️ Build | Research | ✅ Validate | ✅ Review |
| **7-8** | - | - | ✅ Complete | 🏗️ Build | ✅ Complete | 🏗️ Build | ✅ Validate | ✅ FINAL |

**Legend:**
- 🏗️ = Active building
- ✅ = Completed/Validating
- - = Idle (waiting for dependencies)

**Dependencies:**
1. **Week 1-2:** File Editing (P0) - blocks everything else
2. **Week 3-4:** Repository Mapping (P0) - needs file editing
3. **Week 5-6:** Multi-Agent + Testing (P1) - parallel, independent
4. **Week 7-8:** Visual Editor + Tools (P1) - parallel, use all prior work

---

## 🔧 **REQUIRED INSTALLATIONS (Execute Week 0)**

### **npm install Commands**

```bash
# File Editing (Agent #2)
npm install diff

# Repository Mapping (Agent #3)
npm install @babel/parser @babel/traverse @babel/types

# Multi-Agent Orchestration (Agent #4)
npm install @langchain/langgraph @langchain/core

# Already Installed (no action needed) ✅
# - html2canvas (Visual Editor)
# - playwright (Testing)
# - @anthropic-ai/sdk (Claude)
# - openai (GPT-4o)
# - socket.io (Streaming)
```

**Installation Timeline:** Week 0 (before building starts)

---

## 📚 **REQUIRED REPOSITORY CLONES (Execute Week 0)**

### **Clone Commands**

```bash
# File Editing
git clone https://github.com/Aider-AI/aider.git

# Repository Mapping
# (same as above - Aider)

# Multi-Agent
git clone https://github.com/langchain-ai/langgraph.git
git clone https://github.com/joaomdmoura/crewAI.git
git clone https://github.com/microsoft/autogen.git

# Visual Editor
git clone https://github.com/abi/screenshot-to-code.git
git clone https://github.com/BuilderIO/builder.git

# Testing
git clone https://github.com/cline/cline.git

# Tools
git clone https://github.com/continuedev/continue.git
git clone https://github.com/All-Hands-AI/OpenHands.git

# Full Platform (reference)
git clone https://github.com/stackblitz-labs/bolt.diy.git
```

**Clone Timeline:** Week 0 (before building starts)

---

## ✅ **SUCCESS METRICS (8 Weeks)**

| Metric | Current | Week 4 Target | Week 8 Target | Industry Best |
|--------|---------|---------------|---------------|---------------|
| **Edit Success Rate** | 0% | 60% | 80%+ | 72% (Aider) |
| **Repo Compression** | 0x | 10x | 20x+ | 20x (Aider) |
| **Build Success** | 0% | 70% | 90%+ | 92% (Replit) |
| **Test Pass (w/ retry)** | N/A | 80% | 90%+ | 90% (Industry) |
| **Tool Count** | 11 | 25 | 41 | 30 (Replit) |
| **Integration** | 60% | 80% | 95% | 100% |
| **Overall Completion** | 60% | 80% | 95% | 100% (Replit) |

---

## 🚨 **CRITICAL PATH & BLOCKERS**

### **Hard Dependencies (Sequential)**

```
File Editing (Week 1-2) → BLOCKS → Repository Mapping (Week 3-4)
                                      ↓
                                      BLOCKS → Multi-Agent (Week 5-6)
                                      ↓
                                      BLOCKS → Visual Editor (Week 7-8)
```

**Critical Path:** File Editing → Repo Mapping → Multi-Agent → Visual Editor

**Parallel Streams (Independent):**
- Testing (Week 5-6) - parallel with Multi-Agent
- Tools (Week 7-8) - parallel with Visual Editor

---

## 📝 **DAILY STANDUP PROTOCOL**

**Every Day, Each Agent Reports:**

```markdown
## Agent Name: [File Editing Specialist]
## Date: [Oct 23, 2025]

✅ Completed Yesterday:
- Read Aider docs
- Installed diff library
- Studied editblock_coder.py

🏗️ Working on Today:
- Implement UnifiedDiffEditor.ts
- Test with 10 sample diffs

🚧 Blockers:
- None (or describe blocker)

❓ Questions for Other Agents:
- Integration Agent: Where should I mount /api/vibe/edit-file?

📚 Research Status:
- Completed 3/5 required research items
```

**QA Agent Reviews Daily:**
- Any agent skipping documentation? → VETO ❌
- Any agent building without integration? → VETO ❌
- Any agent claiming complete without screenshot? → VETO ❌

---

## 🎓 **AGENT CERTIFICATION (Before Building)**

**Each Agent Must Pass:**

```markdown
## Certification Checklist

📚 Knowledge Test:
- [ ] Scored 8/10 on domain knowledge test
- [ ] Read all required documentation
- [ ] Summarized requirements before coding

🛠️ Technical Skills:
- [ ] Installed required libraries
- [ ] Cloned reference repositories
- [ ] Studied key files (noted in research protocol)

🔗 Integration Awareness:
- [ ] Read INTEGRATION_PROTOCOL.md
- [ ] Understands build → import → render → test flow
- [ ] Knows where to mount features (parent components)

✅ MB.MD Protocol:
- [ ] Read MB_MD_QA_PROTOCOL.md
- [ ] Understands 5 Non-Negotiable Rules
- [ ] Knows when to screenshot (after interactions)

🎯 Success Criteria:
- [ ] Can define success metrics for their domain
- [ ] Knows what "done" looks like
- [ ] Prepared to iterate until success achieved

MINIMUM SCORE: 5/5 sections ✅
```

**Architect Reviews Certification:**
- All agents certified? → Proceed to building ✅
- Any agent failed? → More research required ❌

---

## 🎯 **FINAL DELIVERABLES (Week 8)**

### **Code Artifacts**

1. **File Editing System**
   - `server/services/fileEditing/UnifiedDiffEditor.ts`
   - `server/services/fileEditing/SearchReplaceEditor.ts`
   - `server/services/fileEditing/DiffApplier.ts`

2. **Repository Mapping System**
   - `server/services/repositoryMapping/ASTParser.ts`
   - `server/services/repositoryMapping/CompactRepresentation.ts`
   - `server/services/repositoryMapping/DependencyGraph.ts`

3. **Multi-Agent Orchestration**
   - `server/services/agents/VibeGraph.ts`
   - `server/services/agents/ManagerAgent.ts`
   - `server/services/agents/EditorAgent.ts`
   - `server/services/agents/VerifierAgent.ts`
   - `server/services/agents/TesterAgent.ts`

4. **Visual Editor Integration**
   - Enhanced `client/src/lib/visual-editor/iframeMessaging.ts`
   - `client/src/components/visual-editor/DiffPreviewCard.tsx`
   - `client/src/components/visual-editor/AISuggestionsPanel.tsx`

5. **Testing & Self-Correction**
   - Enhanced `server/browserAutomation.ts`
   - `server/services/testing/PlaywrightEnhanced.ts`

6. **Tools Expansion**
   - 30 new tool files in `server/services/tools/`
   - Enhanced `server/services/tools/universalToolOrchestrator.ts`

7. **API Routes**
   - `server/routes/vibeRoutes.ts` (all endpoints)
   - Enhanced `server/routes/chatProjectsRoutes.ts`

8. **Documentation**
   - Implementation guides for each system
   - Integration map
   - Tool catalog (41 tools)
   - Success metrics report

---

### **Testing Artifacts**

1. **Unit Tests**
   - File editing: 50 samples, 80%+ pass
   - Repository mapping: Parse Mundo Tango codebase
   - Tools: Test each of 41 tools

2. **Integration Tests**
   - E2E user journey tests
   - API endpoint tests
   - Visual Editor ↔ Mr Blue integration tests

3. **Benchmark Reports**
   - Edit success rate comparison
   - Repository compression ratio
   - Build success rate
   - Test pass rate (before/after retries)

---

### **Documentation Artifacts**

1. **Technical Documentation**
   - How file editing works
   - How repository mapping works
   - How multi-agent orchestration works
   - How Visual Editor integration works
   - How self-correction testing works
   - Complete tool catalog

2. **User Documentation**
   - How to use vibe coding
   - Click-to-code workflow guide
   - Troubleshooting guide

3. **QA Reports**
   - Validation results for each specialist
   - Regression test results
   - Final approval document

---

## 🎬 **EXECUTION KICKOFF**

### **Week 0 Checklist (Execute NOW)**

```bash
# 1. Install missing libraries
npm install diff @babel/parser @babel/traverse @babel/types @langchain/langgraph @langchain/core

# 2. Clone reference repositories
mkdir -p ~/research
cd ~/research
git clone https://github.com/Aider-AI/aider.git
git clone https://github.com/langchain-ai/langgraph.git
git clone https://github.com/abi/screenshot-to-code.git
git clone https://github.com/BuilderIO/builder.git
git clone https://github.com/cline/cline.git
git clone https://github.com/continuedev/continue.git
git clone https://github.com/stackblitz-labs/bolt.diy.git

# 3. Documentation Agent: Create certification checklists
# (see Agent #1 deliverables)

# 4. All Agents: Read required documentation
# (see each agent's "Documents to Read" section)

# 5. All Agents: Pass certification test
# (see Agent Certification checklist)

# 6. Architect: Review certifications
# (approve/reject each agent)

# 7. Proceed to Week 1 building
# (only after ALL agents certified)
```

---

## 🚀 **READY TO BUILD?**

**Before Week 1 starts, verify:**

- [ ] All 5 missing libraries installed
- [ ] All 7 reference repositories cloned
- [ ] All 9 agents read their required documentation
- [ ] All 9 agents passed certification test
- [ ] Documentation Agent created checklists
- [ ] Integration Agent mapped all integration points
- [ ] QA Agent reviewed certification results
- [ ] Architect approved all certifications

**If ALL checked ✅ → Proceed to Week 1**  
**If ANY unchecked ❌ → More research required**

---

**Build Plan Created:** October 23, 2025  
**Status:** ✅ READY FOR EXECUTION (Week 0 tasks must complete first)  
**Execution Mode:** MB.MD SIMULTANEOUS  
**Timeline:** 8 weeks to 95% completion  
**Agents:** 9 specialists, all working in parallel  
**Open Sources:** 5 to install, 6 to study  
**Success:** Match Replit + 3 unique advantages 🚀
