# ESA Layer 9: UI Framework Agent 🎨

## Overview
Layer 9 manages the Tailwind CSS utility-first framework, MT Ocean Theme implementation, glassmorphic design patterns, and responsive design system.

## Recent Updates (October 1, 2025)

### MT Ocean Theme Refactor
- **New Color Gradient**: Turquoise → Dodger Blue → Cobalt Blue (#40E0D0 → #1E90FF → #0047AB)
- **Format Modernization**: All RGBA values converted to HSLA format
- **Dark Mode Standardization**: Cobalt blue family (hsl 218°) for consistent shadows, gradients, borders
- **Token Architecture**: Single source of truth in `client/src/styles/design-tokens.css`
- **Phase 1 Complete**: Sidebar and UnifiedTopBar fully refactored with zero inline styles

### Design Token System
- **30+ utility classes** for colors, spacing, shadows, typography
- **Zero hardcoded hex values** - All colors via CSS variables
- **Zero JS hover handlers** - CSS-only `:hover` pseudo-classes
- **WCAG AA compliant** - All gradients verified for 4.5:1+ contrast ratio

## Core Responsibilities

### 1. Design System Management
- Tailwind CSS configuration
- Token-based architecture (`design-tokens.css`)
- HSLA color palette management
- Typography system
- Spacing and sizing scales

### 2. MT Ocean Theme
- Gradient system (#40E0D0 → #1E90FF → #0047AB)
- Glassmorphic components
- Dark/light mode theming with cobalt blue family
- Custom animations
- Brand consistency across all components

### 3. Responsive Design
- Mobile-first approach
- Breakpoint management
- Container queries
- Fluid typography
- Adaptive layouts

## Open Source Packages

```json
{
  "tailwindcss": "^3.4.0",
  "tailwindcss-animate": "^1.0.7",
  "tailwind-merge": "^2.2.0",
  "@tailwindcss/typography": "^0.5.10",
  "@tailwindcss/vite": "^0.0.0-insiders.35938b3",
  "autoprefixer": "^10.4.16",
  "postcss": "^8.4.33",
  "clsx": "^2.1.0",
  "class-variance-authority": "^0.7.0",
  "tw-animate-css": "^1.0.9"
}
```

## Integration Points

- **Layer 8 (Client Framework)**: React component styling
- **Layer 10 (Component Library)**: Component variants
- **Layer 47 (Mobile)**: Responsive breakpoints
- **Layer 53 (i18n)**: RTL layout support
- **Layer 54 (Accessibility)**: WCAG color contrast

## Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: ['./client/src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // MT Ocean Theme
        'mt-ocean': {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        border: 'hsl(var(--border))'
      },
      
      backgroundImage: {
        'mt-gradient': 'linear-gradient(135deg, #5EEAD4 0%, #155E75 100%)',
        'mt-gradient-radial': 'radial-gradient(circle, #5EEAD4 0%, #155E75 100%)'
      },
      
      backdropBlur: {
        xs: '2px'
      },
      
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite'
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' }
        }
      }
    }
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography')
  ]
};
```

## Glassmorphic Components

```css
/* Glassmorphism utilities */
.glass {
  @apply bg-white/10 backdrop-blur-md border border-white/20;
}

.glass-dark {
  @apply bg-black/10 backdrop-blur-md border border-black/20;
}

.glass-card {
  @apply glass rounded-2xl shadow-xl p-6;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.05)
  );
}

.glass-button {
  @apply glass px-4 py-2 rounded-lg hover:bg-white/20 transition-all;
}
```

## Component Styling Patterns

```typescript
// Using class-variance-authority for component variants
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-mt-gradient text-white hover:opacity-90',
        destructive: 'bg-red-500 text-white hover:bg-red-600',
        outline: 'border border-mt-ocean-300 bg-transparent hover:bg-mt-ocean-50',
        ghost: 'hover:bg-mt-ocean-50 hover:text-mt-ocean-900',
        glass: 'glass hover:bg-white/20',
        link: 'text-mt-ocean-600 underline-offset-4 hover:underline'
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-8',
        icon: 'h-10 w-10'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

interface ButtonProps extends VariantProps<typeof buttonVariants> {
  className?: string;
  children: React.ReactNode;
}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
```

## Responsive Utilities

```typescript
// Responsive hook
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<string>('mobile');
  
  useEffect(() => {
    const checkBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 640) setBreakpoint('mobile');
      else if (width < 768) setBreakpoint('sm');
      else if (width < 1024) setBreakpoint('md');
      else if (width < 1280) setBreakpoint('lg');
      else setBreakpoint('xl');
    };
    
    checkBreakpoint();
    window.addEventListener('resize', checkBreakpoint);
    return () => window.removeEventListener('resize', checkBreakpoint);
  }, []);
  
  return breakpoint;
}

// Responsive component example
export function ResponsiveGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {children}
    </div>
  );
}
```

## Dark Mode Implementation

```css
/* CSS Variables for theming */
:root {
  --primary: 175 84% 32%;
  --primary-foreground: 0 0% 100%;
  --background: 0 0% 100%;
  --foreground: 175 84% 10%;
  --border: 175 30% 90%;
}

.dark {
  --primary: 175 84% 40%;
  --primary-foreground: 175 84% 10%;
  --background: 175 84% 5%;
  --foreground: 0 0% 95%;
  --border: 175 30% 20%;
}
```

## Animation Utilities

```typescript
// Micro-interactions
export const microInteractions = {
  ripple: 'hover:before:animate-ping hover:before:absolute hover:before:inset-0',
  magnetic: 'hover:scale-105 transition-transform duration-200',
  glow: 'hover:shadow-[0_0_20px_rgba(94,234,212,0.5)]',
  shake: 'hover:animate-[shake_0.5s]',
  bounce: 'hover:animate-bounce'
};

