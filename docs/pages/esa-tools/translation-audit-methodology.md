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

## 🌍 Adding a New Language: Complete Workflow

### Overview
When adding a new language to the platform, follow this systematic 5-phase approach to ensure 100% translation coverage across all pages and components.

### Phase 1: Language Setup

**1.1 Create Locale Directory Structure**
```bash
# Create new language folder
mkdir -p client/src/i18n/locales/[lang-code]

# Example for Japanese
mkdir -p client/src/i18n/locales/ja
```

**1.2 Copy Base Translation File**
```bash
# Copy English as template
cp client/src/i18n/locales/en/common.json client/src/i18n/locales/[lang-code]/common.json
```

**1.3 Register Language in System**
Add to `client/src/lib/i18n-languages.ts`:
```typescript
{
  code: 'ja',
  name: 'Japanese',
  nativeName: '日本語',
  flag: '🇯🇵',
  rtl: false
}
```

---

### Phase 2: Page Architecture Audit

**2.1 Identify All Pages**
List main application pages:
- Memories Feed (`/`)
- Events (`/events`)
- Community (`/community`)
- Profile (`/profile`)
- Settings (`/settings`)
- Housing Marketplace (`/housing`)

**2.2 Map Component Dependencies**
For each page, create component tree:

```bash
# Example: Memories Page Architecture
ESAMemoryFeed.tsx (Main Page)
├── PostCreator.tsx
├── PostFeed.tsx  
│   ├── EnhancedPostItem.tsx
│   └── PostActionsMenu.tsx
├── SimpleCommentEditor.tsx
└── UpcomingEventsSidebar.tsx
    └── UnifiedEventCard.tsx
```

**2.3 Extract Translation Keys**
For each component, grep for all t() calls:

```bash
# Find all translation keys used in component
grep -o "t('[^']*')" client/src/components/PostCreator.tsx

# Output example:
# t('memories.creator.sharePlaceholder')
# t('memories.categories.milonga')
# t('memories.price.budget')
```

---

### Phase 3: Translation Key Inventory

**3.1 Build Complete Key List**
Create comprehensive list of ALL translation keys by page:

**Memories Page Keys:**
```
memories.title
memories.newPost
memories.edit.title
memories.creator.sharePlaceholder
memories.creator.editPlaceholder
memories.feed.searchPlaceholder
memories.feed.noMemories
memories.feed.noResidents
memories.feed.noVisitors
memories.feed.noFriends
memories.feed.noTaggedPosts
memories.feed.noSearchResults
memories.categories.*
memories.price.*
memories.actions.*
```

**Events/RSVP Keys:**
```
events.upcomingEvents
events.attendeeCount
events.attendeeCount_plural
events.rsvp.markAsAttending
events.rsvp.markAsInterested
events.rsvp.youreGoing
events.rsvp.interested
events.rsvp.maybe
```

**3.2 Check Coverage in New Language**
```bash
# Verify each key exists
grep -n "memories.edit.title" client/src/i18n/locales/ja/common.json
grep -n "events.rsvp.interested" client/src/i18n/locales/ja/common.json
```

**3.3 Identify Missing Keys**
Compare against English version:
```bash
# List all keys in English
grep -o '"[^"]*":' client/src/i18n/locales/en/common.json > en-keys.txt

# List all keys in new language  
grep -o '"[^"]*":' client/src/i18n/locales/ja/common.json > ja-keys.txt

# Find missing keys
diff en-keys.txt ja-keys.txt
```

---

### Phase 4: Translation Implementation

**4.1 Priority Translation Order**
For tango platform, prioritize these 7 languages first:
1. 🇺🇸 English (EN) - Base
2. 🇪🇸 Spanish (ES) - Standard
3. 🇦🇷 Argentine Spanish (es-AR) - Lunfardo/Rioplatense dialect
4. 🇫🇷 French (FR)
5. 🇮🇹 Italian (IT)
6. 🇵🇹 Portuguese (PT)
7. 🇩🇪 German (DE)

**4.2 Dialect Considerations**
For languages with regional variants (like Argentine Spanish):

