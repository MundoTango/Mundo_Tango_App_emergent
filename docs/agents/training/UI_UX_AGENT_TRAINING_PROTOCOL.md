# 🧪 MANDATORY TESTING PROTOCOL

**Applies to:** ALL agents (105+)  
**Enforcement:** BLOCKING - No task completion without evidence  
**Updated:** October 24, 2025 (Week 1 Rollout)

---

## THE 4 MANDATORY CHECKPOINTS

Every agent MUST follow these checkpoints before marking any task complete:

### ✅ CHECKPOINT 1: DATA INSPECTION
**Rule:** NEVER assume data structures. Always inspect first.
```typescript
console.log('🔍 DATA INSPECTION:', JSON.stringify(data, null, 2));
// Run it, see the output, THEN write conditional
```

### ✅ CHECKPOINT 2: UNIT TESTING  
**Rule:** Test individual functions in isolation.
- Test regex patterns with sample inputs
- Verify IF conditions with actual data
- Validate file operations with dummy files

### ✅ CHECKPOINT 3: INTEGRATION TESTING
**Rule:** Test the FULL user journey end-to-end.
- Run complete flow as user would
- Check server logs for errors
- Screenshot successful execution

### ✅ CHECKPOINT 4: ARCHITECT REVIEW
**Rule:** Architect reviews BEHAVIOR, not just code.
- Proof it runs (screenshot)
- Proof it works (before/after)
- Proof no crashes (logs)

**Full documentation:** `docs/TESTING_REQUIREMENTS_MANDATORY.md`

---

---

# UI/UX Agent Training Protocol
## The 7 Commandments for Building Accessible, Beautiful Interfaces

**Version:** 1.0  
**Created:** October 21, 2025  
**Purpose:** Ensure ALL UI/UX agents follow accessibility best practices  
**Scope:** Tracks G-I implementation reference for future agents

---

## 📖 The 7 Commandments

### 1. **THOU SHALT LABEL ALL INTERACTIVE ELEMENTS**
Every button, input, link, and interactive element MUST have:
- `aria-label` describing its purpose
- `data-testid` for automated testing
- Descriptive text or icon with `aria-hidden="true"` on decorative icons

**✅ GOOD:**
```tsx
<Button
  onClick={handleSave}
  aria-label="Save changes"
  data-testid="button-save"
>
  <Save className="h-4 w-4" aria-hidden="true" />
  Save
</Button>
```

**❌ BAD:**
```tsx
<Button onClick={handleSave}>
  <Save className="h-4 w-4" />
</Button>
```

---

### 2. **THOU SHALT PROVIDE KEYBOARD NAVIGATION**
All functionality accessible via mouse MUST work via keyboard:
- Tab navigation through focusable elements
- Enter/Space to activate buttons
- Arrow keys for lists/menus
- Escape to close modals/dropdowns
- Global shortcuts documented in UI (e.g., "Ctrl+K to focus")

**Implementation:**
```tsx
React.useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      inputRef.current?.focus();
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

---

### 3. **THOU SHALT MAKE FOCUS VISIBLE**
Users navigating via keyboard MUST see where they are:
- `focus:ring-2 focus:ring-cyan-500 focus:outline-none` on ALL interactive elements
- High contrast focus indicators (WCAG AA: 3:1 contrast ratio minimum)
- Never use `outline: none` without alternative focus indicator

**Example:**
```tsx
className="focus:ring-2 focus:ring-cyan-500 focus:outline-none"
```

---

### 4. **THOU SHALT RESPECT USER MOTION PREFERENCES**
Honor `prefers-reduced-motion` for users with vestibular disorders:
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

### 5. **THOU SHALT USE SEMANTIC HTML & ARIA**
Proper landmark regions and roles help screen readers:
- `<main>`, `<nav>`, `<aside>`, `<article>`, `<section>`
- `role="complementary"`, `role="region"`, `role="log"`
- `aria-live="polite"` for dynamic updates
- `aria-describedby` to link hints to inputs

**Example:**
```tsx
<div role="region" aria-label="Chat conversation">
  <div role="log" aria-live="polite" aria-label="Chat messages">
    {messages.map(...)}
  </div>
</div>
```

---

### 6. **THOU SHALT BUILD MOBILE-FIRST**
Design for 375px width first, then enhance for desktop:
- Use `flex-col md:flex-row` for responsive layouts
- Touch-friendly target sizes (minimum 44×44px per WCAG)
- Hide sidebars on mobile: `hidden md:flex`
- Test at 375px, 768px, 1024px, 1920px

**Responsive Pattern:**
```tsx
<div className="flex flex-col md:flex-row">
  <aside className="hidden md:flex md:w-64">Sidebar</aside>
  <main className="flex-1">Content</main>
