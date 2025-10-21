# Documentation Verification Checklist
## Mandatory Pre-Work Protocol for All Agents

**Authority:** MB.MD QA Protocol Rule 1  
**Status:** 🔴 REQUIRED before ANY build work  
**Purpose:** Prevent the "build without requirements" failure pattern

---

## 📋 THE CHECKLIST

Every agent MUST complete this checklist BEFORE starting build work:

### Step 1: Read Core Protocol
- [ ] Read `docs/MB_MD_QA_PROTOCOL.md` (all 1009 lines)
- [ ] Understand the 5 Non-Negotiable Rules
- [ ] Review the Mr Blue failure case study

### Step 2: Identify Your Phase
- [ ] Read `docs/MB_MD_DOCUMENTATION_PHASE_MAP.md`
- [ ] Determine which phase you're in (Mapping/Breakdown/Mitigation/Deployment)
- [ ] Identify which docs are relevant to your phase

### Step 3: Read Feature-Specific Documentation
- [ ] Search for feature name in docs/ folder (use grep tool)
- [ ] Read ALL related documentation files
- [ ] List every doc file you read (evidence required)

### Step 4: Read Agent-Specific Documentation
- [ ] Check if your agent has a dedicated guide (e.g., `docs/agents/PAGE_AGENTS_COMPREHENSIVE_GUIDE.md`)
- [ ] Read testing protocols (e.g., `docs/MrBlue/visual-editor-testing.md`)
- [ ] Review audit reports (e.g., `docs/audits/MR_BLUE_VISUAL_EDITOR_AGENT_78_AUDIT.md`)

### Step 5: Read Previous Session Learnings
- [ ] Read `docs/AGENT_SESSION_LOG.md`
- [ ] Check for lessons learned from similar features
- [ ] Note any known pitfalls or blockers

### Step 6: Summarize Requirements
Before writing ANY code, you must write a summary showing:
- **What the feature should do** (from user's perspective)
- **What already exists** (from codebase verification)
- **What's missing** (gap analysis)
- **Technical requirements** (from documentation)

---

## ⚠️ ENFORCEMENT MECHANISM

### For write_task_list Tool Usage:

**CRITICAL:** Before calling `write_task_list`, agents MUST write documentation evidence in their response text.

**The Process:**
1. Search for relevant docs with grep
2. Read ALL relevant documentation files
3. Write evidence section showing what you read and understood
4. THEN call write_task_list

**Example Response (Before calling write_task_list):**
```markdown
I found the visual editor documentation. Let me verify requirements first:

## Documentation Read:
✅ docs/MrBlue/visual-editor-testing.md (342 lines)
   - Line 38: "Element selection works (purple bounding box)"
   - Line 30: "Click on 'Profile' heading element" (direct click)
   - Line 39: "Inline editing updates DOM immediately"

✅ docs/MB-MD-VISUAL-EDITOR-COMPLETE.md (313 lines)
   - Technical architecture for split-pane layout
   - iframe injection mechanism (lines 181-190)

✅ docs/audits/MR_BLUE_VISUAL_EDITOR_AGENT_78_AUDIT.md (30 lines)
   - Current completion status: 10% end-to-end
   - Missing: UI implementation, component library

## Requirements Summary:
- Direct click (NO Cmd/Ctrl modifier keys)
- Purple bounding box (not blue)
- Double-click for inline text editing
- Delete key removes elements
- Inspector shows element data

## What Already Exists:
- iframeOverlay.ts exists but uses Cmd/Ctrl check (line 129)
- ElementInspector.tsx shows data (lines 27-106) ✅ Working
- TabSystem has Styles tab (needs removal per user)

## What's Missing:
1. Remove Cmd/Ctrl requirement from click handler
2. Change blue highlight to purple
3. Add double-click inline editing
4. Add Delete key handler
5. Remove Styles tab

Now I'll create the task list:
[Calls write_task_list tool with specific tasks]
```

### Architect Review Must Verify:

When reviewing work, the architect must ask:
1. "Which documentation files did you read before building?"
2. "Show me evidence you understood the requirements"
3. "Did you verify what already exists?"

If agent cannot provide evidence → **REJECT and require doc verification first**

---

## 🚫 ANTI-PATTERNS (What NOT to Do)

### ❌ Pattern 1: Build Without Reading
```
User: "Add visual editor element selection"
Agent: [Immediately starts writing code]
```

**Why it fails:** Agent doesn't know requirements, builds wrong thing

### ❌ Pattern 2: Skim Instead of Read
```
Agent: "I read the docs" (actually only read first 50 lines)
```

**Why it fails:** Misses critical requirements buried in documentation

### ❌ Pattern 3: Assume Based on Name
```
Agent: "Visual editor probably means drag-and-drop"
[Builds drag-and-drop when docs say click-to-select]
```

**Why it fails:** Assumptions override actual requirements

---

## ✅ CORRECT PATTERN (What TO Do)

```
User: "Add visual editor element selection"

Agent:
1. Searches for "visual editor" in docs/
2. Finds 3 relevant files:
   - visual-editor-testing.md
   - MB-MD-VISUAL-EDITOR-COMPLETE.md  
   - MR_BLUE_VISUAL_EDITOR_AGENT_78_AUDIT.md
3. Reads all 3 files completely
4. Summarizes requirements with line references
5. Checks existing code with grep/read tools
6. Lists what's already built vs what's missing
7. ONLY THEN creates task list with evidence

Result: Builds exactly what's needed, no wasted work
```

---

## 📊 SUCCESS METRICS

### Before (Mr Blue Failure):
- 0 documentation files read before building
- 97.2% of work wasted
- 14 components built, 0 integrated
- No evidence of requirements understanding

### After (With This Protocol):
- ALL relevant docs read before building
- 0% wasted work
- Every component integrated immediately
- Clear evidence of requirements understanding

---

## 🔗 RELATED DOCUMENTATION

- **Main Protocol:** `docs/MB_MD_QA_PROTOCOL.md`
- **Phase Routing:** `docs/MB_MD_DOCUMENTATION_PHASE_MAP.md`
- **Agent Session Log:** `docs/AGENT_SESSION_LOG.md`
- **Testing Protocols:** `docs/MrBlue/visual-editor-testing.md`

---

## 💡 QUICK REFERENCE

**Before starting ANY build task, ask yourself:**

1. ✅ Have I read ALL relevant documentation?
2. ✅ Can I list specific line numbers from the docs showing requirements?
3. ✅ Have I checked what already exists in the codebase?
4. ✅ Have I summarized what's missing?
5. ✅ Can I provide evidence of requirements understanding?

If you answered "NO" to any question → **STOP and read documentation first**

---

**Last Updated:** October 21, 2025  
**Authority:** Platform CEO + MB.MD Protocol v1.0  
**Status:** 🔴 MANDATORY - No exceptions
