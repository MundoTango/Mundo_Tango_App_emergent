# React Application Deployment Guide

**Last Updated:** October 17, 2025  
**Version:** 1.0.0  
**Build Tool:** Vite 5.x  
**Framework:** React 18.3.1

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Build System Architecture](#build-system-architecture)
3. [Pre-Deployment Checklist](#pre-deployment-checklist)
4. [Environment Configuration](#environment-configuration)
5. [Build Process](#build-process)
6. [Deployment Platforms](#deployment-platforms)
7. [Performance Optimization](#performance-optimization)
8. [Monitoring & Validation](#monitoring--validation)
9. [Troubleshooting](#troubleshooting)

---

## Overview

This React application uses **Vite** as the primary build tool with production-optimized configurations. The build system is already configured for optimal performance with code splitting, tree shaking, and asset optimization.

### Key Features
- ✅ Vite build system (no webpack needed)
- ✅ Automatic code splitting (React, TanStack, Radix UI, utilities)
- ✅ Terser minification with console/debugger removal
- ✅ Asset optimization (inline < 4kb)
- ✅ Hash-based file names for cache busting
- ✅ Source maps disabled in production (configurable)
- ✅ Bundle size monitoring

---

## Build System Architecture

### Current Build Configuration

The application uses **Vite** exclusively. Key configuration details from `vite.config.ts`:

```typescript
// Production Build Settings
{
  outDir: 'dist',
  sourcemap: false,              // Disabled for production (can enable 'hidden')
  chunkSizeWarningLimit: 1000,   // 1MB warning threshold
  minify: 'terser',              // Aggressive minification
  terserOptions: {
    compress: {
      drop_console: true,        // Remove console.* in production
      drop_debugger: true         // Remove debugger statements
    }
  }
}
```

### Code Splitting Strategy

The build automatically splits code into optimized chunks:

| Chunk | Contents | Purpose |
|-------|----------|---------|
| `vendor-react` | React, React-DOM | Core framework (cached separately) |
| `tanstack` | @tanstack/react-query | Data fetching library |
| `ui` | @radix-ui components | UI component library |
| `utils` | lodash, date-fns, zod | Utility libraries |
| `vendor` | Other node_modules | Third-party dependencies |

### Asset Optimization

- **Inline Limit:** Assets < 4kb are inlined as base64
- **File Naming:** `assets/[name]-[hash][extname]` for cache busting
- **Chunk Naming:** `js/[name]-[hash].js` for versioning

---

## Pre-Deployment Checklist

### 1. Code Quality
- [ ] All tests passing (`npm run test:all`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] Bundle size < 5MB total

### 2. Environment Setup
- [ ] Production environment variables configured
- [ ] API endpoints updated for production
- [ ] CDN URLs configured (if applicable)
- [ ] Feature flags set correctly

### 3. Security
- [ ] All secrets in environment variables (not committed)
- [ ] HTTPS enabled
- [ ] CORS configured correctly
- [ ] CSP headers configured

### 4. Performance
- [ ] Lazy loading implemented for routes
- [ ] Images optimized (WebP/AVIF when possible)
- [ ] Bundle analyzed (`npm run bundle:analyze`)
- [ ] Lighthouse score > 90

---

## Environment Configuration

### Production Environment Variables

Create `.env.production` based on `.env.production.template`:

```bash
# Required Variables (VITE_ prefix for frontend access)
NODE_ENV=production
VITE_APP_URL=https://your-domain.com
VITE_API_URL=https://api.your-domain.com
VITE_WS_URL=wss://api.your-domain.com

# Optional but Recommended
VITE_SENTRY_DSN=https://...@sentry.io/...
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Server-Side Environment Variables

Configure in `.env.production` (server-only, not prefixed with VITE_):

```bash
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
SESSION_SECRET=your-session-secret
JWT_SECRET=your-jwt-secret
STRIPE_SECRET_KEY=sk_live_...
```

**⚠️ Security Note:** Never commit `.env.production` to version control!

---

## Build Process

### Standard Build

```bash
# Clean previous builds
npm run prebuild

# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Build Output

The build creates the following structure:

```
client/dist/
├── index.html                 # Entry point
├── assets/
│   ├── [images]-[hash].*     # Optimized images
│   └── [fonts]-[hash].*      # Font files
└── js/
    ├── index-[hash].js        # Main entry
    ├── vendor-react-[hash].js # React chunk
    ├── tanstack-[hash].js     # React Query
    ├── ui-[hash].js           # UI components
    └── vendor-[hash].js       # Other vendors
```

### Bundle Analysis

```bash
# Analyze bundle size
npm run bundle:analyze

# Quick bundle stats
npm run bundle:stats

# Track bundle size over time
npm run bundle:capture
npm run bundle:compare
```

### Build Scripts Reference

| Script | Command | Description |
|--------|---------|-------------|
| `prebuild` | `rm -rf dist build .vite client/dist` | Clean build artifacts |
| `build` | `NODE_OPTIONS='--max-old-space-size=2048' vite build` | Production build |
| `build:production` | `npm ci && npm run build && npm cache clean --force` | Clean production build |
| `preview` | `vite preview` | Preview production build |
| `bundle:analyze` | `tsx scripts/analyze-bundle.ts` | Detailed bundle analysis |

---

## Deployment Platforms

### Option A: Replit Deployment (Recommended for Full-Stack)

Replit provides seamless deployment with VM mode for WebSocket support.

#### Configuration

1. **Enable Deployment:**
   - Open Replit project
   - Click "Deploy" button
   - Select "VM" deployment mode (required for WebSockets)

2. **Environment Variables:**
   ```bash
   # Set in Replit Secrets
   DATABASE_URL=your-database-url
   JWT_SECRET=your-jwt-secret
   SESSION_SECRET=your-session-secret
   # ... other secrets from .env.production.example
   ```

3. **Build Command:**
   ```bash
   npm run build:production
   ```

4. **Run Command:**
   ```bash
   NODE_ENV=production node --max-old-space-size=4096 -r tsx/cjs server/index.ts
   ```

5. **Domain Configuration:**
   - Use Replit-provided domain or
   - Configure custom domain in Replit settings
   - Ensure SSL/HTTPS is enabled

#### Advantages
- ✅ WebSocket support (VM mode)
- ✅ Zero-config database (built-in PostgreSQL)
- ✅ Automatic SSL/HTTPS
- ✅ Integrated secrets management
- ✅ Built-in monitoring

---

### Option B: Railway Deployment

Railway offers similar features with GitHub integration.

#### Setup Steps

1. **Connect Repository:**
   ```bash
   # Install Railway CLI
   npm i -g @railway/cli
   
   # Login and init
   railway login
   railway init
   ```

2. **Configure Environment:**
   ```bash
   # Set variables in Railway dashboard
   railway variables set NODE_ENV=production
   railway variables set DATABASE_URL=your-db-url
   # ... other variables
   ```

3. **Deploy Configuration:**
   
   Create `railway.json`:
   ```json
   {
     "build": {
       "builder": "nixpacks",
       "buildCommand": "npm run build:production"
     },
     "deploy": {
       "startCommand": "NODE_ENV=production node -r tsx/cjs server/index.ts",
       "restartPolicyType": "ON_FAILURE",
       "restartPolicyMaxRetries": 10
     }
   }
   ```

4. **Deploy:**
   ```bash
   railway up
   ```

#### Advantages
- ✅ Automatic GitHub deployments
- ✅ Database provisioning (PostgreSQL, Redis)
- ✅ Custom domains with SSL
- ✅ Rollback support
- ✅ Environment-based deployments (staging/production)

---

### Option C: Vercel (Frontend-Only Deployment)

For static/serverless frontend deployment (requires separate backend).

#### Setup Steps

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Configure Build:**
   
   Create `vercel.json`:
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "client/dist",
     "framework": "vite",
     "rewrites": [
       {
         "source": "/api/:path*",
         "destination": "https://your-api-domain.com/api/:path*"
       },
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

#### Advantages
- ✅ Edge network (ultra-fast global delivery)
- ✅ Automatic preview deployments
- ✅ Serverless functions (if needed)
- ✅ DDoS protection
- ✅ Analytics included

---

### Option D: Netlify (Alternative Frontend-Only)

Similar to Vercel for static deployments.

#### Setup Steps

1. **Create `netlify.toml`:**
   ```toml
   [build]
     command = "npm run build"
     publish = "client/dist"
   
   [[redirects]]
     from = "/api/*"
     to = "https://your-api-domain.com/api/:splat"
     status = 200
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

---

## Performance Optimization

### Build Optimizations (Already Configured)

✅ **Code Splitting:** Automatic vendor chunking  
✅ **Tree Shaking:** Unused code removed  
✅ **Minification:** Terser with aggressive compression  
✅ **Asset Optimization:** Images/fonts optimized  
✅ **Cache Busting:** Hash-based file names

### Additional Optimizations

#### 1. Enable Source Maps for Production Debugging (Optional)

Update `vite.config.ts`:
```typescript
build: {
  sourcemap: 'hidden', // Generate but don't expose
}
```

#### 2. Compression (Server-Side)

Add compression middleware in `server/index.ts`:
```typescript
import compression from 'compression';

app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));
```

#### 3. Cache Headers

Configure in server or CDN:
```nginx
# Static assets (1 year)
location ~* \.(js|css|png|jpg|jpeg|gif|svg|woff|woff2)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}

# HTML (no cache)
location ~* \.html$ {
  expires -1;
  add_header Cache-Control "no-cache, no-store, must-revalidate";
}
```

### Performance Targets

| Metric | Target | Tool |
|--------|--------|------|
| **Bundle Size (JS)** | < 500KB gzipped | `npm run bundle:analyze` |
| **Bundle Size (Total)** | < 5MB | `npm run bundle:stats` |
| **First Contentful Paint** | < 1.5s | Lighthouse |
| **Time to Interactive** | < 3.5s | Lighthouse |
| **Largest Contentful Paint** | < 2.5s | Web Vitals |
| **Cumulative Layout Shift** | < 0.1 | Web Vitals |
| **Lighthouse Score** | > 90 | `npm run lighthouse:audit` |

---

## Monitoring & Validation

### Post-Deployment Validation

#### 1. Health Check
```bash
curl https://your-domain.com/health
# Expected: { "status": "ok", "uptime": 12345 }
```

#### 2. Build Verification
```bash
# Check bundle sizes
npm run bundle:analyze

# Verify no console.log in production
grep -r "console.log" client/dist/js/
# Expected: No matches
```

#### 3. Performance Audit
```bash
# Run Lighthouse
npm run lighthouse:audit

# Check Web Vitals
npm run test:visual:a11y
```

### Monitoring Setup

#### Option 1: Sentry (Error Tracking)

```typescript
// client/src/main.tsx
import * as Sentry from "@sentry/react";

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT,
    tracesSampleRate: parseFloat(
      import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE || '0.1'
    ),
  });
}
```

#### Option 2: Google Analytics

```typescript
// client/src/lib/analytics.ts
export const initAnalytics = () => {
  if (import.meta.env.VITE_GOOGLE_ANALYTICS_ID) {
    // Initialize GA4
    gtag('config', import.meta.env.VITE_GOOGLE_ANALYTICS_ID);
  }
};
```

#### Option 3: Web Vitals Tracking

```typescript
// client/src/lib/web-vitals.ts
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

export const reportWebVitals = () => {
  if (import.meta.env.VITE_ENABLE_WEB_VITALS === 'true') {
    onCLS(console.log);
    onFID(console.log);
    onFCP(console.log);
    onLCP(console.log);
    onTTFB(console.log);
  }
};
```

### Bundle Size Tracking

```bash
# Capture current bundle size
npm run bundle:capture

# Compare with previous build
npm run bundle:compare

# View dashboard
npm run perf:dashboard
```

---

## Troubleshooting

### Build Issues

#### Problem: Build fails with memory error
```
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

**Solution:**
```bash
# Increase Node.js memory limit
NODE_OPTIONS='--max-old-space-size=4096' npm run build
```

#### Problem: Vite build hangs
**Solution:**
```bash
# Clear Vite cache
rm -rf node_modules/.vite
rm -rf .vite

# Rebuild
npm run build
```

#### Problem: Module not found errors
**Solution:**
```bash
# Clean install dependencies
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Deployment Issues

#### Problem: White screen after deployment
**Causes:**
1. Incorrect `base` path in Vite config
2. Missing environment variables
3. API endpoint misconfiguration

**Solution:**
```bash
# Check build output
ls -la client/dist/

# Verify environment variables
env | grep VITE_

# Check browser console for errors
```

#### Problem: API calls failing (CORS)
**Solution:**
```typescript
// server/index.ts
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://your-domain.com',
  credentials: true
}));
```

#### Problem: WebSocket connection fails
**Solution:**
- Ensure deployment mode supports WebSockets (use VM mode on Replit)
- Check `VITE_WS_URL` environment variable
- Verify reverse proxy configuration allows WebSocket upgrade

---

## Deployment Validation Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] TypeScript compilation successful
- [ ] ESLint checks pass
- [ ] Bundle size < 5MB
- [ ] Environment variables configured
- [ ] Security audit passed

### Build Phase
- [ ] Build completes without errors
- [ ] console.log statements removed
- [ ] Source maps configured correctly
- [ ] Assets optimized (images, fonts)
- [ ] Chunks properly split

### Deployment Phase
- [ ] Application accessible via HTTPS
- [ ] Health check endpoint responding
- [ ] API endpoints accessible
- [ ] WebSocket connections working (if applicable)
- [ ] Static assets loading from CDN (if applicable)

### Post-Deployment
- [ ] Routes navigate correctly
- [ ] Authentication flows working
- [ ] Database connections stable
- [ ] Error tracking active (Sentry/similar)
- [ ] Analytics tracking (GA/Plausible)
- [ ] Performance metrics within targets
- [ ] Lighthouse score > 90
- [ ] Core Web Vitals passing

### Monitoring
- [ ] Error rates monitored
- [ ] Performance dashboards configured
- [ ] Uptime monitoring active
- [ ] Alerting configured
- [ ] Log aggregation working

---

## Quick Reference

### Essential Commands

```bash
# Development
npm run dev                    # Start dev server

# Building
npm run prebuild              # Clean artifacts
npm run build                 # Production build
npm run build:production      # Clean production build
npm run preview               # Preview production build

# Analysis
npm run bundle:analyze        # Analyze bundle
npm run bundle:stats          # Quick stats
npm run lighthouse:audit      # Performance audit
npm run type-check           # TypeScript check
npm run lint                 # ESLint check

# Deployment
npm run deploy:build         # Build for deployment

# Monitoring
npm run bundle:capture       # Capture bundle metrics
npm run perf:dashboard       # Performance dashboard
```

### Platform-Specific Deploy Commands

```bash
# Replit
# (Use Deploy button in UI or configure workflow)

# Railway
railway up

# Vercel
vercel --prod

# Netlify
netlify deploy --prod
```

---

## Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Production Build](https://react.dev/learn/start-a-new-react-project#building-for-production)
- [Replit Deployments](https://docs.replit.com/category/deployments)
- [Railway Docs](https://docs.railway.app/)
- [Vercel Docs](https://vercel.com/docs)
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

---

**Document Version:** 1.0.0  
**Last Updated:** October 17, 2025  
**Maintained by:** Development Team
