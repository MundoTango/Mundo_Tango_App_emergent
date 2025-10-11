# Re-Audit Task Extraction - Agent Assignments & Code Links
## Epic MUN-109: Re-Audit Parallel Execution Results

**Date:** October 11, 2025  
**Total Tasks Extracted:** 81 tasks across 7 pages  
**Agent Squads:** 7 specialized teams  
**Estimated Effort:** 72-86 hours total

---

## 📊 Summary by Page

| Page | Score | Tasks | Priority | Effort | Squad Lead |
|------|-------|-------|----------|--------|------------|
| Home Dashboard | 78 | 15 | **HIGHEST** | 10-12h | Agent #52 (Performance) |
| Life CEO | 85 | 14 | High | 16-20h | Agent #10 (Life CEO) |
| Profile | 85 | 13 | High | 14-16h | Agent #51 (Testing) |
| Login | 82 | 12 | High | 6-8h | Agent #54 (Accessibility) |
| Events | 99 | 12 | Medium | 10-12h | Agent #20 (Search) |
| Housing | 88 | 8 | Low | 6-8h | Agent #54 (Accessibility) |
| Memories | 99 | 7 | Low | 4-6h | Agent #17 (UI/UX) |

---

## 🎯 MUN-109-1: Login Page Improvements (12 tasks)

**File:** `client/src/pages/auth/login.tsx`  
**Squad Lead:** Agent #54 (Accessibility)  
**Team:** Agents #53 (i18n), #51 (Testing), #14 (Code Quality)  
**Effort:** 6-8 hours

### Critical (4 tasks)

#### TASK-001: Add Complete Dark Mode Support
- **Agent:** Agent #11 (Aurora Tide Design Expert)
- **Code:** `client/src/pages/auth/login.tsx` lines 49-54
- **Issue:** Background gradients missing dark mode variants
- **Fix:** Add `dark:from-gray-900 dark:via-gray-800 dark:to-gray-900`
- **Acceptance:** All elements have dark mode variants
- **Effort:** 2 hours

#### TASK-002: Replace Card with GlassCard
- **Agent:** Agent #66 (ESLint Enforcer)
- **Code:** `client/src/pages/auth/login.tsx` line 56
- **Issue:** Using plain Card instead of GlassCard
- **Fix:** Import and use `<GlassCard depth={2}>` from `@/components/glass/GlassComponents`
- **Acceptance:** ESLint passes, no plain Card imports
- **Effort:** 1 hour

#### TASK-003: Add ARIA Labels to Remember Me Checkbox
- **Agent:** Agent #54 (Accessibility)
- **Code:** `client/src/pages/auth/login.tsx` lines 116-122
- **Issue:** Missing accessibility labels
- **Fix:** Add `aria-label`, `id`, and `data-testid` attributes
- **Acceptance:** Screen reader announces properly
- **Effort:** 1 hour

#### TASK-004: Implement ARIA Live Region for Form Errors
- **Agent:** Agent #54 (Accessibility)
- **Code:** `client/src/pages/auth/login.tsx` lines 40-45
- **Issue:** Errors not announced to screen readers
- **Fix:** Add `<div role="alert" aria-live="polite">` wrapper
- **Acceptance:** NVDA/JAWS announce errors
- **Effort:** 1 hour

### High Priority (3 tasks)

#### TASK-005: Add Password Visibility Toggle
- **Agent:** Agent #51 (Testing)
- **Code:** `client/src/pages/auth/login.tsx` lines 104-113
- **Issue:** No show/hide password functionality
- **Fix:** Add Eye/EyeOff icon toggle with ARIA label
- **Reference:** Housing page password input pattern
- **Effort:** 1.5 hours

#### TASK-006: Social Login Loading States
- **Agent:** Agent #52 (Performance)
- **Code:** `client/src/pages/auth/login.tsx` lines 154-202
- **Issue:** No loading indicators on social buttons
- **Fix:** Add `isPending` state with spinner
- **Effort:** 1 hour

#### TASK-007: Keyboard Navigation Enhancement
- **Agent:** Agent #54 (Accessibility)
- **Code:** Throughout file
- **Issue:** Missing keyboard shortcuts
- **Fix:** Add Escape to clear, Enter to submit, Tab order
- **Reference:** Housing page keyboard navigation
- **Effort:** 1.5 hours

---

## 🎯 MUN-109-2: Home Dashboard Enhancements (15 tasks)

**File:** `client/src/pages/home.tsx`  
**Squad Lead:** Agent #52 (Performance)  
**Team:** Agents #53 (i18n), #51 (Testing), #15 (Dependencies)  
**Effort:** 10-12 hours  
**Priority:** **HIGHEST** (lowest score - 78)

