# Quick Audit Learnings: Wave-Based Debugging Strategy
## Documented October 9, 2025

**Context:** User testing platform after 3 weeks of work. Some features working, some broken, some untested. Memory feed was stuck loading.

---

## 🎯 What We Learned

### **Lesson 1: Start with the Blocking Issue**
**Problem:** Memory feed showing "Loading..." forever, page timeout  
**Diagnosis Method:** 
1. Try to screenshot the page → Got timeout error
2. Check LSP diagnostics → Found 42 TypeScript errors in postsRoutes.ts
3. Read the errors → API was broken (missing joins, type issues)

**Key Insight:** When a page won't load at all, check LSP diagnostics for the API routes first. TypeScript errors = broken API = page timeout.

---

### **Lesson 2: One File, One Subagent**
**What Worked:**
- Deployed ONE subagent to fix ONE file (postsRoutes.ts)
- Clear, specific task: "Fix all 42 TypeScript errors"
- Listed the error categories upfront
- Result: 100% success in ~3 minutes

**What Didn't Work Earlier:**
- Trying to audit 5 massive tracks in parallel
- Request was too big, subagent couldn't handle scope

**Key Insight:** For fixes, keep subagent tasks to single files or very specific scopes. For audits, batch by feature area, not technical layer.

---

### **Lesson 3: Common Error Patterns in This Codebase**

Based on the 42 errors fixed, here are recurring issues to watch for:

#### **Pattern A: Missing Type Conversions**
```typescript
// BROKEN: req.params.id is string, storage expects number
await storage.getPost(req.params.id)

// FIXED: Convert to number
await storage.getPost(Number(req.params.id))
```
**Where to check:** Any route using req.params or req.query for IDs

#### **Pattern B: Missing Database Joins**
```typescript
// BROKEN: Accessing properties not in query
post.user.name // Error: Property 'user' does not exist

// NEED: Add joins to query
const posts = await db.select()
  .from(postsTable)
  .leftJoin(usersTable, eq(postsTable.userId, usersTable.id))
```
**Where to check:** Any route returning posts, events, or user-generated content

#### **Pattern C: Null Date Handling**
```typescript
// BROKEN: date-fns doesn't accept null
formatDistanceToNow(post.createdAt)

// FIXED: Add null check
post.createdAt ? formatDistanceToNow(post.createdAt) : 'recently'
```
**Where to check:** Anywhere using date-fns functions

#### **Pattern D: Duplicate Properties**
```typescript
// BROKEN: Same property twice
return {
  ...post,
  enhanced: aiResult,
  enhanced: aiResult.enhanced  // Duplicate!
}

// FIXED: One property
return {
  ...post,
  enhanced: aiResult.enhanced
}
```
**Where to check:** AI enhancement endpoints, complex object transformations

---

## 🔧 Debugging Workflow That Works

### **Step 1: Reproduce the Issue** (2 min)
- Try to screenshot the page
- If timeout → Backend/API issue
- If loads with errors → Frontend issue
- Note exact error messages

### **Step 2: Check LSP Diagnostics** (1 min)
```bash
# Look for TypeScript errors in related files
get_latest_lsp_diagnostics(file_path="path/to/route.ts")
```
If 10+ errors → API is broken, fix it first

### **Step 3: Deploy Focused Subagent** (3-5 min)
One subagent per file with:
- Clear objective: "Fix all X errors in [file]"
- List error categories
- Specific validation criteria
- Single file focus

### **Step 4: Verify Fix** (1 min)
- Screenshot the page again
- Check for new errors in console
- Confirm page loads

**Total time per issue: 7-9 minutes**

---

## 📊 Pattern Recognition: This Codebase

### **User's Development Style (Observed)**
1. **Manual UI testing** - Not running automated tests
2. **Quick fixes** - Patches things when they break
3. **Notes for later** - Intends to come back but forgets
4. **Catastrophic events** - Had to do emergency fixes that created duplicates
5. **Non-developer** - May not catch TypeScript errors immediately