```json
// es-AR (Argentine Spanish - Lunfardo)
{
  "memories": {
    "edit": {
      "title": "Editá Tu Recuerdo"  // voseo: "editá" not "edita"
    },
    "creator": {
      "sharePlaceholder": "Compartí un recuerdo tanguero..."  // "compartí" not "comparte"
    }
  }
}
```

**4.3 Add Missing Translations**
For EACH missing key, add to new language file:

```json
// client/src/i18n/locales/ja/common.json
{
  "events": {
    "rsvp": {
      "youreGoing": "参加予定",
      "interested": "興味あり",
      "maybe": "未定",
      "attendeeCount": "{{count}}名参加",
      "attendeeCount_plural": "{{count}}名参加"
    }
  }
}
```

**4.4 Handle Pluralization**
Different languages have different plural rules:

```json
// English (2 forms: singular/plural)
"attendeeCount": "{{count}} attending",
"attendeeCount_plural": "{{count}} attending"

// French (2 forms)
"attendeeCount": "{{count}} participant",
"attendeeCount_plural": "{{count}} participants"

// Japanese (1 form - no plural)
"attendeeCount": "{{count}}名参加"

// Arabic (6 forms - would need: zero, one, two, few, many, other)
"attendeeCount": "{{count}} حاضر",
"attendeeCount_plural": "{{count}} حاضرون"
```

---

### Phase 5: Validation & Testing

**5.1 Visual Testing Checklist**
For each page, switch to new language and verify:

- [ ] **Headers & Titles** - All section headers translated
- [ ] **Buttons & Actions** - All CTAs show correct language
- [ ] **Form Placeholders** - Input hints translated
- [ ] **Status Messages** - RSVP badges, attendance counts
- [ ] **Empty States** - "No results" messages
- [ ] **Tooltips** - Hover text translated
- [ ] **Error Messages** - Validation feedback

**5.2 Test RSVP Status Display**
Event cards must show translated status:
```
✅ English: "You're Going" / "Interested" / "5 attending"
✅ Spanish: "Vas a Asistir" / "Interesado" / "5 asistiendo"  
✅ French: "Vous y allez" / "Intéressé" / "5 participants"
✅ Japanese: "参加予定" / "興味あり" / "5名参加"
```

**5.3 Pluralization Testing**
Test with different counts:
- 0 items (zero form if language has it)
- 1 item (singular)
- 2+ items (plural)
- Large numbers (many form for Arabic/Slavic)

**5.4 Runtime Verification**
```bash
# Start app
npm run dev

# Switch language in UI (top-right selector)
# Navigate through:
# 1. Memories page - check all empty states
# 2. Event cards - verify RSVP status badges
# 3. Profile page - check form labels
# 4. Settings - verify all options
```

---

### Phase 6: Documentation Update

**6.1 Update Language Coverage Tracker**
Add to `docs/pages/esa-tools/i18n-coverage.md`:

```markdown
## Japanese (ja) - Translation Status
- **Status:** ✅ Complete
- **Coverage:** 100%
- **Pages Audited:** 
  - Memories Feed ✅
  - Events ✅
  - Community ✅
  - Profile ✅
- **Date Completed:** [Date]
- **Keys Added:** 247
- **Translator:** [Agent/Person]
```

**6.2 Add to Language Priority List**
Update `replit.md` if adding to top tango languages.

---

## 🎯 Real-World Example: Spanish Translation Audit

### Case Study: Memories Page + Event Cards (October 2025)

**Problem:** Spanish translations incomplete - hardcoded "Interested", "You're Going", "attending" on event cards

**Step 1: Component Audit**
```bash
# Found 6 main components
- ESAMemoryFeed.tsx
- PostCreator.tsx  
- PostFeed.tsx
- EnhancedPostItem.tsx
- PostActionsMenu.tsx
- UnifiedEventCard.tsx (event cards)
```

**Step 2: Key Extraction**
```bash
grep "t('memories" client/src/components/*.tsx
grep "t('events.rsvp" client/src/components/events/*.tsx
```

