# 🏗️ Architect Evidence Checklist - Mandatory Review Requirements

**Created:** October 24, 2025  
**Authority:** MB.MD Protocol Rule #5  
**Enforcement:** BLOCKING - No approval without evidence

---

## 🎯 **PURPOSE**

This checklist ensures architects validate BEHAVIOR, not just code structure. After Agent #131 failures, we learned that "code looks correct" ≠ "code works correctly."

---

## ✅ **EVIDENCE REQUIREMENTS BY TASK TYPE**

### **Level 1: TRIVIAL (<10 lines, cosmetic changes)**
**Examples:** CSS class change, typo fix, comment addition

**Required Evidence:**
- [ ] Screenshot showing change rendered correctly
- [ ] No console errors visible in screenshot
- [ ] Change deployed and visible to user

**Approval Criteria:**
- ✅ Visual proof provided
- ✅ No breaking changes
- ✅ No crashes in logs

---

### **Level 2: SIMPLE (10-50 lines, basic logic)**
**Examples:** New button with onClick, form field addition, basic API endpoint

**Required Evidence:**
1. **Visual Proof:**
   - [ ] Screenshot: Feature renders correctly
   - [ ] Screenshot: Feature works when clicked/used
   
2. **Runtime Proof:**
   - [ ] Browser console: Clean (no errors)
   - [ ] Server logs: Clean (no crashes)
   
3. **Integration Proof:**
   - [ ] Component imported and rendered
   - [ ] Event handlers wired correctly

**Approval Criteria:**
- ✅ ALL screenshots provided
- ✅ Logs show clean execution
- ✅ Feature accessible to user

---

### **Level 3: COMPLEX (50+ lines, external data, complex logic)**
**Examples:** Autonomous code modification, API integration, data processing

**Required Evidence:**
1. **Data Inspection (Checkpoint 1):**
   - [ ] Logs showing actual data structure
   - [ ] Comparison: assumptions vs reality
   - [ ] Proof structures were verified before building
   
2. **Unit Testing (Checkpoint 2):**
   - [ ] Test cases with sample inputs
   - [ ] All tests passed (logs showing results)
   - [ ] Edge cases covered
   
3. **Integration Testing (Checkpoint 3):**
   - [ ] End-to-end user journey tested
   - [ ] Screenshot: Flow completed successfully
   - [ ] Server logs: No errors during execution
   - [ ] Browser console: Clean throughout flow
   
4. **Evidence Package (Checkpoint 4):**
   - [ ] All checkpoints documented
   - [ ] Screenshots at key steps
   - [ ] Logs proving no crashes
   - [ ] Before/after comparison

**Approval Criteria:**
- ✅ Data structures inspected and verified
- ✅ Unit tests passed for all complex logic
- ✅ Integration test successful
- ✅ Complete evidence package provided

---

### **Level 4: CRITICAL (Core systems, security, payments, auth)**
**Examples:** Payment processing, authentication, database migrations

**Required Evidence:**
- Everything from Level 3, PLUS:
- [ ] Automated test suite executed (all passed)
- [ ] Rollback plan documented
- [ ] Production validation strategy defined
- [ ] Risk assessment completed
- [ ] Security review if applicable

**Approval Criteria:**
- ✅ Everything from Level 3
- ✅ Automated tests passed
- ✅ Rollback tested
- ✅ Risk mitigation documented

---

## 🚫 **AUTOMATIC REJECTION CRITERIA**

Reject immediately if ANY of these apply:

### **Missing Evidence:**
- ❌ No screenshots for UI changes
- ❌ No data inspection logs for external data
- ❌ No unit test results for complex logic
- ❌ No integration test proof
- ❌ Claims "tested" without proof

### **Code-Only Submissions:**
- ❌ Just git diff, no runtime proof
- ❌ "It compiles" without execution proof
- ❌ "Looks correct" without behavior validation

### **Incomplete Testing:**
- ❌ Unit tests missing for regex/parsing
- ❌ No end-to-end user journey test
- ❌ Assumed data structures without inspection

### **Crashes or Errors:**
- ❌ Server logs show errors
- ❌ Browser console shows errors
- ❌ Screenshots show broken UI

---

## ✅ **APPROVAL TEMPLATE**

```markdown
## Architect Review: APPROVED

**Task:** [Brief description]

**Evidence Validated:**
✅ Checkpoint 1: Data structures inspected
✅ Checkpoint 2: Unit tests passed (X/X)
✅ Checkpoint 3: Integration test successful
✅ Checkpoint 4: Complete evidence package

**Visual Proof:**
✅ Screenshot: Feature renders correctly
✅ Screenshot: Feature works as expected
✅ No console errors

**Runtime Proof:**
✅ Server logs: Clean execution
✅ Browser logs: No errors
✅ Performance: Acceptable

**Security:**
✅ No secrets exposed
✅ Input validation present
✅ No injection vulnerabilities

**Recommendation:** APPROVE for deployment

**Next Steps:** [Any follow-up items if needed]
```

