# MB.MD Rule #7: DIAGNOSE BEFORE FIX
## Quick Reference Guide - October 24, 2025

---

## 🎯 THE RULE

**DIAGNOSE BEFORE FIX:** Add diagnostic logging BEFORE attempting any fixes - never make assumption-based changes

**When to Use:** ANY time something is broken, returning errors, or not working as expected

---

## ⚡ QUICK WORKFLOW

```
1. ADD LOGGING FIRST (before any fixes)
2. TEST & OBSERVE (gather evidence)
3. ANALYZE EVIDENCE (root cause identification)
4. FIX THE RIGHT PROBLEM (evidence-based)
5. VERIFY SUCCESS (logs prove it works)
```

---

## 📋 LOGGING TEMPLATES

### Backend (Express.js)
```typescript
// Add at start of route handler
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📦 [DEBUG] Request received at <endpoint>');
console.log('📦 [DEBUG] Request body:', JSON.stringify(req.body, null, 2));
console.log('📦 [DEBUG] Body type:', typeof req.body);
console.log('📦 [DEBUG] Headers:', req.headers);
console.log('📦 [DEBUG] User:', req.user?.id || 'undefined');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
```

### Frontend (React/Fetch)
```typescript
// Add in error handling
if (!response.ok) {
  const errorText = await response.text();
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('❌ [ERROR] Response status:', response.status);
  console.error('❌ [ERROR] Response body:', errorText);
  console.error('❌ [ERROR] Request payload:', JSON.stringify(payload, null, 2));
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  throw new Error(`Failed: ${response.status} - ${errorText}`);
}
```

---

## 🚫 ANTI-PATTERNS (DON'T DO THIS)

```markdown
❌ "It's probably the routing" → Change routing without evidence
❌ "Looks like auth failure" → Add auth without checking logs
❌ "Must be CORS" → Add CORS headers without testing
❌ "The API isn't working" → Rewrite API without diagnostic check
```

---

## ✅ CORRECT PATTERNS (DO THIS)

```markdown
✅ Add logging → Test → See "body: undefined" → Fix body parser
✅ Add logging → Test → See "401 Unauthorized" → Add auth middleware
✅ Add logging → Test → See "CORS error" → Add CORS headers
✅ Add logging → Test → See "500 internal error" → Check stack trace
```

---

## 📊 DECISION TREE

```
Is something broken/failing?
    ↓
  YES → Add diagnostic logging FIRST
    ↓
  Test and observe logs
    ↓
  Do logs show root cause?
    ↓
  YES → Fix the ACTUAL problem
  NO → Add MORE logging, repeat

NEVER skip to "try fixing X"
```

---

## 🎓 WHY THIS MATTERS

### Without Rule #7:
- 🔴 Fix wrong problems
- 🔴 Break working code
- 🔴 Waste time on assumptions
- 🔴 No audit trail
- 🔴 Can't reproduce issue

### With Rule #7:
- ✅ Fix right problems
- ✅ Evidence-based changes
- ✅ Faster debugging
- ✅ Clear audit trail
- ✅ Reproducible fixes

---

## 📝 ENFORCEMENT

**Architect Reviews:**
- Must see diagnostic evidence
- Rejects fixes without proof
- Asks: "What did the logs show?"

**QA Agent:**
- Verifies logging was added
- Checks evidence section in PRs
- Rejects "I think it's X" without logs

---

## 🔗 INTEGRATION WITH OTHER RULES

| Rule | How Rule #7 Enhances It |
|------|------------------------|
| **Rule #1: VERIFY** | Verify behavior WITH logs before changing |
| **Rule #3: SCREENSHOT** | Screenshot console logs as evidence |
| **Rule #4: TEST** | Test WITH logging to prove it works |
| **Rule #5: ARCHITECT** | Architect reviews diagnostic evidence |
| **Rule #6: DOCUMENT** | Document evidence in real-time logs |

---

## 📍 WHERE TO FIND

**Full Documentation:** `docs/MB_MD_QA_PROTOCOL.md` (lines 371-495)  
**Example Implementation:** `docs/BUILD_REPORTS/CHAT_DIAGNOSTIC_LOGGING_OCT_24_2025.md`  
**Original Context:** This rule was created after Oct 24, 2025 incident where chat was "fixed" without evidence

---

**Remember:** **"Looks like X" ≠ "Actually is X"**

**Status:** 🟢 ACTIVE - All agents must follow  
**Created:** October 24, 2025  
**Authority:** MB.MD Quality Assurance Protocol v1.1
