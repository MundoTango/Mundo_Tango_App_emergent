# Visual Editor Not Rendering - Root Cause Analysis
## October 22, 2025

### 🚨 CRITICAL BUG: URL Encoding Issue

**Symptom**: Visual Editor doesn't show when navigating to `/?edit=true`  
**Expected**: Right sidebar with tab system appears  
**Actual**: Completely blank page

---

### 🔍 ROOT CAUSE

**Problem**: URL query parameter is being DOUBLE-ENCODED

**Evidence from Screenshot**:
```
Expected URL:  /?edit=true
Actual URL:    /%3Fedit=true
                   ↑↑
                 %3F is URL-encoded "?"
```

**Why This Breaks**:
```javascript
// VisualEditorWrapper.tsx line 67-69
const urlParams = new URLSearchParams(window.location.search);
const editMode = urlParams.get('edit') === 'true';
```

When URL is `/%3Fedit=true`:
- `window.location.search` = `` (empty, no query string detected)
- `urlParams.get('edit')` = `null`
- `editMode` = `false`
- Visual Editor never activates

---

### 📊 CHAIN OF FAILURES

1. **User clicks link** with `?edit=true`
2. **Link gets double-encoded** → `%3Fedit=true`
3. **Browser treats it as PATH** not query string
4. **VisualEditorWrapper checks** `window.location.search`
5. **Search string is empty** (no `?` found)
6. **`editMode` stays false** → sidebar never renders
7. **Page shows blank** (children=null from App.tsx line 751)

---

### 🎯 SECONDARY ISSUES DISCOVERED

#### Issue #1: Missing Inspector Tab Rendering Case
**Problem**: TabSystem defines 'inspector' tab, VisualEditorWrapper has no rendering case  
**Impact**: If user manages to open editor and clicks Inspector tab → blank  
**Status**: ✅ FIXED (added ElementInspector rendering case)

#### Issue #2: Children Prop is Null
**Problem**: App.tsx line 751: `<VisualEditorWrapper children={null} />`  
**Impact**: No page content rendered inside editor  
**Status**: ⚠️ NEEDS INVESTIGATION (should wrap actual page content)

---

### 🔧 FIXES NEEDED

#### Fix #1: URL Encoding (HIGH PRIORITY)
**File**: Wherever the `?edit=true` link is generated  
**Find**: Code that creates the edit mode URL  
**Fix**: Ensure proper URL construction:
```typescript
// WRONG
const url = `${path}?edit=true`; // Gets double-encoded

// RIGHT  
const url = new URL(window.location.href);
url.searchParams.set('edit', 'true');
window.location.href = url.toString();
```

#### Fix #2: Add Defensive URL Parsing
**File**: `client/src/components/visual-editor/VisualEditorWrapper.tsx`  
**Current**:
```typescript
const urlParams = new URLSearchParams(window.location.search);
const editMode = urlParams.get('edit') === 'true';
```

**Better**:
```typescript
// Try query string first
let editMode = new URLSearchParams(window.location.search).get('edit') === 'true';

// Fallback: Check if %3Fedit=true is in pathname (double-encoded)
if (!editMode && window.location.pathname.includes('%3Fedit=true')) {
  editMode = true;
  console.warn('⚠️ URL double-encoded detected, fixing...');
  
  // Fix the URL
  const url = new URL(window.location.href);
  url.searchParams.set('edit', 'true');
  window.history.replaceState({}, '', url);
}
```

#### Fix #3: Children Prop (MEDIUM PRIORITY)
**File**: `client/src/App.tsx` line 751  
**Investigation Needed**: Should VisualEditorWrapper wrap page content or render alongside it?

---

### 📸 VERIFICATION CHECKLIST

After fixing:
- [ ] Navigate to `/?edit=true` (manually type in browser)
- [ ] Verify URL shows `/?edit=true` NOT `/%3Fedit=true`
- [ ] Verify Visual Editor sidebar appears on right
- [ ] Verify all 11 tabs clickable
- [ ] Click Inspector tab → verify ElementInspector shows
- [ ] Click Models tab → verify ModelMonitorTab shows
- [ ] Take screenshot of working editor

---

### 🎓 MB.MD LEARNINGS

**Violation**: MB.MD Rule #3 (Screenshot Everything)  
**What Happened**: Agent claimed "files exist, routes registered" without visual proof  
**Impact**: Shipped broken feature - URL encoding bug not discovered

**Prevention**: MANDATORY screenshot showing:
1. Feature in action
2. URL bar visible
3. User-facing result

---

### 🚀 NEXT STEPS

1. **FIND** where `?edit=true` link is generated (Visual Editor tab button, Mr Blue command, etc.)
2. **FIX** URL construction to prevent double-encoding
3. **ADD** defensive parsing in VisualEditorWrapper
4. **TEST** by clicking the link that triggers edit mode
5. **SCREENSHOT** working Visual Editor sidebar
6. **VERIFY** all tabs render correctly

---

**Status**: 🔴 BLOCKED - Need to find URL generation source  
**Priority**: P0 - Critical user-facing bug  
**Assignee**: Next agent in chain  
