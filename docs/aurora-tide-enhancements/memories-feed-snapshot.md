# Memories Feed - Aurora Tide Enhancement Snapshot

**Date:** October 9, 2025  
**Enhancement Type:** Visual-Only (Aurora Tide Design System)  
**Git Commit:** `9eb64b28054924247ca76ace9dd8bf5d8ec7e36a`  
**Rollback Command:** `git checkout 9eb64b28054924247ca76ace9dd8bf5d8ec7e36a`

---

## Current State Analysis

### Page: Memories Feed (`/`)
- **Location:** `client/src/pages/home.tsx`
- **Current Aurora Tide Compliance:** 60%
- **Hardcoded Styles:** 12 instances
- **Dark Mode:** ✅ Complete
- **Accessibility:** ✅ WCAG 2.1 AA

### Component Hierarchy

```
Home Page (/)
├── UnifiedTopBar (navigation)
├── Sidebar (collapsible navigation)  
├── Main Content Area
    ├── StoryViewer (optional)
    │   └── Currently uses: .glassmorphic-card
    ├── CreatePost 
    │   └── Currently uses: Card component
    └── PostFeed (context: 'feed')
        └── EnhancedPostItem[]
            ├── Currently uses: MTCard
            ├── Post Header (avatar, name, timestamp)
            ├── Post Content (text, media, hashtags)
            ├── Post Actions (like, comment, share)
            └── Comments Section
```

---

## Files to Modify (Visual Wrappers ONLY)

### Primary Components (8 files)

1. **`client/src/pages/home.tsx`**
   - **Risk Level:** LOW (visual wrappers only)
   - **Changes:** Wrap sections in GlassCard, add FadeIn animations
   - **Preserves:** All layout logic, sidebar state, theme toggle

2. **`client/src/components/feed/create-post.tsx`**
   - **Risk Level:** LOW (design tokens + micro-interactions)
   - **Changes:** Replace Card with GlassCard, add ocean tokens, confetti on success
   - **Preserves:** All upload logic, form submission, fast upload hook

3. **`client/src/components/moments/PostFeed.tsx`**
   - **Risk Level:** LOW (scroll animations + filters)
   - **Changes:** Add useScrollReveal, ocean palette to filters
   - **Preserves:** Data fetching, infinite scroll logic, context switching

4. **`client/src/components/moments/EnhancedPostItem.tsx`**
   - **Risk Level:** LOW (GlassCard + magnetic buttons)
   - **Changes:** Replace MTCard with GlassCard, wrap buttons in MagneticButton
   - **Preserves:** Like/comment/share logic, mutations, cache invalidation

5. **`client/src/components/feed/story-viewer.tsx`**
   - **Risk Level:** LOW (GlassCard wrapper)
   - **Changes:** Replace .glassmorphic-card with GlassCard component
   - **Preserves:** Story navigation, swipe gestures

6. **`client/src/components/navigation/UnifiedTopBar.tsx`**
   - **Risk Level:** LOW (design tokens + PulseIcon)
   - **Changes:** Add PulseIcon to notifications, migrate colors to tokens
   - **Preserves:** Menu toggle, search, notifications logic

7. **`client/src/components/layout/sidebar.tsx`**
   - **Risk Level:** LOW (design token migration)
   - **Changes:** Replace hardcoded colors with ocean palette tokens
   - **Preserves:** Navigation routing, collapse state

8. **`client/src/components/ui/SimpleLikeButton.tsx`**
   - **Risk Level:** LOW (MagneticButton wrapper)
   - **Changes:** Wrap in MagneticButton, add particle effect on like
   - **Preserves:** Like mutation logic, optimistic updates

---

## Functionality to Preserve (CRITICAL - Zero Changes Allowed)

### ✅ Backend & API (MUST REMAIN UNCHANGED)
- ❌ NO changes to `/api/posts/feed` endpoint
- ❌ NO changes to `/api/posts` CRUD operations
- ❌ NO changes to `/api/stories/following` endpoint
- ❌ NO changes to like/comment/share mutations
- ❌ NO changes to upload endpoints
- ❌ NO changes to any database queries

### ✅ Component Logic (MUST REMAIN UNCHANGED)
- ❌ NO changes to React Query hooks (useQuery, useMutation)
- ❌ NO changes to cache invalidation logic
- ❌ NO changes to form validation (Zod schemas)
- ❌ NO changes to authentication flows (useAuth)
- ❌ NO changes to file upload logic (useFastUpload)
- ❌ NO changes to component props/interfaces
- ❌ NO changes to state management (useState, context)
- ❌ NO changes to infinite scroll pagination

### ✅ Features (MUST WORK IDENTICALLY)
- ✅ Post creation with text/images/videos
- ✅ Like/unlike posts with optimistic updates
- ✅ Comment on posts with mentions
- ✅ Share posts with/without comments
- ✅ Infinite scroll loading
- ✅ Filter posts (All/Following/Nearby)
- ✅ Search posts by hashtags
- ✅ Story viewing and navigation
- ✅ Sidebar navigation and collapse
- ✅ Dark mode toggle
- ✅ Responsive mobile layout

