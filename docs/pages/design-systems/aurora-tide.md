# Aurora Tide Design System

**Last Updated:** October 6, 2025  
**Status:** ✅ Production-Ready + Complete Developer Documentation  
**Coverage:** All Housing Platform Components + 4 Developer Guides  
**ESA Framework:** Layer 9 (UI Framework) + Layer 48 (Performance)

---

## Overview

Aurora Tide is the unified design system for the Life CEO & Mundo Tango housing platform. Built on glassmorphic principles with the MT Ocean Theme, it delivers a cohesive, accessible, and performant user experience across all housing customer journeys.

### Design Philosophy

- **Glassmorphic Depth**: Layered transparency with blur effects creating depth perception
- **MT Ocean Theme**: Cyan-to-teal-to-blue gradient palette (#5EEAD4 → #14B8A6 → #0D9488 → #155E75)
- **Motion Design**: GSAP + Framer Motion for fluid, purposeful animations
- **Micro-interactions**: Magnetic buttons, pulse effects, ripple feedback
- **Dark Mode First**: All components designed for both light and dark themes
- **Internationalization**: i18next integration with 6 languages (EN, ES, FR, DE, IT, PT)

---

## Core Components

### 1. Glassmorphic Cards (GlassCard)

**File:** `client/src/components/glass/GlassComponents.tsx`

#### Depth Levels

```typescript
interface GlassCardProps {
  depth?: 1 | 2 | 3 | 4;
  className?: string;
  children: React.ReactNode;
}
```

**Depth 1** - Subtle elevation for nested content
```css
backdrop-filter: blur(12px);
background: rgba(255, 255, 255, 0.7);
border: 1px solid rgba(148, 163, 184, 0.2);
```

**Depth 2** - Primary cards (default)
```css
backdrop-filter: blur(16px);
background: rgba(255, 255, 255, 0.8);
border: 1px solid rgba(148, 163, 184, 0.3);
box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
```

**Depth 3** - Elevated modals/dialogs
```css
backdrop-filter: blur(20px);
background: rgba(255, 255, 255, 0.85);
border: 1px solid rgba(148, 163, 184, 0.4);
box-shadow: 0 16px 48px rgba(31, 38, 135, 0.2);
```

**Depth 4** - Maximum elevation (overlays)
```css
backdrop-filter: blur(24px);
background: rgba(255, 255, 255, 0.9);
border: 1px solid rgba(148, 163, 184, 0.5);
box-shadow: 0 24px 64px rgba(31, 38, 135, 0.25);
```

#### Dark Mode Variants

All depths automatically adapt:
```css
/* Light mode */
background: rgba(255, 255, 255, 0.8);
border-color: rgba(148, 163, 184, 0.3);

/* Dark mode */
background: rgba(15, 23, 42, 0.8);
border-color: rgba(100, 116, 139, 0.3);
```

---

### 2. Framer Motion Animations

**File:** `client/src/components/animations/FramerMotionWrappers.tsx`

#### FadeIn
```typescript
<FadeIn delay={0.1} duration={0.5}>
  <GlassCard>Content fades in smoothly</GlassCard>
</FadeIn>
```

**Props:**
- `delay?: number` - Animation delay in seconds (default: 0)
- `duration?: number` - Animation duration (default: 0.4)
- `direction?: 'up' | 'down' | 'left' | 'right'` - Slide direction

#### ScaleIn
```typescript
<ScaleIn delay={0.05}>
  <PropertyCard />
</ScaleIn>
```

**Effect:** Scales from 0.9 to 1.0 with fade-in  
**Use Case:** Individual cards, modal entries

#### StaggerContainer
```typescript
<StaggerContainer staggerDelay={0.08}>
  {items.map(item => (
    <ScaleIn key={item.id}>
      <Card data={item} />
    </ScaleIn>
  ))}
</StaggerContainer>
```

**Effect:** Children animate sequentially with delay  
**Use Case:** Lists, grids, feeds

#### SlideIn
```typescript
<SlideIn direction="left" delay={0.2}>
  <Sidebar />
</SlideIn>
```

**Directions:** `left | right | up | down`  
**Use Case:** Side panels, drawers, tooltips

---

### 3. Micro-interactions

**File:** `client/src/components/interactions/MicroInteractions.tsx`

#### MagneticButton

Buttons that subtly follow cursor movement:

```typescript
<MagneticButton 
  strength={0.2} 
  className="glass-card px-4 py-2"
  data-testid="button-action"
>
  <ArrowLeft className="w-5 h-5" />
</MagneticButton>
```

**Props:**
- `strength?: number` - Magnetic pull intensity (0.1 = subtle, 0.3 = strong)
- `className: string` - Tailwind classes
- `onClick?: () => void`
- `disabled?: boolean`

**Use Cases:**
- Back navigation buttons
- Secondary CTAs
- Icon buttons
- Cancel actions

#### PulseButton

Primary CTAs with pulsing animation:

```typescript
<PulseButton 
  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl"
  data-testid="button-submit"
>
  {isPending ? 'Submitting...' : 'Submit Request'}
</PulseButton>
```

**Effect:** Continuous subtle scale pulse (0.98 → 1.0)  
**Use Cases:**
- Primary form submissions
- Booking CTAs
- Confirmation buttons
- Payment actions

#### RippleButton

Material Design ripple effect:

```typescript
<RippleButton className="bg-cyan-500 text-white">
  Click Me
</RippleButton>
```

**Effect:** Circular ripple expands from click point  
**Use Cases:** Mobile interactions, touch targets

---

### 4. MT Ocean Theme Gradients

#### Primary Gradient (Horizontal)
```css
background: linear-gradient(to right, 
  #5EEAD4,  /* Cyan-300 */
  #14B8A6,  /* Teal-500 */
  #0D9488   /* Teal-600 */
);
```

#### Extended Gradient (Headers)
```css
background: linear-gradient(135deg,
  #5EEAD4 0%,    /* Cyan-300 */
  #14B8A6 25%,   /* Teal-500 */
  #0D9488 50%,   /* Teal-600 */
  #0F766E 75%,   /* Teal-700 */
  #155E75 100%   /* Cyan-900 */
);
```

#### Text Gradients
```tsx
<h1 className="bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-600 dark:from-cyan-400 dark:via-teal-400 dark:to-blue-400 bg-clip-text text-transparent">
  Aurora Tide Heading
</h1>
```

#### Status Badge Gradients

**Approved/Success:**
```css
background: linear-gradient(to right, 
  rgb(103, 232, 249), /* cyan-300 */
  rgb(34, 211, 238)   /* cyan-400 */
);
```

**Pending/Warning:**
```css
background: linear-gradient(to right,
  rgb(254, 240, 138), /* yellow-200 */
  rgb(251, 191, 36)   /* amber-400 */
);
```

**Rejected/Error:**
```css
background: linear-gradient(to right,
  rgb(252, 165, 165), /* red-300 */
  rgb(248, 113, 113)  /* red-400 */
);
```

---

### 5. Dark Mode Implementation

All Aurora Tide components use Tailwind's `dark:` variants:

```tsx
<GlassCard className="
  bg-white/80 dark:bg-slate-900/80
  border-cyan-200/30 dark:border-cyan-500/30
  text-slate-900 dark:text-white
">
  <p className="text-slate-600 dark:text-slate-400">
    Content adapts to theme
  </p>
</GlassCard>
```

#### Common Dark Mode Patterns

**Backgrounds:**
- Light: `bg-slate-50` / `bg-white`
- Dark: `dark:bg-slate-950` / `dark:bg-slate-900`

**Text:**
- Headings: `text-slate-900 dark:text-white`
- Body: `text-slate-700 dark:text-slate-300`
- Muted: `text-slate-600 dark:text-slate-400`
- Disabled: `text-slate-400 dark:text-slate-600`

**Borders:**
- Subtle: `border-slate-200/30 dark:border-slate-700/30`
- MT Ocean: `border-cyan-200/30 dark:border-cyan-500/30`

**Gradients stay consistent** - cyan/teal colors work in both themes

---

### 6. i18next Translation Integration

All Aurora Tide components use `react-i18next`:

```typescript
import { useTranslation } from 'react-i18next';

function HousingCard() {
  const { t } = useTranslation();
  
  return (
    <GlassCard>
      <h3>{t('housing.card.title', 'Property Title')}</h3>
      <p>{t('housing.card.description', {
        defaultValue: '{{rooms}} rooms, {{guests}} guests',
        rooms: 3,
        guests: 6
      })}</p>
    </GlassCard>
  );
}
```

#### Translation Key Namespaces

- `housing.homes_list.*` - HostHomesList component
- `housing.my_bookings.*` - Guest booking views
- `housing.host_bookings.*` - Host booking management
- `housing.reviews.*` - Review system
- `housing.onboarding.*` - Onboarding flows
- `housing.calendar.*` - Calendar components

#### Pluralization
```typescript
t('housing.reviews.review_count', {
  defaultValue: '{{count}} review',
  defaultValue_plural: '{{count}} reviews',
  count: reviewCount
})
```

---

## Developer Guides

### How to Toggle Dark Mode

**Location:** `client/src/contexts/theme-context.tsx`

The platform uses a global `ThemeProvider` that:
- Detects system preference on first visit
- Persists user choice to localStorage
- Toggles `dark` class on `<html>` element
- Works automatically with Tailwind's `dark:` variants

#### Using the useTheme Hook

```tsx
import { useTheme } from '@/contexts/theme-context';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
    </button>
  );
}
```

#### Hook API

```typescript
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}
```

#### Implementation Details

**Initialization Logic:**
1. Check `localStorage` for saved preference
2. If none, check system preference via `matchMedia('(prefers-color-scheme: dark)')`
3. Default to `'light'` if neither exists

**Persistence:**
```typescript
// Auto-saved to localStorage on every toggle
localStorage.setItem('esa-theme', theme); // 'light' or 'dark'

// Auto-applied to document
document.documentElement.classList.toggle('dark', theme === 'dark');
```

#### Conditional Rendering

```tsx
function AdaptiveIcon() {
  const { theme } = useTheme();
  
  return theme === 'dark' ? <MoonIcon /> : <SunIcon />;
}
```

#### Using Tailwind Dark Variants (Recommended)

```tsx
<GlassCard className="
  bg-white/80 dark:bg-slate-900/80
  border-cyan-200/30 dark:border-cyan-500/30
  text-slate-900 dark:text-white
">
  <h3 className="text-slate-700 dark:text-slate-300">
    Auto-adapts to theme
  </h3>
</GlassCard>
```

**Key Principle:** Always provide both light and dark variants for ALL visual properties (backgrounds, text, borders, shadows).

---

### How to Add Translations (i18next)

**Location:** `client/src/i18n/config.ts`

Aurora Tide uses `react-i18next` with support for **73 languages** (6 primary: EN, ES, FR, DE, IT, PT).

#### Developer Workflow

**Step 1: Import Hook**
```tsx
import { useTranslation } from 'react-i18next';
```

**Step 2: Use in Component**
```tsx
function PropertyCard({ property }) {
  const { t } = useTranslation();
  
  return (
    <GlassCard>
      <h3>{t('housing.propertyTitle', 'Property Title')}</h3>
      <p>{t('housing.maxGuests', {
        defaultValue: 'Sleeps {{count}} guests',
        count: property.maxGuests
      })}</p>
    </GlassCard>
  );
}
```

#### Translation Patterns

**1. Simple Text**
```tsx
{t('common.save', 'Save')}
{t('common.cancel', 'Cancel')}
```

**2. With Variables**
```tsx
{t('housing.pricePerNight', {
  defaultValue: '{{price}} per night',
  price: formatCurrency(listing.price)
})}
```

**3. Pluralization**
```tsx
{t('housing.bedroomCount', {
  count: bedrooms,
  defaultValue: '{{count}} bedroom',
  defaultValue_plural: '{{count}} bedrooms'
})}
```

**4. With Namespace**
```tsx
const { t } = useTranslation('housing');
{t('onboarding.step1.title', 'Property Type')}
```

#### Translation Key Namespaces

Organized by module in `client/src/i18n/locales/[lang]/`:

- **`common.json`** - Shared UI (Save, Cancel, Loading, etc.)
- **`housing.json`** - Housing marketplace, onboarding, bookings
- **`social.json`** - Posts, comments, friends, groups
- **`events.json`** - Event creation, RSVP, calendar
- **`agents.json`** - Life CEO agents

#### Supported Languages

**Primary (6):** English, Spanish, French, German, Italian, Portuguese  
**Total:** 73 languages including:
- **RTL Support:** Arabic, Hebrew, Persian, Urdu
- **Asian:** Chinese, Japanese, Korean, Hindi, Thai
- **Cultural Variants:** Spanish (Argentina - Lunfardo), French (Canada), Portuguese (Brazil)

#### How Language Changes Work

```tsx
import { changeLanguage } from '@/i18n/config';

// User selects language
await changeLanguage('es'); // Spanish

// Auto-updates:
// 1. All t() calls re-render with new translations
// 2. localStorage saves preference
// 3. Document direction updates (LTR/RTL)
```

#### Translation File Structure

```json
{
  "housing": {
    "propertyTitle": "Property Title",
    "maxGuests": "Sleeps {{count}} guests",
    "bedroomCount": "{{count}} bedroom",
    "bedroomCount_plural": "{{count}} bedrooms"
  }
}
```

#### Best Practices

✅ **Always provide default values** - Prevents blank UI if translation missing  
✅ **Use semantic keys** - `housing.propertyTitle` not `housing.text1`  
✅ **Translate everything** - Labels, buttons, placeholders, errors, tooltips  
✅ **Test with long text** - German/French translations are 30% longer than English  
✅ **Consider RTL** - Arabic/Hebrew reverse layout direction

---

### GSAP ScrollTrigger Usage

**Location:** `client/src/hooks/useScrollReveal.ts`

Aurora Tide uses GSAP ScrollTrigger for scroll-based animations with **memory-safe cleanup** and **accessibility support**.

#### useScrollReveal Hook

Animates child elements as they enter the viewport.

```tsx
import { useScrollReveal } from '@/hooks/useScrollReveal';

function PropertyList({ properties }) {
  // Animate cards on scroll
  const cardsRef = useScrollReveal('.property-card', {
    opacity: 0,
    y: 30,
  }, {
    stagger: 0.1,
    start: 'top 85%',
    once: true,
    respectReducedMotion: true,
  });

  return (
    <div ref={cardsRef}>
      {properties.map(property => (
        <div key={property.id} className="property-card">
          <PropertyCard data={property} />
        </div>
      ))}
    </div>
  );
}
```

#### Hook Parameters

```typescript
useScrollReveal(
  selector: string,           // CSS selector for child elements
  animation: gsap.TweenVars,  // GSAP animation properties
  options: ScrollRevealOptions // ScrollTrigger configuration
)
```

**1. selector** - Target child elements to animate
```tsx
'.property-card'  // Animate all elements with this class
'.step-indicator' // Animate step indicators
```

**2. animation** - GSAP properties (defaults: `{ opacity: 0, y: 50 }`)
```tsx
{ opacity: 0, y: 30 }           // Fade + slide up
{ opacity: 0, scale: 0.95 }     // Fade + scale
{ opacity: 0, x: -50 }          // Fade + slide from left
```

**3. options** - ScrollTrigger configuration
```typescript
{
  start?: string;                // Trigger point (default: 'top 80%')
  end?: string;                  // End point (default: 'bottom 20%')
  stagger?: number;              // Delay between elements (default: 0.1)
  once?: boolean;                // Animate only once (default: true)
  respectReducedMotion?: boolean; // Honor accessibility (default: true)
  scrub?: boolean | number;      // Scrub animation to scroll
  markers?: boolean;             // Debug markers (dev only)
}
```

#### Implementation Pattern

1. **Attach ref to wrapper element**
2. **Add class to child elements**
3. **Hook finds and animates children**
4. **Cleanup handled automatically**

```tsx
const progressRef = useScrollReveal('.progress-step', {
  opacity: 0,
  y: 20,
}, {
  stagger: 0.15,
  start: 'top 90%',
});

<div ref={progressRef}>
  <div className="progress-step">Step 1</div>
  <div className="progress-step">Step 2</div>
  <div className="progress-step">Step 3</div>
</div>
```

#### Additional Hooks

**useParallax** - Parallax scrolling effect
```tsx
const heroRef = useParallax('.hero-background', -100);

<div ref={heroRef}>
  <div className="hero-background">
    {/* Moves -100px during scroll */}
  </div>
</div>
```

**usePinElement** - Pin element during scroll
```tsx
const navRef = usePinElement('.sticky-nav', {
  start: 'top top',
  end: 'bottom top',
  pinSpacing: true,
});

<div ref={navRef}>
  <nav className="sticky-nav">
    {/* Pinned while scrolling */}
  </nav>
</div>
```

**useScrollProgress** - Track scroll progress
```tsx
const [progress, setProgress] = useState(0);

const progressRef = useScrollProgress('.progress-section', {
  start: 'top top',
  end: 'bottom bottom',
  onUpdate: (progress) => setProgress(progress * 100),
});

<div ref={progressRef} className="progress-section">
  <ProgressBar value={progress} />
</div>
```

#### Accessibility

**Respects `prefers-reduced-motion`:**
```tsx
// User has motion sensitivity
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  // Animations automatically disabled
}
```

To override (not recommended):
```tsx
useScrollReveal('.card', animation, {
  respectReducedMotion: false, // Force animations
});
```

#### Memory Safety

All hooks include proper cleanup:
- Kills GSAP tweens on unmount
- Removes ScrollTrigger instances
- Clears timeouts
- No memory leaks

```tsx
// Automatic cleanup
useEffect(() => {
  // ... create animations
  
  return () => {
    tween.kill();
    scrollTriggerInstance.kill();
  };
}, []);
```

#### Production Examples

**HostOnboarding** - Progress indicator reveals:
```tsx
const progressRef = useScrollReveal('.progress-indicator', {
  opacity: 0,
  scale: 0.95,
}, {
  start: 'top 90%',
  once: true,
});
```

**host-bookings** - Booking cards stagger:
```tsx
const cardsRef = useScrollReveal('.booking-card', {
  opacity: 0,
  y: 30,
}, {
  stagger: 0.1,
  start: 'top 85%',
  once: true,
});
```

---

### Platform-Wide Design Cohesion

Aurora Tide unifies **4 core systems** across all modules (Housing, Admin, Social, Life CEO):

#### 1. Glassmorphic Components (Visual Layer)

**GlassCard** with 4 depth levels - consistent across platform

```tsx
// Housing Module
<GlassCard depth={2} className="border-cyan-200/30 dark:border-cyan-500/30">
  <h3>Property Details</h3>
</GlassCard>

// Admin Module
<GlassCard depth={3} className="border-cyan-200/30 dark:border-cyan-500/30">
  <h2>System Metrics</h2>
</GlassCard>

// Social Module
<GlassCard depth={2} className="border-cyan-200/30 dark:border-cyan-500/30">
  <PostCard />
</GlassCard>
```

#### 2. MT Ocean Theme (Color System)

**Cyan → Teal → Blue gradients** - works in light AND dark mode

```tsx
// Primary gradient (CTAs, headers)
className="bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-500"

// Text gradient (headings)
className="bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-600 
           dark:from-cyan-400 dark:via-teal-400 dark:to-blue-400 
           bg-clip-text text-transparent"

// Status badges
className="bg-gradient-to-r from-cyan-300 to-cyan-400" // Success
className="bg-gradient-to-r from-yellow-200 to-amber-400" // Warning
className="bg-gradient-to-r from-red-300 to-red-400" // Error
```

#### 3. Dark Mode (Theme Layer)

**Global ThemeProvider** - all components use `dark:` variants

```tsx
import { useTheme } from '@/contexts/theme-context';

// Auto-persisted to localStorage
// Auto-applied to <html class="dark">
// All Tailwind dark: variants activate

<div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
  Content adapts automatically
</div>
```

#### 4. i18next Translations (Localization Layer)

**73 languages** - all text uses `t()` function

```tsx
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();

<h1>{t('module.title', 'Default Title')}</h1>
<p>{t('module.description', {
  defaultValue: 'Value: {{value}}',
  value: data
})}</p>
```

---

#### Cross-Module Consistency Examples

**Housing Module:**
```tsx
<GlassCard depth={2} className="border-cyan-200/30 dark:border-cyan-500/30">
  <h3 className="text-slate-900 dark:text-white">
    {t('housing.myProperties', 'My Properties')}
  </h3>
  <PulseButton className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white">
    {t('housing.addProperty', 'Add Property')}
  </PulseButton>
</GlassCard>
```

**Admin Module:**
```tsx
<GlassCard depth={3} className="border-cyan-200/30 dark:border-cyan-500/30">
  <h2 className="bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
    {t('admin.dashboard', 'Admin Dashboard')}
  </h2>
  <div className="text-slate-700 dark:text-slate-300">
    {t('admin.systemHealth', 'System Health')}
  </div>
</GlassCard>
```

**Social Module:**
```tsx
<GlassCard depth={2} className="border-cyan-200/30 dark:border-cyan-500/30">
  <MagneticButton onClick={handleLike}>
    <Heart className="text-cyan-500" />
  </MagneticButton>
  <p className="text-slate-600 dark:text-slate-400">
    {t('social.likes', { count, defaultValue: '{{count}} likes' })}
  </p>
</GlassCard>
```

---

#### Design Scaffolding Standards

**Standard Page Structure:**
```tsx
import { GlassCard } from '@/components/glass/GlassComponents';
import { FadeIn, StaggerContainer, ScaleIn } from '@/components/animations/FramerMotionWrappers';
import { MagneticButton, PulseButton } from '@/components/interactions/MicroInteractions';
import { useTranslation } from 'react-i18next';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export default function AuroraTidePage() {
  const { t } = useTranslation();
  
  const cardsRef = useScrollReveal('.reveal-card', {
    opacity: 0,
    y: 30,
  }, {
    stagger: 0.1,
    once: true,
  });
  
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-8">
        
        {/* Header */}
        <FadeIn>
          <GlassCard depth={2} className="mb-6 border-cyan-200/30 dark:border-cyan-500/30">
            <div className="p-6">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-600 dark:from-cyan-400 dark:via-teal-400 dark:to-blue-400 bg-clip-text text-transparent">
                {t('page.title', 'Page Title')}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                {t('page.subtitle', 'Page subtitle')}
              </p>
            </div>
          </GlassCard>
        </FadeIn>
        
        {/* Content Grid */}
        <div ref={cardsRef}>
          <StaggerContainer staggerDelay={0.1}>
            {items.map(item => (
              <ScaleIn key={item.id}>
                <GlassCard 
                  depth={2}
                  className="p-6 border-cyan-200/30 dark:border-cyan-500/30 reveal-card"
                >
                  <h3 className="text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mt-2">
                    {item.description}
                  </p>
                  
                  <PulseButton className="mt-4 px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl">
                    {t('action.view', 'View Details')}
                  </PulseButton>
                </GlassCard>
              </ScaleIn>
            ))}
          </StaggerContainer>
        </div>
        
      </div>
    </DashboardLayout>
  );
}
```

---

#### Component Hierarchy

1. **Layout** - DashboardLayout (navigation + content area)
2. **Animations** - FadeIn/StaggerContainer wrappers
3. **Cards** - GlassCard with MT Ocean borders
4. **Interactions** - MagneticButton/PulseButton for actions
5. **Text** - Always use `dark:` variants + `t()` translations
6. **Scroll Reveals** - useScrollReveal for viewport animations

---

#### Color Palette Enforcement

**Backgrounds:**
- Light: `bg-slate-50`, `bg-white`, `bg-gradient-to-br from-slate-50 to-cyan-50/30`
- Dark: `dark:bg-slate-950`, `dark:bg-slate-900`

**Text:**
- Headings: `text-slate-900 dark:text-white`
- Body: `text-slate-700 dark:text-slate-300`
- Muted: `text-slate-600 dark:text-slate-400`
- Disabled: `text-slate-400 dark:text-slate-600`

**Accents (MT Ocean):**
- Primary: `cyan-500`, `teal-500`, `blue-500`
- Gradients: `from-cyan-500 via-teal-500 to-blue-500`
- Borders: `border-cyan-200/30 dark:border-cyan-500/30`

**Status Colors:**
- Success: `cyan-300` → `cyan-400`
- Warning: `yellow-200` → `amber-400`
- Error: `red-300` → `red-400`

---

#### Quality Checklist

Before deploying a new component, ensure:

- [ ] **Uses GlassCard** (not regular Card component)
- [ ] **Dark mode variants** on ALL visual properties (bg, text, borders, shadows)
- [ ] **Text uses `t()` function** with default values
- [ ] **Buttons use MagneticButton or PulseButton** (not plain Button)
- [ ] **Follows MT Ocean gradients** (cyan/teal/blue, not pink/purple)
- [ ] **Includes scroll animations** (if page-level component)
- [ ] **Has `data-testid` attributes** for E2E testing
- [ ] **Responsive design** (mobile-first Tailwind classes)
- [ ] **Accessibility** (ARIA labels, keyboard navigation)

---

#### Migration from Old Patterns

**Before (Old MT Ocean / Generic Styles):**
```tsx
<Card className="bg-white border-gray-200 shadow-md">
  <h3 className="text-gray-900">Property Title</h3>
  <p className="text-gray-600">Description text</p>
  <Button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
    View Details
  </Button>
</Card>
```

**After (Aurora Tide):**
```tsx
<ScaleIn>
  <GlassCard depth={2} className="border-cyan-200/30 dark:border-cyan-500/30">
    <h3 className="text-slate-900 dark:text-white">
      {t('housing.propertyTitle', 'Property Title')}
    </h3>
    <p className="text-slate-600 dark:text-slate-400">
      {t('housing.description', 'Description text')}
    </p>
    <PulseButton className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl">
      {t('housing.viewDetails', 'View Details')}
    </PulseButton>
  </GlassCard>
</ScaleIn>
```

**Key Changes:**
1. ✅ `Card` → `GlassCard` with depth
2. ✅ Pink/purple → Cyan/teal gradients
3. ✅ Wrap with Framer Motion components
4. ✅ Add dark mode variants to ALL properties
5. ✅ Use MagneticButton/PulseButton
6. ✅ Add i18next translations
7. ✅ Include data-testids

---

#### Platform Modules Using Aurora Tide

**Housing Platform** (100% coverage)
- HostOnboarding, GuestOnboarding
- HostDashboard, host-bookings, my-bookings
- host-calendar, housing-marketplace
- listing-detail, HostHomesList

**Admin Center** (In progress)
- AdminCenter dashboard
- Agent metrics
- Analytics dashboards

**Social Features** (Partial)
- GroupDetailPageMT
- Community world map

**Life CEO** (Planned)
- Agent interfaces
- Dashboard widgets

---

## Implemented Components

### Housing Platform (All Aurora Tide)

| Component | File | Depth | Animations | i18next |
|-----------|------|-------|------------|---------|
| **Host Onboarding** | `pages/HostOnboarding.tsx` | 2-3 | FadeIn, StaggerContainer | ✅ |
| **Guest Onboarding** | `pages/GuestOnboarding.tsx` | 2-3 | ScaleIn, SlideIn | ✅ |
| **Host Bookings** | `pages/host-bookings.tsx` | 2 | StaggerContainer, ScaleIn | ✅ |
| **Host Calendar** | `pages/host-calendar.tsx` | 2 | FadeIn, ScaleIn | ✅ |
| **My Bookings** | `pages/my-bookings.tsx` | 2 | StaggerContainer, ScaleIn | ✅ |
| **Review Components** | `components/reviews/*` | 1-2 | ScaleIn, StaggerContainer | ✅ |
| **HostHomesList** | `components/Housing/HostHomesList.tsx` | 2 | StaggerContainer, ScaleIn | ✅ |

### Micro-interactions Coverage

| Component | MagneticButton | PulseButton | RippleButton |
|-----------|---------------|-------------|--------------|
| Host Onboarding | Navigation | Submit | - |
| Guest Onboarding | Back | Book Now | - |
| Host Bookings | Actions | Accept/Decline | - |
| My Bookings | Cancel | - | - |
| Reviews | Respond | Post Response | - |
| HostHomesList | Filters | Request Stay | - |

---

## Performance Optimization

### GPU Acceleration
```css
.glass-card {
  transform: translateZ(0);
  will-change: transform, opacity;
}
```

### Reduced Motion Support
```typescript
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

<FadeIn duration={prefersReducedMotion ? 0.1 : 0.4}>
  <Content />
</FadeIn>
```

### Lazy Loading Animations
```typescript
import { lazy, Suspense } from 'react';

const HeavyAnimation = lazy(() => import('./HeavyAnimation'));

<Suspense fallback={<Skeleton />}>
  <HeavyAnimation />
</Suspense>
```

---

## Testing

### Data-testid Convention

All interactive elements include `data-testid`:

```typescript
// Pattern: {action}-{target}[-{id}]
<PulseButton data-testid="button-submit-booking">
<MagneticButton data-testid="button-cancel-123">
<GlassCard data-testid="card-property-456">
```

### Playwright E2E Tests

```typescript
test('Aurora Tide animations work', async ({ page }) => {
  await page.goto('/housing-marketplace');
  
  // Wait for StaggerContainer animation
  await page.waitForTimeout(500);
  
  // Verify glassmorphic cards
  const card = page.getByTestId('card-property-1');
  await expect(card).toHaveCSS('backdrop-filter', /blur/);
  
  // Test magnetic button
  const button = page.getByTestId('button-request-stay-1');
  await button.hover();
  // Button should shift position
});
```

---

## Accessibility

### WCAG 2.2 Compliance

✅ **Color Contrast:**
- MT Ocean gradients tested against white/dark backgrounds
- All text meets AA contrast (4.5:1 minimum)

✅ **Keyboard Navigation:**
- All MagneticButton/PulseButton support keyboard events
- Focus indicators visible on glass backgrounds

✅ **Screen Readers:**
- ARIA labels on all interactive elements
- Semantic HTML structure maintained

✅ **Motion Preferences:**
- `prefers-reduced-motion` support
- Animations disabled/shortened for accessibility

### Focus Indicators

```css
/* Light mode */
.glass-card:focus-visible {
  outline: 2px solid #14B8A6;
  outline-offset: 2px;
}

/* Dark mode */
.dark .glass-card:focus-visible {
  outline: 2px solid #5EEAD4;
  outline-offset: 2px;
}
```

---

## Usage Examples

### Complete Page Template

```typescript
import { GlassCard } from '@/components/glass/GlassComponents';
import { FadeIn, ScaleIn, StaggerContainer } from '@/components/animations/FramerMotionWrappers';
import { MagneticButton, PulseButton } from '@/components/interactions/MicroInteractions';
import { useTranslation } from 'react-i18next';

export default function AuroraTidePage() {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header */}
        <FadeIn>
          <GlassCard depth={2} className="mb-6 border-cyan-200/30 dark:border-cyan-500/30">
            <div className="p-6">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
                {t('page.title', 'Aurora Tide Page')}
              </h1>
            </div>
          </GlassCard>
        </FadeIn>
        
        {/* Content Grid */}
        <StaggerContainer staggerDelay={0.1}>
          <div className="grid grid-cols-3 gap-6">
            {items.map(item => (
              <ScaleIn key={item.id} delay={0.05}>
                <GlassCard 
                  depth={2}
                  className="p-6 border-cyan-200/30 dark:border-cyan-500/30"
                >
                  <h3 className="text-slate-900 dark:text-white">{item.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400">{item.desc}</p>
                  
                  <PulseButton className="mt-4 px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl">
                    {t('action.view', 'View Details')}
                  </PulseButton>
                </GlassCard>
              </ScaleIn>
            ))}
          </div>
        </StaggerContainer>
        
      </div>
    </div>
  );
}
```

---

## Migration Guide

### Converting Existing Components

**Before (Old MT Ocean):**
```tsx
<Card className="bg-white border-gray-200 shadow-md">
  <h3 className="text-gray-900">Title</h3>
  <Button className="bg-gradient-to-r from-pink-500 to-purple-600">
    Action
  </Button>
</Card>
```

**After (Aurora Tide):**
```tsx
<ScaleIn>
  <GlassCard depth={2} className="border-cyan-200/30 dark:border-cyan-500/30">
    <h3 className="text-slate-900 dark:text-white">Title</h3>
    <PulseButton className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl">
      Action
    </PulseButton>
  </GlassCard>
</ScaleIn>
```

**Key Changes:**
1. Replace `Card` → `GlassCard` with depth
2. Replace pink/purple → cyan/teal gradients
3. Wrap with Framer Motion components
4. Add dark mode variants
5. Use Magnetic/Pulse buttons
6. Add i18next translations
7. Include data-testids

---

## Resources

### Component Files
- **Glass:** `client/src/components/glass/GlassComponents.tsx`
- **Animations:** `client/src/components/animations/FramerMotionWrappers.tsx`
- **Interactions:** `client/src/components/interactions/MicroInteractions.tsx`

### Related Documentation
- [Housing Marketplace](../housing/housing-marketplace.md)
- [Host Onboarding](../housing/HostOnboarding.md)
- [Guest Onboarding](../housing/GuestOnboarding.md)
- [Review System](../housing/reviews.md)

### Design Tokens
- [Tailwind Config](../../../tailwind.config.ts)
- [Global Styles](../../../client/src/index.css)

---

## Changelog

**October 6, 2025 - Developer Documentation Update:**
- ✅ Added comprehensive "Developer Guides" section with 4 practical guides
- ✅ **Dark Mode Toggle Guide:** ThemeProvider usage, useTheme hook, implementation patterns
- ✅ **i18next Translation Workflow:** Step-by-step guide, patterns (simple, variables, pluralization), 73 language support
- ✅ **GSAP ScrollTrigger Usage:** useScrollReveal hook docs, additional hooks (useParallax, usePinElement, useScrollProgress), accessibility
- ✅ **Platform-Wide Design Cohesion:** 4 core systems integration, cross-module examples, scaffolding standards, quality checklist, migration guide
- ✅ Enhanced documentation with ~500 lines of practical developer guidance

**October 6, 2025 - Initial Aurora Tide Launch:**
- ✅ Complete Aurora Tide transformation of 7 housing components
- ✅ Glassmorphic depth system (1-4 levels)
- ✅ MT Ocean Theme gradients (cyan/teal/blue)
- ✅ Framer Motion animation suite
- ✅ Micro-interactions (Magnetic, Pulse, Ripple)
- ✅ Full dark mode support
- ✅ i18next integration (6 languages)
- ✅ Data-testid coverage for E2E testing

---

**Aurora Tide Design System - Production Ready** 🎨✨
