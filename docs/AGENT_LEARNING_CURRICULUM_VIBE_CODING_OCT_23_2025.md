# Agent Learning Curriculum: Implementing Vibe Coding (Oct 23, 2025)

## 🎯 **Purpose**

This document answers: **"What do our agents have to learn to successfully implement vibe coding?"**

Created for agents who will build the vibe coding system, based on research of 25+ platforms, 3 multi-agent frameworks, and visual editor integration patterns.

---

## 📚 **Required Reading (Before Building)**

### **Phase 1: Understanding Vibe Coding (2 hours)**

**Must Read Documents** (in this order):

1. **`docs/agents/operational/operational-131-vibe-coding-specialist.md`** (30 min)
   - What is vibe coding?
   - How does it work end-to-end?
   - What are the 30+ tools?
   - What is the multi-agent architecture?

2. **`docs/VIBE_CODING_PLATFORMS_RESEARCH_OCT_23_2025.md`** (20 min)
   - How does Replit do it?
   - How does Cursor do it?
   - What can we learn from them?

3. **`docs/VIBE_CODING_FILE_EDITING_ALGORITHMS_OCT_23_2025.md`** (20 min)
   - Why unified diff > whole file rewrite?
   - How to implement SEARCH/REPLACE?
   - What success rates to expect?

4. **`docs/MUNDO_TANGO_VS_OPEN_SOURCE_VIBE_CODING_OCT_23_2025.md`** (20 min)
   - What do we already have? (60%)
   - What's missing? (file editing, repo mapping)
   - What's our 8-week plan?

5. **`docs/MB_MD_QA_PROTOCOL.md`** (15 min)
   - The 5 Non-Negotiable Rules
   - Why agents fail without them
   - QA Agent veto power

6. **`docs/INTEGRATION_PROTOCOL.md`** (15 min)
   - Component exists ≠ feature works
   - Integration checklist (build → import → render → test → screenshot)
   - Mr Blue + Visual Editor integration requirements

---

## 🛠️ **Technical Skills Agents Must Master**

### **Skill 1: File Editing Algorithms** ⚠️ **CRITICAL**

**Why:** 60-70% of vibe coding success depends on this

**What to Learn:**

1. **Unified Diff Format**
   ```diff
   --- file.ts
   +++ file.ts
   @@ -10,3 +10,5 @@
    function login() {
   -  return true;
   +  if (!user) return false;
   +  return verifyToken(user);
    }
   ```
   
   **Read:**
   - `docs/VIBE_CODING_FILE_EDITING_ALGORITHMS_OCT_23_2025.md`
   - Aider's docs: https://aider.chat/docs/unified-diffs.html
   
   **Clone & Study:**
   ```bash
   git clone https://github.com/Aider-AI/aider.git
   # Read: aider/coders/editblock_coder.py (200 lines, core algorithm)
   ```

2. **Apply Diffs with Fuzzy Matching**
   ```typescript
   import { applyPatch } from 'diff';
   
   // LLMs are imprecise - allow ±2 lines tolerance
   const result = applyPatch(originalContent, diffString, {
       fuzzFactor: 2,  // ±2 lines
       autoConvertLineEndings: true
   });
   ```
   
   **Practice:**
   - Apply diffs manually
   - Handle failed patches (context mismatch)
   - Implement retry with larger context

3. **Generate Diffs from LLM Output**
   ```typescript
   // LLM returns SEARCH/REPLACE blocks
   const SEARCH_REPLACE_REGEX = /<<<<<<< SEARCH\n(.*?)\n=======\n(.*?)\n>>>>>>> REPLACE/gs;
   
   function parseDiffs(llmOutput: string): Diff[] {
       const matches = [...llmOutput.matchAll(SEARCH_REPLACE_REGEX)];
       return matches.map(([_, search, replace]) => ({
           search: search.trim(),
           replace: replace.trim()
       }));
   }
   ```

**Mastery Test:**
- Can apply 10 consecutive diffs with >80% success rate
- Can handle LLM imprecision (fuzzy matching)
- Can generate clear error messages when diffs fail

---

### **Skill 2: Repository Mapping** ⚠️ **CRITICAL**

