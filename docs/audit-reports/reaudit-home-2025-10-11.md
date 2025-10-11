# Re-Audit Report: Home Dashboard
## Squad 2 - Agent #52 (Performance Lead)

**Date:** October 11, 2025  
**Page:** `/home` (`client/src/pages/home.tsx`)  
**Previous Score:** 78  
**Re-Audit Focus:** Performance optimization, expand test coverage, i18n expansion

---

## 🎯 Executive Summary

Home dashboard has **lowest score (78)** of all audited pages. Major gaps in test coverage (only 12 data-testids), minimal i18n (only 7 translations), and needs significant accessibility improvements.

---

## ✅ Strengths Found

### **Architecture**
- ✅ Uses GlassCard from Aurora Tide
- ✅ MT Ocean gradients present
- ✅ HomeErrorBoundary for resilience
- ✅ FadeIn animations from Framer Motion

### **Performance**
- ✅ Service worker update detection
- ✅ Theme persistence in localStorage
- ✅ Lazy loading for PostFeed

---

## 🔴 Critical Issues (Priority 1)

### **1. Insufficient Test Coverage**
**Location:** Throughout file  
**Issue:** Only 12 data-testids for 139-line component  
**Evidence:**
```tsx
// Only these testids found:
- page-home
- section-topbar
- container-layout
- section-sidebar
- overlay-sidebar
- main-feed
- container-feed-content
- section-stories
- card-stories
- section-create-post
- card-create-post
- section-post-feed
```
**Fix Required:** Add 20+ more data-testids:
- `button-toggle-sidebar`
- `button-theme-toggle`
- `button-close-overlay`
- `loader-stories`
- `empty-state-stories`
- `error-stories`
- etc.

### **2. Minimal i18n Coverage**
**Location:** Throughout file  
**Issue:** Only 7 translation keys used  
**Evidence:**
```tsx
t('home.aria.page')
t('home.aria.close_sidebar')
t('home.aria.main_feed')
t('home.aria.stories')
t('home.aria.create_post')
t('home.aria.posts_feed')
// Missing: buttons, tooltips, empty states, errors
```
**Fix Required:** Expand to 40+ translation keys

### **3. Missing Dark Mode on Background**
**Location:** Line 57  
**Issue:** Background gradient missing dark mode variant  
**Evidence:**
```tsx
className="min-h-screen bg-gradient-to-br from-turquoise-50 via-cyan-50 to-blue-50"
```
**Fix Required:**
```tsx
className="min-h-screen bg-gradient-to-br from-turquoise-50 via-cyan-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
```

---

## 🟠 High Priority Issues (Priority 2)

### **4. Widget Loading Performance**
**Location:** Line 100-132 (feed content)  
**Issue:** No lazy loading for individual widgets  
**Fix Required:** Implement React.lazy for:
- StoryViewer
- CreatePost
- PostFeed (already lazy but can optimize)

### **5. Missing Loading Skeletons**
**Location:** Entire component  
**Issue:** No skeleton states while loading  
**Fix Required:** Add Skeleton component from react-loading-skeleton

### **6. No Error States**
**Location:** Throughout  
**Issue:** No error handling for failed widget loads  
**Fix Required:** Add error boundaries per widget

---

## 🟡 Medium Priority Issues (Priority 3)

### **7. Bundle Size Optimization**
**Issue:** PostFeed component heavy  
**Fix Required:** Code splitting with React.lazy

### **8. Missing Analytics Tracking**
**Issue:** No event tracking for user actions  
**Fix Required:** Add analytics events for:
- Theme toggle
- Sidebar toggle
- Post creation
- Story views

### **9. Sidebar State Not Persisted**
**Location:** Line 18  
**Issue:** Sidebar state resets on reload  
**Fix Required:** Persist in localStorage

---

## 🟢 Low Priority Enhancements (Priority 4)

### **10. Missing Keyboard Shortcuts**
**Issue:** No keyboard navigation  
**Fix Required:** Add hotkeys for common actions

### **11. Service Worker Toast**
**Issue:** Page reloads without user notification  
**Fix Required:** Show toast before reload

---

## 📋 Extracted Tasks (15 Total)

### **Critical (3 tasks)**
1. Expand data-testid coverage from 12 to 30+
2. Expand i18n from 7 keys to 40+ keys
3. Add dark mode to background gradient

### **High Priority (4 tasks)**
4. Implement lazy loading for all widgets
5. Add loading skeletons for all sections
6. Add error boundaries per widget
7. Optimize PostFeed bundle size with code splitting

### **Medium Priority (4 tasks)**
8. Add analytics tracking for user actions
9. Persist sidebar state in localStorage
10. Create widget loading priority system
11. Implement progressive enhancement

### **Low Priority (4 tasks)**
12. Add keyboard shortcuts (Ctrl+N for new post)
13. Show toast before service worker reload
14. Add widget animation polish
15. Implement widget drag-and-drop reordering

---

## 🎯 Performance Budget

**Current Bundle Size:** Unknown (needs measurement)  
**Target:** < 150KB gzipped  

**Lighthouse Metrics:**
- FCP: Target < 1.5s
- LCP: Target < 2.5s
- TTI: Target < 3.5s
- CLS: Target < 0.1

**Actions:**
1. Measure current bundle size
2. Implement code splitting
3. Lazy load heavy components
4. Optimize images

---

## 🎯 Recommendations

**For Immediate Implementation:**
1. **Test Coverage** - Critical for E2E testing
2. **i18n Expansion** - Required for global users
3. **Dark Mode** - Aurora Tide compliance

**For Sprint Planning:**
- Allocate 4 hours for test coverage expansion
- Allocate 3 hours for i18n key creation
- Allocate 2 hours for performance optimization
- Allocate 2 hours for accessibility improvements

**Reference Implementation:**
- Profile Page (`/profile`) - Better test coverage example
- Memories Feed (`/memories`) - Performance reference

---

## 📊 Re-Audit Metrics

| Category | Score | Change | Target |
|----------|-------|--------|--------|
| Testing | 40% | **CRITICAL** | 90% |
| i18n | 30% | **CRITICAL** | 95% |
| Performance | 75% | Needs optimization | 95% |
| Accessibility | 70% | Needs ARIA expansion | 95% |
| Aurora Tide | 85% | Good, needs dark mode | 100% |
| **Overall** | **78** | **LOWEST SCORE** | **95+** |

---

**Squad Lead:** Agent #52 (Performance)  
**Team:** Agents #53 (i18n), #51 (Testing), #15 (Dependencies)  
**Epic:** MUN-109-2 - Home Dashboard Enhancements  
**Estimated Effort:** 10-12 hours  
**Priority:** **HIGHEST** (lowest score of all pages)
