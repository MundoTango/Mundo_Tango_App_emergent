# Task Completion Requirements - MB.MD 5-Layer Testing Protocol
**Updated:** October 27, 2025  
**Status:** MANDATORY for ALL agents

---

## 🎯 OVERVIEW

**RULE:** No agent can mark ANY task as `status: "completed"` without satisfying ALL requirements in this document.

**Enforcement:** Task system validates completion requirements. Architect reviews before final approval.

---

## 📋 5-LAYER TESTING PROTOCOL

Every task involving user-facing features MUST pass ALL 5 layers:

### ✅ LAYER 1: UI Elements Exist

**What it tests:** Frontend components render correctly

**Evidence required:**
- Screenshot showing UI element (button, input, modal, etc.)
- Element has correct `data-testid` attribute
- Element is visible and clickable/interactive

**Example:**
```markdown
### Layer 1: UI Elements
Screenshot: SAVE button visible in toolbar
- data-testid="button-save" ✅
- Button enabled when changes pending ✅
- Badge shows change count ✅
```

---

### ✅ LAYER 2: API Endpoints Exist

**What it tests:** Backend routes respond to requests

**Evidence required:**
- API endpoint returns 200 OK (or appropriate status code)
- Request body validation works (400 for invalid input)
- Auth check works (401 for unauthenticated)

**Example:**
```markdown
### Layer 2: API Endpoints
POST /api/visual-editor/save
- Returns 200 OK ✅
- Validates changes array (400 if missing) ✅
- Requires authentication (401 without token) ✅
```

**❌ INSUFFICIENT:** Passing Layer 2 alone does NOT mean feature works!

---

### ✅ LAYER 3: Backend Logic Works

**What it tests:** Actual work is performed, not just returning success

**Evidence required:**
- Backend logs show actual operations (file writes, DB inserts, API calls)
- NOT just: "✅ Changes saved successfully" (could be lie)
- MUST show: "Wrote 247 bytes to client/src/pages/Home.tsx" (proof of work)

**Example:**
```markdown
### Layer 3: Backend Logic
Backend logs:
```
[VisualEditor] Applying style changes: 2
[AST] Replaced "bg-blue-500" with "bg-red-500" in Home.tsx
[AST] Wrote 3,247 bytes to client/src/pages/Home.tsx
[Git] Staged file: client/src/pages/Home.tsx
```
```

**🚨 CRITICAL:** Stub endpoints return success without doing work → Pass Layer 2 but FAIL Layer 3.

---

### ✅ LAYER 4: File Persistence Works

**What it tests:** Changes actually written to disk/database

**Evidence required:**
- File system verification (e.g., `git diff` shows changes)
- OR database query shows inserted/updated rows
- OR file exists with expected content

**Example:**
```markdown
### Layer 4: File Persistence
```bash
$ git diff client/src/pages/Home.tsx
- <div className="bg-blue-500">
+ <div className="bg-red-500">
```

**Verification:** ✅ File actually modified on disk
```

**❌ COMMON FAILURE:** Backend says "success" but `git diff` shows nothing → Layer 4 FAIL.

---

### ✅ LAYER 5: End-to-End Integration Works

**What it tests:** Complete user journey from UI action to final result

**Evidence required:**
- Playwright test or manual E2E test covering full flow
- All intermediate steps verified (not just start and end)
- Screenshot evidence of final result

**Example:**
```markdown
### Layer 5: E2E Integration
User Journey:
1. User selects element (screenshot: purple outline) ✅
2. User types "make it red" (screenshot: input filled) ✅
3. AI generates code (logs: codeChanges array populated) ✅
4. SAVE button enabled (screenshot: badge shows "1") ✅
5. User clicks SAVE (screenshot: toast "Changes saved") ✅
6. Git commit created (screenshot: commit hash abc1234) ✅
7. File modified (git diff shows red background) ✅

Playwright test: tests/integration/vibe-save-flow.spec.ts ✅
```

**🚨 CRITICAL:** This is where most agent failures occur - features "work" in isolation but break in real user flow.

---

## 🚫 FORBIDDEN PATTERNS

### ❌ PATTERN #1: Stub Endpoints

**BANNED:**
```typescript
router.post('/endpoint', (req, res) => {
  // TODO: Implement
  res.json({ success: true });
});
```

**Why:** Passes Layer 2 (API exists) but fails Layer 3 (no work done).

**Solution:** Implement real work OR return 501 Not Implemented.

---

### ❌ PATTERN #2: Log Messages Without Proof

**BANNED:**
```typescript
console.log('✅ Changes saved successfully');
res.json({ success: true });
// ← No actual file write happened!
```