**Why:** Need to fit 100k+ LOC into AI context

**What to Learn:**

1. **AST Parsing (TypeScript/JavaScript)**
   ```typescript
   import { parse } from '@babel/parser';
   import traverse from '@babel/traverse';
   
   // Parse TypeScript file
   const ast = parse(sourceCode, {
       sourceType: 'module',
       plugins: ['typescript', 'jsx']
   });
   
   // Extract symbols
   const symbols = [];
   traverse(ast, {
       FunctionDeclaration(path) {
           symbols.push({
               type: 'function',
               name: path.node.id.name,
               line: path.node.loc.start.line
           });
       },
       ClassDeclaration(path) {
           symbols.push({
               type: 'class',
               name: path.node.id.name,
               methods: extractMethods(path)
           });
       }
   });
   ```

2. **Compact Representation (Aider's Innovation)**
   ```typescript
   // Instead of sending full file (50k tokens):
   // function login() {
   //     const user = getUser();
   //     const token = generateToken();
   //     ...300 more lines...
   // }
   
   // Send compact map (2k tokens):
   // ## src/auth.ts
   //   - function login()
   //   - function logout()
   //   - class AuthService
   //     → constructor()
   //     → verifyToken()
   //   - imports: [React, { db } from './db']
   
   function createCompactMap(file: string): string {
       const ast = parse(file);
       const symbols = extractSymbols(ast);
       
       return formatCompact(symbols);
       // Result: 20x compression!
   }
   ```

3. **Dependency Graph**
   ```typescript
   // Track imports/exports
   interface DependencyGraph {
       files: Map<string, {
           imports: string[];
           exports: string[];
           symbols: Symbol[];
       }>;
   }
   
   // Find all files that import Button.tsx
   function findUsages(file: string): string[] {
       return Array.from(graph.files.entries())
           .filter(([_, data]) => data.imports.includes(file))
           .map(([path, _]) => path);
   }
   ```

**Read:**
- Aider's repomap: https://aider.chat/docs/repomap.html
- Babel docs: https://babeljs.io/docs/en/babel-parser

**Clone & Study:**
```bash
git clone https://github.com/Aider-AI/aider.git
# Read: aider/repomap.py (500 lines, repository mapping)
```

**Mastery Test:**
- Can parse 100k LOC TypeScript codebase
- Can generate compact map (20x compression)
- Can find symbol definitions and usages

---

### **Skill 3: Multi-Agent Orchestration** ⚠️ **IMPORTANT**

**Why:** Complex builds need multiple agents working together

**What to Learn:**

1. **LangGraph (State-Based)**
   ```typescript
   import { StateGraph } from '@langchain/langgraph';
   
   interface State {
       userRequest: string;
       tasks: Task[];
       codeChanges: Diff[];
       testResults: TestResult[];
   }
   
   const graph = new StateGraph<State>();
   
   // Add nodes (agents)
   graph.addNode('manager', planTasks);
   graph.addNode('editor', generateCode);
   graph.addNode('verifier', checkQuality);
   
   // Add edges (flow)
   graph.addEdge('manager', 'editor');
   graph.addConditionalEdge(
       'verifier',
       (state) => state.allApproved ? 'done' : 'editor',
       { 'done': END, 'editor': 'editor' }
   );
   ```

2. **CrewAI (Role-Based)**
   ```python
   from crewai import Agent, Task, Crew
   
   # Define roles
   pm = Agent(role='Project Manager', goal='Plan tasks')
   dev = Agent(role='Developer', goal='Write code')
   qa = Agent(role='QA', goal='Test code')
   
   # Create tasks
   tasks = [
       Task(description='Plan', agent=pm),
       Task(description='Code', agent=dev, context=[task1]),
       Task(description='Test', agent=qa, context=[task2])
   ]
   
   # Execute
   crew = Crew(agents=[pm, dev, qa], tasks=tasks)
   result = crew.kickoff()
   ```

**Read:**
- `docs/MULTI_AGENT_ORCHESTRATION_PATTERNS_OCT_23_2025.md`
- LangGraph docs: https://python.langchain.com/docs/langgraph
- CrewAI docs: https://docs.crewai.com/

**Clone & Study:**
```bash
git clone https://github.com/langchain-ai/langgraph.git
# Read: examples/multi-agent/supervisor.py
```

**Mastery Test:**
- Can design state graph for complex task
- Can implement conditional loops (retry on failure)
- Can coordinate 3+ agents

---

### **Skill 4: Visual Editor Integration** ⚠️ **IMPORTANT**

**Why:** Click element → AI generates code (unique Mundo Tango advantage)

**What to Learn:**

1. **Enhanced Element Inspection**
   ```typescript
   function inspectElement(el: Element) {
       return {
           // Basic
           tagName: el.tagName,
           className: el.className,
           
           // Computed Styles (NEW!)
           computedStyles: window.getComputedStyle(el),
           
           // DOM Structure (NEW!)
           parent: el.parentElement?.tagName,
           children: Array.from(el.children).map(c => ({
               tag: c.tagName,
               text: c.textContent
           })),
           
           // Visual (NEW!)
           boundingBox: el.getBoundingClientRect(),
           screenshot: await captureScreenshot(el),
           
           // Code (NEW!)
           sourceFile: findSourceFile(el),
           sourceCode: getReactSource(el)
       };
   }
   ```

2. **Screenshot Capture**
   ```typescript
   import html2canvas from 'html2canvas';
   
   async function captureElement(el: Element): Promise<string> {
       const canvas = await html2canvas(el, {
           backgroundColor: null,
           scale: 2  // High DPI
       });
       return canvas.toDataURL('image/png');
   }
   ```

3. **Diff Preview & Apply**
   ```typescript
   // In chat, show diff with Apply button
   <DiffPreviewCard
       before={currentCode}
       after={proposedCode}
       screenshot={beforeAfter}
       onApply={async () => {
           await applyDiff(proposedCode);
           refreshPreview();
           toast({ title: "Changes applied!" });
       }}
   />
   ```

**Read:**
- `docs/VISUAL_EDITOR_AI_CONTEXT_BRIDGE_OCT_23_2025.md`
- `docs/INTEGRATION_PROTOCOL.md` (Mr Blue/Visual Editor sections)
- screenshot-to-code: https://github.com/abi/screenshot-to-code

**Study Existing Code:**
```bash
# Current integration
client/src/contexts/VisualEditorContext.tsx
client/src/lib/visual-editor/iframeMessaging.ts
server/routes/chatProjectsRoutes.ts (buildContextAwarePrompt)
```

**Mastery Test:**
- Can extract computed styles from element
- Can capture screenshot of selected element
- Can show diff preview with before/after
- Can apply changes and refresh preview

---

### **Skill 5: Browser Automation & Testing** ⚠️ **IMPORTANT**

**Why:** Self-testing loop is critical for reliability

**What to Learn:**

1. **Playwright Automation**
   ```typescript
   import { chromium } from 'playwright';
   
   const browser = await chromium.launch();
   const page = await browser.newPage();
   
   // Navigate
   await page.goto('http://localhost:5000');
   
   // Interact
   await page.click('button[data-testid="login"]');
   await page.fill('input[name="email"]', 'test@example.com');
   
   // Assert
   const text = await page.textContent('.success-message');
   expect(text).toBe('Login successful');
   
   // Screenshot
   await page.screenshot({ path: 'test.png' });
   ```

2. **Self-Correction Loop**
   ```typescript
   async function testWithRetry(task: Task): Promise<Result> {
       let attempts = 0;
       
       while (attempts < 3) {
           // Execute task
           await applyCode(task.code);
           
           // Test
           const result = await runTests();
           
           if (result.passed) {
               return { success: true };
           }
           
           // Analyze failure
           const screenshot = await page.screenshot();
           const analysis = await aiAnalyze({
               screenshot,
               error: result.error,
               code: task.code
           });
           
           // Generate fix
           task.code = await aiFix(analysis);
           attempts++;
       }
       
       return { success: false, error: 'Max retries exceeded' };
   }
   ```

3. **AI Vision Analysis (Claude)**
   ```typescript
   async function analyzeFailure(screenshot: string, error: string) {
       const response = await anthropic.messages.create({
           model: 'claude-3-5-sonnet',
           messages: [{
               role: 'user',
               content: [
                   { type: 'image', source: { type: 'base64', data: screenshot } },
                   { type: 'text', text: `Test failed: ${error}. What's wrong?` }
               ]
           }]
       });
       
       return response.content[0].text;
   }
   ```

**Read:**
- Playwright docs: https://playwright.dev/
- `server/browserAutomation.ts` (existing implementation)

**Clone & Study:**
```bash
git clone https://github.com/cline/cline.git
# Read: src/services/browser/BrowserSession.ts
```

**Mastery Test:**
- Can write Playwright test for any feature
- Can analyze screenshots with AI
- Can implement self-correction loop (3 retries)

---

## 🎯 **Learning Path: 4-Week Intensive**

### **Week 1: File Editing Mastery**

**Monday-Tuesday:**
- Read Aider docs (unified diffs)
- Clone Aider repo, study `editblock_coder.py`
- Install `diff` library, practice applying patches

**Wednesday-Thursday:**
- Implement `UnifiedDiffEditor.ts`
- Implement `SearchReplaceEditor.ts`
- Test with 20 sample diffs, aim for >80% success

**Friday:**
- Write unit tests
- Create API routes (`/api/vibe/edit-file`)
- Document learnings

**Success Criteria:**
- Can apply unified diffs with 80%+ success
- Can handle fuzzy matching (±2 lines)
- Can parse LLM output (SEARCH/REPLACE blocks)

---

### **Week 2: Repository Mapping**

**Monday-Tuesday:**
- Read Babel docs (AST parsing)
- Clone Aider repo, study `repomap.py`
- Install `@babel/parser`, practice parsing TypeScript

**Wednesday-Thursday:**
- Implement `repositoryMapper.ts` (AST parsing)
- Implement `compactRepresentation.ts` (20x compression)
- Implement `dependencyGraph.ts` (import tracking)

**Friday:**
- Test with Mundo Tango codebase (100k+ LOC)
- Measure compression ratio (should be >15x)
- Document findings

**Success Criteria:**
- Can parse entire Mundo Tango codebase
- Can generate compact map (<10k tokens for 100k LOC)
- Can find symbol definitions and usages

---

### **Week 3: Multi-Agent Orchestration**

**Monday-Tuesday:**
- Read LangGraph docs
- Clone LangGraph repo, study examples
- Install `@langchain/langgraph`

**Wednesday-Thursday:**
- Implement `vibeGraph.ts` (state graph)
- Create 4 agent nodes (Manager, Editor, Verifier, Tester)
- Add conditional edges (retry loops)

**Friday:**
- Test with sample request ("Add login button")
- Verify agents coordinate correctly
- Document agent architecture

**Success Criteria:**
- Can orchestrate 4 agents
- Can implement retry loops (max 3 attempts)
- Can handle failures gracefully

---

### **Week 4: Visual Editor Integration**

**Monday-Tuesday:**
- Read Visual Editor docs
- Study existing code (`VisualEditorContext.tsx`, `iframeMessaging.ts`)
- Install `html2canvas`

**Wednesday-Thursday:**
- Enhance `inspectElement()` (computed styles)
- Implement `captureScreenshot()`
- Create `DiffPreviewCard` component

**Friday:**
- Test click element → generate code → apply workflow
- Verify screenshot capture works
- Document integration

**Success Criteria:**
- Can extract full element context (styles, screenshot, source)
- Can show diff preview with Apply button
- Can apply changes and refresh preview

---

## 📖 **Open Source Study Guide**

### **Repositories to Clone (Priority Order)**

```bash
# 1. File Editing (CRITICAL)
git clone https://github.com/Aider-AI/aider.git
# Read: aider/coders/editblock_coder.py
# Read: aider/coders/base_coder.py

