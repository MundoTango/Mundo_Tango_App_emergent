# Translation Audit Methodology
## Systematic i18n Completeness Verification for 68-Language Support

**ESA Layer 53:** Internationalization  
**ESA Phase 16:** i18n Implementation  
**Version:** 1.0  
**Last Updated:** October 8, 2025

---

## 🎯 Purpose

The Translation Audit is a systematic process to ensure **100% translation coverage** across all UI components, eliminating hardcoded English strings and ensuring proper i18next integration for all 68 supported languages.

---

## 📋 Methodology Overview

### What is a Translation Audit?

A **Component Hierarchy Translation Audit** (also called "Page-to-Component i18n Verification") is a top-down systematic process that:

1. **Starts at the page level** - Identifies the main route/page component
2. **Maps the component tree** - Lists all child components rendered on that page
3. **Detects hardcoded strings** - Finds English text not wrapped in translation functions
4. **Verifies translation keys** - Checks if keys exist in all translation files
5. **Tests multi-language** - Validates in non-English languages (French recommended for testing)
6. **Fixes dual-source issues** - Updates both `common.json` AND `translations.json` files

---

## 🔍 Step-by-Step Process

### Step 1: Page Analysis
**Identify the main page component and its route**

```bash
# Example: Memories Feed page
File: client/src/pages/ESAMemoryFeed.tsx
Route: "/"
```

**Key Questions:**
- What is the page's main purpose?
- Which layout does it use? (DashboardLayout, etc.)
- What are the core UI sections?

---

### Step 2: Component Mapping
**List all child components used in the page**

Use grep to find all imports and component usage:

```bash
# Find all component imports
grep -n "import.*from.*components" client/src/pages/ESAMemoryFeed.tsx

# Find component usage in JSX
grep -n "<[A-Z]" client/src/pages/ESAMemoryFeed.tsx
```

**Example Component Tree:**
```
ESAMemoryFeed (Page)
├── DashboardLayout
│   ├── Sidebar
│   └── UnifiedTopBar
├── PostCreator
├── PostFeed
└── UpcomingEventsSidebar
    └── UnifiedEventCard
```

---

### Step 3: String Detection
**Find all hardcoded English text in each component**

**Search Patterns:**
```bash
# Method 1: Direct text search
grep -n '"[A-Z][a-zA-Z ]*"' [component-file]

# Method 2: Look for specific patterns
grep -n 'MENU\|STATISTICS\|Upcoming\|attending' [component-file]

# Method 3: Check for missing t() function
grep -n '>[A-Z][a-zA-Z ]*<' [component-file]
```

**Common Hardcoded String Locations:**
- Section headers (h1, h2, h3)
- Button labels
- Placeholder text
- Tooltip titles
- Badge text
- Loading/error messages
- Empty state messages

---

### Step 4: Translation Key Verification
**Check if translation keys exist in all language files**

**Files to Check:**
1. `client/src/i18n/locales/en/common.json` ✅ Primary source
2. `client/src/i18n/locales/fr/common.json` ✅ French test
3. `client/src/i18n/translations.json` ⚠️ Often overlooked!

**Verification Commands:**
```bash
# Check if key exists in English
grep -n "upcomingEvents" client/src/i18n/locales/en/common.json

# Check if key exists in French
grep -n "upcomingEvents" client/src/i18n/locales/fr/common.json

# Check translations.json (critical!)
grep -n "upcomingEvents" client/src/i18n/translations.json
```

**Common Key Patterns:**
```javascript
// Navigation
t('navigation.menu')
t('navigation.search')

// Events
t('events.upcomingEvents')
t('events.attendeeCount', { count: 5 })

// Community
t('community.globalStatistics')
t('community.yourCity')

// RSVP
t('events.rsvp.youreGoing')
t('events.rsvp.interested')
```

---

### Step 5: Pluralization Support
**Ensure proper plural forms for countable items**

**Bad (No Pluralization):**
```jsx
<span>{count} {t('events.attending')}</span>
```

**Good (With Pluralization):**
```jsx
<span>{t('events.attendeeCount', { count })}</span>
```

**Translation Keys for Plurals:**
```json
{
  "attendeeCount": "{{count}} attending",
  "attendeeCount_plural": "{{count}} attending",
  
  "eventComingUp": "{{count}} event coming up",
  "eventComingUp_plural": "{{count}} events coming up"
}
```

**French Plural Forms:**
```json
{
  "attendeeCount": "{{count}} participant",
  "attendeeCount_plural": "{{count}} participants"
}
```

---

### Step 6: Dual-Source Fix
**CRITICAL: Update BOTH translation sources**

The i18n system merges translations in this order:
1. `translations.json` (gets merged FIRST) ⚠️
2. `baseResources` (inline config)
3. `locales/[lang]/common.json` (gets merged LAST)

**Problem:** If `translations.json` is missing a key, it won't be available even if it exists in `common.json`!