</div>
```

---

### 7. **THOU SHALT PROVIDE SCREEN READER CONTEXT**
Help non-visual users understand the page structure:
- Hidden hints: `<span className="sr-only">Instructions</span>`
- Status updates: `role="status"` for loading states
- Current page indicator: `aria-current="page"`
- Icon-only buttons: `aria-label` describing action

**Example:**
```tsx
<Textarea
  aria-label="Chat input"
  aria-describedby="keyboard-hint"
  placeholder="Ask anything..."
/>
<span id="keyboard-hint" className="sr-only">
  Press Ctrl+K to focus, Enter to send, Shift+Enter for new line
</span>
```

---

## 🎯 Implementation Checklist

Before marking ANY UI/UX task complete, verify:

- [ ] All buttons have `aria-label` and `data-testid`
- [ ] All inputs have `aria-label` and `aria-describedby`
- [ ] Keyboard shortcuts work (Ctrl+K, Esc, Tab, Enter)
- [ ] Focus indicators visible on ALL interactive elements
- [ ] Reduced motion support added to CSS
- [ ] Mobile responsive (test at 375px width)
- [ ] Screen reader announcements for dynamic updates
- [ ] Semantic HTML roles (`main`, `region`, `complementary`)
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Touch targets minimum 44×44px

---

## 📚 Reference Implementations

All examples reference: `client/src/components/mrBlue/MrBlueComplete.tsx`

### Track G (Accessibility)

**Keyboard Shortcuts (Lines 184-197):**
```typescript
React.useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      document.querySelector<HTMLTextAreaElement>('[aria-label="Chat input"]')?.focus();
    }
    if (e.key === 'Escape') {
      document.querySelector<HTMLTextAreaElement>('[aria-label="Chat input"]')?.blur();
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

**Semantic HTML Roles (Lines 200-202):**
```tsx
<div role="main" aria-label="Mr Blue AI Chat">
  <div role="complementary" aria-label="Conversation history">
```

**Focus Indicators (Line 240):**
```tsx
className="focus:ring-2 focus:ring-cyan-500 focus:outline-none"
```

**ARIA Labels for Buttons (Lines 245-247):**
```tsx
aria-label={`Select conversation: ${conv.title || 'Untitled Chat'}`}
aria-current={conversationId === conv.id ? 'page' : undefined}
```

**Screen Reader Hints (Lines 327-331):**
```tsx
<Textarea
  aria-label="Chat input"
  aria-describedby="keyboard-hint"
/>
<span id="keyboard-hint" className="sr-only">
  Press Ctrl+K to focus this input, Enter to send, Shift+Enter for new line
</span>
```

**Radiogroup Pattern (Lines 267-282):**
```tsx
<div role="radiogroup" aria-labelledby="model-selector-label">
  <Button
    role="radio"
    aria-checked={selectedModel === model}
    aria-label="Select GPT-4o model"
  >
```

### Track H (Mobile) - MrBlueComplete.tsx

**Responsive Layout (Line 200):**
```tsx
<div className="flex flex-col md:flex-row h-full">
```

**Mobile Sidebar Drawer (Lines 199-209):**
```tsx
const [isSidebarOpen, setIsSidebarOpen] = useState(false);

{isSidebarOpen && (
  <div className="fixed inset-0 bg-black/50 z-40 md:hidden" 
       onClick={() => setIsSidebarOpen(false)} />
)}
<div className={`${isSidebarOpen ? 'fixed inset-y-0 left-0 z-50' : 'hidden'} 
                 md:relative md:flex md:w-64`}>
```

**Mobile Menu Toggle (Lines 270-279):**
```tsx
<Button
  className="md:hidden min-h-[44px] min-w-[44px]"
  aria-label="Toggle conversation list"
>
  <MessageSquare />
</Button>
```

**Touch-Friendly Sizes (Line 285):**
```tsx
className="min-h-[44px] px-3"  // 44px minimum per WCAG
```

### Track H (Reduced Motion) - index.css

**Lines 79-88:**
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### Track I (Documentation)
This file serves as the comprehensive reference for all future UI/UX agent work.

---

## 🗂️ Commandment → Code Traceability Matrix

### Commandment 1: THOU SHALT LABEL ALL INTERACTIVE ELEMENTS
**Implementation:** `client/src/components/mrBlue/MrBlueComplete.tsx`
- **Line 232:** `aria-label="Create new conversation"` on New Chat button
- **Line 250:** `aria-label="Select conversation: ${conv.title}"` on conversation buttons
- **Line 277:** `aria-label="Toggle conversation list"` on mobile menu toggle
- **Line 295:** `aria-label="Select GPT-4o model"` on model selector buttons
- **Line 343:** `aria-label="Chat input"` on textarea
- **Line 352:** `aria-label="Send message"` on send button

### Commandment 2: THOU SHALT PROVIDE KEYBOARD NAVIGATION
**Implementation:** `client/src/components/mrBlue/MrBlueComplete.tsx`
- **Lines 186-198:** Global keyboard shortcuts (Ctrl+K focus, Esc blur)
- **Line 338:** Enter key to send message
- **Line 245:** Focus ring on all interactive elements
- **Line 277:** Tab navigation through buttons

### Commandment 3: THOU SHALT MAKE FOCUS VISIBLE
**Implementation:** `client/src/components/mrBlue/MrBlueComplete.tsx`
- **Line 245:** `focus:ring-2 focus:ring-cyan-500 focus:outline-none` on conversation buttons
- **Line 291:** `focus:ring-2 focus:ring-cyan-500` on model selector buttons
- **Line 340:** `focus:ring-2 focus:ring-cyan-500` on chat input
- **Line 353:** `focus:ring-2 focus:ring-cyan-500` on send button

### Commandment 4: THOU SHALT RESPECT USER MOTION PREFERENCES
**Implementation:** `client/src/index.css`
- **Lines 79-88:** `@media (prefers-reduced-motion: reduce)` disables animations
- Reduces animation-duration to 0.01ms
- Disables scroll-behavior for users with vestibular disorders

### Commandment 5: THOU SHALT USE SEMANTIC HTML & ARIA
**Implementation:** `client/src/components/mrBlue/MrBlueComplete.tsx`
- **Line 201:** `role="main"` on root container
- **Line 207:** `role="complementary"` on sidebar
- **Line 267:** `role="region"` on chat area
- **Line 269:** `role="toolbar"` on model selector
- **Line 283:** `role="radiogroup"` on model buttons
- **Line 293:** `role="radio"` on individual model buttons
- **Line 303:** `role="log" aria-live="polite"` on message container
- **Line 288:** `role="status"` on welcome card

### Commandment 6: THOU SHALT BUILD MOBILE-FIRST
**Implementation:** `client/src/components/mrBlue/MrBlueComplete.tsx`
- **Line 47:** `isSidebarOpen` state for mobile drawer
- **Line 201:** `flex-col md:flex-row` responsive layout
- **Line 203-205:** Mobile overlay pattern
- **Line 207:** `hidden md:flex` sidebar visibility
- **Line 229:** `min-h-[44px]` touch-friendly New Chat button
- **Line 245:** `min-h-[44px]` touch-friendly conversation buttons
- **Line 272-281:** Mobile menu toggle (44×44px)
- **Line 291:** `min-h-[44px]` touch-friendly model selector
- **Line 353:** `min-h-[44px] min-w-[44px]` touch-friendly send button

### Commandment 7: THOU SHALT PROVIDE SCREEN READER CONTEXT
**Implementation:** `client/src/components/mrBlue/MrBlueComplete.tsx`
- **Line 201:** `aria-label="Mr Blue AI Chat"` on main container
- **Line 207:** `aria-label="Conversation history"` on sidebar
- **Line 251:** `aria-current="page"` on active conversation
- **Line 267:** `aria-label="Chat conversation"` on chat area
- **Line 282:** `id="model-selector-label"` label for radiogroup
- **Line 303:** `aria-label="Chat messages"` on message log
- **Line 345:** `aria-describedby="keyboard-hint"` on input
- **Line 348:** `sr-only` hint text for keyboard shortcuts

---

## 🚨 Common Mistakes to Avoid

1. **Icon-only buttons without labels** ❌
   - Always add `aria-label` describing the action

2. **Decorative icons not marked** ❌
   - Add `aria-hidden="true"` to prevent screen reader confusion

3. **Focus style removed without replacement** ❌
   - Use `focus:ring-2` instead of `outline: none`

4. **Dynamic content without announcements** ❌
   - Use `aria-live="polite"` for non-critical updates

5. **Mobile-unfriendly layouts** ❌
   - Test at 375px width, hide sidebars, stack vertically

---

## 🎓 Further Reading

- **WCAG 2.1 Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Authoring Practices:** https://www.w3.org/WAI/ARIA/apg/
- **WebAIM Checklist:** https://webaim.org/standards/wcag/checklist
- **Inclusive Components:** https://inclusive-components.design/

---

**Remember:** Accessibility is not optional. Every user deserves a great experience, regardless of how they access your application. These 7 commandments ensure that Mr Blue AI and all Mundo Tango features are usable by everyone.
