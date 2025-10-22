# Learning Capture Template
**Version:** 1.0  
**Created:** October 22, 2025  
**Purpose:** Submit new learnings to AGENT_LEARNINGS.md  
**Status:** 🔴 Use this template when discovering new patterns

---

## 📝 **HOW TO USE THIS TEMPLATE**

When you discover a new failure pattern, anti-pattern, or learning:
1. Copy this template
2. Fill in all sections
3. Submit to Documentation Agent
4. Documentation Agent adds to AGENT_LEARNINGS.md
5. Architect updates MB_MD_QA_PROTOCOL.md cross-reference

---

## 📋 **LEARNING SUBMISSION FORM**

### Learning Number
**Next available:** #19 (check AGENT_LEARNINGS.md for latest)

---

### Learning Title
**Pattern:** THE "[CATCHY NAME]" [PATTERN TYPE]

**Examples:**
- THE "COMPONENT EXISTS" FALLACY
- THE "MODAL OPENS ≠ MODAL WORKS" TRAP
- THE "DEBUG LOG" TRAP

**Your title:** THE "_______________" _______________

---

### Problem Description
**What went wrong?**
```
[Describe the failure pattern in 1-2 sentences]
```

---

### Real Example
**What actually happened in our project?**
```
[Specific example from Mr Blue, Visual Editor, or other work]
```

---

### Impact
**What was the consequence?**
```
[How did this affect the project? Wasted time? Broken feature? User impact?]
```

---

### Root Cause
**Why did this happen?**
```
[What assumption was wrong? What was overlooked?]
```

---

### Phase Classification
**Which MB.MD phase does this apply to?**
- [ ] Phase 1: MAPPING (before writing code)
- [ ] Phase 2: BREAKDOWN (during task planning)
- [ ] Phase 3: MITIGATION (while building)
- [ ] Phase 4: DEPLOYMENT (before marking complete)

---

### Owner Assignment
**Which agent should watch for this pattern?**
- [ ] Documentation Agent
- [ ] Architect
- [ ] Implementation Agent
- [ ] QA Agent

**Validator:** [Who validates this is avoided?]

---

### Related MB.MD Rule
**Which of the 5 Non-Negotiable Rules does this relate to?**
- [ ] Rule 1: VERIFY BEFORE BUILD
- [ ] Rule 2: INTEGRATE IMMEDIATELY
- [ ] Rule 3: SCREENSHOT EVERYTHING
- [ ] Rule 4: TEST USER JOURNEY
- [ ] Rule 5: ARCHITECT VALIDATES

---

### Agent Action
**What should the agent DO to avoid this?**

```bash
# Commands to run (if applicable)
[Bash commands]
```

```typescript
// Code pattern (if applicable)
[Code example]
```

```markdown
## Checklist (if applicable)
- [ ] Action 1
- [ ] Action 2
```

---

### Verification Checklist
**How can an agent verify they've avoided this pattern?**
- [ ] Verification step 1
- [ ] Verification step 2
- [ ] Verification step 3

---

### Cross-References
**Related learnings or documentation:**
- Learning #[X]: [Title]
- Documentation: [File path]
- Protocol section: [MB_MD_QA_PROTOCOL.md section]

---

## 📤 **SUBMISSION PROCESS**

### Step 1: Fill Template
Complete all sections above with specific details.

### Step 2: Submit to Documentation Agent
```markdown
@DocumentationAgent - New learning discovered:

**Title:** THE "[NAME]" [TYPE]
**Phase:** Phase [X]
**Owner:** [Agent]

[Paste completed template]

Please add to AGENT_LEARNINGS.md under Phase [X] section.
```

### Step 3: Documentation Agent Reviews
- Reviews completeness
- Checks for duplicates with existing learnings
- Ensures example is specific (not generic)
- Verifies checklist is actionable

