# 🧪 MANDATORY TESTING REQUIREMENTS - ALL AGENTS

**Created:** October 24, 2025  
**Authority:** MB.MD Protocol Extension  
**Enforcement:** BLOCKING - No agent may mark tasks complete without these validations

---

## 🎯 **THE PROBLEM WE'RE SOLVING**

**Root Cause of Oct 24, 2025 Failures:**
- Agent #131 crashed server 2x because "code looks correct" ≠ "code works correctly"
- Architect approved based on code structure, not runtime behavior
- No automated testing caught bugs before deployment
- Assumptions about data structures were never validated

**Result:** Catastrophic failures that could have been prevented with basic testing.

---

## ✅ **MANDATORY TESTING CHECKPOINTS**

### **CHECKPOINT 1: DATA STRUCTURE VALIDATION** (Before any code)
**Rule:** NEVER assume data structures. Always inspect first.

**Required Actions:**
1. Add temporary `console.log()` to see actual runtime data
2. Run the flow manually and capture real data shape
3. Screenshot or copy actual values from browser/server console
4. Compare assumptions vs reality BEFORE writing code

**Example:**
```typescript
// ❌ WRONG - Assumption without proof
if (contextData?.textContent) { ... }

// ✅ RIGHT - Verify first
console.log('🔍 DATA INSPECTION:', JSON.stringify(contextData, null, 2));
// Run it, see the output, THEN write conditional
```

**Enforcement:** Code changes touching external data MUST include inspection logs in first PR.

---

### **CHECKPOINT 2: UNIT TESTING** (Before integration)
**Rule:** Test individual functions in isolation before combining them.

