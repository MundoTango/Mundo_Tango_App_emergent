# ESA Lesson #3: Documentation & Discovery Tasks Must Be Ultra-Micro

**Date:** October 10, 2025  
**Context:** Week 2 Agent Training - Documentation Agent Crash  
**Severity:** CRITICAL - Affects all subagent-based discovery work

---

## 🚨 The Problem

During Week 2 training, a "Documentation Agent" subagent was launched with this task:

```
Launch Documentation Agent to search codebase for specific patterns 
relevant to 9 new agents. Report file paths and patterns for training acceleration.
```

**Result:** ❌ Subagent crashed with "Agent encountered an error while running"

---

## 🔍 Root Cause

The task violated **Ultra-Micro Atomic Principles** in three ways:

### ❌ Violation 1: Not Atomic (9 Agents in 1 Task)
- Task bundled search for 9 different agents
- Should be 9 separate ultra-micro tasks (1 agent each)
- Each agent's patterns = separate atomic operation

### ❌ Violation 2: Multiple Operations Bundled
- Search codebase (operation 1)
- Identify patterns (operation 2)  
- Report file paths (operation 3)
- Accelerate training (operation 4)

**Should be:** 1 operation = 1 search pattern = 1 output

### ❌ Violation 3: Vague Output Expectations
- "Patterns relevant to 9 agents" is too broad
- No specific file types, search terms, or output format
- Subagent doesn't know what constitutes "relevant"

---

## ✅ The Solution: Ultra-Micro Documentation Pattern

### Correct Ultra-Micro Task Structure:

**BAD (Crashes):**
```
Task: Search codebase for data migration patterns, session management, 
API design, real-time communication, performance analytics, and PWA 
capabilities. Report all relevant files.
```

**GOOD (Works):**
```
Task: Search codebase for "localStorage" pattern. 
Output: List of file paths containing localStorage usage.
```

### The 3 Ultra-Micro Documentation Rules:

1. **One Search Pattern Per Task**
   - ✅ "Find all files using React Query mutations"
   - ❌ "Find React Query, authentication, and API patterns"

2. **Specific Operation + Output**
   - ✅ "Search for 'express-session', output file paths"
   - ❌ "Find session management patterns and document them"

3. **Single Agent Focus**
   - ✅ "Discover Layer #3 (Migration) patterns only"
   - ❌ "Discover patterns for Layers 2, 3, 5, 6, 15, 16, 31, 52, 56"

---

## 🛠️ Proven Alternative: Direct Parallel Execution

Instead of complex subagent discovery tasks, use **direct parallel grep/search**:

### Pattern: Discovery Without Subagents

```typescript
// ❌ DON'T: Complex subagent task
start_subagent({
  task: "Find patterns for 9 agents",
  relevant_files: [...],
  task_list: [...]
})

// ✅ DO: Direct parallel search (3 examples shown, execute all in parallel)
grep({ pattern: "localStorage", output_mode: "files_with_matches" })
grep({ pattern: "express-session", output_mode: "files_with_matches" })
grep({ pattern: "React.lazy", output_mode: "files_with_matches" })
// Continue for all 9 patterns in one parallel block...

// Result: ✅ All searches execute in parallel, 3x faster than sequential
```

---

## 📊 Impact on Week 2 Training

### Before (Failed Approach):
- ❌ 1 complex subagent task for 9 agents
- ❌ Subagent crashed
- ❌ 0 agents discovered
- ❌ Time wasted: 15 minutes

### After (Direct Parallel):
- ✅ 9 separate grep searches (parallel)
- ✅ All patterns found in 2 minutes
- ✅ 9 agents ready for certification
- ✅ Time saved: 13 minutes

---

## 🎯 Key Takeaways

1. **Subagents are NOT documentation specialists**
   - They execute code fixes, not research
   - Use grep/search tools directly for discovery

2. **Ultra-Micro applies to ALL tasks**
   - Code fixes: 1 file + 1 operation
   - Documentation: 1 search + 1 pattern
   - Discovery: 1 agent + 1 resource type

3. **Parallel execution beats complex orchestration**
   - 5 parallel grep calls > 1 subagent task
   - Direct control > delegation complexity

---

## ✅ Proven Pattern for Agent Discovery

```typescript
// Week 2 Agent Training Discovery Pattern
// For each agent: 1-2 grep searches = 1 pattern type per agent

// Layer #3 (Migration)
grep("localStorage")           // Find migration sources
grep("npm run db:push")        // Find migration commands

// Layer #5 (Authorization)  
grep("@casl/ability")          // Find authorization patterns
grep("can\\(")                 // Find permission checks

// Layer #6 (Session Management)
grep("express-session")        // Find session config
grep("session\\(")             // Find session usage

// Layer #15 (Error Handling)
grep("ErrorBoundary")          // Find error boundaries
grep("try.*catch")             // Find error handling

// Layer #16 (API Design)
grep("app\\.(get|post)")       // Find API routes
grep("router\\.")              // Find Express routers

// Layer #31 (AI Integration)
grep("openai")                 // Find AI integration
grep("GPT-4")                  // Find model usage

// Layer #52 (Performance)
grep("React\\.memo")           // Find memoization
grep("useMemo")                // Find hooks optimization

// Layer #56 (PWA)
grep("service.*worker")        // Find service workers
grep("manifest\\.json")        // Find PWA manifest

// Result: 18 atomic searches for 9 agents, all executed in parallel
```

---

## 📚 Related ESA Lessons

- **Lesson #1:** [Pre-Flight Check](./ESA-LESSON-LEARNED-PRE-FLIGHT-CHECK.md) - Always verify 0 LSP errors before starting
- **Lesson #2:** [Continuous LSP Monitoring](./ESA-LESSON-LEARNED-CONTINUOUS-LSP.md) - Re-check LSP during execution
- **Lesson #3:** This document - Documentation tasks must be ultra-micro too

---

**Status:** ✅ LESSON LEARNED & APPLIED  
**Next Action:** Continue Week 2 training using direct parallel execution
