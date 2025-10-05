# Canceled Features Registry

**Last Updated**: October 5, 2025  
**Purpose**: Central tracking of all disabled/postponed features with technical analysis

## Overview

This directory documents all features that have been disabled with "Coming Soon" overlays or removed from production. Each feature includes:
- Root cause analysis
- Technical blockers encountered
- Proposed solution architecture
- Estimated complexity to fix

## Active "Coming Soon" Overlays

### 1. Post Filtering (Relationship-Based)
**Location**: `client/src/components/moments/PostFeed.tsx` (lines 572-626)  
**Status**: ⚠️ Disabled October 5, 2025  
**Severity**: High - Core social feed feature  
**Details**: [post-filtering.md](./post-filtering.md)

**Quick Summary**:
- Filter buttons (All/Residents/Visitors/Friends) cause posts to disappear
- Context stability issues leading to infinite re-renders
- Complex state management in 800+ line component

### 2. Dark Mode Toggle
**Location**: `client/src/components/navigation/UnifiedTopBar.tsx` (lines 446-451)  
**Status**: ⚠️ Disabled  
**Severity**: Medium - UX enhancement  
**Details**: [dark-mode.md](./dark-mode.md)

**Quick Summary**:
- Theme context not propagating to all components
- CSS variable conflicts between light/dark modes
- Requires theme system rebuild

### 3. Language Selector
**Location**: `client/src/components/navigation/UnifiedTopBar.tsx` (lines 463-468)  
**Status**: ⚠️ Disabled  
**Severity**: High - Internationalization critical  
**Details**: [language-switching.md](./language-switching.md)

**Quick Summary**:
- ESA Layer 53 UI integration incomplete
- `useTranslation()` hook doesn't trigger re-renders
- Translation keys displayed raw instead of translated text

### 4. Search & Advanced Filters
**Location**: `client/src/components/moments/PostFeed.tsx` (lines 688-693)  
**Status**: ⚠️ Disabled  
**Severity**: Medium - Discovery feature  
**Details**: [post-filtering.md](./post-filtering.md#search-and-tags)

**Quick Summary**:
- Search functionality interferes with filter state
- Tag filtering needs backend support
- Date range filtering causes API issues

## Other Known Disabled Features

### Teacher Tools
**Location**: `client/src/pages/teacher.tsx`  
**Status**: Placeholder page  
**Reason**: Feature not yet scoped

### Organizer Tools
**Location**: `client/src/pages/organizer.tsx`  
**Status**: Placeholder page  
**Reason**: Feature not yet scoped

### Housing Filters on Group Pages
**Location**: Group detail pages  
**Status**: Disabled  
**Details**: See `docs/pages/housing/housing-marketplace.md`

## Documentation Standards

Each canceled feature should have:

1. **Root Cause Analysis**
   - What broke and why
   - Timeline of when it worked vs. when it broke
   - Specific error messages or behaviors

2. **Technical Blockers**
   - Architecture issues
   - Dependency conflicts
   - Performance problems
   - Security concerns

3. **Solution Architecture**
   - Recommended approach to fix
   - Alternative approaches considered
   - Estimated effort (hours/days)
   - Dependencies that need to be resolved first

4. **Re-enablement Checklist**
   - Steps to restore functionality
   - Tests that must pass
   - Verification criteria

## Priority Matrix

| Feature | User Impact | Technical Debt | Fix Complexity | Priority |
|---------|-------------|----------------|----------------|----------|
| Post Filtering | HIGH | HIGH | HIGH | P0 |
| Language Switching | HIGH | MEDIUM | MEDIUM | P0 |
| Dark Mode | MEDIUM | MEDIUM | MEDIUM | P1 |
| Search/Advanced Filters | MEDIUM | HIGH | HIGH | P1 |
| Teacher/Organizer Tools | LOW | LOW | HIGH | P3 |

## ESA 61x21 Compliance

Disabled features violate ESA framework principles:

- **Layer 9 (Frontend)**: Components should be stable and production-ready
- **Layer 2 (API)**: Backend endpoints should be reliable
- **Layer 61 (Quality)**: All features should be thoroughly tested

**Goal**: Re-enable all P0 features before production launch.

## Related Documentation

- [ESA Framework Guide](../../ESA_LIFE_CEO_61x21_DEFINITIVE_GUIDE.md)
- [Platform Audit](../../ESA_COMPREHENSIVE_PLATFORM_AUDIT.md)
- [Bug Fixes Log](../bug-fixes/)
