# Chat Middleware Fixes - Oct 23, 2025

## Problem: Chat Working for Messages 1-2, Then 400 Errors

### Symptoms
- First 2 messages work fine (200 OK, 8+ seconds response time)
- Message 3+ fail instantly (400 error in 1ms)
- Request never reaches the router (no `[MULTIMODEL ROUTER]` log)
- Frontend shows optimistic UI (message appears then disappears)

### Root Cause Analysis

**THREE stacked middleware issues** were blocking chat requests with Visual Editor context:

#### 1. `inputLengthValidation` Middleware ✅ FIXED
**File:** `server/middleware/securityEnhancements.ts`
**Issue:** Validates string length max 10,000 chars, but Visual Editor context with element data exceeds this
**Fix:** Added bypass for `/api/multimodel/`, `/api/chat/`, `/api/vibe/`, `/api/ai/` routes

```typescript
// Line 90-96
if (req.path.startsWith('/api/multimodel/') || 
    req.path.startsWith('/api/chat/') || 
    req.path.startsWith('/api/vibe/') || 
    req.path.startsWith('/api/ai/')) {
  return next();
}
```

#### 2. `sanitizeInput` Middleware ✅ FIXED
**File:** `server/middleware/security.ts`
**Issue:** DOMPurify and quote removal corrupted JSON context objects
**Fix:** Added bypass for AI routes that need raw JSON

```typescript
// Line 133-141
if (req.path.startsWith('/api/multimodel/') || 
    req.path.startsWith('/api/chat/') || 
    req.path.startsWith('/api/vibe/') || 
    req.path.startsWith('/api/ai/')) {
  console.log('✅ [Sanitize] Bypassing sanitization for:', req.path);
  return next();
}
```

#### 3. `regexpProtection` Middleware ✅ FIXED
**File:** `server/middleware/securityEnhancements.ts`
**Issue:** Detected XPath selectors (e.g., `/html/body/div/...`) as "potential DoS regex patterns" because they start with `/` and contain multiple `/`
**Fix:** Added bypass for AI routes with XPath selectors

```typescript
// Line 32-38
if (req.path.startsWith('/api/multimodel/') || 
    req.path.startsWith('/api/chat/') || 
    req.path.startsWith('/api/vibe/') || 
    req.path.startsWith('/api/ai/')) {
  return next();
}
```

### Why It Worked for Messages 1-2

**Message 1-2:** No element selected → `selectedElement: undefined` → smaller payload
**Message 3+:** Element selected → full XPath + styles + boundingBox → triggers all 3 middleware issues

### Key Learning for All Agents

**When debugging 400 errors that bypass routing:**
1. Check for middleware rejecting requests BEFORE they reach the router
2. Look for middleware that validates/modifies request bodies
3. AI/chat endpoints need special handling - they send large, structured context objects
4. Always restart server (not just HMR) to load middleware changes

### Testing Protocol
1. Send message without element selection (should work)
2. Select an element in Visual Editor
3. Send message with element context (should now work)
4. Check logs for `✅ [Sanitize] Bypassing` confirmation

### Files Modified
- `server/middleware/security.ts` (sanitizeInput bypass)
- `server/middleware/securityEnhancements.ts` (regexpProtection + inputLengthValidation bypasses)
- `server/routes/chatProjectsRoutes.ts` (context awareness improvements)

### Impact
- ✅ Chat now works consistently with Visual Editor context
- ✅ Element selection data passes through to AI
- ✅ XPath selectors no longer trigger DoS protection
- ✅ Large context payloads no longer rejected

---

## Additional Fix: Context Awareness Improvement

### Problem: AI Didn't Know What Page User Was On

**Symptoms:**
- User asked "what page am I on?"
- AI responded about documentation files (mb.md) instead of the actual webapp page
- AI ignored Visual Editor preview context

### Root Cause
The system prompt WAS sending page context (`previewPath: "/"`, `route: "/admin/visual-editor"`), but:
1. Context was buried at the bottom of the prompt
2. AI was calling `read_documentation` tool and getting confused about what "page" meant
3. Not enough explicit examples showing how to use the context

### Solution ✅
**File:** `server/routes/chatProjectsRoutes.ts` - `buildContextAwarePrompt()` function

**Changes:**
1. **Moved preview path to TOP** of context section with clear heading "WHERE YOU ARE RIGHT NOW"
2. **Added emojis** for visual clarity (📄, 🛠️, ✅, 🎯, 👤, 🔧)
3. **Explicit instructions** to NOT read docs when asked "what page"
4. **Added examples** in dev tool mode:
   - "What page am I on?" → "You're looking at the Homepage (/) in the Visual Editor preview"
   - "Make background red" → search_codebase("HomePage") → "Found it in client/src/pages/Home.tsx"

**Before:**
```typescript
prompt += '\n\n**CONTEXT AWARENESS:**';
if (context.pageName) {
  prompt += `\n- The user is currently on the "${context.pageName}" page`;
}
// ... preview path was buried after user info
if (previewPath) {
  prompt += `\n- **PREVIEW SHOWING:** ${pageName} (${previewPath})`;
}
```

**After:**
```typescript
prompt += '\n\n**🎯 WHERE YOU ARE RIGHT NOW:**';
// Preview path FIRST
if (previewPath) {
  prompt += `\n📄 **YOU ARE LOOKING AT:** The ${pageName} in the Visual Editor preview`;
  prompt += `\n   (URL path: ${previewPath})`;
}
// Tool panel second
if (context.pageName) {
  prompt += `\n🛠️  **TOOL PANEL:** ${context.pageName} (Visual Editor interface)`;
}
// Explicit examples
prompt += `\n- User asks "what page?" → Answer: "You're looking at the Homepage in the Visual Editor preview"`;
prompt += `\n**DO NOT** read documentation files when asked "what page" - use the preview path context above!`;
```

