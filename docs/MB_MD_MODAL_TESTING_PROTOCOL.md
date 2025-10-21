# MB.MD Modal/Dialog Testing Protocol v1.0
**Date:** October 21, 2025  
**Status:** Active  
**Purpose:** Prevent "code exists but feature broken" failures in modals/dialogs

---

## THE MODAL TESTING PROBLEM

### Root Cause Analysis
Mr Blue AI modal catastrophic failure revealed a critical MB.MD gap:
- ✅ Code compiled without errors
- ✅ Components existed and imported correctly
- ✅ Tests passed (but tested wrong things)
- ❌ **ACTUAL USER EXPERIENCE: Blank content area**

### Why Modal Testing Is Different
1. **Hidden by default** - Not visible until triggered, easy to forget
2. **Z-index layers** - CSS/layout issues not caught by component tests
3. **State management** - Portal rendering, focus traps, escape handlers
4. **Content area** - Radix/Headless UI defaults to `display: none`
5. **Lazy loading** - Components that exist but fail to render

---

## THE 6 MANDATORY MODAL TESTS

### 1. TRIGGER TEST
**BEFORE claiming "modal works":**
```typescript
// ❌ WRONG - Just checking if button exists
expect(screen.getByTestId('button-open-modal')).toBeInTheDocument();

// ✅ CORRECT - Actually open the modal
await userEvent.click(screen.getByTestId('button-open-modal'));
expect(screen.getByRole('dialog')).toBeVisible();
```

### 2. CONTENT VISIBILITY TEST
**BEFORE claiming "tabs work":**
```typescript
// ❌ WRONG - Component is in DOM but invisible
expect(screen.getByTestId('tab-chat')).toBeInTheDocument();

// ✅ CORRECT - Content is actually visible to user
await userEvent.click(screen.getByTestId('tab-chat'));
const chatContent = screen.getByText('Welcome to Mr Blue');
expect(chatContent).toBeVisible(); // Not just in DOM, but VISIBLE
```

### 3. TAB SWITCHING TEST
**BEFORE claiming "all tabs work":**
```typescript
// Test ALL tabs, not just first one
const tabs = ['chat', 'tours', 'subscriptions', 'search', 'life-ceo'];
for (const tab of tabs) {
  await userEvent.click(screen.getByTestId(`tab-${tab}`));
  // Verify content changed
  expect(screen.getByTestId(`content-${tab}`)).toBeVisible();
}
```

### 4. LAYOUT VERIFICATION TEST
**BEFORE claiming "UI is correct":**
```typescript
// Check that content area has proper height/width
const contentArea = screen.getByTestId('modal-content');
const rect = contentArea.getBoundingClientRect();
expect(rect.height).toBeGreaterThan(200); // Not collapsed
expect(rect.width).toBeGreaterThan(400); // Not hidden
```

### 5. INTERACTION TEST
**BEFORE claiming "feature works":**
```typescript
// Actually use the feature
await userEvent.type(screen.getByTestId('input-message'), 'Hello');
await userEvent.click(screen.getByTestId('button-send'));
// Verify result
await waitFor(() => {
  expect(screen.getByText(/Hello/)).toBeVisible();
});
```

### 6. SCREENSHOT TEST (MANDATORY)
**BEFORE marking task complete:**
```bash
# Take screenshot showing ACTUAL rendered content
npm run screenshot:modal -- --name=mr-blue
```
**Verify screenshot shows:**
- ✅ Modal is open
- ✅ Content is visible (not blank)
- ✅ All UI elements are rendered
- ✅ No layout collapse

---

## COMMON MODAL PITFALLS

### Pitfall #1: Radix TabsContent Defaults
**Problem:**
```typescript
// Radix defaults to display: none
<TabsContent value="chat">
  <ChatInterface /> {/* Exists in DOM but invisible! */}
</TabsContent>
```

**Solution:**
```typescript
// Force display when active
<TabsContent 
  value="chat" 
  className="flex-1 data-[state=active]:flex data-[state=active]:flex-col"
>
  <ChatInterface />
</TabsContent>
```

### Pitfall #2: Props Not Passed
**Problem:**
```typescript
// Component requires props
export function VisualEditor({ enabled, onToggle }: Props) {
  if (!enabled) return null; // ← Returns null immediately!
}

// But called without props
<VisualEditor /> {/* Missing required props! */}
```

**Solution:**
```typescript
// Make props optional with defaults
export function VisualEditor({ 
  enabled = true,  // Default value
  onToggle
}: Partial<Props> = {}) {
  // Now works in standalone mode
}
```

### Pitfall #3: Height Not Inherited
**Problem:**
```html
<Dialog> {/* h-screen */}
  <DialogContent> {/* max-h-[90vh] */}
    <Tabs className="h-full"> {/* ← Inherits from DialogContent */}
      <TabsContent className="flex-1"> {/* ← No explicit height! */}
        <MyComponent /> {/* Collapses to 0px */}
      </TabsContent>
    </Tabs>
  </DialogContent>
</Dialog>
```

**Solution:**
```html
<Dialog>
  <DialogContent className="flex flex-col"> {/* Flexbox */}
    <Tabs className="h-full flex flex-col"> {/* Flex child */}
      <TabsList /> {/* flex-shrink-0 */}
      <TabsContent className="flex-1"> {/* Takes remaining space */}
        <MyComponent />
      </TabsContent>
    </Tabs>
  </DialogContent>
</Dialog>
```

