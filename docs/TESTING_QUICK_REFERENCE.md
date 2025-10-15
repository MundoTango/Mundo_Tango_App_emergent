# UI/UX Testing Quick Reference Card

**For:** All 125 ESA Agents  
**When:** Any UI/UX feature work  
**Based on:** Mr Blue AI Bug Fix Pattern

---

## 🚀 The 6-Step Journey (Quick Version)

```
1. REPRODUCE & DOCUMENT
   → Click it yourself
   → Capture error (console + screenshot)
   → Write: "Expected X, got Y"

2. 5-TRACK PARALLEL RESEARCH
   → Track 1: Console (check browser + server logs)
   → Track 2: Dependencies (trace the flow)
   → Track 3: Config (API endpoints, env vars)
   → Track 4: User State (localStorage, auth)
   → Track 5: Integration (third-party APIs)

3. FIX INCREMENTALLY
   → Fix one bug
   → Test
   → Repeat until working

4. HANDLE EDGE CASES
   → New users
   → Existing users
   → Logged in/out
   → All pages
   → Error states

5. WRITE 8 FUNCTIONAL TESTS
   ✅ Feature works
   ✅ Multi-page support
   ✅ Context-aware
   ✅ Performance <15s
   ✅ Multiple interactions
   ✅ Error handling
   ✅ Auth states
   ✅ Learning integration

6. DEPLOY AUTONOMOUS TESTING
   → Hourly validation
   → Reports to Component Learning History
   → Escalates to Agent #79 if >20% fail
   → Shares with Agent #80
```

---

## ✅ Pre-Work Checklist

Before touching code:

- [ ] 5-Track research planned
- [ ] Test scenarios identified
- [ ] Edge cases listed
- [ ] Testing strategy documented

---

## 📝 Required Deliverables

- [ ] `/tests/e2e/[feature]/functional-validation.spec.ts` (8+ tests)
- [ ] `/tests/[feature]/autonomous-test-runner.ts` (hourly validation)
- [ ] `/docs/[FEATURE]_BUG_FIX_COMPLETE.md` (full documentation)
- [ ] Replit.md updated (Recent Changes)
- [ ] Component Learning History updated

---

## 🎯 Key Principle

**Tests must USE the feature, not just check if UI exists!**

❌ **BAD:**
```typescript
test('button exists', async ({ page }) => {
  await expect(page.locator('button')).toBeVisible();
});
```

✅ **GOOD:**
```typescript
test('button triggers AI response', async ({ page }) => {
  await page.click('[data-testid="button"]');
  await page.fill('[data-testid="input"]', 'test');
  await page.click('[data-testid="send"]');
  
  const response = await page.waitForSelector('[data-testid="response"]');
  expect(await response.textContent()).toBeTruthy();
});
```

---

## 📊 Quality Gates (All Required)

- [ ] 5-Track research done
- [ ] Fix tested incrementally
- [ ] Edge cases handled
- [ ] 8+ functional tests pass
- [ ] Autonomous runner deployed
- [ ] Learning system updated
- [ ] Documentation complete

**If any is unchecked → NOT COMPLETE!**

---

## 🔗 Full Docs

- **Methodology:** `/docs/STANDARD_UI_TESTING_JOURNEY.md`
- **Protocol:** `/docs/ESA_AGENT_TESTING_PROTOCOL.md`
- **Example:** `/docs/MB_MD_BUG_FIX_COMPLETE_V2.md`

---

**Print this. Pin it. Use it every time.** 📌
