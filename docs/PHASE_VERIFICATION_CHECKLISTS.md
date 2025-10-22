# Phase Verification Checklists - Quick Reference
**Version:** 1.0  
**Created:** October 22, 2025  
**Purpose:** One-page checklists for each MB.MD phase  
**Status:** 🔴 COPY-PASTE READY

---

## 📋 **PHASE 1: MAPPING CHECKLIST**
**Owner:** Documentation Agent + Architect  
**When:** Before writing ANY code

```markdown
## Phase 1: MAPPING (Documentation Agent)

### Step 1: Read Documentation
- [ ] Read MB_MD_QA_PROTOCOL.md
- [ ] Read DOCUMENTATION_VERIFICATION.md
- [ ] Search for feature-specific docs: `grep -r "feature-name" docs/`
- [ ] Read ALL files found (list them)

### Step 2: Map User Journey
- [ ] Write user path (clicks/actions): "User clicks X → sees Y → gets Z"
- [ ] Identify entry point: Where does user START?
- [ ] Identify success state: What does user SEE when done?
- [ ] Note browser APIs needed: Mic? WebSocket? Geolocation?

### Step 3: Identify Integration Points
- [ ] Where does feature hook into app? (which parent component?)
- [ ] Does it need context provider? Check App.tsx provider tree
- [ ] Does it need new routes? Check server/routes.ts
- [ ] Does it need database tables? Check shared/schema.ts

### Step 4: Verify What Exists
- [ ] Search for similar components: `grep -r "ComponentName"`
- [ ] Check if feature already partially built
- [ ] List what works vs what's missing
- [ ] Check for duplicate implementations

### Step 5: Write Evidence Summary
```
## Documentation Read:
- ✅ [File 1] ([X] lines) - [Key finding]
- ✅ [File 2] ([X] lines) - [Key finding]

## User Journey:
1. User [action] → [result]
2. User [action] → [result]

## Integration Points:
- Component wires to: [Parent]
- Context needed: [Yes/No]
- Routes needed: [Yes/No]

## What Exists:
- ✅ [Working component 1]
- ❌ [Missing component 2]
```

### Step 6: Architect Sign-Off
- [ ] Architect reviews evidence summary
- [ ] Architect approves before Phase 2

**Phase 1 Complete: Ready for task breakdown** ✅
```

---

## 🏗️ **PHASE 2: BREAKDOWN CHECKLIST**
**Owner:** Architect  
**When:** During task planning

```markdown
## Phase 2: BREAKDOWN (Architect)

### Step 1: Create Task List
- [ ] Break work into specific tasks
- [ ] Mark dependencies: Task 2 depends on Task 1
- [ ] Identify parallel tasks: Tasks can run simultaneously
- [ ] Add integration test task AFTER parallel work

### Step 2: Define Integration Testing
- [ ] Add task: "Test user journey end-to-end"
- [ ] Add task: "Screenshot each step"
- [ ] Add task: "Verify browser console clean"
- [ ] Add task: "Check Network tab for API success"

### Step 3: Document Entry Points (if feature has multiple paths)
```
## Entry Points:
1. **Primary:** [Path 1] (full features)
2. **Secondary:** [Path 2] (subset of features)

Why multiple paths: [Explanation]
```

### Step 4: Plan Tab Content (if adding tabs)
- [ ] List all tabs in navigation
- [ ] Verify content component exists for each
- [ ] Plan screenshot for each tab
- [ ] Check TabsContent renders each component

### Step 5: Define Screenshot Requirements
```
## Screenshots Required:
1. Feature access (where user finds it)
2. Feature in action (user mid-interaction)
3. Feature result (what user sees)
4. Error state (graceful failure)
```

### Step 6: Assign Validation Owner
- [ ] Phase 3 work: Implementation Agent
- [ ] Phase 3 review: Architect
- [ ] Phase 4 validation: QA Agent (MANDATORY)

**Phase 2 Complete: Ready to build** ✅
```

---

## 🔧 **PHASE 3: MITIGATION CHECKLIST**
**Owner:** Implementation Agent  
**When:** While building feature

```markdown
## Phase 3: MITIGATION (Implementation Agent)

### Step 1: Build Component
- [ ] Create component file
- [ ] Add all props with types
- [ ] Implement all hooks
- [ ] Apply styles

### Step 2: INTEGRATE IMMEDIATELY (CRITICAL)
- [ ] Import component in parent file
- [ ] Add component to parent's JSX (not just import!)
- [ ] Pass all required props
- [ ] Wire up event handlers

### Step 3: Verify Import Chain
```bash
# Component exists
ls client/src/components/path/to/Component.tsx

# Imported by parent
grep "import.*Component" client/src/parent/Parent.tsx

# RENDERED in parent JSX
grep "<Component" client/src/parent/Parent.tsx

# If not in JSX → ADD IT NOW
```

### Step 4: Add Context Provider (if needed)
- [ ] Create provider component
- [ ] Add to App.tsx provider tree
- [ ] Verify provider wraps children
- [ ] Test hook returns non-null
- [ ] Add debug log to verify context available

### Step 5: Handle Browser APIs (if applicable)
```typescript
// Microphone/Camera/Geolocation
try {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  // Use stream
} catch (err) {
  if (err.name === 'NotAllowedError') {
    toast.error('Permission denied');
  }
}
```

### Step 6: Test API Endpoints (if applicable)
- [ ] Register route in backend
- [ ] Implement handler
- [ ] Test with real request from frontend
- [ ] Check Network tab shows 200 status
- [ ] Handle error cases (400, 401, 500)

### Step 7: Document Wrapper Components
```typescript
/**
 * [ComponentName] - [Purpose]
 * 
 * WRAPPER COMPONENT: This is a thin wrapper
 * ACTUAL COMPONENT: [ActualComponent] from [Path]
 * 
 * PURPOSE: [Why wrapper exists]
 */