**Required Actions:**
1. **Regex patterns:** Test with sample inputs BEFORE deploying
   ```typescript
   // Test this separately!
   const testInput = "```typescript\nimport React...";
   const sanitized = testInput.replace(/^```[\w]*\s*\n?/, '');
   console.log('Sanitized starts with:', sanitized.substring(0, 20));
   ```

2. **IF conditions:** Verify with actual data values
   ```typescript
   console.log('Condition check:', {
     hasTextContent: !!contextData?.textContent,
     value: contextData?.textContent,
     lengthCheck: contextData?.textContent?.length
   });
   ```

3. **File operations:** Test read/write with dummy files first

**Enforcement:** Any new function >10 lines MUST have unit test proof before integration.

---

### **CHECKPOINT 3: INTEGRATION TESTING** (Before claiming complete)
**Rule:** Test the FULL user journey end-to-end, not just isolated pieces.

**Required Actions:**
1. **Manual Testing:**
   - Run the complete flow as a user would
   - Click buttons, enter data, trigger actions
   - Verify expected outcomes actually happen

2. **Server Log Validation:**
   - Check logs for errors or warnings
   - Confirm expected log messages appear
   - Verify no crashes or exceptions

3. **Visual Proof:**
   - Screenshot successful execution
   - Show before/after state changes
   - Capture console logs proving functionality

**Enforcement:** NO task can be marked "completed" without screenshots or log evidence.

---

### **CHECKPOINT 4: BEHAVIOR VALIDATION** (Before architect review)
**Rule:** Architect reviews BEHAVIOR, not just code structure.

**Required Evidence for Review:**
1. **Proof it runs:** Screenshot of successful execution
2. **Proof it works:** Before/after showing desired change
3. **Proof no crashes:** Server logs with no errors
4. **Proof data correct:** Console output showing expected values

**Example Architect Review Submission:**
```markdown
## Changes Made
- Fixed file detection to use textContent

## Evidence
1. Screenshot: Element selection successful ✅
2. Server logs: File detected correctly (see attached)
3. Browser console: No errors during execution
4. Result: Button changed color as requested

## Testing Performed
- Manual: Clicked 3 different elements, all detected correctly
- Logs: All show correct file paths, no App.tsx
- Validation: Sanitization removed markdown in all 5 test cases
```

**Enforcement:** Architect review REQUIRES evidence submission. Code-only reviews rejected.

---

## 🤖 **AUTOMATED TESTING AGENT (Agent #132)**

**Purpose:** Catch bugs BEFORE humans review code.

**Capabilities:**
1. **Static Analysis:** Check for common antipatterns
2. **Unit Test Runner:** Execute isolated function tests
3. **Integration Test Runner:** Run end-to-end user flows
4. **Regression Detector:** Compare behavior before/after changes
5. **Evidence Collector:** Auto-generate screenshots, logs, proofs

**When It Runs:**
- After every code change (pre-commit)
- Before architect review (blocking gate)
- On demand when agent requests validation

**What It Validates:**
- All regex patterns work with sample inputs
- All IF conditions evaluate correctly with test data
- All file operations succeed without errors
- All API endpoints return expected responses
- No markdown wrappers in generated code
- No console errors during execution

**Blocking Criteria:**
- If ANY test fails → task cannot be marked complete
- If evidence missing → architect review rejected
- If crashes detected → immediate rollback required

---

## 📊 **TESTING LEVELS**

### **Level 1: TRIVIAL Changes** (<10 lines, no logic changes)
**Required:**
- Visual inspection
- Manual click test
- No crashes

**Example:** Adding a CSS class, fixing a typo

---

### **Level 2: SIMPLE Changes** (10-50 lines, basic logic)
**Required:**
- Unit test proof for new functions
- Manual end-to-end test
- Server log validation
- Screenshot of working feature

**Example:** Adding a new button with onClick handler

---

### **Level 3: COMPLEX Changes** (50+ lines, external dependencies)
**Required:**
- Data structure inspection logs
- Unit tests for all new functions
- Integration test covering full flow
- Server + browser console logs
- Before/after screenshots
- Architect validation with evidence

**Example:** Autonomous code modification system (Agent #131's task)

---

### **Level 4: CRITICAL Changes** (Core systems, security, data)
**Required:**
- Everything from Level 3, PLUS:
- Automated test suite execution
- Rollback plan documented
- Production validation strategy
- User acceptance criteria defined
- Risk assessment completed

**Example:** Payment processing, authentication, database migrations

---

## 🚨 **ENFORCEMENT MECHANISMS**

### **Pre-Commit Hooks**
- Run automated tests before allowing commit
- Block if evidence files missing
- Require test passing status

### **Architect Review Process**
1. Agent submits code + evidence package
2. Architect verifies evidence exists and matches claims
3. If evidence missing/insufficient → REJECTED with required actions
4. If tests fail → REJECTED with fix requirements
5. If behavior doesn't match spec → REJECTED with clarifications
6. ONLY approve when behavior proven correct

### **Task Completion Checklist**
Before marking ANY task "completed":
- [ ] Data structures inspected and validated
- [ ] Unit tests passed (if applicable)
- [ ] Integration test passed
- [ ] Screenshots captured
- [ ] Server logs clean (no errors)
- [ ] Browser console clean (no errors)
- [ ] Architect reviewed with evidence
- [ ] User acceptance criteria met

**If ANY checkbox unchecked → Task remains "in_progress"**

---

## 💡 **EXAMPLES OF TESTING IN ACTION**

### **Example 1: File Detection Fix**
```typescript
// CHECKPOINT 1: Inspect data first
console.log('🔍 [DATA INSPECTION] Context received:', JSON.stringify(context, null, 2));
// → Run it, see what's actually there

// CHECKPOINT 2: Unit test the condition
console.log('🔍 [UNIT TEST] textContent check:', {
  has: !!context?.textContent,
  value: context?.textContent,
  length: context?.textContent?.length,
  passesCheck: context?.textContent && context.textContent.length > 3
});

// CHECKPOINT 3: Integration test
// Manual: Select "Find Events" button, verify correct file found

// CHECKPOINT 4: Evidence for review
// Screenshot: File detection logs showing client/src/components/EventCard.tsx
// NOT client/src/App.tsx
```

### **Example 2: Regex Sanitization**
```typescript
// CHECKPOINT 1: Inspect actual AI output
console.log('🧹 [DATA INSPECTION] AI raw output:', aiResponse.substring(0, 100));

// CHECKPOINT 2: Unit test regex
const testCases = [
  "```typescript\nimport React...",
  "```javascript\nconst foo...",
  "```\nimport { useState }..."
];

testCases.forEach(test => {
  const result = test.replace(/^```[\w]*\s*\n?/, '');
  console.log('Test:', test.substring(0, 20), '→', result.substring(0, 20));
  console.assert(!result.startsWith('```'), 'Markdown not removed!');
});

// CHECKPOINT 3: Integration test
// Trigger autonomous modification, check App.tsx has no ``` after write

// CHECKPOINT 4: Evidence
// Server logs showing sanitization removed fences
// App.tsx file showing clean code, no markdown
```

---

## 📚 **REQUIRED READING FOR ALL AGENTS**

Before starting ANY task, agents MUST:
1. Read this document completely
2. Understand which testing level applies to their task
3. Plan evidence collection BEFORE writing code
4. Never skip checkpoints "to save time"

**Remember:** The 2 server crashes on Oct 24, 2025 cost more time than all testing would have taken.

---

## 🎯 **SUCCESS CRITERIA**

**We know testing is working when:**
- ✅ Zero production crashes from preventable bugs
- ✅ All architect reviews include behavior evidence
- ✅ No agent marks tasks complete without proof
- ✅ Automated tests catch issues before human review
- ✅ Data structure assumptions validated before coding

---

**THIS IS LAW. NO EXCEPTIONS. NO SHORTCUTS.**

Every agent failing to follow this will be held accountable. Every crash that could have been prevented by testing is a training failure that must be documented and learned from.

**Updated:** October 24, 2025  
**Next Review:** After first month of enforcement (November 24, 2025)