### Step 4: Documentation Agent Adds to AGENT_LEARNINGS.md
```markdown
### Learning #[X]: THE "[NAME]" [TYPE]
**Problem:** [Description]
**Real Example:** [Example]
**Impact:** [Impact]

**Agent Action:**
[Commands/code/checklist]

**Checklist:**
- [ ] Item 1
- [ ] Item 2
```

### Step 5: Architect Updates MB_MD_QA_PROTOCOL.md
Add cross-reference in relevant rule:
```markdown
## Rule [X]: [RULE NAME]
... existing content ...

**New Pattern Identified:** [Pattern name] (see AGENT_LEARNINGS.md #[X])
```

---

## ✅ **EXAMPLE SUBMISSION**

Here's a complete example to guide you:

### Learning Number
**Next available:** #19

---

### Learning Title
**Pattern:** THE "WEBSOCKET RECONNECTION" PATTERN

---

### Problem Description
**What went wrong?**
```
WebSocket connections drop unexpectedly, and the app becomes unresponsive 
because there's no automatic reconnection logic.
```

---

### Real Example
**What actually happened in our project?**
```
Voice conversation WebSocket disconnected when user's network briefly dropped.
User had to refresh entire page to resume conversation. No "reconnecting..." 
message shown, just silent failure.
```

---

### Impact
**What was the consequence?**
```
Users lost their conversation context and had to start over. Poor UX.
Support tickets about "voice stops working randomly."
```

---

### Root Cause
**Why did this happen?**
```
Implementation focused on happy path (connection succeeds). Didn't account 
for network instability common in mobile/poor connection scenarios.
```

---

### Phase Classification
**Which MB.MD phase does this apply to?**
- [x] Phase 3: MITIGATION (while building)

---

### Owner Assignment
**Which agent should watch for this pattern?**
- [x] Implementation Agent

**Validator:** Architect (code review), QA Agent (test disconnect scenarios)

---

### Related MB.MD Rule
**Which of the 5 Non-Negotiable Rules does this relate to?**
- [x] Rule 4: TEST USER JOURNEY (test network failure scenarios)

---

### Agent Action
**What should the agent DO to avoid this?**

```typescript
const ws = new WebSocket(url);

// Add reconnection logic
ws.onclose = () => {
  console.log('WebSocket closed, reconnecting...');
  toast.info('Connection lost, reconnecting...');
  setTimeout(() => connectWebSocket(), 1000);
};

ws.onerror = (err) => {
  console.error('WebSocket error:', err);
  toast.error('Connection error, reconnecting...');
};

// Verify reconnection works
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;

function connectWebSocket() {
  if (reconnectAttempts >= maxReconnectAttempts) {
    toast.error('Unable to connect. Please refresh.');
    return;
  }
  reconnectAttempts++;
  // Connect logic
}
```

---

### Verification Checklist
**How can an agent verify they've avoided this pattern?**
- [ ] WebSocket reconnection logic added
- [ ] User sees "reconnecting..." message
- [ ] Test: Disable network → Enable → Verify reconnects
- [ ] Test: Max reconnect attempts shows error message
- [ ] Screenshot: Reconnection success message

---

### Cross-References
**Related learnings or documentation:**
- Learning #7: Browser API Permissions Reality
- Learning #4: Conversation Feature Reality Check
- Documentation: MB_MD_QA_PROTOCOL.md Rule 4

---

## 🎯 **QUALITY CRITERIA**

A good learning submission has:
- ✅ Specific real example (not generic "components don't work")
- ✅ Clear actionable steps (agent knows what to do)
- ✅ Verification checklist (agent can prove they followed it)
- ✅ Phase classification (agent knows when to apply)
- ✅ Impact statement (agent understands why it matters)

A poor learning submission has:
- ❌ Vague description ("things broke")
- ❌ No real example (hypothetical scenario)
- ❌ No actionable steps (just "be careful")
- ❌ No checklist (can't verify if followed)
- ❌ No phase (agent doesn't know when to apply)

---

**Ready to submit your learning? Copy this template and fill it out!**
