# Design Systems Documentation

**Life CEO & Mundo Tango Platform**  
**Last Updated:** October 8, 2025

---

## Overview

The platform uses **Aurora Tide Design System** with MT Ocean Theme, built on ESA 105-Agent System with 61-Layer Framework framework principles. This documentation covers design standards, component usage, and migration guides.

---

## Core Documentation

### [Aurora Tide Design System](./aurora-tide.md)
Complete design system reference covering:
- Glassmorphic components (GlassCard with 4 depth levels)
- MT Ocean Theme gradients and color palette
- Framer Motion animations (FadeIn, ScaleIn, StaggerContainer)
- Micro-interactions (MagneticButton, PulseButton, RippleButton)
- Dark mode implementation
- i18next translation integration (73 languages)
- GSAP ScrollTrigger usage patterns

**Status:** ✅ Production-Ready  
**Coverage:** All housing platform components + 4 developer guides

---

### [Design Token Migration Guide](./design-token-migration.md)
Systematic migration from hardcoded colors to design tokens:
- 3-layer token architecture (primitives → semantic → components)
- Ocean palette reference (seafoam, cyan, teal)
- Migration patterns and examples
- Validation system (pre-commit hooks + CI/CD)
- Brand protection guidelines
- Accessibility compliance (WCAG 2.1 AA)

**Status:** 🔄 Phase 4 In Progress (82% complete)  
**Progress:** 607 → 586 violations (21 fixed)

---

## Quick Start

### Using Aurora Tide Components

```tsx
import { GlassCard } from '@/components/glass/GlassComponents';
import { FadeIn, StaggerContainer } from '@/components/animations/FramerMotionWrappers';
import { MagneticButton } from '@/components/interactions/MicroInteractions';
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <FadeIn>
      <GlassCard depth={2} className="border-cyan-200/30 dark:border-cyan-500/30">
        <h3 className="text-slate-900 dark:text-white">
          {t('module.title', 'Default Title')}
        </h3>
        
        <MagneticButton 
          strength={0.2}
          className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white"
        >
          {t('common.submit', 'Submit')}
        </MagneticButton>
      </GlassCard>
    </FadeIn>
  );
}
```

### Using Design Tokens

```css
/* Use ocean palette tokens */
.my-component {
  background: var(--ocean-seafoam-400);
  border: 1px solid hsl(177 72% 56% / 0.3);
  box-shadow: 0 0 0 3px hsl(177 72% 56% / 0.1);
}

/* Use predefined gradients */
.hero-section {
  background: var(--gradient-primary);
}

/* Dark mode support */
.card {
  background: var(--glass-bg);
  color: var(--text-primary);
}
```

---

## Design Standards

### MT Ocean Theme Color Palette

**Primary Gradient:**
- Cyan #5EEAD4 → Teal #14B8A6 → Deep Blue #155E75

**Semantic Colors:**
- Primary: `--ocean-seafoam-400` (turquoise accent)
- Info: `--ocean-cyan-400` (dodger blue)
- Success: `--color-success` (emerald green)
- Warning: `--color-warning` (amber)
- Error: `--color-error` (coral red)

### Glassmorphic Depth Levels

1. **Depth 1:** Subtle (nested content)
2. **Depth 2:** Primary (cards, default)
3. **Depth 3:** Elevated (modals, dialogs)
4. **Depth 4:** Maximum (overlays, popovers)

### Animation Principles

- **Duration:** 150-400ms for UI interactions
- **Easing:** `cubic-bezier(0.4, 0, 0.2, 1)` (smooth)
- **Stagger:** 50-150ms delay between list items
- **Accessibility:** Respects `prefers-reduced-motion`

---

## Implementation Checklist

### New Component Development

- [ ] Use `GlassCard` for container elements
- [ ] Add `FadeIn` or `ScaleIn` animation wrapper
- [ ] Apply MT Ocean gradients for CTAs
- [ ] Use `useTranslation()` for all text
- [ ] Include `dark:` variants for all colors
- [ ] Add `data-testid` attributes
- [ ] Use design tokens (no hardcoded colors)
- [ ] Test with dark mode enabled
- [ ] Verify with reduced motion preference

### Design Token Migration

- [ ] Run validation: `node design-system/scripts/validate-tokens.js`
- [ ] Replace hex colors with ocean tokens
- [ ] Convert `rgba()` to HSL with alpha channel
- [ ] Use gradient tokens instead of inline gradients
- [ ] Verify pre-commit hook passes
- [ ] Test in light and dark modes

---

## Validation & Testing

### Automated Checks

**Pre-Commit Hooks:**
```bash
# Blocks commits with hardcoded colors
.husky/pre-commit
```

**CI/CD Pipeline:**
```yaml
# GitHub Actions workflow
.github/workflows/design-tokens.yml
```

### Manual Validation

```bash
# Check for hardcoded colors
node design-system/scripts/validate-tokens.js

# Run accessibility audit
npm run test:a11y

# Visual regression testing
npm run test:visual
```

---

## Resources

### Documentation Files

- `aurora-tide.md` - Complete design system reference
- `design-token-migration.md` - Token migration guide
- `../../design-system/PHASE_4_STATUS.md` - Migration progress report
- `../../design-system/IMPLEMENTATION_STATUS.md` - Overall project status

### Code Files

- `client/src/styles/design-tokens.css` - Design token definitions
- `client/src/components/glass/GlassComponents.tsx` - Glassmorphic components
- `client/src/components/animations/FramerMotionWrappers.tsx` - Animation wrappers
- `client/src/components/interactions/MicroInteractions.tsx` - Interactive components
- `client/src/contexts/theme-context.tsx` - Dark mode provider
- `client/src/i18n/config.ts` - Translation configuration

### Tools & Scripts

- `design-system/scripts/validate-tokens.js` - Token validation
- `.github/workflows/design-tokens.yml` - CI/CD automation
- `.husky/pre-commit` - Git hooks

---

## ESA 105-Agent System with 61-Layer Framework Framework

Aurora Tide implements multiple ESA layers:

- **Layer 9:** UI Framework (design tokens, components)
- **Layer 10:** Component Audit (513 components analyzed)
- **Layer 48:** Performance (lazy loading, virtual scrolling)
- **Layer 51:** Testing Infrastructure (BackstopJS, axe-core)
- **Layer 52:** Accessibility (WCAG 2.1 AA compliance)
- **Layer 61:** Continuous Validation (automated checks)

**Framework Status:** 82% complete (Week 3.5/4)

---

## Support

**Questions or Issues:**
- Review documentation in `docs/pages/design-systems/`
- Check validation report: `node design-system/scripts/validate-tokens.js`
- See examples in `client/src/pages/` (housing modules)

**Contributing:**
- Follow Aurora Tide standards
- Use design tokens (no hardcoded colors)
- Add translations for all text
- Include dark mode variants
- Test accessibility with screen readers

---

**Maintained by:** ESA Design System Team  
**Framework:** ESA LIFE CEO 61x21  
**Theme:** Aurora Tide MT Ocean