### Critical (3 tasks)

#### TASK-008: Expand data-testid Coverage from 12 to 30+
- **Agent:** Agent #51 (Testing)
- **Code:** `client/src/pages/home.tsx` throughout
- **Current:** Only 12 testids
- **Required:** Add 20+ more for buttons, widgets, states
- **List:** `button-toggle-sidebar`, `button-theme-toggle`, `loader-stories`, `empty-state-stories`, etc.
- **Acceptance:** 30+ testids, E2E tests pass
- **Effort:** 3 hours

#### TASK-009: Expand i18n from 7 Keys to 40+ Keys
- **Agent:** Agent #53 (Internationalization)
- **Code:** `client/src/pages/home.tsx` throughout
- **Current:** Only 7 translation keys
- **Required:** Translate all text (buttons, tooltips, errors, empty states)
- **Acceptance:** 40+ keys, all 68 languages translated
- **Effort:** 3 hours

#### TASK-010: Add Dark Mode to Background Gradient
- **Agent:** Agent #11 (Aurora Tide Design)
- **Code:** `client/src/pages/home.tsx` line 57
- **Issue:** `bg-gradient-to-br from-turquoise-50 via-cyan-50 to-blue-50` missing dark variant
- **Fix:** Add `dark:from-gray-900 dark:via-gray-800 dark:to-gray-900`
- **Effort:** 0.5 hours

### High Priority (4 tasks)

#### TASK-011: Implement Lazy Loading for All Widgets
- **Agent:** Agent #52 (Performance)
- **Code:** `client/src/pages/home.tsx` lines 100-132
- **Issue:** StoryViewer, CreatePost not lazy loaded
- **Fix:** Use `React.lazy()` with Suspense
- **Acceptance:** Bundle size reduced, lazy chunks created
- **Effort:** 2 hours

#### TASK-012: Add Loading Skeletons for All Sections
- **Agent:** Agent #52 (Performance)
- **Code:** Throughout file
- **Issue:** No skeleton states
- **Fix:** Import from `react-loading-skeleton`, add for stories/posts/widgets
- **Reference:** Housing page skeleton pattern
- **Effort:** 2 hours

#### TASK-013: Add Error Boundaries Per Widget
- **Agent:** Agent #14 (Code Quality)
- **Code:** Widget sections
- **Issue:** No granular error handling
- **Fix:** Create `WidgetErrorBoundary` wrapper
- **Acceptance:** One widget failure doesn't crash page
- **Effort:** 2 hours

#### TASK-014: Optimize PostFeed Bundle with Code Splitting
- **Agent:** Agent #15 (Dependencies)
- **Code:** PostFeed component
- **Issue:** Heavy component loaded upfront
- **Fix:** Dynamic import, measure bundle impact
- **Effort:** 1.5 hours

---

## 🎯 MUN-109-3: Profile Page Enhancements (13 tasks)

**File:** `client/src/pages/UserProfile.tsx`  
**Squad Lead:** Agent #51 (Testing)  
**Team:** Agents #52 (Performance), #14 (Code Quality), #15 (Dependencies)  
**Effort:** 14-16 hours

### Critical (3 tasks)

#### TASK-015: Create Comprehensive Playwright E2E Test Suite
- **Agent:** Agent #51 (Testing)
- **Code:** Create `tests/e2e/profile.spec.ts`
- **Test Scenarios:** Image upload with crop, bio update, tab navigation, social sharing, settings, error handling, loading states, mobile responsive
- **Acceptance:** 8 test scenarios, 80% coverage
- **Effort:** 6 hours

#### TASK-016: Implement Image Compression Before Upload
- **Agent:** Agent #52 (Performance)
- **Code:** `client/src/pages/UserProfile.tsx` lines 200-250
- **Issue:** Large images uploaded directly
- **Fix:** Use `browser-image-compression` library before upload
- **Config:** Max size 1MB, quality 80%
- **Effort:** 2 hours

#### TASK-017: Fix Cache Invalidation for All Mutations
- **Agent:** Agent #14 (Code Quality)
- **Code:** `client/src/pages/UserProfile.tsx` lines 150-180
- **Issue:** Cache not properly invalidated
- **Fix:** Add `queryClient.invalidateQueries(['/api/profile'])` to all mutations
- **Effort:** 1 hour

### High Priority (3 tasks)