```

### Step 8: Avoid Modal Traps
- [ ] No modal inside another modal
- [ ] Test Escape key closes correct modal
- [ ] Test backdrop click works
- [ ] Test focus trap works

### Step 9: Architect Review
- [ ] Architect reviews implementation
- [ ] Architect checks integration complete
- [ ] Architect approves before Phase 4

**Phase 3 Complete: Ready for QA validation** ✅
```

---

## ✅ **PHASE 4: DEPLOYMENT CHECKLIST**
**Owner:** QA Agent (MANDATORY)  
**When:** Before marking task complete

```markdown
## Phase 4: DEPLOYMENT (QA Agent - FINAL GATE)

### Step 1: Screenshot Evidence (NO APPROVAL WITHOUT THIS)
- [ ] Screenshot: Feature access (where user finds it)
- [ ] Screenshot: Feature in action (mid-interaction)
- [ ] Screenshot: Feature result (outcome visible)
- [ ] Screenshot: Error state (graceful failure)
- [ ] Screenshot: Mobile view (375px width)

### Step 2: User Journey Testing
```
## Test Script:
1. Action: [Click/Type X]
   Expected: [Y happens]
   Actual: [What happened]
   Screenshot: [Path]
   
2. Action: [Next step]
   Expected: [Expected result]
   Actual: [Actual result]
   Screenshot: [Path]
```

### Step 3: Browser Console Check
- [ ] Open DevTools Console
- [ ] No red errors visible
- [ ] Expected debug logs appear
- [ ] Screenshot console if errors present

### Step 4: Network Tab Check (for API features)
- [ ] Open DevTools Network tab
- [ ] Trigger feature action
- [ ] Verify API calls succeed (200/201)
- [ ] Verify WebSocket connects (if applicable)
- [ ] Screenshot Network tab

### Step 5: Integration Verification
```bash
# Component imported?
grep "import.*Component" parent.tsx

# Component in JSX?
grep "<Component" parent.tsx

# If not in JSX → REJECT
```

### Step 6: Accessibility Check
- [ ] Keyboard navigation works (Tab, Enter, Esc)
- [ ] Focus indicators visible
- [ ] Modal focus trap works
- [ ] Screen reader compatible

### Step 7: Mobile Responsive (for UI features)
- [ ] Test at 375px width
- [ ] Layout doesn't break
- [ ] Buttons tappable
- [ ] Text readable

### Step 8: Render Decision Matrix
Use this table to decide APPROVE or REJECT:

| Check | Status | Action |
|-------|--------|--------|
| Screenshots provided | ❌ | REJECT |
| User can access feature | ❌ | REJECT |
| Browser console has errors | ✅ | REJECT |
| Feature doesn't work | ✅ | REJECT |
| Component not in JSX | ✅ | REJECT |
| All checks pass | ✅ | APPROVE |

### Step 9: Issue APPROVAL or REJECTION

**APPROVAL Template:**
```markdown
## ✅ QA Approved: [Feature Name]

Tested User Journey:
1. [Action] → [Result] ✅ (Screenshot)

Browser Console: No errors ✅
Network Tab: All requests successful ✅
Evidence: [Screenshot paths]

Status: COMPLETE - Ready for deployment
```

**REJECTION Template:**
```markdown
## ❌ QA Rejected: [Feature Name]

Issues Found:
- Issue 1: [Description + Screenshot]

Required Actions:
1. [Fix 1]
2. Provide screenshots
3. Resubmit for QA review

Status: BLOCKED - Return to implementation
```

**Phase 4 Complete: Feature approved for deployment** ✅
```

---

## 🎯 **QUICK DECISION TREE**

```
Starting task?
  ├─> Read Phase 1 checklist
  ├─> Complete Phase 1
  └─> Get Architect approval
      └─> Proceed to Phase 2

Planning task?
  ├─> Read Phase 2 checklist
  ├─> Create task list with integration tests
  └─> Define screenshot requirements
      └─> Proceed to Phase 3

Building feature?
  ├─> Read Phase 3 checklist
  ├─> Build + Integrate IMMEDIATELY
  └─> Get Architect review
      └─> Proceed to Phase 4

Ready to complete?
  ├─> Read Phase 4 checklist
  ├─> QA Agent validates
  └─> APPROVE or REJECT
      └─> If APPROVED: Task complete ✅
      └─> If REJECTED: Return to Phase 3
```

---

## 📊 **COMPLETION CRITERIA BY PHASE**

| Phase | Complete When... |
|-------|------------------|
| **Phase 1** | Architect approves evidence summary |
| **Phase 2** | Task list includes integration tests + screenshots |
| **Phase 3** | Architect confirms component integrated |
| **Phase 4** | QA Agent issues APPROVAL with screenshots |

---

## 🔗 **CROSS-REFERENCES**

- `MB_MD_QA_PROTOCOL.md` - Full protocol details
- `AGENT_LEARNINGS.md` - Detailed learnings by phase
- `QA_AGENT_PROTOCOL.md` - QA validation authority
- `DOCUMENTATION_VERIFICATION.md` - Phase 1 detailed guide
- `INTEGRATION_PROTOCOL.md` - Phase 3 integration details

---

**Remember:** Copy these checklists into your working notes. Check off items as you go. No phase is complete until ALL items checked.
