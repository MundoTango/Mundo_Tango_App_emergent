# Performance Monitoring & Optimization Setup

**Last Updated:** October 17, 2025  
**Version:** 1.0.0  
**Purpose:** Production performance monitoring and optimization guidelines

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Performance Targets](#performance-targets)
3. [Bundle Size Monitoring](#bundle-size-monitoring)
4. [Runtime Performance](#runtime-performance)
5. [Core Web Vitals](#core-web-vitals)
6. [Monitoring Tools](#monitoring-tools)
7. [Automated Audits](#automated-audits)
8. [Performance Budget](#performance-budget)

---

## Overview

This document outlines the performance monitoring strategy for the React application. We use a multi-layered approach combining build-time analysis, runtime monitoring, and automated audits.

### Monitoring Stack

| Layer | Tools | Purpose |
|-------|-------|---------|
| **Build Time** | Vite analyzer, Bundle stats | Track bundle size |
| **Runtime** | Web Vitals, Sentry Performance | User experience metrics |
| **Audits** | Lighthouse CI, Custom scripts | Quality gates |
| **Analytics** | Google Analytics, Plausible | User behavior tracking |

---

## Performance Targets

### Bundle Size Targets

| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| **Total Bundle (Gzipped)** | < 500 KB | < 1 MB |
| **Initial JS** | < 200 KB | < 300 KB |
| **CSS** | < 50 KB | < 100 KB |
| **Vendor Chunks** | < 300 KB | < 500 KB |
| **Per Route Chunk** | < 100 KB | < 200 KB |

### Load Time Targets

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| **First Contentful Paint (FCP)** | < 1.5s | 1.5s - 3s | > 3s |
| **Largest Contentful Paint (LCP)** | < 2.5s | 2.5s - 4s | > 4s |
| **Time to Interactive (TTI)** | < 3.5s | 3.5s - 7s | > 7s |
| **Total Blocking Time (TBT)** | < 300ms | 300ms - 600ms | > 600ms |
| **Cumulative Layout Shift (CLS)** | < 0.1 | 0.1 - 0.25 | > 0.25 |
| **First Input Delay (FID)** | < 100ms | 100ms - 300ms | > 300ms |

### Lighthouse Scores

| Category | Target | Minimum |
|----------|--------|---------|
| **Performance** | > 95 | > 90 |
| **Accessibility** | 100 | > 95 |
| **Best Practices** | 100 | > 95 |
| **SEO** | 100 | > 95 |
| **PWA** | > 80 | > 70 |

---

## Bundle Size Monitoring

### Existing Scripts

The application already includes comprehensive bundle analysis tools:

```bash
# Detailed bundle analysis
npm run bundle:analyze

# Quick bundle statistics
npm run bundle:stats

# Capture current bundle size (for tracking)
npm run bundle:capture

# Compare with previous build
npm run bundle:compare

# View performance dashboard
npm run perf:dashboard
```

### Bundle Analysis Workflow

1. **Before Build:**
   ```bash
   # Capture baseline
   npm run bundle:capture
   ```

2. **After Changes:**
   ```bash
   # Build and analyze
   npm run build
   npm run bundle:analyze
   
   # Compare with baseline
   npm run bundle:compare
   ```

3. **Identify Issues:**
   - Large vendor chunks (> 500KB)
   - Duplicate dependencies
   - Unnecessary imports
   - Un-tree-shaken code

### Chunk Size Optimization

Current chunk splitting strategy (from `vite.config.ts`):

```typescript
manualChunks(id) {
  if (id.includes('node_modules')) {
    if (id.includes('react') || id.includes('react-dom')) {
      return 'vendor-react';      // ~140KB gzipped
    }
    if (id.includes('@tanstack/react-query')) {
      return 'tanstack';          // ~40KB gzipped
    }
    if (id.includes('@radix-ui')) {
      return 'ui';                // ~80KB gzipped
    }
    if (id.includes('lodash') || id.includes('date-fns') || id.includes('zod')) {
      return 'utils';             // ~30KB gzipped
    }
    return 'vendor';              // All other deps
  }
}
```

**Expected Bundle Sizes:**
- vendor-react.js: ~140KB gzipped (React + React DOM)
- tanstack.js: ~40KB gzipped (React Query)
- ui.js: ~80KB gzipped (Radix UI components)
- utils.js: ~30KB gzipped (Utility libraries)
- vendor.js: ~100KB gzipped (Other dependencies)
- **Total:** ~390KB gzipped ✅ (well under 500KB target)

---

## Runtime Performance

### Web Vitals Integration

Add Web Vitals tracking to your application:

```typescript
// client/src/lib/web-vitals.ts
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

export const reportWebVitals = (onReport?: (metric: WebVitalMetric) => void) => {
  const report = onReport || console.log;
  
  onCLS(report);  // Cumulative Layout Shift
  onFID(report);  // First Input Delay
  onFCP(report);  // First Contentful Paint
  onLCP(report);  // Largest Contentful Paint
  onTTFB(report); // Time to First Byte
};

// Send to analytics
export const sendToAnalytics = (metric: WebVitalMetric) => {
  if (import.meta.env.VITE_GOOGLE_ANALYTICS_ID) {
    gtag('event', metric.name, {
      value: Math.round(metric.value),
      metric_rating: metric.rating,
      metric_id: metric.id,
      metric_delta: Math.round(metric.delta),
    });
  }
};
```

### Initialize in Main Entry

```typescript
// client/src/main.tsx
import { reportWebVitals, sendToAnalytics } from '@/lib/web-vitals';

// After React render
if (import.meta.env.VITE_ENABLE_WEB_VITALS === 'true') {
  reportWebVitals(sendToAnalytics);
}
```

### Performance Observer

```typescript
// client/src/lib/performance-observer.ts
export const observePerformance = () => {
  if ('PerformanceObserver' in window) {
    // Long Task Observer
    const longTaskObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          console.warn('Long task detected:', entry.duration, 'ms');
          // Send to monitoring service
        }
      }
    });
    
    longTaskObserver.observe({ entryTypes: ['longtask'] });
    
    // Navigation Timing
    const navObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log('Navigation timing:', entry.toJSON());
      }
    });
    
    navObserver.observe({ entryTypes: ['navigation'] });
  }
};
```

---

## Core Web Vitals

### What to Measure

#### 1. Largest Contentful Paint (LCP)
**Target:** < 2.5s

**Optimization strategies:**
- Optimize images (WebP/AVIF, proper sizing)
- Preload critical resources
- Use CDN for static assets
- Implement route-based code splitting

**Monitoring:**
```typescript
onLCP((metric) => {
  if (metric.value > 2500) {
    console.warn('LCP threshold exceeded:', metric.value);
    // Alert or log to monitoring service
  }
});
```

#### 2. First Input Delay (FID)
**Target:** < 100ms

**Optimization strategies:**
- Code split large JavaScript bundles
- Defer non-critical scripts
- Use Web Workers for heavy computations
- Optimize event handlers

#### 3. Cumulative Layout Shift (CLS)
**Target:** < 0.1

**Optimization strategies:**
- Set explicit sizes for images/videos
- Avoid inserting content above existing content
- Use transform animations instead of layout changes
- Reserve space for dynamic content

---

## Monitoring Tools

### 1. Sentry Performance Monitoring

```typescript
// client/src/lib/sentry.ts
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

export const initSentry = () => {
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.VITE_SENTRY_ENVIRONMENT,
      
      // Performance Monitoring
      integrations: [
        new BrowserTracing({
          tracingOrigins: [import.meta.env.VITE_API_URL],
        }),
      ],
      
      tracesSampleRate: parseFloat(
        import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE || '0.1'
      ),
      
      // Custom performance monitoring
      beforeSend(event) {
        // Add custom context
        event.contexts = {
          ...event.contexts,
          performance: {
            bundleSize: /* calculated size */,
            routeName: /* current route */,
          },
        };
        return event;
      },
    });
  }
};
```

### 2. Google Analytics (GA4)

```typescript
// client/src/lib/analytics.ts
export const trackPerformance = (metricName: string, value: number) => {
  if (import.meta.env.VITE_GOOGLE_ANALYTICS_ID) {
    gtag('event', 'performance_metric', {
      metric_name: metricName,
      metric_value: value,
      page_path: window.location.pathname,
    });
  }
};

// Usage
onLCP((metric) => {
  trackPerformance('LCP', metric.value);
});
```

### 3. Custom Performance Dashboard

The application includes a built-in performance dashboard:

```bash
# View performance metrics
npm run perf:dashboard
```

**Features:**
- Real-time bundle size tracking
- Historical performance data
- Core Web Vitals trends
- Lighthouse score history
- Performance regression detection

---

## Automated Audits

### Lighthouse CI

Configuration already exists in `lighthouserc.json`:

```bash
# Run Lighthouse audit
npm run test:lighthouse

# View results
npm run test:lighthouse:view
```

### Custom Audit Scripts

```bash
# Run all audits
npm run audit:all

# Specific category audit
npm run audit:category

# Page-specific audit
npm run audit-page [page-path]
```

### Scheduled Audits

```bash
# Daily audit
npm run audit:daily

# Weekly comprehensive audit
npm run audit:weekly

# Platform-wide audit
npm run audit:platform
```

### CI/CD Integration

Add to your CI pipeline (`.github/workflows/performance.yml`):

```yaml
name: Performance Audit

on:
  pull_request:
  push:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm run test:lighthouse
      
      - name: Check bundle size
        run: |
          npm run bundle:analyze
          # Fail if bundle > 5MB
          if [ $(du -sm client/dist | cut -f1) -gt 5 ]; then
            echo "Bundle size exceeds 5MB"
            exit 1
          fi
```

---

## Performance Budget

### Budget Configuration

Create `performance-budget.json`:

```json
{
  "budgets": [
    {
      "resourceSizes": [
        {
          "resourceType": "script",
          "budget": 500
        },
        {
          "resourceType": "stylesheet",
          "budget": 100
        },
        {
          "resourceType": "image",
          "budget": 1000
        },
        {
          "resourceType": "font",
          "budget": 200
        },
        {
          "resourceType": "total",
          "budget": 2000
        }
      ]
    },
    {
      "timings": [
        {
          "metric": "first-contentful-paint",
          "budget": 1500
        },
        {
          "metric": "largest-contentful-paint",
          "budget": 2500
        },
        {
          "metric": "time-to-interactive",
          "budget": 3500
        },
        {
          "metric": "cumulative-layout-shift",
          "budget": 0.1
        }
      ]
    }
  ]
}
```

### Enforce Budget in Build

Add to `package.json`:

```json
{
  "scripts": {
    "build:check": "npm run build && node scripts/check-performance-budget.js"
  }
}
```

Create `scripts/check-performance-budget.js`:

```javascript
import fs from 'fs';
import path from 'path';

const budgets = JSON.parse(
  fs.readFileSync('performance-budget.json', 'utf8')
);

const distPath = 'client/dist';
const jsFiles = fs.readdirSync(path.join(distPath, 'js'));

let totalSize = 0;
let violations = [];

jsFiles.forEach(file => {
  const size = fs.statSync(path.join(distPath, 'js', file)).size;
  totalSize += size;
});

const totalSizeKB = totalSize / 1024;

if (totalSizeKB > budgets.budgets[0].resourceSizes[0].budget) {
  violations.push(
    `JavaScript budget exceeded: ${totalSizeKB}KB > ${budgets.budgets[0].resourceSizes[0].budget}KB`
  );
}

if (violations.length > 0) {
  console.error('❌ Performance budget violations:');
  violations.forEach(v => console.error(`  - ${v}`));
  process.exit(1);
}

console.log('✅ Performance budget met!');
```

---

## Monitoring Checklist

### Pre-Production
- [ ] Web Vitals tracking configured
- [ ] Sentry performance monitoring active
- [ ] Analytics integration tested
- [ ] Lighthouse CI configured
- [ ] Performance budgets defined
- [ ] Automated audits scheduled

### Production
- [ ] Real user monitoring (RUM) active
- [ ] Error tracking operational
- [ ] Performance dashboard accessible
- [ ] Alerting configured for regressions
- [ ] Bundle size tracking enabled
- [ ] Core Web Vitals within targets

### Ongoing
- [ ] Weekly Lighthouse audits
- [ ] Monthly bundle size review
- [ ] Quarterly performance optimization sprint
- [ ] Continuous monitoring of user metrics
- [ ] Regular performance regression checks

---

## Performance Optimization Workflow

### 1. Measure
```bash
# Capture baseline
npm run bundle:capture
npm run test:lighthouse
```

### 2. Analyze
```bash
# Identify bottlenecks
npm run bundle:analyze
npm run perf:dashboard
```

### 3. Optimize
- Implement code splitting
- Optimize images/assets
- Remove unused dependencies
- Defer non-critical resources

### 4. Validate
```bash
# Re-run audits
npm run test:lighthouse
npm run bundle:compare

# Check improvements
npm run perf:dashboard
```

### 5. Monitor
- Track Core Web Vitals in production
- Set up alerts for regressions
- Review performance dashboard weekly

---

## Quick Reference

### Essential Commands

```bash
# Bundle Analysis
npm run bundle:analyze        # Detailed analysis
npm run bundle:stats          # Quick stats
npm run bundle:capture        # Capture metrics
npm run bundle:compare        # Compare builds

# Performance Audits
npm run test:lighthouse       # Lighthouse audit
npm run perf:dashboard        # View dashboard
npm run audit:all             # All audits

# Monitoring
npm run test:visual:a11y      # Accessibility
npm run test:visual           # Visual regression
```

### Performance Targets Summary

| Metric | Target |
|--------|--------|
| **Bundle Size** | < 500KB gzipped |
| **LCP** | < 2.5s |
| **FID** | < 100ms |
| **CLS** | < 0.1 |
| **TTI** | < 3.5s |
| **Lighthouse** | > 90 |

---

**Document Version:** 1.0.0  
**Last Updated:** October 17, 2025