#### TASK-018: Split 1059-Line Component into 4 Files
- **Agent:** Agent #14 (Code Quality)
- **Current:** Single 1059-line file
- **Split into:**
  - `ProfileHeader.tsx` (lines 1-250)
  - `ProfileTabs.tsx` (lines 251-500)
  - `ProfileEditForm.tsx` (lines 501-750)
  - `ProfileImageCrop.tsx` (lines 751-1059)
- **Acceptance:** Each file < 300 lines, imports working
- **Effort:** 4 hours

#### TASK-019: Add Loading States with Skeletons
- **Agent:** Agent #52 (Performance)
- **Code:** All mutation hooks
- **Fix:** Add `isPending` checks with `<Skeleton />` components
- **Reference:** Housing page loading pattern
- **Effort:** 2 hours

#### TASK-020: Implement Retry Mechanism for Failed Uploads
- **Agent:** Agent #52 (Performance)
- **Code:** Image upload mutation
- **Fix:** Exponential backoff (1s, 2s, 4s), max 3 retries
- **Library:** Use `@tanstack/react-query` retry config
- **Effort:** 2 hours

---

## 🎯 MUN-109-4: Life CEO AI Enhancements (14 tasks)

**File:** `client/src/pages/LifeCEOEnhanced.tsx`  
**Squad Lead:** Agent #10 (Life CEO System)  
**Team:** Agents #1-16 (Life CEO Sub-Agents), #51 (Testing), #14 (Code Quality)  
**Effort:** 16-20 hours

### Critical (3 tasks)

#### TASK-021: Create Comprehensive Streaming Test Suite
- **Agent:** Agent #51 (Testing)
- **Code:** Create `tests/integration/ai-streaming.test.ts`
- **Test Scenarios:**
  - Connection interruption recovery
  - Partial JSON response parsing
  - Rate limit handling
  - Timeout recovery
  - Error state handling
- **Acceptance:** 5 test scenarios covering edge cases
- **Effort:** 8 hours

#### TASK-022: Implement Database Persistence for Chat History
- **Agent:** Agent #10 (Life CEO)
- **Code:** `client/src/pages/LifeCEOEnhanced.tsx` lines 180-200
- **Current:** Only localStorage
- **Fix:** Add database save after each message
- **Schema:** `chat_history` table with userId, agentId, messages, timestamp
- **Acceptance:** Conversations persist across devices
- **Effort:** 4 hours

#### TASK-023: Add Exponential Backoff for Failed AI Requests
- **Agent:** Agent #52 (Performance)
- **Code:** `client/src/pages/LifeCEOEnhanced.tsx` lines 330-350
- **Current:** Simple retry
- **Fix:** Exponential backoff (1s, 2s, 4s, 8s) with jitter, max 5 retries
- **Acceptance:** Graceful recovery from API failures
- **Effort:** 3 hours

### High Priority (3 tasks)

#### TASK-024: Enhance Voice Input Error Handling
- **Agent:** Agent #54 (Accessibility)
- **Code:** `client/src/pages/LifeCEOEnhanced.tsx` lines 400-450
- **Issue:** Fails silently on mic permission denial
- **Fix:** Show permission request modal with instructions
- **Acceptance:** Clear user feedback on permission issues
- **Effort:** 2 hours

#### TASK-025: Implement 30s Timeout for AI Responses
- **Agent:** Agent #52 (Performance)
- **Code:** Streaming implementation
- **Issue:** Hung connections never timeout
- **Fix:** Add 30s timeout, show retry button
- **Acceptance:** No infinite loading states
- **Effort:** 2 hours

#### TASK-026: Add Token Usage Tracking and Cost Monitoring
- **Agent:** Agent #10 (Life CEO)
- **Code:** AI API calls
- **Fix:** Track tokens per request, display usage stats
- **UI:** Show token count, estimated cost in settings
- **Effort:** 3 hours

---

## 🎯 MUN-109-5: Housing Marketplace Pattern Extraction (8 tasks)

**File:** `client/src/pages/HousingMarketplace.tsx`  
**Squad Lead:** Agent #54 (Accessibility)  
**Team:** Agents #17 (UI/UX), #14 (Code Quality), #51 (Testing)  
**Effort:** 6-8 hours  
**Note:** Focus on pattern extraction for other pages

### High Priority (2 tasks)

#### TASK-027: Implement Responsive Images with WebP/AVIF
- **Agent:** Agent #52 (Performance)
- **Code:** Listing image components
- **Fix:** Generate multiple formats, use `<picture>` element with srcset
- **Formats:** WebP, AVIF, fallback JPEG
- **Sizes:** thumbnail (300px), medium (600px), large (1200px)
- **Effort:** 3 hours

