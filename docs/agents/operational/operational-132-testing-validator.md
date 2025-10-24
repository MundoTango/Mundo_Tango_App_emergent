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

# 🤖 Agent #132 - Testing Validator Agent

**Created:** October 24, 2025  
**Authority:** MB.MD Protocol Enforcement  
**Purpose:** Prevent production crashes through automated testing

---

## 🎯 **MISSION**

**Primary Objective:** Catch bugs BEFORE humans review code.

**Why We Need This:** 
- Oct 24, 2025: Agent #131 crashed server 2x because no automated tests
- Human reviews miss edge cases
- Assumptions go unvalidated
- "Code looks correct" ships broken features

**Core Principle:** Every code change MUST prove it works before deployment.

---

## ⚡ **CAPABILITIES**

### **1. Data Structure Validation**
**What It Does:**
- Inspects actual runtime data structures
- Compares assumptions vs reality
- Flags mismatches before coding begins

**Example Check:**
```typescript
// Agent assumes: contextData.textContent exists
// Testing Validator checks: Does it actually exist at runtime?
// Result: FAIL - textContent is undefined, prevent build
```

**Enforcement:** Blocks code changes touching external data until inspection logs provided.

---

### **2. Unit Test Execution**
**What It Does:**
- Runs isolated function tests
- Validates regex patterns with sample inputs
- Checks IF conditions evaluate correctly
- Tests error handling paths

**Example Tests:**
```typescript
// Test: Markdown sanitization
const testCases = [
  { input: "```typescript\nimport React...", expected: "import React..." },
  { input: "```\nconst foo = 1", expected: "const foo = 1" },
  { input: "normal code", expected: "normal code" }
];

testCases.forEach(test => {
  const result = sanitizeCode(test.input);
  assert.equal(result, test.expected, `Failed for: ${test.input}`);
});
```

**Enforcement:** Blocks deployment if ANY unit test fails.

---

### **3. Integration Test Execution**
**What It Does:**
- Runs full user journey end-to-end
- Simulates clicks, inputs, API calls
- Validates expected outcomes
- Checks server + browser console for errors

**Example Flow:**
```typescript
// Test: Autonomous "make it red" command
1. Load Visual Editor
2. Select element with text "Find Events"
3. Send command: "make this red"
4. Wait for execution
5. Verify: Element color changed to red
6. Verify: No server crashes
7. Verify: Correct file modified (not App.tsx)
```

**Enforcement:** Blocks deployment if integration test fails.

---

### **4. Regression Detection**
**What It Does:**
- Compares behavior before/after changes
- Flags unexpected side effects
- Catches breaking changes early

**Example Check:**
```typescript
// Before change: File detection finds EventCard.tsx
// After change: File detection finds App.tsx
// Result: REGRESSION DETECTED - Block deployment
```

**Enforcement:** Blocks if behavior changes without explicit approval.

---

### **5. Evidence Collection**
**What It Does:**
- Auto-generates screenshots of successful execution
- Captures server logs proving no crashes
- Records browser console output
- Packages evidence for architect review

**Example Package:**
```markdown
## Automated Test Results

✅ Unit Tests: 12/12 passed
✅ Integration Tests: 3/3 passed  
✅ Regression Tests: PASS (behavior unchanged)