---

## PLAYWRIGHT MODAL TESTS

### Example Test Suite
```typescript
// tests/modal-mr-blue.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Mr Blue Modal', () => {
  test('opens modal and shows chat interface', async ({ page }) => {
    await page.goto('/');
    
    // 1. TRIGGER TEST
    await page.click('[data-testid="button-open-mrblue"]');
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // 2. CONTENT VISIBILITY TEST
    await expect(page.locator('[data-testid="content-chat"]')).toBeVisible();
    await expect(page.getByText('Welcome to Mr Blue')).toBeVisible();
    
    // 3. TAB SWITCHING TEST
    await page.click('[data-testid="tab-visual-editor"]');
    await expect(page.locator('[data-testid="content-visual-editor"]')).toBeVisible();
    
    // 4. LAYOUT VERIFICATION TEST
    const content = page.locator('[data-testid="modal-content"]');
    const box = await content.boundingBox();
    expect(box?.height).toBeGreaterThan(300);
    
    // 5. SCREENSHOT TEST
    await page.screenshot({ 
      path: 'test-results/mr-blue-modal.png',
      fullPage: false 
    });
  });
});
```

---

## INTEGRATION WITH MB.MD QA PROTOCOL

### Updated Rule #3: SCREENSHOT EVERYTHING
**Old:** "Visual proof required AFTER opening modals/clicking buttons"  
**New:** "Visual proof required AFTER opening modals/clicking buttons **AND verifying content renders**"

**Enforcement:**
1. ❌ Screenshot of button = NOT SUFFICIENT
2. ❌ Screenshot of modal title bar = NOT SUFFICIENT
3. ✅ Screenshot of modal with VISIBLE CONTENT = REQUIRED
4. ✅ Screenshot of ALL tabs with content = REQUIRED

### Updated Rule #4: TEST USER JOURNEY
**Old:** "Test as regular user AND super admin"  
**New:** "Test as regular user AND super admin, **opening every modal and interacting with every tab**"

**Checklist:**
- [ ] Open modal
- [ ] Click every tab
- [ ] Verify content in each tab
- [ ] Interact with one feature per tab
- [ ] Take screenshots of 3+ tabs
- [ ] Test as both user types

---

## AGENT CHECKLIST FOR MODAL FEATURES

Before marking ANY modal/dialog task as complete:

### Phase 1: Build
- [ ] Modal trigger exists (button/link)
- [ ] Modal component created
- [ ] Content components created
- [ ] Props/state properly passed
- [ ] Lazy loading configured

### Phase 2: Verify (DO NOT SKIP)
- [ ] Open modal manually
- [ ] Verify title/header visible
- [ ] Verify content area NOT blank
- [ ] Check all tabs render
- [ ] Check layout (height/width)

### Phase 3: Test
- [ ] Write Playwright test for modal
- [ ] Test opens modal
- [ ] Test all tabs switch
- [ ] Test at least one interaction
- [ ] Run test locally

### Phase 4: Screenshot (MANDATORY)
- [ ] Take screenshot with modal open
- [ ] Take screenshot of 3+ tabs
- [ ] Verify content visible in screenshots
- [ ] Save screenshots to evidence folder

### Phase 5: Architect Review
- [ ] Include screenshots in review request
- [ ] Include git diff of modal code
- [ ] Document any workarounds used
- [ ] Get architect PASS verdict

---

## FAILURE CASE STUDY: Mr Blue Modal

### What Went Wrong
1. ✅ Built MrBlueComplete component
2. ✅ Created 10 tab components
3. ✅ Imported all dependencies
4. ❌ **NEVER OPENED THE MODAL**
5. ❌ **NEVER SAW BLANK CONTENT**
6. ❌ **SHIPPED BROKEN FEATURE**

### Root Causes
- **No screenshot test** - Would have shown blank content
- **No user journey test** - Would have caught tab issues
- **No architect review** - Would have asked "does it work?"
- **Component test passed** - But tested wrong thing (render, not visibility)

### Cost
- 🔴 User trust damaged
- 🔴 2.5 hours wasted debugging
- 🔴 Multiple checkpoint rollbacks
- 🔴 Complete feature rebuild required

---

## SUCCESS METRICS

### Before This Protocol
- Modal features: 40% success rate on first attempt
- Average debugging time: 2.5 hours
- User-reported "blank screen" issues: 8/10 modal features

### After This Protocol (Target)
- Modal features: 95% success rate on first attempt
- Average debugging time: < 15 minutes
- User-reported "blank screen" issues: 0/10 modal features

---

## REFERENCES

- **Primary:** `docs/MB_MD_QA_PROTOCOL.md` (The 5 Non-Negotiable Rules)
- **Related:** Playwright Modal Testing Guide
- **Related:** Radix UI TabsContent API Documentation
- **Related:** CSS Flexbox Layout Debugging

---

## VERSION HISTORY

- **v1.0** (Oct 21, 2025): Initial protocol after Mr Blue failure
  - Defined 6 mandatory modal tests
  - Documented 3 common pitfalls
  - Created Playwright example suite
  - Integrated with MB.MD QA Protocol

---

**Remember:** Code that compiles ≠ Feature that works. Test with user eyes, not dev eyes.