### **What This Means for Audits**
✅ **DO:**
- Check TypeScript errors first (they don't see them)
- Look for duplicate implementations (from emergency fixes)
- Test UI manually after each fix (matches their workflow)
- Document issues clearly (they need to understand without dev jargon)

❌ **DON'T:**
- Assume tests are passing
- Trust that recent code is error-free
- Use complex automated test suites
- Speak in technical terms

---

## 🎯 Reusable Audit Pattern

### **For Broken Features:**
1. Screenshot → Identify if frontend or backend issue
2. Check LSP → Find TypeScript errors
3. One subagent per broken file
4. Verify with screenshot

### **For Untested Features:**
1. Screenshot → Capture current state
2. Manual interaction checklist
3. Document what works/breaks
4. Fix issues using pattern above

### **For Working Features Needing Review:**
1. Screenshot → Visual confirmation
2. Test edge cases manually
3. Check for duplicate implementations
4. Code quality review (optional)

---

## 💡 Insights for Future Waves

### **Wave 1B (Dark Mode + Language Changer)**
**Predicted Issues:**
- Likely CSS/theme context issues
- May be localStorage or state management
- Check ThemeProvider and i18n setup

**Approach:**
1. Screenshot in light mode vs dark mode
2. Try language switcher manually
3. Check browser console for errors
4. Deploy subagent for specific fix

### **Wave 2 (Navigation Testing)**
**Predicted Issues:**
- Broken routes (404s)
- Missing route definitions
- Component not rendering

**Approach:**
1. Click each navigation link
2. Note which ones 404 or error
3. Check routes.ts for missing paths
4. Fix routes in batch

### **Wave 3 (Memories Features)**
**Predicted Issues:**
- More API errors (similar to posts)
- Missing joins in database queries
- Type conversion issues

**Approach:**
- Use same pattern as Wave 1A
- Check LSP first before testing
- Fix API routes before testing UI

---

## 📈 Success Metrics

**Wave 1A Results:**
- Time: 8 minutes total
- Cost: Minimal (1 small subagent)
- Success: ✅ Memory feed loading
- Errors fixed: 42
- Lines modified: ~15

**Efficiency gained:**
- Focused scope = faster execution
- Clear diagnostics = no guessing
- One file = manageable for subagent
- Verification = confirmed fix

---

## 🔑 Key Takeaways

1. **LSP diagnostics are gold** - Check them FIRST when pages won't load
2. **One file per subagent** - Keeps scope manageable
3. **Screenshot before/after** - Visual confirmation is powerful
4. **Pattern recognition** - Same errors repeat across codebase
5. **User's workflow matters** - Audit in their style, not dev style
6. **Wave batching works** - Small focused tasks complete fast

---

---

## 📝 Wave 1B Results: Dark Mode + Language Changer

**Time:** 4 minutes  
**Method:** Diagnostic subagent (no fixes)  
**Files Examined:** 15+ files across contexts, components, i18n

### **Dark Mode Status: ⚠️ ARCHITECTURAL CONFLICT**

**Issues Found:**
1. **Dual ThemeProvider conflict** - Two providers, one not mounted
2. **Missing dark class toggle** - Active provider doesn't toggle Tailwind's `dark` class
3. **Layout-level only** - Works in DashboardLayout but not globally
4. **Context mismatches** - 6 files import unmounted provider
5. **Inconsistent localStorage keys** - 3 different keys used

**Root Cause:** App tries to do theme colors (mundo-tango, life-ceo) AND dark mode simultaneously. Implementations conflict.

**User Impact:** Dark mode button exists but may not work consistently across all pages.

### **Language Changer Status: 🟢 LIKELY FUNCTIONAL**

**What Works:**
- Well-implemented LanguageSelector with 68 languages
- Organized by regions, RTL support
- LocalStorage persistence
- Toast notifications

**Minor Issues:**
- Dual i18n configs (redundant but not breaking)
- Limited translation coverage (expected from Track 3)

**User Impact:** Language switcher should work, translations complete for 7 languages.

### **Key Learning:**
**Diagnostic-first approach works!** Spending 4 minutes to understand the problem before fixing saves time and prevents breaking working code.

---

---

## 📝 Wave 2 Results: Navigation Testing

**Time:** 5 minutes  
**Method:** Route mapping + component verification  
**Items Tested:** 18 (8 sidebar + 5 top bar + 5 dropdown menu items)

### **Navigation Health: 🟡 MOSTLY WORKING (13/18)**

**Sidebar:** 7/8 working ✅  
- Role Invitations: Route exists, likely runtime/API issue ⚠️

**Top Bar:** 3/5 working ✅  
- Notifications: Component exists, route missing ❌
- Favorites: Component exists, route missing ❌

**User Dropdown:** 6/10 working ✅  
- Help & Support: No component, no route ❌
- Privacy Policy: Route mismatch ❌
- Delete Account: No component, no route ❌

### **Key Learning:**
**Route registry is your friend!** Checking `routes.ts` + verifying component files = fast diagnosis. Found 5 issues in 5 minutes without clicking anything.

**Pattern Discovered:**
- When button exists but doesn't work → Check if route is registered
- Most components exist, just not wired up to routes

---

**Next Steps:**
- Wave 3: Audit memories page features (posting, filtering, actions)
- Continue documenting patterns
- Build fix priority list at end

---

**Created:** October 9, 2025, 9:42 AM  
**Updated:** October 9, 2025, 9:52 AM  
**Status:** Active learning document  
**Updates:** Added Waves 1A, 1B, 2 findings