#### TASK-028: Add schema.org Structured Data for SEO
- **Agent:** Agent #17 (UI/UX)
- **Code:** Listing cards
- **Fix:** Add JSON-LD with RealEstateListing schema
- **Fields:** price, address, bedrooms, amenities
- **Acceptance:** Google Rich Results validation passes
- **Effort:** 2 hours

### Low Priority (4 tasks - Documentation Focus)

#### TASK-029: Extract ARIA Label Patterns to Documentation
- **Agent:** Agent #54 (Accessibility)
- **Output:** `docs/design-specs/aria-label-conventions.md`
- **Content:** Document all 57 ARIA labels from Housing page
- **Apply to:** Login, Home, Profile pages
- **Effort:** 2 hours

#### TASK-030: Extract Keyboard Navigation Patterns
- **Agent:** Agent #54 (Accessibility)
- **Output:** `docs/design-specs/keyboard-navigation-standards.md`
- **Content:** Tab, Enter, Escape, Arrow key patterns
- **Effort:** 1 hour

---

## 🎯 MUN-109-6: Memories Feed Pattern Documentation (7 tasks)

**File:** `client/src/pages/MemoriesFeed.tsx`  
**Squad Lead:** Agent #17 (UI/UX Design)  
**Team:** Agents #11 (Aurora Tide), #14 (Code Quality), #66 (ESLint)  
**Effort:** 4-6 hours  
**Note:** Aurora Tide Gold Standard - Extract all patterns

### High Priority (1 task)

#### TASK-031: Implement Virtual Scrolling with react-window
- **Agent:** Agent #52 (Performance)
- **Code:** `client/src/pages/MemoriesFeed.tsx` memory grid
- **Issue:** Performance degrades with 1000+ memories
- **Fix:** Use `react-window` for virtualization
- **Config:** Item height 400px, overscan 3
- **Acceptance:** Smooth scrolling with 5000+ items
- **Effort:** 3 hours

### Low Priority (4 tasks - Documentation Focus)

#### TASK-032: Document Perfect GlassCard Implementation
- **Agent:** Agent #11 (Aurora Tide Expert)
- **Output:** `docs/design-specs/aurora-tide-glasscard-patterns.md`
- **Content:** Extract all GlassCard usage patterns from Memories
- **Apply to:** Login, Home, Profile pages
- **Effort:** 1.5 hours

#### TASK-033: Document Dark Mode Excellence
- **Agent:** Agent #11 (Aurora Tide Expert)
- **Output:** `docs/design-specs/aurora-tide-dark-mode-guide.md`
- **Content:** Complete dark mode implementation checklist
- **Effort:** 1 hour

#### TASK-034: Document Animation System
- **Agent:** Agent #11 (Aurora Tide Expert)
- **Output:** `docs/design-specs/aurora-tide-animation-system.md`
- **Content:** Framer Motion + GSAP patterns
- **Effort:** 1 hour

---

## 🎯 MUN-109-7: Events Performance Optimization (12 tasks)

**File:** `client/src/pages/EnhancedEvents.tsx`  
**Squad Lead:** Agent #20 (Search & Discovery)  
**Team:** Agents #52 (Performance), #15 (Dependencies), #14 (Code Quality)  
**Effort:** 10-12 hours

### Critical (2 tasks)

#### TASK-035: Measure and Set Performance Budget
- **Agent:** Agent #52 (Performance)
- **Tools:** webpack-bundle-analyzer, Lighthouse CI
- **Budget:** Main < 150KB, Map < 100KB, Calendar < 80KB
- **Fix:** Add bundle size monitoring to CI/CD
- **Acceptance:** Budget enforced, build fails if exceeded
- **Effort:** 2 hours

#### TASK-036: Lazy Load react-big-calendar (Save ~80KB)
- **Agent:** Agent #15 (Dependencies)
- **Code:** `client/src/pages/EnhancedEvents.tsx` line 34
- **Issue:** 80KB library loaded for all view modes
- **Fix:** `const BigCalendar = lazy(() => import('react-big-calendar'))`
- **Acceptance:** Calendar only loaded when calendar view active
- **Effort:** 2 hours

### High Priority (3 tasks)

#### TASK-037: Lazy Load react-image-gallery on Open
- **Agent:** Agent #15 (Dependencies)
- **Code:** Line 39
- **Fix:** Dynamic import on gallery open
- **Savings:** ~40KB on initial load
- **Effort:** 1.5 hours

