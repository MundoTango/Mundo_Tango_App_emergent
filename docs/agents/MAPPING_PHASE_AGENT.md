# MAPPING Phase Agent - MB.MD Protocol Documentation

**Agent ID:** #132  
**Phase:** MAPPING (MB.MD Phase 1)  
**Purpose:** Enforce documentation verification BEFORE any code generation  
**File:** `server/services/agents/MappingPhaseAgent.ts`  
**Created:** October 28, 2025

---

## Overview

The MAPPING Phase Agent prevents agents from building the wrong features by forcing comprehensive documentation analysis before planning begins. It is the **FIRST MANDATORY GATE** in the MB.MD workflow.

### Problem Solved

**BEFORE:** Agents started coding immediately without reading documentation → built wrong features

**AFTER:** MAPPING phase enforces documentation verification → correct requirements understood

---

## Mandatory Checklist

Every MB.MD session MUST complete these steps:

1. ✅ **Read replit.md** (1,648 lines - project overview, user preferences)
2. ✅ **Read MB.MD protocols** (if applicable to task)
3. ✅ **Read agent documentation** (if request mentions agents)
4. ✅ **Read integration protocol** (if request mentions components)
5. ✅ **Inspect existing codebase** (find related components using grep/search)
6. ✅ **Analyze requirements** (AI-powered via Claude Sonnet 4)

---

## Output Structure

```typescript
interface MappingPhaseResult {
  documentationRead: string[];           // Files actually read
  requirementsSummary: string;           // What user wants
  existingComponents: string[];          // What already exists
  integrationPoints: string[];           // Where to hook in
  dataStructures: Record<string, any>;   // Runtime inspection
  executionMode: 'FOCUSED' | 'PARALLEL' | 'SIMULTANEOUS';
  userJourney: string[];                 // Step-by-step flow
  toolsRequired: string[];               // Agents/services needed
  estimatedComplexity: 'simple' | 'moderate' | 'complex';
  requiresArchitectReview: boolean;      // True for UI/data changes
}
```

---

## Execution Mode Declaration

The agent FORCES execution mode declaration:

- **FOCUSED:** Serial execution (tasks have dependencies, must complete sequentially)
- **PARALLEL:** 2-3 independent streams working simultaneously
- **SIMULTANEOUS:** All agents working at once (comprehensive build, maximum parallelism)

This prevents ambiguity about how work should be executed.

---

## Integration with VibeGraph

The MappingPhaseAgent is injected at the START of VibeGraph execution:

```typescript
// server/services/agents/VibeGraph.ts
private async mappingNode(): Promise<void> {
  this.state.status = 'mapping';
  
  // Use MappingPhaseAgent for comprehensive analysis
  const mappingAgent = new MappingPhaseAgent();
  const mappingResult = await mappingAgent.performMapping(
    this.state.userRequest,
    this.sessionManager
  );

  // Update state with mapping results
  this.state.documentationRead = mappingResult.documentationRead;
  this.state.executionMode = mappingResult.executionMode;
  
  this.state.mappingComplete = true;
}
```

---

## Example MAPPING Output

**User Request:** "Add a 🎉 emoji next to the Welcome heading"

**Mapping Output:**
```json
{
  "documentationRead": [
    "replit.md",
    "docs/MB_MD_QA_PROTOCOL.md",
    "docs/INTEGRATION_PROTOCOL.md"
  ],
  "requirementsSummary": "Add celebration emoji to welcome heading",
  "existingComponents": [
    "client/src/pages/HomePage.tsx"
  ],
  "integrationPoints": [
    "HomePage heading element (line 42)"
  ],
  "dataStructures": {},
  "executionMode": "FOCUSED",
  "userJourney": [
    "User loads homepage",
    "User sees Welcome heading with 🎉 emoji",
    "User feels welcomed and celebrated"
  ],
  "toolsRequired": [
    "EditorAgent (modify HomePage.tsx)"
  ],
  "estimatedComplexity": "simple",
  "requiresArchitectReview": true
}
```

---

## AI Analysis Prompt

The agent uses Claude Sonnet 4 with this prompt structure:

```
You are analyzing a user request to ensure requirements are understood BEFORE coding.

USER REQUEST: {userRequest}

DOCUMENTATION READ:
- replit.md (1,648 lines)
- MB_MD_QA_PROTOCOL.md
- INTEGRATION_PROTOCOL.md

Provide analysis:
1. What does the user ACTUALLY want?
2. What already exists in codebase?
3. Where should changes integrate?
4. What execution mode? (FOCUSED/PARALLEL/SIMULTANEOUS)
5. Does this need architect review?
```

---

## Success Criteria

MAPPING phase is complete when:

1. ✅ All relevant documentation read
2. ✅ Requirements clearly summarized
3. ✅ Existing components identified
4. ✅ Integration points mapped
5. ✅ Execution mode declared
6. ✅ Complexity estimated
7. ✅ Architect review flag set

---

## Common Pitfalls

**Pitfall #1:** Skipping documentation verification
- **Fix:** Enforce checklist completion, reject if docs not read

**Pitfall #2:** Vague requirements summary
- **Fix:** Use AI analysis to clarify user intent

**Pitfall #3:** Missing existing components
- **Fix:** Use grep/search to find all related code

**Pitfall #4:** Wrong execution mode
- **Fix:** Analyze dependencies, choose correct parallelism level

---

## Evidence Collection

MAPPING phase must record evidence:

```typescript
await sessionManager.recordEvidence(
  sessionId,
  'MAPPING',
  'documentation_verification',
  null,
  {
    documentationRead: mappingResult.documentationRead,
    executionMode: mappingResult.executionMode,
    requiresArchitectReview: mappingResult.requiresArchitectReview
  }
);
```

---

## Next Phase

After MAPPING completes, flow continues to:

**BREAKDOWN** → Planning and task decomposition using ManagerAgent

---

**Last Updated:** October 28, 2025  
**Status:** Production-ready  
**Integration:** Active in VibeGraph.ts
