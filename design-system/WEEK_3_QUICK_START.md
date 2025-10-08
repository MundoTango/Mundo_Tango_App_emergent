# Week 3 Migration Tools - Quick Start Guide

**Last Updated:** October 8, 2025  
**Status:** Ready for Production

---

## 🚀 Quick Commands

### Run Individual Migrations
```bash
# Replace hardcoded colors with design tokens
npm run migrate:tokens client/src/components

# Add dark mode support
npm run migrate:dark-mode client/src/components

# Add test IDs for automated testing
npm run migrate:testids client/src/components

# Convert glass effects to GlassCard
npm run migrate:glasscard client/src/components
```

### Run All Migrations
```bash
npm run migrate:all
```

### Validate Results
```bash
# Check WCAG 2.1 AA compliance
npm run validate:wcag client/src/pages

# Run accessibility linting
npm run lint:a11y
```

---

## 📊 What Each Tool Does

### 1. Token Migration (`migrate:tokens`)
**Converts:** Hardcoded colors & spacing → Design tokens

**Example:**
```tsx
// Before
className="bg-cyan-500 text-white"

// After
className="bg-ocean-500 text-white"
```

### 2. Dark Mode (`migrate:dark-mode`)
**Adds:** Dark mode variants to components

**Example:**
```tsx
// Before
className="bg-white text-black"

// After
className="bg-white dark:bg-neutral-900 text-black dark:text-white"
```

### 3. Test IDs (`migrate:testids`)
**Adds:** data-testid attributes for testing

**Example:**
```tsx
// Before
<button onClick={handleClick}>Submit</button>

// After
<button data-testid="button-submit" onClick={handleClick}>Submit</button>
```

### 4. GlassCard (`migrate:glasscard`)
**Converts:** Manual glass effects → GlassCard component

**Example:**
```tsx
// Before
<div className="bg-white/10 backdrop-blur-lg">Content</div>

// After
<GlassCard depth={2}>Content</GlassCard>
```

---

## ✅ Test Results Summary

| Tool | Test Files | Success | Changes |
|------|-----------|---------|---------|
| Token Migration | 61 | ✅ 100% | 2 files, 2 replacements |
| Dark Mode | 61 | ✅ 100% | 11 files, 36 classes |
| Test IDs | 61 | ✅ 100% | 16 files, 66 IDs |
| GlassCard | 399 | ✅ 100% | 30 migrated, 60+ candidates |

---

## 🎯 Expected Production Impact

**Full Codebase Migration:**
- Dark Mode: 25.9% → 95% (450+ files)
- Test IDs: 30% → 100% (1,500+ IDs)
- Design Tokens: 10.6% → 100% (300+ files)
- GlassCard: 5.5% → 80% (200+ components)

---

## 📋 Detailed Documentation

See `WEEK_3_MIGRATION_REPORT.md` for complete technical details.