### Key Learnings
1. **Order matters** - Most important context should come FIRST
2. **Be explicit** - Don't assume AI will infer "page" means webapp page vs docs page
3. **Add examples** - Show the AI exactly how to use the context
4. **Visual hierarchy** - Use emojis/formatting to make key info stand out
5. **Negative examples** - Tell AI what NOT to do ("DON'T read docs when asked what page")

---

## Additional Fix #2: Tool Permissions & Element Recognition

### Problem: AI Not Recognizing Selected Element + Tool Permission Errors

**Symptoms:**
- User selected "Share Memories" div in inspector
- AI didn't acknowledge the selection
- GPT-4o getting "Insufficient permissions to execute search_codebase" error
- Only Claude's `read_documentation` tool worked (not useful for code modifications)

### Root Causes
1. **Tool permissions bug:** `ToolExecutor.isSuperAdmin()` checked `user.roles` (plural) but schema has `user.role` (singular)
2. **Weak acknowledgment:** System prompt had "YOUR JOB: ACKNOWLEDGE..." but AI ignored it

### Solutions ✅

#### 1. Fixed Tool Permissions
**File:** `server/services/tools/ToolExecutor.ts`

**Before:**
```typescript
private isSuperAdmin(user: any): boolean {
  if (!user) return false;
  if (user.roles?.includes('super_admin')) return true; // ❌ Wrong field!
  return false;
}
```

**After:**
```typescript
private isSuperAdmin(user: any): boolean {
  if (!user) return false;
  if (user.role === 'super_admin') return true; // ✅ Correct field
  if (user.roles?.includes('super_admin')) return true; // Fallback for arrays
  return false;
}
```

#### 2. Mandatory Element Acknowledgment
**File:** `server/routes/chatProjectsRoutes.ts` - `buildContextAwarePrompt()`

**Before:**
```typescript
prompt += `\n\n**YOUR JOB:**`;
prompt += `\n1. ACKNOWLEDGE the selection in your response: "I see you've selected the <${tag}> element."`;
```

**After:**
```typescript
const textContent = typeof selectedEl === 'object' ? selectedEl.textContent : null;

prompt += `\n\n**⚠️ CRITICAL RULE: ALWAYS start your FIRST response with:**`;
prompt += `\n"I see you selected the '${textContent}' element (the <${tag}>)."`;
prompt += `\n\n**Then immediately:**`;
prompt += `\n- If user asks to modify it → USE search_codebase to find the component`;
prompt += `\n- If just selected → Offer: "Would you like me to change its color, text, layout, or add an icon?"`;
```

### Impact
- ✅ All 3 models (Claude, GPT-4o, Gemini) now have tool access
- ✅ `search_codebase` tool now works for super admins
- ✅ AI now MUST acknowledge selected elements in first response
- ✅ Element text content included in acknowledgment ("Share Memories" not just "div")

### Testing
1. Select an element in Visual Editor (e.g., "Share Memories" div)
2. AI should respond: "I see you selected the 'Share Memories' element (the <div>)."
3. Ask "make this element red"
4. AI should use `search_codebase` to find the HomePage component and explain the file path

### Files Modified
- `server/services/tools/ToolExecutor.ts` (isSuperAdmin field check)
- `server/routes/chatProjectsRoutes.ts` (mandatory element acknowledgment)

---

## Additional Fix #3: Apply Button & "What Element" Questions

### Problem: Apply Button Returns 400 + AI Can't Answer "What Element" Questions

**Symptoms:**
1. Clicking Apply button on code changes → 400 error on `/api/vibe/edit-file`
2. User asks "what element did I select?" → AI calls `read_documentation` tool instead of using the context already in the system prompt

### Root Causes
1. **Field name mismatch:** Frontend sends `{ diff, type }` but backend expects `{ diffContent, editType }`
2. **AI tool abuse:** AI calls unnecessary tools even when the answer is already in the system prompt

### Solutions ✅

#### 1. Fixed Apply Button Field Names
**File:** `client/src/lib/vibeApi.ts` - `applyCodeChange()` function

**Before:**
```typescript
body: {
  filePath,
  diff,      // ❌ Backend expects "diffContent"
  type       // ❌ Backend expects "editType"
}
```

**After:**
```typescript
body: {
  filePath,
  editType: type,       // ✅ Matches backend
  diffContent: diff     // ✅ Matches backend
}
```

#### 2. Explicit "What Element" Instructions
**File:** `server/routes/chatProjectsRoutes.ts` - `buildContextAwarePrompt()`

**Added:**
```typescript
prompt += `\n\n**⚠️ WHEN USER ASKS ABOUT THE ELEMENT:**`;
prompt += `\n- "what element?" or "what did I select?" → Answer directly from context above`;
prompt += `\n- **DO NOT** call read_documentation or search_codebase tools for this - the info is already in this prompt!`;
```

### Impact
- ✅ Apply button now works correctly - applies code changes to files
- ✅ AI answers "what element" questions directly without calling tools
- ✅ Faster responses for simple context questions (no unnecessary tool calls)

### Testing
1. Select an element in Visual Editor
2. Generate a code change via chat
3. Click Apply → should apply successfully
4. Ask "what element did I select?" → AI should answer "You selected the 'Find Events' element (the <div> with class 'flex flex-col...')"

### Files Modified
- `client/src/lib/vibeApi.ts` (Apply button field names)
- `server/routes/chatProjectsRoutes.ts` (element question instructions)