---

## 🚫 **REJECTION TEMPLATE**

```markdown
## Architect Review: REJECTED

**Task:** [Brief description]

**Missing Evidence:**
❌ [Checkpoint/evidence missing]
❌ [Another missing item]

**Issues Found:**
❌ [Specific issue with explanation]
❌ [Another issue]

**Required Actions:**
1. [Specific fix needed]
2. [Testing requirement]
3. [Evidence to provide]

**Resubmit When:**
- All required evidence provided
- All issues addressed
- All tests passing

**Status:** BLOCKED until requirements met
```

---

## 📊 **REVIEW DECISION TREE**

```
START: Agent submits code for review

├─ Is it UI change?
│  ├─ YES: Screenshot required
│  │  ├─ Screenshot provided? → Continue
│  │  └─ No screenshot? → REJECT
│  └─ NO: Continue

├─ Touches external data (API, context, props)?
│  ├─ YES: Data inspection logs required
│  │  ├─ Inspection logs provided? → Continue
│  │  └─ No logs? → REJECT
│  └─ NO: Continue

├─ Has complex logic (>10 lines, regex, parsing)?
│  ├─ YES: Unit tests required
│  │  ├─ Unit tests passed? → Continue
│  │  └─ No tests? → REJECT
│  └─ NO: Continue

├─ User-facing feature?
│  ├─ YES: Integration test required
│  │  ├─ Integration test passed? → Continue
│  │  └─ No test? → REJECT
│  └─ NO: Continue

├─ Check logs
│  ├─ Server logs clean? → Continue
│  ├─ Server errors? → REJECT
│  ├─ Browser console clean? → Continue
│  └─ Browser errors? → REJECT

├─ All evidence complete?
│  ├─ YES: → APPROVE
│  └─ NO: → REJECT with requirements

END: Decision made
```

---

## 🎓 **COMMON REJECTION SCENARIOS**

### **Scenario 1: "It compiles" fallacy**
**Submission:** "Added feature X, code looks good"  
**Missing:** No screenshot, no test, no logs  
**Action:** REJECT - Require evidence package

### **Scenario 2: Assumption-based coding**
**Submission:** "Fixed file detection by checking contextData.textContent"  
**Missing:** No proof textContent actually exists  
**Action:** REJECT - Require data inspection logs

### **Scenario 3: Untested regex**
**Submission:** "Added markdown sanitization"  
**Missing:** No unit test with sample inputs  
**Action:** REJECT - Require unit tests proving it works

### **Scenario 4: Integration illusion**
**Submission:** "Added component to codebase"  
**Missing:** No proof component is imported/rendered  
**Action:** REJECT - Require import verification + screenshot

---

## 💡 **APPROVAL BEST PRACTICES**

### **Do:**
- ✅ Ask "Where's the proof?" if evidence missing
- ✅ Request specific screenshots/logs needed
- ✅ Verify data structures were inspected
- ✅ Check test results, not just "tested"
- ✅ Look for crashes/errors in logs
- ✅ Validate user can actually access feature

### **Don't:**
- ❌ Approve based on code structure alone
- ❌ Accept "I tested it" without proof
- ❌ Skip evidence review because "looks good"
- ❌ Assume features work without visual confirmation
- ❌ Trust claims without supporting logs/screenshots

---

## 📈 **TRACKING COMPLIANCE**

### **Weekly Metrics:**
- Reviews requiring evidence re-submission: [X]
- Reviews approved first time: [Y]
- Most common rejection reason: [Z]

### **Monthly Goals:**
- Target: 80%+ first-time approvals
- Target: <5% missing evidence rejections
- Target: 0 preventable crashes from reviewed code

---

## 🚨 **ESCALATION**

If agent repeatedly submits without evidence:
1. First rejection: Friendly reminder + link to this checklist
2. Second rejection: Required reading of TESTING_REQUIREMENTS_MANDATORY.md
3. Third rejection: Escalate to QA Agent #79 for compliance review
4. Pattern of violations: Training gap identified, agent re-training required

---

**THIS CHECKLIST IS LAW FOR ALL ARCHITECT REVIEWS**

After Oct 24, 2025 failures, we learned that reviewing code structure without behavior proof leads to production crashes. Every architect must validate evidence, not just code quality.

**Updated:** October 24, 2025  
**Owner:** All Architect Agents  
**Enforced By:** QA Agent #79 + Code Review Protocol