**Step 3: Missing Keys Identified**
```
Missing in ES:
- memories.edit.title
- memories.feed.noMemories
- memories.feed.noResidents  
- memories.feed.noVisitors
- memories.feed.noFriends
- memories.feed.noTaggedPosts
- memories.feed.noSearchResults
- events.rsvp.youreGoing
- events.rsvp.interested
- events.rsvp.maybe
- events.attendeeCount
```

**Step 4: Translations Added**
```json
// client/src/i18n/locales/es/common.json
{
  "memories": {
    "edit": {
      "title": "Edita Tu Recuerdo"
    },
    "feed": {
      "noMemories": "Aún No Hay Recuerdos",
      "noResidents": "Aún no hay publicaciones de residentes...",
      "noVisitors": "No se encontraron publicaciones de visitantes...",
      "noFriends": "Aún no hay publicaciones de tus amigos...",
      "noTaggedPosts": "No se encontraron publicaciones con las etiquetas: {{tags}}",
      "noSearchResults": "No se encontraron recuerdos que coincidan con \"{{query}}\"..."
    }
  },
  "events": {
    "rsvp": {
      "youreGoing": "Vas a Asistir",
      "interested": "Interesado",
      "maybe": "Quizás"
    },
    "attendeeCount": "{{count}} asistiendo",
    "attendeeCount_plural": "{{count}} asistiendo"
  }
}
```

**Step 5: Replicated for All Tango Languages**
Same keys added to: FR, IT, PT, DE, es-AR (with dialect adjustments)

**Result:** ✅ 100% translation coverage for Memories page + Event cards across top 7 tango languages

---

## 🚨 Critical Checklist for New Languages

Before marking a language as "complete", verify:

### Component Coverage
- [ ] All page components audited
- [ ] All shared components checked (Sidebar, TopBar, etc.)
- [ ] All form components translated
- [ ] All modal dialogs covered
- [ ] All toast/notification messages included

### Translation Quality  
- [ ] No English fallbacks appear
- [ ] Pluralization works correctly
- [ ] Cultural/regional variants respected (es vs es-AR)
- [ ] Formal/informal address appropriate for culture
- [ ] Technical terms translated or kept in English as needed

### Technical Validation
- [ ] All keys present in `[lang]/common.json`
- [ ] RTL support configured if needed (Arabic, Hebrew)
- [ ] Date/time formats localized
- [ ] Number formats correct for locale
- [ ] Currency symbols appropriate

### Runtime Testing
- [ ] Switch to language via UI selector
- [ ] Navigate all main pages
- [ ] Test form submissions
- [ ] Verify error states
- [ ] Check empty states
- [ ] Test pluralization with 0, 1, 2+ items

---

## 📊 Translation Progress Template

Use this for tracking new language implementation:

```markdown
## [Language Name] ([code]) - Implementation Progress

**Start Date:** [Date]  
**Target Completion:** [Date]  
**Translator:** [Agent/Person]

### Phase Completion
- [ ] Phase 1: Language Setup (locale files, registration)
- [ ] Phase 2: Page Architecture Audit (6 main pages)
- [ ] Phase 3: Translation Key Inventory (complete key list)
- [ ] Phase 4: Translation Implementation (all keys translated)
- [ ] Phase 5: Validation & Testing (visual + runtime)
- [ ] Phase 6: Documentation Update (coverage tracker)

### Page Coverage
- [ ] Memories Feed - [X] keys
- [ ] Events - [X] keys  
- [ ] Community - [X] keys
- [ ] Profile - [X] keys
- [ ] Settings - [X] keys
- [ ] Housing - [X] keys

### Key Statistics
- **Total Keys Required:** [X]
- **Keys Translated:** [X]
- **Coverage:** [X]%
- **Missing Keys:** [X]

### Issues Encountered
1. [Issue description] - [Resolution]
2. [Issue description] - [Resolution]

### Quality Assurance
- [ ] Native speaker review completed
- [ ] Cultural appropriateness verified
- [ ] Technical accuracy confirmed
- [ ] User acceptance testing done
```

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