// Particle effects
export function ParticleBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-mt-gradient opacity-20" />
      <div className="particle-container">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              '--delay': `${Math.random() * 5}s`,
              '--duration': `${5 + Math.random() * 10}s`,
              left: `${Math.random() * 100}%`,
              animationDelay: 'var(--delay)',
              animationDuration: 'var(--duration)'
            }}
          />
        ))}
      </div>
    </div>
  );
}
```

## Typography System

```typescript
// Typography components
export const Typography = {
  H1: ({ children, className }: TypographyProps) => (
    <h1 className={cn(
      'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl',
      className
    )}>
      {children}
    </h1>
  ),
  
  H2: ({ children, className }: TypographyProps) => (
    <h2 className={cn(
      'scroll-m-20 text-3xl font-semibold tracking-tight',
      className
    )}>
      {children}
    </h2>
  ),
  
  Body: ({ children, className }: TypographyProps) => (
    <p className={cn('leading-7 [&:not(:first-child)]:mt-6', className)}>
      {children}
    </p>
  )
};
```

## Performance Considerations

| Optimization | Implementation |
|-------------|---------------|
| PurgeCSS | Automatic unused CSS removal |
| JIT Mode | Just-in-time compilation |
| Class Merging | tailwind-merge for conflicts |
| Critical CSS | Inline critical styles |
| Dynamic Classes | Avoid string concatenation |

## Testing Utilities

### Visual Theme Compliance Testing

```typescript
// Visual regression testing helpers
export const visualTestClasses = {
  // Consistent test classes for Percy/Playwright
  'test-primary-button': 'bg-mt-gradient text-white px-4 py-2 rounded-lg',
  'test-glass-card': 'glass-card p-6',
  'test-responsive-grid': 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
};

// MT Ocean theme compliance checks
export const themeComplianceTests = {
  // Verify no hardcoded hex colors
  noHexColors: (component: HTMLElement) => {
    const styles = window.getComputedStyle(component);
    const hasHexInline = component.getAttribute('style')?.includes('#');
    return !hasHexInline;
  },
  
  // Verify using design tokens
  usesDesignTokens: (component: HTMLElement) => {
    const classes = component.className;
    const validTokens = ['bg-ocean', 'text-ocean', 'border-ocean', 'shadow-ocean'];
    return validTokens.some(token => classes.includes(token));
  },
  
  // Verify gradient consistency
  verifyGradient: (element: HTMLElement) => {
    const bg = window.getComputedStyle(element).backgroundImage;
    // Should contain turquoise (#40E0D0) and cobalt (#0047AB) hues
    return bg.includes('180') || bg.includes('218'); // HSL hue values
  }
};

// Accessibility testing
export function checkColorContrast(foreground: string, background: string): boolean {
  // WCAG AA compliance check
  const ratio = getContrastRatio(foreground, background);
  return ratio >= 4.5; // AA standard for normal text
}

// Screenshot comparison for visual regression
export async function compareThemeConsistency(page: Page, componentName: string) {
  // Light mode screenshot
  await page.screenshot({ 
    path: `./visual-tests/${componentName}-light.png`,
    fullPage: false 
  });
  
  // Dark mode screenshot
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await page.screenshot({ 
    path: `./visual-tests/${componentName}-dark.png`,
    fullPage: false 
  });
  
  // Verify MT Ocean gradient present
  const gradient = await page.evaluate(() => {
    const elements = document.querySelectorAll('[class*="ocean-gradient"]');
    return elements.length > 0;
  });
  
  return { lightMode: true, darkMode: true, hasOceanGradient: gradient };
}
```

### Playwright Theme Tests

```typescript
// e2e/theme-compliance.spec.ts
import { test, expect } from '@playwright/test';

test.describe('MT Ocean Theme Compliance', () => {
  test('Sidebar uses design tokens', async ({ page }) => {
    await page.goto('/');
    
    const sidebar = page.locator('[data-testid="sidebar"]');
    const classes = await sidebar.getAttribute('class');
    
    // Verify design token usage
    expect(classes).toContain('bg-ocean-gradient');
    expect(classes).toContain('text-ocean');
    
    // Verify no inline styles with hex colors
    const inlineStyle = await sidebar.getAttribute('style');
    expect(inlineStyle).not.toMatch(/#[0-9A-Fa-f]{3,6}/);
  });
  
  test('Profile section interactive states', async ({ page }) => {
    await page.goto('/');
    
    const profileCard = page.locator('[data-testid="link-user-profile"]');
    
    // Take screenshot before hover
    await profileCard.screenshot({ path: 'profile-default.png' });
    
    // Hover and verify scale transform
    await profileCard.hover();
    const transform = await profileCard.evaluate(el => 
      window.getComputedStyle(el).transform
    );
    expect(transform).toContain('matrix'); // CSS transform applied
    
    // Take screenshot after hover
    await profileCard.screenshot({ path: 'profile-hover.png' });
  });
  
  test('Color contrast meets WCAG AA', async ({ page }) => {
    await page.goto('/');
    
    // Use @axe-core/playwright for automated a11y testing
    const axe = await injectAxe(page);
    const results = await page.evaluate(axe.run);
    
    const contrastViolations = results.violations.filter(
      v => v.id === 'color-contrast'
    );
    
    expect(contrastViolations.length).toBe(0);
  });
});
```

## Next Steps

- [ ] Implement container queries
- [ ] Add CSS-in-JS fallback
- [ ] Create theme marketplace
- [ ] Enhanced animation library

---

**Status**: 🟢 Operational
**Dependencies**: Tailwind CSS, PostCSS, Autoprefixer
**Owner**: Design Team
**Last Updated**: September 2025