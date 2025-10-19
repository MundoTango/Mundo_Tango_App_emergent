# Mundo Tango Build & Styling Stack Guide
**Version:** 1.0  
**Last Updated:** October 19, 2025  
**Build Tool:** Vite | **Styling:** Tailwind CSS + MT Ocean Theme

## Overview

Mundo Tango uses **Vite** for blazing-fast builds and **Tailwind CSS** for utility-first styling with the custom MT Ocean theme (teal/cyan gradients, glassmorphic design).

---

## Vite Configuration

### **vite.config.ts** (NEVER EDIT - Forbidden)

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@shared': path.resolve(__dirname, './shared'),
      '@assets': path.resolve(__dirname, './client/attached_assets'),
    },
  },
  server: {
    port: 5000,
    host: '0.0.0.0', // Required for Replit preview
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-select'],
        },
      },
    },
  },
});
```

**Key Features:**
- ✅ Path aliases (`@/`, `@shared/`, `@assets/`)
- ✅ HMR (Hot Module Replacement)
- ✅ Code splitting
- ✅ Tree shaking

---

## Build Commands

```bash
# Development (with HMR)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Type check
npm run typecheck
```

---

## Tailwind CSS Configuration

### **tailwind.config.ts**

```typescript
import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'], // Enable dark mode with class strategy
  content: [
    './client/src/**/*.{ts,tsx}',
    './client/index.html',
  ],
  theme: {
    extend: {
      colors: {
        // MT Ocean Theme
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      backgroundImage: {
        'gradient-ocean': 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
```

---

## MT Ocean Theme (Dark Mode)

### **client/src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Primary: Teal/Cyan */
  --primary: 180 80% 50%;
  --primary-foreground: 0 0% 100%;
  
  /* Accent: Cyan highlights */
  --accent: 185 85% 55%;
  --accent-foreground: 0 0% 100%;
  
  /* Background: Light glassmorphic */
  --background: 210 20% 98%;
  --foreground: 210 20% 10%;
  
  /* Muted */
  --muted: 210 30% 96%;
  --muted-foreground: 210 10% 40%;
  
  /* Card */
  --card: 0 0% 100%;
  --card-foreground: 210 20% 10%;
  
  /* Border */
  --border: 210 30% 88%;
  --input: 210 30% 88%;
  --ring: 180 80% 50%;
  
  --radius: 0.5rem;
}

.dark {
  --primary: 180 75% 45%;
  --primary-foreground: 0 0% 100%;
  
  --accent: 185 80% 50%;
  --accent-foreground: 0 0% 100%;
  
  --background: 210 20% 10%;
  --foreground: 210 20% 98%;
  
  --muted: 210 20% 15%;
  --muted-foreground: 210 10% 60%;
  
  --card: 210 20% 12%;
  --card-foreground: 210 20% 98%;
  
  --border: 210 20% 20%;
  --input: 210 20% 20%;
  --ring: 180 75% 45%;
}
```

---

## Styling Patterns

### **Pattern 1: Utility Classes**

```typescript
// Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {posts.map(post => <PostCard key={post.id} post={post} />)}
</div>

// Dark mode variants
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
  Content
</div>

// Hover states
<button className="bg-primary hover:bg-primary/90 transition-colors">
  Click me
</button>
```

### **Pattern 2: Glassmorphic Cards**

```typescript
<Card className="
  bg-white/80 
  dark:bg-gray-900/80 
  backdrop-blur-md 
  border-white/20 
  shadow-xl
">
  <CardContent>
    Glassmorphic content
  </CardContent>
</Card>
```

### **Pattern 3: Gradients**

```typescript
// MT Ocean gradient
<div className="bg-gradient-ocean text-white">
  Teal to Cyan gradient
</div>

// Custom gradient
<div className="bg-gradient-to-r from-teal-500 to-cyan-500">
  Custom gradient
</div>
```

### **Pattern 4: Custom Components**

```typescript
// Using @layer for custom utilities
@layer components {
  .btn-ocean {
    @apply bg-gradient-ocean text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity;
  }
  
  .card-ocean {
    @apply bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-white/20 rounded-lg p-6;
  }
}

// Usage
<button className="btn-ocean">Ocean Button</button>
<div className="card-ocean">Ocean Card</div>
```

---

## Performance Optimization

### **1. Code Splitting**

```typescript
// Lazy load components
import { lazy, Suspense } from 'react';

const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

export function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminDashboard />
    </Suspense>
  );
}
```

### **2. CSS Purging** (Automatic)

Tailwind automatically removes unused CSS in production:

```bash
# Production build purges unused classes
npm run build

# Check bundle size
npm run build --analyze
```

### **3. Asset Optimization**

```typescript
// Import images (Vite optimizes automatically)
import logo from '@assets/logo.png';

<img src={logo} alt="Logo" />

// SVG as component
import { ReactComponent as Icon } from '@assets/icon.svg';

<Icon className="w-6 h-6" />
```

---

## Build Optimization

### **Chunk Strategy**

```typescript
// vite.config.ts (DO NOT EDIT without approval)
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom'],
        ui: ['@radix-ui/react-dialog', '@radix-ui/react-select'],
        query: ['@tanstack/react-query'],
        form: ['react-hook-form', '@hookform/resolvers'],
      },
    },
  },
}
```

---

## Environment Variables

```bash
# Frontend (.env)
VITE_API_URL=http://localhost:5000
VITE_ENVIRONMENT=development

# Access in code
const apiUrl = import.meta.env.VITE_API_URL;
```

**NOTE:** Only `VITE_` prefixed vars are available in frontend!

---

## Troubleshooting

### **Issue: Styles not updating**

```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Restart dev server
npm run dev
```

### **Issue: Build errors**

```bash
# Type check
npm run typecheck

# Check for circular dependencies
npm run build --debug
```

---

## Next Steps

1. Read `docs/MT_SHADCN_UI_COMPONENT_GUIDE.md` for component styling
2. See `docs/REPLIT_COST_OPTIMIZATION.md` for production build optimization
3. Review `vite.config.ts` (READ ONLY - do not modify)

**Related Files:**
- `vite.config.ts` - Vite configuration (FORBIDDEN to edit)
- `tailwind.config.ts` - Tailwind configuration
- `client/src/index.css` - Global styles and theme
