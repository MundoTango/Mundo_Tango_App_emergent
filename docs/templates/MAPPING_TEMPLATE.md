# MB.MD Phase 1: MAPPING Template

**Feature/Task:** [Name of feature or task]  
**Agent:** [Your agent ID/name]  
**Date:** [Today's date]  
**Execution Mode:** [ ] FOCUSED [ ] PARALLEL [ ] SIMULTANEOUS

---

## 1. DOCUMENTATION VERIFICATION

**Files to Read:**
- [ ] `[path/to/relevant/doc1.md]` - [Why this is relevant]
- [ ] `[path/to/relevant/doc2.md]` - [Why this is relevant]
- [ ] `[path/to/code/file.tsx]` - [Existing implementation]

**Documentation Summary:**
[Summarize key requirements, constraints, or patterns learned from docs]

**Integration Protocol Read:**
- [ ] Read `docs/INTEGRATION_PROTOCOL.md` - Wire-up checklist
- [ ] Read `docs/TESTING_REQUIREMENTS_MANDATORY.md` - Testing checkpoints

---

## 2. DATA INSPECTION

**Runtime Data Structures:**
```typescript
// Add diagnostic logging to inspect actual data
console.log('[DATA_INSPECTION] Current structure:', JSON.stringify(data, null, 2));
console.log('[DATA_INSPECTION] Props received:', props);
console.log('[DATA_INSPECTION] State shape:', state);
```

**Findings:**
- Actual data structure: [Describe what you found]
- Differs from assumptions: [Any surprises?]
- External dependencies: [APIs, databases, etc.]

---

## 3. INTEGRATION POINTS IDENTIFICATION

**Parent Components:**
- Component: `[ParentComponent.tsx]`
- Location: `[Import path]`
- Integration method: [ ] Props [ ] Context [ ] Store [ ] API

**Child Components:**
- Component: `[ChildComponent.tsx]`
- Usage: [How will you use it?]

**API Endpoints:**
- Endpoint: `[POST /api/endpoint]`
- Purpose: [What it does]

**Database Tables:**
- Table: `[table_name]`
- Columns: [List relevant columns]

---

## 4. USER JOURNEY MAPPING

**Entry Point:**
[Where does user start? e.g., "Click Mr Blue button"]

**Journey Steps:**
1. User action: [Click/type/select something]
2. System response: [What happens]
3. User sees: [What appears in UI]
4. Completion: [How user knows it worked]

**Success Criteria:**
- [ ] User can find feature (navigation clear)
- [ ] User can interact (buttons clickable)
- [ ] User sees result (feedback visible)
- [ ] User understands outcome (messaging clear)

---

## 5. EXECUTION MODE DECLARATION

**Mode Selected:** [FOCUSED / PARALLEL / SIMULTANEOUS]

**Reasoning:**
[Explain why you chose this mode]

**Mode Definitions:**
- **FOCUSED:** Single task, deep analysis, sequential execution
- **PARALLEL:** Multiple independent tasks, can work simultaneously
- **SIMULTANEOUS:** Comprehensive multi-component build, all-at-once

---

## 6. EXISTING COMPONENTS CHECK

**Components that already exist:**
- [ ] `[Component.tsx]` - [What it does]
- [ ] `[AnotherComponent.tsx]` - [Can we reuse this?]

**Patterns to follow:**
- Styling pattern: [MT Ocean theme, glassmorphic, etc.]
- State management: [React Query, Context, hooks]
- Error handling: [Toast, modal, inline]

---

## 7. SCREENSHOT REQUIREMENTS

**Screenshots needed:**
1. [ ] **Feature access** - Where user finds it
2. [ ] **Feature in action** - Mid-interaction
3. [ ] **Feature result** - What user sees after
4. [ ] **Error state** - Graceful failure handling

**Naming convention:** `feature-name-[access|action|result|error].png`

---

## 8. RISK ASSESSMENT

**Complexity Level:** [ ] Simple [ ] Medium [ ] Complex

**Requires Architect Review:** [ ] Yes [ ] No

**Reasoning:**
[Based on: >50 lines changed, new feature, database change, security change, super-admin tool]

---

## 9. MAPPING PHASE CHECKLIST

Before proceeding to BREAKDOWN, verify:
- [ ] All relevant documentation read and summarized
- [ ] Runtime data structures inspected with logs
- [ ] Integration points identified (parent/child/API/DB)
- [ ] User journey mapped from entry to completion
- [ ] Execution mode declared with reasoning
- [ ] Existing components checked for reuse
- [ ] Screenshot requirements defined
- [ ] Risk assessment completed
- [ ] Architect review requirement determined

---

## 10. EVIDENCE UPLOAD

**Evidence collected:**
```bash
# Upload mapping evidence
curl -X POST http://localhost:5000/api/mbmd/evidence/upload \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": YOUR_SESSION_ID,
    "phase": "MAPPING",
    "evidenceType": "document",
    "metadata": {
      "docsRead": ["file1.md", "file2.tsx"],
      "executionMode": "FOCUSED",
      "integrationPoints": ["ParentComponent.tsx"]
    }
  }'
```

---

**MAPPING PHASE COMPLETE:** ✅  
**Next Phase:** BREAKDOWN (Task Planning)  
**Ready to proceed:** [ ] Yes [ ] No (explain why)