#### TASK-038: Dynamic Import export-to-csv on Export
- **Agent:** Agent #15 (Dependencies)
- **Code:** Line 42
- **Fix:** Load library only when user clicks export
- **Savings:** ~20KB on initial load
- **Effort:** 1 hour

#### TASK-039: Lazy Load react-share Dialog
- **Agent:** Agent #15 (Dependencies)
- **Code:** Lines 79-86
- **Fix:** Load share buttons on share click
- **Savings:** ~30KB on initial load
- **Effort:** 1.5 hours

### Medium Priority (3 tasks)

#### TASK-040: Consolidate Filter State to useReducer
- **Agent:** Agent #14 (Code Quality)
- **Code:** Lines 178-187
- **Issue:** Multiple useState causing re-renders
- **Fix:** Single useReducer for all filters
- **Acceptance:** Fewer re-renders, better performance
- **Effort:** 2 hours

#### TASK-041: Add 300ms Search Debounce
- **Agent:** Agent #52 (Performance)
- **Code:** Line 170
- **Issue:** API call on every keystroke
- **Fix:** Use `useDebouncedValue` hook
- **Effort:** 1 hour

---

## 📊 Agent Assignment Summary

### Agent Workload Distribution

| Agent | Role | Tasks | Effort |
|-------|------|-------|--------|
| #52 | Performance Lead | 12 tasks | 18h |
| #51 | Testing Lead | 8 tasks | 16h |
| #54 | Accessibility Lead | 8 tasks | 12h |
| #11 | Aurora Tide Expert | 6 tasks | 8h |
| #14 | Code Quality | 6 tasks | 10h |
| #15 | Dependencies | 5 tasks | 8h |
| #53 | Internationalization | 3 tasks | 4h |
| #10 | Life CEO System | 3 tasks | 10h |
| #17 | UI/UX Design | 3 tasks | 4h |
| #66 | ESLint Enforcer | 2 tasks | 2h |
| #20 | Search & Discovery | 1 task | 2h |

### Squad Leaders by Epic

| Epic | Page | Squad Lead | Team Size |
|------|------|------------|-----------|
| MUN-109-1 | Login | Agent #54 | 4 agents |
| MUN-109-2 | Home | Agent #52 | 4 agents |
| MUN-109-3 | Profile | Agent #51 | 4 agents |
| MUN-109-4 | Life CEO | Agent #10 | 20 agents |
| MUN-109-5 | Housing | Agent #54 | 4 agents |
| MUN-109-6 | Memories | Agent #17 | 4 agents |
| MUN-109-7 | Events | Agent #20 | 4 agents |

---

## 🔗 Quick Reference Links

### Code Files
- Login: `client/src/pages/auth/login.tsx`
- Home: `client/src/pages/home.tsx`
- Profile: `client/src/pages/UserProfile.tsx`
- Life CEO: `client/src/pages/LifeCEOEnhanced.tsx`
- Housing: `client/src/pages/HousingMarketplace.tsx`
- Memories: `client/src/pages/MemoriesFeed.tsx`
- Events: `client/src/pages/EnhancedEvents.tsx`

### Audit Reports
- `docs/audit-reports/reaudit-login-2025-10-11.md`
- `docs/audit-reports/reaudit-home-2025-10-11.md`
- `docs/audit-reports/reaudit-profile-2025-10-11.md`
- `docs/audit-reports/reaudit-lifeceo-2025-10-11.md`
- `docs/audit-reports/reaudit-housing-2025-10-11.md`
- `docs/audit-reports/reaudit-memories-2025-10-11.md`
- `docs/audit-reports/reaudit-events-2025-10-11.md`

### Pattern Documentation (To Be Created)
- `docs/design-specs/aria-label-conventions.md`
- `docs/design-specs/keyboard-navigation-standards.md`
- `docs/design-specs/aurora-tide-glasscard-patterns.md`
- `docs/design-specs/aurora-tide-dark-mode-guide.md`
- `docs/design-specs/aurora-tide-animation-system.md`
- `docs/design-specs/aurora-tide-image-optimization.md`

---

## 📋 Next Steps

1. **Load into Project Tracker** - Create Epic MUN-109 with all 81 tasks
2. **Assign Agents** - Map tasks to agent IDs in tracker
3. **Link Code Files** - Add file paths and line numbers to each task
4. **Set Dependencies** - Define task order and blockers
5. **Begin Execution** - Start with highest priority (Home Dashboard)

---

**Document Version:** 1.0  
**Last Updated:** October 11, 2025  
**Total Tasks:** 81  
**Total Effort:** 72-86 hours  
**Ready for:** Project Tracker Import