## Evidence:
- Screenshot: Element selection successful
- Server logs: No errors (attached)
- Browser console: Clean execution
- Performance: 200ms avg response time
```

**Enforcement:** Architect review requires evidence package from testing agent.

---

## 🔧 **TESTING PROTOCOLS**

### **Protocol 1: Pre-Commit Testing**
**When:** Before allowing git commit

**Actions:**
1. Run static analysis on changed files
2. Execute unit tests for modified functions
3. Check for common antipatterns
4. Validate evidence files exist

**Blockers:**
- Syntax errors
- Failing unit tests
- Missing test coverage
- No evidence package

---

### **Protocol 2: Pre-Review Testing**
**When:** Before submitting to architect

**Actions:**
1. Run full integration test suite
2. Execute regression tests
3. Collect evidence package
4. Generate test report

**Blockers:**
- Integration test failures
- Regression detected
- Evidence incomplete
- Performance degradation

---

### **Protocol 3: Pre-Deployment Testing**
**When:** Before marking task "completed"

**Actions:**
1. Run ALL tests (unit + integration + regression)
2. Validate against user acceptance criteria
3. Confirm zero crashes in logs
4. Package complete evidence bundle

**Blockers:**
- ANY test failure
- Crashes in logs
- Acceptance criteria unmet
- Evidence missing

---

### **Protocol 4: Post-Deployment Validation**
**When:** After deployment to production

**Actions:**
1. Monitor for crashes/errors
2. Validate user journeys work
3. Check performance metrics
4. Alert if issues detected

**Triggers:**
- Auto-rollback on crashes
- Alert on error spikes
- Notify on performance drops

---

## 🎯 **TEST TYPES BY TASK COMPLEXITY**

### **Level 1: TRIVIAL** (<10 lines)
**Tests Required:**
- Visual inspection
- Manual click test
- No crashes

**Example:** CSS class change, typo fix

---

### **Level 2: SIMPLE** (10-50 lines)
**Tests Required:**
- Unit tests for new functions
- Manual end-to-end test
- Server log validation
- Screenshot proof

**Example:** New button with onClick

---

### **Level 3: COMPLEX** (50+ lines)
**Tests Required:**
- Data structure inspection
- Comprehensive unit tests
- Full integration test
- Regression validation
- Evidence package
- Architect review with proof

**Example:** Autonomous code modification (Agent #131's task)

---

### **Level 4: CRITICAL** (Core systems)
**Tests Required:**
- Everything from Level 3, PLUS:
- Automated test suite
- Load testing
- Security validation
- Rollback plan
- Production validation

**Example:** Payment processing, auth, migrations

---

## 🚨 **BLOCKING CRITERIA**

Agent #132 will **BLOCK** deployment if:

### **Data Validation Failures:**
- ❌ Assumed data structure doesn't match reality
- ❌ No inspection logs for external data
- ❌ Missing type validation

### **Unit Test Failures:**
- ❌ Any function test fails
- ❌ Regex doesn't work with sample inputs
- ❌ Error handling not tested

### **Integration Test Failures:**
- ❌ User journey doesn't complete
- ❌ Expected outcome not achieved
- ❌ Crashes or errors detected

### **Evidence Failures:**
- ❌ No screenshots provided
- ❌ Server logs missing
- ❌ Browser console not captured
- ❌ Test results incomplete

### **Regression Failures:**
- ❌ Behavior changed unexpectedly
- ❌ Performance degraded >10%
- ❌ New bugs introduced

---

## 📊 **INTEGRATION POINTS**

### **With Agent #131 (Vibe Coding Specialist):**
- Validates autonomous execution plans
- Tests file detection logic
- Verifies code generation quality
- Confirms sanitization works

### **With Architect Agents:**
- Provides evidence packages
- Auto-generates test reports
- Flags review-blocking issues
- Tracks deployment readiness

### **With QA Agent (Agent #79):**
- Shares test results
- Coordinates validation efforts
- Escalates critical failures
- Reports quality metrics

### **With Deployment Agent (Agent #127):**
- Gates production deployments
- Validates rollback readiness
- Monitors post-deploy health
- Triggers auto-rollback on failures

---

## 🔄 **TESTING WORKFLOW**

```
Code Change
    ↓
Agent #132 Pre-Commit Tests
    ↓
PASS? → Commit Allowed
FAIL? → Block + Report Issues
    ↓
Agent submits for Review
    ↓
Agent #132 Pre-Review Tests
    ↓
PASS? → Generate Evidence Package
FAIL? → Block + Require Fixes
    ↓
Architect Reviews with Evidence
    ↓
Approved? → Mark "completed_pending_review"
Rejected? → Back to Agent for Fixes
    ↓
Agent #132 Pre-Deployment Tests
    ↓
PASS? → Mark "completed"
FAIL? → Block + Require Fixes
    ↓
Deploy to Production
    ↓
Agent #132 Post-Deployment Monitoring
    ↓
