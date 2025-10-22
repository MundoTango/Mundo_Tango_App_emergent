# QA Enforcement Checklist

## MB.MD Quality Assurance Protocol
**Version 1.0 - October 22, 2025**

This document enforces the **5 Non-Negotiable Rules** from `replit.md` to prevent "code compiles ≠ feature works" failures.

---

## 🚫 THE CORE PROBLEM

**Agents claim features are "fixed" without actually testing them.**

Symptoms:
- ✅ Code has no syntax errors
- ✅ Server runs without crashes
- ❌ User clicks button → nothing happens
- ❌ User types in input → can't send message
- ❌ User saves changes → not persisted

**Root Cause**: Agents mark tasks complete based on code existence, not functionality.

---

## ✅ MANDATORY CHECKLIST (Before marking ANY task complete)

### Rule #1: VERIFY BEFORE BUILD
- [ ] Read ALL relevant documentation
- [ ] Summarize requirements BEFORE coding
- [ ] Confirm understanding with architect/user

**Failure mode**: Building the wrong feature because you didn't read the docs.

---

### Rule #2: INTEGRATE IMMEDIATELY  
- [ ] Import component as you build it
- [ ] Test import works (no module errors)
- [ ] Verify component renders on page

**Failure mode**: Component exists in repo but isn't imported anywhere, so it's never used.

---

### Rule #3: SCREENSHOT EVERYTHING
- [ ] Screenshot BEFORE interaction (baseline)
- [ ] Screenshot AFTER clicking button
- [ ] Screenshot AFTER typing text
- [ ] Screenshot AFTER receiving response
- [ ] Screenshot AFTER saving changes

**Failure mode**: Screenshotting only initial page load, not actual user interactions.

---

### Rule #4: TEST USER JOURNEY
- [ ] Test as regular user (non-admin)
- [ ] Test as super admin (if applicable)
- [ ] Verify access controls work correctly
- [ ] Test error cases (network failure, invalid input)

**Failure mode**: Testing only happy path, missing permission/validation errors.

---

### Rule #5: ARCHITECT VALIDATES
- [ ] Request independent review
- [ ] Do NOT self-approve your own work
- [ ] Provide evidence (screenshots, logs)
- [ ] Fix ALL issues found in review

**Failure mode**: Self-approving broken features because "it works on my machine."

---

## 📸 SCREENSHOT REQUIREMENTS

### BEFORE marking a task complete, you MUST have:

1. **Initial state screenshot**
   - Shows the page/component before interaction
   - Proves feature is visible to user

2. **Interaction screenshot**  
   - Shows button being clicked
   - Shows text typed in input field
   - Shows dropdown menu open

3. **Result screenshot**
   - Shows API response received
   - Shows data saved to database
   - Shows success message/toast

4. **Error screenshot** (if applicable)
   - Shows validation errors
   - Shows network errors
   - Shows permission denied messages

---

## 🧪 TESTING SCRIPTS (Common Features)

### Button Click Test
```bash
1. Navigate to page with button
2. Screenshot: Initial state
3. Click button
4. Screenshot: Modal/drawer opened
5. Verify: Event handler fired (check console logs)
6. Screenshot: Action completed
```

### Form Submit Test  
```bash
1. Navigate to form
2. Screenshot: Empty form
3. Type test data in all fields
4. Screenshot: Filled form
5. Click submit button
6. Screenshot: Loading state
7. Wait for API response
8. Screenshot: Success message + data saved
9. Verify: Database updated (check backend logs or query DB)
```

### Chat/Message Test
```bash
1. Open chat interface
2. Screenshot: Empty chat
3. Type message "Hello test"
4. Screenshot: Text in input field
5. Click send button
6. Screenshot: Message appears in chat
7. Wait for AI response
8. Screenshot: AI reply visible
9. Verify: Messages saved to database
```

### Save/Persist Test  
```bash
1. Make changes (edit text, select option, etc)
2. Screenshot: Changed state
3. Click save button
4. Screenshot: Loading indicator
5. Wait for API response
6. Screenshot: Success toast
7. Refresh page
8. Screenshot: Changes still visible after refresh
9. Verify: Database contains updated values
```

---

## 🚨 COMMON FAILURE PATTERNS

### Pattern 1: "The Button Exists" Fallacy
**Agent says**: "I added the save button, it's ready to test"  
**Reality**: Button renders, but `onClick` handler does nothing  
**Prevention**: Click the button, verify network request in browser DevTools

### Pattern 2: "Code Compiles" Fallacy  
**Agent says**: "No TypeScript errors, feature is complete"  
**Reality**: Types are correct, but business logic is broken  
**Prevention**: Run the feature, observe actual behavior

### Pattern 3: "Component Imported" Fallacy
**Agent says**: "I imported ChatInterface into MrBlueComplete"  
**Reality**: Import exists but component isn't rendered in JSX  
**Prevention**: Search for `<ChatInterface` in parent component

### Pattern 4: "API Endpoint Exists" Fallacy
**Agent says**: "Backend route is registered at /api/save"  
**Reality**: Route returns 500 error due to database schema mismatch  
**Prevention**: Test API call, check response status code

### Pattern 5: "Database Schema Updated" Fallacy  
**Agent says**: "I added updatedAt column to schema.ts"  
**Reality**: Schema file updated, but database not synced  
**Prevention**: Run `npm run db:push`, verify column exists in actual DB

---

## 🔍 VERIFICATION METHODS

### Frontend Verification
```bash
# Open browser DevTools (F12)
# Check Console tab for errors
# Check Network tab for failed requests
# Check Elements tab to verify DOM structure
```

### Backend Verification  
```bash
# Check server logs for errors
# Verify API endpoint receives request
# Check database query logs
# Verify response status code (200 = success, 500 = error)
```

### Database Verification
```bash
# Query database directly to verify data saved
# Check for missing columns causing errors
# Verify foreign key constraints work
```

---

## 📋 TASK COMPLETION TEMPLATE

When marking a task complete, include this evidence:

```markdown
## Task: [Feature Name]

### What was built:
- [List of files changed]
- [List of components created]

### How to test:
1. Navigate to [URL/page]
2. Click [button/link]
3. Type [input text]
4. Verify [expected result]

### Evidence:
- Screenshot 1: Initial state
- Screenshot 2: After interaction  
- Screenshot 3: Result/success message
- Backend logs: [paste relevant logs showing API success]
- Database query: [paste query showing data saved]

### Tested by:
- [x] Regular user (non-admin)
- [x] Super admin (if applicable)
- [x] Error cases (network failure, invalid input)

### Status: ✅ COMPLETE
All tests passed, screenshots provided, feature verified working.
```

---

## 🛡️ ENFORCEMENT

**For Agents**: This checklist is MANDATORY, not optional. Violating these rules results in:
1. Task rejected and returned for proper testing
2. Documentation of failure pattern
3. Required training on proper QA process

**For Architects/Reviewers**: You have authority to reject ANY task that:
- Lacks required screenshots
- Shows no evidence of testing
- Claims "it works" without proof

**No exceptions.** Quality > Speed.

---

## 📚 Related Documentation

- `replit.md` - The 5 Non-Negotiable Rules
- `docs/DOCUMENTATION_VERIFICATION.md` - Pre-build verification checklist  
- `docs/MB_MD_QA_PROTOCOL.md` - Full 1009-line QA protocol

---

**Remember**: A feature isn't done until a user can successfully use it. Code existence ≠ functionality.
