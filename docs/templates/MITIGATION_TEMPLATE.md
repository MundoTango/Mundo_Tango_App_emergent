# MB.MD Phase 3: MITIGATION Template

**Feature/Task:** [Name of feature or task]  
**Agent:** [Your agent ID/name]  
**Date:** [Today's date]  
**Current Task:** [Which subtask from BREAKDOWN]

---

## 1. PRE-BUILD CHECKLIST

Before writing ANY code:
- [ ] MAPPING phase complete
- [ ] BREAKDOWN phase complete
- [ ] Relevant files read
- [ ] Integration points identified
- [ ] Test plan created

---

## 2. UNIT TESTING (Before Integration)

**For complex logic (>10 lines, regex, parsing, transforms):**

### Function: `[functionName]`
**Purpose:** [What it does]

**Test Cases:**
```typescript
// tests/unit/functionName.test.ts
import { functionName } from '@/path/to/file';

describe('functionName', () => {
  it('should handle normal case', () => {
    const input = 'test input';
    const result = functionName(input);
    expect(result).toBe('expected output');
  });
  
  it('should handle edge case', () => {
    const input = '';
    const result = functionName(input);
    expect(result).toBe('default value');
  });
  
  it('should handle error case', () => {
    expect(() => functionName(null)).toThrow('Error message');
  });
});
```

**Test Results:**
- [ ] ✅ Normal case passed
- [ ] ✅ Edge case passed
- [ ] ✅ Error case passed

---

## 3. DIAGNOSTIC LOGGING

**For external data/APIs/runtime structures:**

```typescript
// Add inspection logging BEFORE building logic
console.log('[DATA_INSPECTION] API response:', JSON.stringify(response, null, 2));
console.log('[DATA_INSPECTION] Database record:', record);
console.log('[DATA_INSPECTION] Props received:', props);

// Verify assumptions
if (!response.expectedField) {
  console.error('[DATA_INSPECTION] ⚠️ Missing expected field!');
}
```

**Logging Results:**
- Data structure matches assumptions: [ ] Yes [ ] No
- All required fields present: [ ] Yes [ ] No
- Unexpected data found: [ ] Yes [ ] No (describe)

---

## 4. BUILD COMPONENT

**Component/File:** `[ComponentName.tsx]`

**Implementation checklist:**
- [ ] Props interface defined with TypeScript
- [ ] All imports added
- [ ] Component logic implemented
- [ ] Event handlers wired up
- [ ] Styles applied (MT Ocean theme)
- [ ] Data-testid attributes added
- [ ] Error handling implemented
- [ ] Loading states handled

**Code snippet:**
```typescript
interface [ComponentName]Props {
  prop1: string;
  prop2: number;
  onEvent: () => void;
}

export function [ComponentName]({ prop1, prop2, onEvent }: [ComponentName]Props) {
  // Implementation
  return (
    <div data-testid="component-name">
      {/* JSX */}
    </div>
  );
}
```

---

## 5. INTEGRATE IMMEDIATELY

**Critical: Do NOT build in isolation!**

### Step 1: Import
**File to edit:** `[ParentComponent.tsx]`

```typescript
// Add this import
import [ComponentName] from '@/components/path/ComponentName';
```

### Step 2: Render
**JSX to add:**
```typescript
<ComponentName 
  prop1={value1}
  prop2={value2}
  onEvent={handleEvent}
  data-testid="component-in-parent"
/>
```

### Step 3: Verify Import
- [ ] No TypeScript errors
- [ ] No circular dependencies
- [ ] Import path correct

### Step 4: Verify Render
- [ ] Component visible in browser
- [ ] Props passed correctly
- [ ] Events fire correctly

---

## 6. PROVIDER HIERARCHY VERIFICATION

**If using Context/Store:**

```typescript
// Verify component is inside required providers
<AuthProvider>
  <ThemeProvider>
    <QueryClientProvider>
      {/* Your component must be here */}
      <YourComponent />
    </QueryClientProvider>
  </ThemeProvider>
</AuthProvider>
```

**Checklist:**
- [ ] All required providers present
- [ ] Provider order correct
- [ ] No missing context errors in console

---

## 7. INTEGRATION TEST

**Test component in context:**

```typescript
// tests/integration/ComponentName.test.tsx
import { render, screen } from '@testing-library/react';
import { ComponentName } from '@/components/ComponentName';

test('ComponentName integrates with parent', () => {
  render(
    <ParentComponent>
      <ComponentName prop1="test" />
    </ParentComponent>
  );
  
  expect(screen.getByTestId('component-name')).toBeInTheDocument();
  expect(screen.getByText('Expected content')).toBeVisible();
});
```

**Test Results:**
- [ ] ✅ Component renders
- [ ] ✅ Props received correctly
- [ ] ✅ Events work
- [ ] ✅ No console errors

---

## 8. API ENDPOINT TESTING

**For backend routes:**

### Endpoint: `POST /api/endpoint`

**Manual test:**
```bash
curl -X POST http://localhost:5000/api/endpoint \
  -H "Content-Type: application/json" \
  -d '{"param1": "value1"}'
```

**Expected response:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Automated test:**
```typescript
// tests/api/endpoint.test.ts
import request from 'supertest';
import app from '@/server';

test('POST /api/endpoint works', async () => {
  const response = await request(app)
    .post('/api/endpoint')
    .send({ param1: 'value1' });
  
  expect(response.status).toBe(200);
  expect(response.body.success).toBe(true);
});
```

**Test Results:**
- [ ] ✅ Status code correct
- [ ] ✅ Response format correct
- [ ] ✅ Data matches schema
- [ ] ✅ Error handling works

---

## 9. DATABASE VALIDATION

**For schema changes:**

### Before pushing:
- [ ] Backed up database
- [ ] Tested schema locally
- [ ] Verified no data loss

### Push command:
```bash
npm run db:push
# If data loss warning: npm run db:push --force
```

### Verify:
```bash
# Check tables exist
psql $DATABASE_URL -c "\dt"

# Check columns correct
psql $DATABASE_URL -c "\d table_name"
```

---

## 10. BROWSER TESTING

**Manual verification:**

1. **Open browser DevTools**
2. **Go to Console tab**
3. **Navigate to feature**
4. **Check for errors:**
   - [ ] No red errors
   - [ ] No yellow warnings
   - [ ] Expected debug logs present

**Screenshot:**
- [ ] Captured console with no errors
- [ ] Saved as `console-clean-[feature].png`

---

## 11. SERVER LOG VALIDATION

**Check server logs:**

```bash
# Look for errors in workflow logs
# Expected: Clean logs, no errors

✅ Good:
[INFO] Request received
[INFO] Processing complete
[INFO] Response sent

❌ Bad:
[ERROR] Failed to process
[ERROR] Database connection failed
```

**Log status:**
- [ ] No errors in server logs
- [ ] All expected info logs present
- [ ] Performance acceptable

---

## 12. MITIGATION PHASE CHECKLIST

Before proceeding to DEPLOYMENT, verify:

### Code Quality
- [ ] Unit tests passed (if complex logic)
- [ ] Integration tests passed
- [ ] Diagnostic logs added
- [ ] Code follows patterns

### Integration
- [ ] Component imported to parent
- [ ] Component rendered in JSX
- [ ] Props passed correctly
- [ ] Events wired up
- [ ] Provider hierarchy correct

### Testing
- [ ] Manual browser test passed
- [ ] Browser console clean
- [ ] Server logs clean
- [ ] API endpoints work
- [ ] Database schema correct

### Evidence
- [ ] Code changes committed to git
- [ ] Test results saved
- [ ] Logs captured
- [ ] Ready for screenshots

---

## 13. EVIDENCE UPLOAD

**Evidence collected:**
```bash
# Upload mitigation evidence
curl -X POST http://localhost:5000/api/mbmd/evidence/upload \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": YOUR_SESSION_ID,
    "phase": "MITIGATION",
    "evidenceType": "test",
    "metadata": {
      "unitTestsPassed": true,
      "integrationTestsPassed": true,
      "consoleClean": true,
      "logsClean": true
    }
  }'
```

---

**MITIGATION PHASE COMPLETE:** ✅  
**Next Phase:** DEPLOYMENT (Evidence Collection + QA Validation)  
**Ready to proceed:** [ ] Yes [ ] No (explain why)