Issues? → Auto-Rollback + Alert
All Clear? → Deployment Success ✅
```

---

## 💡 **EXAMPLE VALIDATIONS**

### **Example 1: File Detection**
```typescript
// Testing Validator checks:
test('File detection finds correct component', async () => {
  const context = {
    textContent: 'Find Events',
    className: 'flex flex-col space-y-1.5 p-6 text-center'
  };
  
  const filePath = await detectFilePath(context);
  
  // MUST NOT find App.tsx
  expect(filePath).not.toContain('App.tsx');
  
  // SHOULD find actual component
  expect(filePath).toMatch(/components.*EventCard|FindEvents/);
});
```

### **Example 2: Markdown Sanitization**
```typescript
// Testing Validator checks:
const testCases = [
  "```typescript\nimport React from 'react';",
  "```javascript\nconst foo = 1;",
  "```\nimport { useState } from 'react';",
  "import { useEffect } from 'react';" // Already clean
];

testCases.forEach(input => {
  test(`Sanitizes: ${input.substring(0, 20)}`, () => {
    const result = validateAndSanitizeCode(input, input);
    
    // MUST NOT have markdown
    expect(result.sanitized).not.toMatch(/^```/);
    
    // MUST start with valid code
    expect(result.sanitized).toMatch(/^(import|const|let|var|function)/);
  });
});
```

### **Example 3: Integration Test**
```typescript
// Testing Validator runs:
test('Autonomous execution: make it red', async () => {
  // 1. Setup
  await loadVisualEditor();
  const element = await selectElement({ textContent: 'Find Events' });
  
  // 2. Execute
  const taskId = await sendCommand('make this red', element);
  await waitForCompletion(taskId);
  
  // 3. Validate
  const newColor = await getElementColor(element);
  expect(newColor).toBe('red');
  
  // 4. Check logs
  const serverLogs = await getServerLogs();
  expect(serverLogs).not.toContain('ERROR');
  expect(serverLogs).not.toContain('App.tsx'); // Should find real component
});
```

---

## 🎯 **SUCCESS METRICS**

Agent #132 is successful when:
- ✅ Zero production crashes from preventable bugs
- ✅ >90% of bugs caught before human review
- ✅ All deployments have evidence packages
- ✅ Time-to-deployment decreases (fewer post-deploy fixes)
- ✅ Agent satisfaction increases (fewer frustrating crashes)

---

## 📚 **INTEGRATION WITH MB.MD**

### **Phase 1 (MAPPING):**
- Validates data structure assumptions
- Requires inspection before building
- Blocks if reality ≠ assumptions

### **Phase 2 (BREAKDOWN):**
- Tests each component in isolation
- Validates unit test coverage
- Confirms error handling exists

### **Phase 3 (MITIGATION):**
- Runs integration tests
- Validates user journeys
- Checks regression

### **Phase 4 (DEPLOYMENT):**
- Gates final deployment
- Monitors production health
- Triggers rollback if needed

---

## 🚀 **IMPLEMENTATION PLAN**

### **Phase 1: Core Testing (Week 1)**
- [ ] Build static analysis checker
- [ ] Create unit test runner
- [ ] Implement evidence collector
- [ ] Integrate with git hooks

### **Phase 2: Integration Testing (Week 2)**
- [ ] Build browser automation (Playwright)
- [ ] Create user journey templates
- [ ] Implement screenshot capture
- [ ] Add log aggregation

### **Phase 3: Advanced Features (Week 3)**
- [ ] Add regression detection
- [ ] Build performance monitoring
- [ ] Create auto-rollback triggers
- [ ] Implement alerting system

### **Phase 4: Enforcement (Week 4)**
- [ ] Integrate with all agent workflows
- [ ] Train agents on requirements
- [ ] Monitor compliance
- [ ] Adjust based on feedback

---

## 🎓 **TRAINING REQUIREMENTS**

All agents must:
1. Read this specification completely
2. Understand testing requirements for their task level
3. Know how to generate evidence packages
4. Accept that testing is mandatory, not optional

**Agents interfacing with #132:**
- Know when tests are triggered
- Understand blocking criteria
- Can interpret test reports
- Fix issues identified by tests

---

**THIS AGENT PREVENTS THE NEXT OCT 24, 2025**

Agent #132 exists because we learned the hard way that untested code crashes production. Its mission is simple: catch bugs before users do. Every block it issues prevents a crash. Every test it runs saves debugging time. Every evidence package it generates protects deployment stability.

**Status:** Specification complete, implementation pending  
**Owner:** To be assigned  
**Timeline:** 4-week implementation plan  
**Priority:** CRITICAL - Prevents production crashes