**Solution:** Always update BOTH files:

```json
// ✅ client/src/i18n/locales/fr/common.json
{
  "events": {
    "upcomingEvents": "Événements à venir",
    "attendeeCount": "{{count}} participant",
    "attendeeCount_plural": "{{count}} participants"
  }
}

// ✅ client/src/i18n/translations.json
{
  "fr": {
    "translation": {
      "events": {
        "upcomingEvents": "Événements à venir",
        "attendeeCount": "{{count}} participant",
        "attendeeCount_plural": "{{count}} participants"
      }
    }
  }
}
```

---

## ✅ Validation Checklist

### Component-Level Checks
- [ ] No hardcoded English strings in JSX
- [ ] All visible text uses `t()` function
- [ ] useTranslation hook imported: `const { t } = useTranslation()`
- [ ] Proper pluralization for counts
- [ ] Tooltip/aria-label text translated
- [ ] Dynamic content uses interpolation: `t('key', { variable })`

### Translation File Checks
- [ ] Key exists in `en/common.json`
- [ ] Key exists in `fr/common.json` (test language)
- [ ] Key exists in `translations.json` for target language
- [ ] Plural forms defined: `_plural` suffix
- [ ] Nested keys follow pattern: `section.subsection.key`

### Runtime Validation
- [ ] Switch to French - all text translates
- [ ] Check pluralization: 0, 1, 2+ items
- [ ] Verify tooltips show translated text
- [ ] Test dynamic content with variables

---

## 🛠️ Common Issues & Solutions

### Issue 1: Text Shows in English Despite French Selection
**Cause:** Key missing in `translations.json`  
**Solution:** Add key to both `common.json` AND `translations.json`

### Issue 2: Pluralization Not Working
**Cause:** Using direct string instead of count interpolation  
**Solution:** Use `t('key', { count })` with `_plural` suffix key

### Issue 3: Component Not Re-rendering on Language Change
**Cause:** Missing useTranslation hook  
**Solution:** Add `const { t } = useTranslation()` to component

### Issue 4: Nested Keys Not Found
**Cause:** Incorrect key path  
**Solution:** Verify exact path: `t('events.rsvp.interested')` not `t('rsvp.interested')`

---

## 📊 Audit Results Template

```markdown
## Translation Audit Results: [Page Name]

**Date:** [Date]
**Auditor:** [Name]
**Page:** [Route/Component]

### Components Audited
- [x] Component 1
- [x] Component 2
- [x] Component 3

### Issues Found
1. **[Component Name]** - [Issue description]
   - Location: [File:Line]
   - Fix: [What was changed]

2. **[Component Name]** - [Issue description]
   - Location: [File:Line]
   - Fix: [What was changed]

### Translation Keys Added
- `navigation.menu` - "Menu"
- `events.attendeeCount` - "{{count}} attending" (with plural)
- `community.globalStatistics` - "Global Statistics"

### Files Modified
- ✅ `client/src/components/Sidebar.tsx`
- ✅ `client/src/i18n/locales/en/common.json`
- ✅ `client/src/i18n/locales/fr/common.json`
- ✅ `client/src/i18n/translations.json`

### Validation
- [x] French translation verified
- [x] Pluralization tested
- [x] All visible text translates
- [x] Tooltips work in all languages
```

---

## 🚀 Quick Command Reference

```bash
# Find hardcoded strings in component
grep -rn '"[A-Z][a-zA-Z ]*"' client/src/components/[Component].tsx

# Check if translation key exists
grep -rn "keyName" client/src/i18n/

# Find all components in a page
grep -n "import.*from.*components" client/src/pages/[Page].tsx

# Search for untranslated text patterns
grep -rn "Upcoming\|Statistics\|Menu" client/src/components/

# Verify t() usage
grep -rn "t(" client/src/components/[Component].tsx
```

---

## 📈 Success Metrics

**100% Translation Coverage Achieved When:**
- ✅ No hardcoded English strings in any component
- ✅ All 68 languages have complete key coverage
- ✅ Pluralization works for all countable items
- ✅ User can switch languages without any English fallbacks
- ✅ Both `common.json` and `translations.json` are synchronized

---

## 🔗 Related Documentation

- **ESA Framework Layer 53:** Internationalization
- **ESA Phase 16:** i18n Implementation  
- **Translation Expert Agent:** `server/esa-agents/translation-expert.ts`
- **i18n Config:** `client/src/i18n/config.ts`
- **Supported Languages:** 68 languages defined in `supportedLanguages` array

---

## 📝 Notes

- Always test with French as the validation language (second most complete after English)
- Italian has 169 missing keys - use Translation Expert to batch translate
- The dual-source issue (`translations.json` + `common.json`) is the #1 cause of "missing" translations
- Restart the workflow after making translation changes to see updates

---

**End of Translation Audit Methodology**