---

## Enhancement Strategy - 4-Track Parallel Execution

### Track A: Aurora Tide Core (Visual Layer)
**Goal:** Replace standard components with glassmorphic system

**Changes:**
- Wrap StoryViewer in `<GlassCard depth={1}>`
- Wrap CreatePost in `<GlassCard depth={2}>`
- Replace MTCard with `<GlassCard depth={2}>` in post items
- Add `<FadeIn>` animations for initial load
- Migrate all hardcoded colors to design tokens

**Pattern:**
```typescript
// Before
<Card className="bg-white border-gray-200">
  {content}
</Card>

// After
<GlassCard depth={2}>
  {content}
</GlassCard>
```

### Track B: Micro-interactions (Additive)
**Goal:** Add magnetic hover, ripple effects, particles

**Changes:**
- Wrap action buttons in `<MagneticButton strength={0.3}>`
- Add `<RippleCard>` to post cards
- Add confetti on post creation success
- Add `<PulseIcon>` to notification bell

**Pattern:**
```typescript
// Wrap existing button (don't replace)
<MagneticButton strength={0.3}>
  <Button onClick={handleLike}>
    <Heart />
  </Button>
</MagneticButton>
```

### Track C: Accessibility (Enhancement)
**Goal:** Maintain WCAG 2.1 AA, enhance focus states

**Changes:**
- Add `aria-label` to icon-only buttons
- Enhance focus rings with ocean palette
- Add `role="feed"` to PostFeed container
- Verify color contrast ratios

**Pattern:**
```typescript
// Enhanced focus indicator
className="focus:ring-2 focus:ring-ocean-seafoam-400 
           focus:ring-offset-2 dark:focus:ring-ocean-cyan-500"
```

### Track D: Content Polish (UX Enhancement)
**Goal:** Refine empty states, loading, microcopy

**Changes:**
- Add ocean-themed empty state illustration
- Create skeleton loader with ocean pulse
- Polish success/error messages
- Add GSAP scroll reveal to feed items

**Pattern:**
```typescript
// Scroll reveal
const containerRef = useScrollReveal('.post-item', {
  opacity: 0,
  y: 30,
  stagger: 0.15
});
```

---

## Rollback Procedure

### If Enhancement Fails
```bash
# Restore to pre-enhancement state
git checkout 9eb64b28054924247ca76ace9dd8bf5d8ec7e36a

# Verify restoration
npm run dev
# Test: Navigate to /, verify all features work

# If needed: Force clean
git reset --hard 9eb64b28054924247ca76ace9dd8bf5d8ec7e36a
```

### Validation Checklist (Must Pass)
- [ ] All posts load correctly
- [ ] Can create new posts with media
- [ ] Like/unlike works with correct counts
- [ ] Comments load and can be added
- [ ] Share functionality works
- [ ] Infinite scroll loads more posts
- [ ] Filters work (All/Following/Nearby)
- [ ] Search works by hashtags
- [ ] Dark mode toggles correctly
- [ ] Mobile responsive layout intact
- [ ] No console errors
- [ ] No layout shift (CLS)
- [ ] Animations run at 60fps

---

## Success Metrics

### Aurora Tide Compliance
- **Before:** 60%
- **Target:** 100%

### Design Token Usage
- **Before:** 40% (12 hardcoded colors)
- **Target:** 100% (zero hardcoded colors)

### Accessibility
- **Maintain:** WCAG 2.1 AA compliance
- **Enhance:** Focus indicators, ARIA labels

### Performance
- **Target:** 60fps animations
- **Target:** <3s page load
- **Target:** CLS < 0.1

---

## Implementation Notes

### Aurora Tide Components Used
- `GlassCard` from `@/components/glass/GlassComponents`
- `FadeIn`, `ScaleIn` from `@/components/animations/FramerMotionWrappers`
- `MagneticButton`, `RippleCard`, `PulseIcon` from `@/components/micro/MicroInteractions`
- `useScrollReveal` from `@/hooks/useScrollReveal`
- `useConfetti` from `@/hooks/useConfetti`

### Design Tokens
- Ocean palette: `--ocean-seafoam-*`, `--ocean-cyan-*`, `--ocean-teal-*`
- Semantic tokens: `--bg-primary`, `--text-primary`, `--border-default`
- Component tokens: `--card-*`, `--button-*`

### Dark Mode
- All components must have `dark:` variants
- Use design tokens for automatic theme switching
- Test in both light and dark modes

---

**Snapshot Created:** October 9, 2025  
**Auditor:** Agent #11 (Aurora - UI/UX Design Expert)  
**Next Step:** Execute 4-track parallel enhancement