**Why:** Logs say "success" but Layer 4 (file persistence) fails.

**Solution:** Log AFTER actual work, with details of what was done.

---

### ❌ PATTERN #3: Self-Approval Without Testing

**BANNED:**
```markdown
Task: Implement SAVE button
Status: ✅ completed
Evidence: Code compiles
```

**Why:** Missing ALL 5 layers of verification.

**Solution:** Complete 5-layer checklist + architect review.

---

## 📝 COMPLETION CHECKLIST TEMPLATE

**Agents MUST copy this template into completion report:**

```markdown
## Task Completion Report: [Task Name]

### Layer 1: UI Elements Exist
- [ ] Screenshot showing [element name]
- [ ] Element has data-testid attribute
- [ ] Element is visible and interactive

**Screenshot:** [link or inline image]

---

### Layer 2: API Endpoints Exist
- [ ] Endpoint: [method] [path]
- [ ] Returns correct status code: [200/201/etc]
- [ ] Validates input: [400 for invalid]
- [ ] Requires auth: [401 without token]

**Test:**
```bash
curl -X POST http://localhost:5000/api/endpoint \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

**Response:** [paste response]

---

### Layer 3: Backend Logic Works
- [ ] Backend logs show actual operations
- [ ] NOT just "success" messages
- [ ] Specific evidence of work done

**Logs:**
```
[paste relevant backend logs showing actual work]
```

---

### Layer 4: File Persistence Works
- [ ] File system changes verified
- [ ] OR database changes verified
- [ ] Proof of data actually written

**Verification:**
```bash
$ git diff [file]
[paste diff showing changes]
```

---

### Layer 5: E2E Integration Works
- [ ] Complete user journey tested
- [ ] All intermediate steps verified
- [ ] Screenshot of final result
- [ ] Playwright test passing (if applicable)

**User Journey:**
1. [Step 1] - Screenshot: [link]
2. [Step 2] - Screenshot: [link]
...

**Playwright Test:** [test file path] - ✅ PASSING

---

### Architect Review
- [ ] All 5 layers verified by architect
- [ ] No critical issues found
- [ ] Approval given

**Review Document:** [link to architect review]

---

## Completion Status: [PENDING / APPROVED]
```

---

## 🎯 ROLE-SPECIFIC REQUIREMENTS

### Agent #126 (Git Operations)
**Additional requirements:**
- Must run `git diff` and paste output
- Must run `git status` and verify files staged
- Must run `git commit` and paste commit hash
- Must screenshot Git history showing commit

**See:** `docs/agents/AGENT_126_GIT_OPERATIONS.md`

---

### Agent #128 (Voice + Visual Context)
**Additional requirements:**
- Must compare backend AND frontend logs (state sync verification)
- Must verify audio bytes transmitted (not just captured)
- Must screenshot voice conversation showing user speech → AI response

**See:** `docs/agents/AGENT_128_VOICE_CONTEXT.md`

---

### Agent #131 (Vibe Coding)
**Additional requirements:**
- Must verify `/api/vibe/execute` called in logs
- Must verify `codeChanges[]` array populated
- Must screenshot SAVE button showing badge count

**See:** `docs/agents/AGENT_131_VIBE_CODING.md`

---

### Agent #127 (Deployment Safety)
**Additional requirements:**
- Must run ALL pre-flight checks (stub detection, state validation, integration tests)
- Must generate pre-flight report
- Must verify ALL test suites passing (not just security)

**See:** `docs/agents/AGENT_127_DEPLOYMENT_SAFETY.md`

---

## 🚨 ENFORCEMENT

### Pre-Commit Hook
- Scans for stub endpoints → Blocks commit if found
- Scans for duplicate WebSocket state → Blocks commit if found

**Script:** `scripts/check-stub-endpoints.ts`

---

### Task System Validation
- Task marked `completed` → System checks for architect review
- No architect review → Task rejected, status reverted to `completed_pending_review`

---

### Architect Review Gate
- Agent requests completion → Architect reviews 5-layer evidence
- Missing evidence → Sent back to agent with this document
- Complete evidence → Approved, task marked `completed`

---

## 💡 KEY PRINCIPLES

1. **"Code Compiles" ≠ "Feature Works"**
2. **"API Returns 200" ≠ "Feature Works"**
3. **"Logs Say Success" ≠ "Feature Works"**

**ONLY valid proof:** All 5 layers verified + Architect approval.

---

**Last Updated:** October 27, 2025  
**Next Review:** After next major incident or monthly (whichever comes first)