# 2. Multi-Agent (CRITICAL)
git clone https://github.com/langchain-ai/langgraph.git
# Read: examples/multi-agent/supervisor.py
# Read: examples/multi-agent/hierarchical.py

# 3. Full Platform (REFERENCE)
git clone https://github.com/stackblitz-labs/bolt.diy.git
# Read: app/lib/stores/files.ts
# Read: app/routes/api.chat.ts

# 4. Repository Mapping (IMPORTANT)
git clone https://github.com/BloopAI/bloop.git
# Read: src/query/semantic.rs

# 5. Browser Automation (IMPORTANT)
git clone https://github.com/cline/cline.git
# Read: src/services/browser/BrowserSession.ts
```

### **Key Files to Study (Est. 10 hours)**

1. **Aider's File Editing** (2 hours)
   - `aider/coders/editblock_coder.py` (200 lines)
   - `aider/coders/base_coder.py` (300 lines)
   - Understand: How diffs are generated and applied

2. **Aider's Repository Mapping** (2 hours)
   - `aider/repomap.py` (500 lines)
   - Understand: How to compress 100k LOC → 10k tokens

3. **LangGraph Multi-Agent** (2 hours)
   - `examples/multi-agent/supervisor.py` (150 lines)
   - `examples/multi-agent/hierarchical.py` (200 lines)
   - Understand: State management, conditional edges

4. **Bolt.diy Full Platform** (2 hours)
   - `app/lib/stores/files.ts` (300 lines)
   - `app/routes/api.chat.ts` (400 lines)
   - Understand: How streaming works, how files are managed

5. **Cline Browser Automation** (2 hours)
   - `src/services/browser/BrowserSession.ts` (400 lines)
   - Understand: How to automate testing, analyze screenshots

---

## 🚨 **Common Pitfalls (What NOT to Do)**

### **Pitfall 1: Building Without Reading Docs**

**❌ WRONG:**
```
Agent: "I'll build file editing now"
→ Builds naive solution
→ 30% success rate
→ Has to rebuild
```

**✅ CORRECT:**
```
Agent: "Let me read Aider docs first"
→ Understands unified diff algorithm
→ Implements proven approach
→ 80% success rate
```

**Rule:** ALWAYS read documentation before building (MB.MD Rule 1)

---

### **Pitfall 2: Component Exists ≠ Feature Works**

**❌ WRONG:**
```
Agent: "I created DiffPreviewCard.tsx ✅"
Reality: Not imported anywhere
Result: Feature doesn't work
```

**✅ CORRECT:**
```
Agent: "I created DiffPreviewCard.tsx AND imported it into ChatInterface.tsx ✅"
Reality: Component renders, user sees it
Result: Feature works
```

**Rule:** Build + Import + Render + Test = Complete (Integration Protocol)

---

### **Pitfall 3: No Screenshot Proof**

**❌ WRONG:**
```
Agent: "Code compiles, task complete ✅"
Reality: UI broken, button doesn't appear
Result: User can't use feature
```

**✅ CORRECT:**
```
Agent: "Here's screenshot showing button works ✅"
Reality: Visual proof feature is accessible
Result: QA Agent approves
```

**Rule:** Screenshot everything user can interact with (MB.MD Rule 3)

---

### **Pitfall 4: Testing Code, Not User Journey**

**❌ WRONG:**
```
Agent Tests:
✅ TypeScript compiles
✅ No console errors
✅ API returns 200

