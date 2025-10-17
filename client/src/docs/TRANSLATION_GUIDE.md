# ESA LIFE CEO 61×21 - Comprehensive Translation Guide

## Layer 53: Internationalization Agent Implementation

This guide shows how to apply translations to any component in the Mundo Tango platform, supporting 73+ languages.

## 🌍 Quick Start: Translating Any Component

### Step 1: Import Translation Hook

```tsx
import { useTranslation } from 'react-i18next';
// Or use our utility hook
import { useAppTranslation } from '@/utils/translation';
```

### Step 2: Initialize in Component

```tsx
function MyComponent() {
  const { t } = useTranslation();
  // Or with namespace
  const { t } = useTranslation('events');
  
  return (
    <div>
      <h1>{t('common.welcome')}</h1>
      <p>{t('events.createEvent')}</p>
    </div>
  );
}
```

## 📝 Common Translation Patterns

### 1. Simple Text Translation

```tsx
// Before
<button>Save</button>

// After
<button>{t('common.save')}</button>
```

### 2. Text with Variables

```tsx
// Before
<p>Welcome back, {user.name}!</p>

// After
<p>{t('auth.welcomeBack', { name: user.name })}</p>
```

Translation file:
```json
{
  "auth": {
    "welcomeBack": "Welcome back, {{name}}!"
  }
}
```

### 3. Pluralization

```tsx
// Before
<p>{count} friends</p>

// After
<p>{t('friends.friendCount', { count })}</p>
```

Translation file:
```json
{
  "friends": {
    "friendCount": "{{count}} friend",
    "friendCount_plural": "{{count}} friends"
  }
}
```

### 4. Date and Time

```tsx
import { formatDateLocale } from '@/utils/translation';

// Before
<span>{new Date().toLocaleDateString()}</span>

// After
<span>{formatDateLocale(new Date(), i18n.language)}</span>
```

### 5. Form Labels and Placeholders

```tsx
// Before
<input placeholder="Enter your email" />
<label>Email Address</label>

// After
<input placeholder={t('forms.enterEmail')} />
<label>{t('forms.emailLabel')}</label>
```

## 🎯 Component Translation Checklist

When translating a component, ensure you translate:

- [ ] **Headings and Titles**
- [ ] **Button Text**
- [ ] **Form Labels**
- [ ] **Placeholder Text**
- [ ] **Error Messages**
- [ ] **Success Messages**
- [ ] **Loading States**
- [ ] **Empty States**
- [ ] **Tooltips**
- [ ] **Alt Text for Images**
- [ ] **Aria Labels**
- [ ] **Notification Messages**
- [ ] **Confirmation Dialogs**
- [ ] **Navigation Items**
- [ ] **Tab Labels**
- [ ] **Status Messages**
- [ ] **Validation Messages**

## 📁 Available Translation Namespaces

The platform uses these translation namespaces:

```javascript
{
  'common': 'Shared UI elements',
  'navigation': 'Navigation menu items',
  'auth': 'Authentication (login, signup, etc)',
  'memories': 'Memory/post related text',
  'events': 'Event management',
  'groups': 'Group functionality',
  'messages': 'Messaging system',
  'friends': 'Friend management',
  'profile': 'User profiles',
  'settings': 'Settings pages',
  'community': 'Community features',
  'actions': 'Action buttons and links',
  'notifications': 'Notification messages',
  'errors': 'Error messages',
  'forms': 'Form elements',
  'time': 'Time-related text',
  'globalStatistics': 'Statistics and metrics',
  'tango': 'Tango-specific terminology'
}
```

## 🔧 Advanced Features

### Using the T Component

For inline translations without hooks:

```tsx
import { T } from '@/utils/translation';

function MyComponent() {
  return (
    <div>
      <T tKey="common.welcome" />
      <T tKey="auth.welcomeBack" values={{ name: 'Maria' }} />
    </div>
  );
}
```

### Higher-Order Component

Wrap components with translation capabilities:

```tsx
import { withTranslation } from '@/components/WithTranslation';

function MyComponent({ t }) {
  return <h1>{t('common.welcome')}</h1>;
}

export default withTranslation(MyComponent);
```

### Dynamic Translation Loading

For lazy-loaded components:

```tsx
import { loadTranslationNamespace } from '@/utils/translation';

useEffect(() => {
  loadTranslationNamespace('events', i18n.language);
}, []);
```

## 🌐 RTL Language Support

For Arabic, Hebrew, Persian, and Urdu:

```tsx
import { getTextDirection } from '@/utils/translation';

function App() {
  const { i18n } = useTranslation();
  const direction = getTextDirection(i18n.language);
  
  return (
    <div dir={direction}>
      {/* Your content */}
    </div>
  );
}
```

## 📋 Example: Complete Component Translation

Here's a before and after example:

### Before (No Translation)

```tsx
function EventCard({ event }) {
  return (
    <div className="event-card">
      <h3>{event.name}</h3>
      <p>Date: {event.date}</p>
      <p>{event.attendees} attendees</p>
      <button>Register</button>
      <button>Share</button>
      {event.isFull && <span>Event Full</span>}
    </div>
  );
}
```

### After (With Translation)

```tsx
import { useTranslation } from 'react-i18next';
import { formatDateLocale } from '@/utils/translation';

function EventCard({ event }) {
  const { t, i18n } = useTranslation('events');
  
  return (
    <div className="event-card">
      <h3>{event.name}</h3>
      <p>{t('eventDate')}: {formatDateLocale(event.date, i18n.language)}</p>
      <p>{t('attendees', { count: event.attendees })}</p>
      <button>{t('registerButton')}</button>
      <button>{t('common:actions.share')}</button>
      {event.isFull && <span>{t('eventFull')}</span>}
    </div>
  );
}
```

## 🚀 Best Practices

1. **Use Namespaces**: Organize translations by feature
2. **Keep Keys Descriptive**: `events.registerButton` not `events.btn1`
3. **Avoid Hardcoded Text**: All user-facing text should be translatable
4. **Handle Loading States**: Show skeleton or default language while loading
5. **Test with Long Text**: German and Finnish translations are often longer
6. **Use Interpolation**: For dynamic values, use `{{variable}}` syntax
7. **Centralize Common Terms**: Use the `common` namespace for shared text
8. **Document Special Terms**: Add comments for context-specific translations

## 🎭 Tango-Specific Translations

For authentic tango terminology, especially Lunfardo:

```tsx
// Use the tango namespace for dance-specific terms
<span>{t('tango:milonga')}</span>  // Milonga
<span>{t('tango:cabeceo')}</span>  // Cabeceo
<span>{t('tango:tanda')}</span>    // Tanda
```

## 📊 Translation Coverage

To ensure complete translation coverage:

1. Run the app in development mode
2. Switch to a non-English language
3. Look for any untranslated text (will show as keys)
4. Add missing translations to the appropriate namespace

## 🔍 Debugging Translations

Enable debug mode in development:

```typescript
// client/src/i18n/config.ts
debug: process.env.NODE_ENV === 'development'
```

This will log missing translations and loading issues to the console.

## 📱 Mobile Considerations

For mobile-optimized translations:

1. Keep translations concise for mobile screens
2. Test text truncation on small devices
3. Use abbreviations where appropriate
4. Provide full text in tooltips when truncated

---

**Remember**: Every piece of text a user sees should be translatable. This ensures our platform can truly serve the global tango community in their native languages!