User Experience:
❌ Can't find button
❌ Modal doesn't open
❌ Changes don't apply
```

**✅ CORRECT:**
```
Agent Tests:
✅ User clicks floating button → Modal opens
✅ User types message → AI responds
✅ User clicks "Apply" → Code updates
✅ Screenshot of each step
```

**Rule:** Test user path, not code path (Agent Learning #11)

---

## 🎓 **Mastery Checklist**

**Before starting vibe coding implementation, verify:**

- [ ] Read all 8 vibe coding research documents
- [ ] Read MB.MD QA Protocol (5 Non-Negotiable Rules)
- [ ] Read Integration Protocol (build → integrate → test → screenshot)
- [ ] Cloned and studied Aider (file editing)
- [ ] Cloned and studied LangGraph (multi-agent)
- [ ] Cloned and studied Bolt.diy (full platform)
- [ ] Can apply unified diffs with >80% success
- [ ] Can parse TypeScript into compact AST representation
- [ ] Can design multi-agent state graph
- [ ] Can extract computed styles from DOM element
- [ ] Can capture screenshots with html2canvas
- [ ] Can write Playwright tests
- [ ] Understand Visual Editor ↔ Mr Blue context flow
- [ ] Practiced on sample task (login button example)

**Minimum Score:** 14/14 ✅

---

## 📊 **Knowledge Assessment**

### **Test 1: File Editing (10 points)**

**Questions:**
1. What is unified diff format? (2 pts)
2. Why is it better than whole file rewrite? (2 pts)
3. What is fuzzy matching and why is it needed? (2 pts)
4. How do you parse SEARCH/REPLACE blocks from LLM output? (2 pts)
5. What's the success rate of unified diff vs whole file? (2 pts)

**Passing Score:** 8/10

---

### **Test 2: Multi-Agent (10 points)**

**Questions:**
1. What are the 4 agent roles in vibe coding? (2 pts)
2. What is a state graph? (2 pts)
3. How do conditional edges work? (2 pts)
4. Why use multi-agent instead of single agent? (2 pts)
5. What is the supervisor pattern? (2 pts)

**Passing Score:** 8/10

---

### **Test 3: Visual Editor Integration (10 points)**

**Questions:**
1. What context does Visual Editor send to Mr Blue? (2 pts)
2. What's missing in current integration? (2 pts)
3. How do you capture element screenshot? (2 pts)
4. What are computed styles? (2 pts)
5. How does diff preview work? (2 pts)

**Passing Score:** 8/10

---

### **Test 4: MB.MD Protocol (10 points)**

**Questions:**
1. What are the 5 Non-Negotiable Rules? (3 pts)
2. Why is screenshot proof mandatory? (2 pts)
3. What's the difference between component exists vs feature works? (2 pts)
4. When does QA Agent veto? (2 pts)
5. What are the 3 execution modes (FOCUSED, PARALLEL, SIMULTANEOUS)? (1 pt)

**Passing Score:** 8/10

---

## 🎯 **Final Certification**

**Agent is ready to implement vibe coding if:**

✅ Passed all 4 knowledge tests (32/40 minimum)  
✅ Completed 14/14 mastery checklist items  
✅ Studied all 5 priority repositories  
✅ Built and tested sample feature (login button)  
✅ Demonstrated integration protocol adherence  
✅ Received Architect approval

**Certification Level:**
- **Bronze:** 32-35 points (can assist)
- **Silver:** 36-38 points (can lead small tasks)
- **Gold:** 39-40 points (can lead complex builds)

---

## 📚 **Continuous Learning**

**After certification, continue studying:**

1. **Weekly:** Read one new open-source vibe coding platform
2. **Monthly:** Experiment with new LLM models (test success rates)
3. **Quarterly:** Review and update learnings based on failures

**Learning Sources:**
- Aider changelog (new algorithms)
- LangChain blog (multi-agent patterns)
- Replit docs (new features)
- Community discussions (Reddit, Discord)

---

## 🎬 **Summary**

**What agents need to learn:**

1. **File Editing** (P0) - Unified diff, fuzzy matching, SEARCH/REPLACE
2. **Repository Mapping** (P0) - AST parsing, compact representation, 20x compression
3. **Multi-Agent** (P1) - LangGraph, state graphs, conditional loops
4. **Visual Integration** (P1) - Enhanced inspection, screenshots, diff preview
5. **Testing** (P1) - Playwright, self-correction loops, AI vision analysis

**Learning Path:**
- Week 1: File editing
- Week 2: Repository mapping
- Week 3: Multi-agent orchestration
- Week 4: Visual editor integration

**Resources:**
- 8 research documents (70,000 words)
- 5 open-source repositories
- 4 knowledge tests
- 14-item mastery checklist

**Certification:**
- Minimum 32/40 points
- All checklist items complete
- Architect approval

**Result:** Agent ready to build production vibe coding system

---

**Document Created:** October 23, 2025  
**Status:** ✅ COMPLETE - Comprehensive learning curriculum  
**Audience:** All agents implementing vibe coding  
**Prerequisite:** Read all 8 vibe coding research documents first
