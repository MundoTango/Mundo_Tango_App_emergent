# Phase 15: Advanced Optimization - BREAKDOWN PLAN

**Date:** October 18, 2025  
**Phase:** MB.MD BREAKDOWN  
**Previous:** MAPPING ✅ Complete  
**Next:** MITIGATION (Implementation)

---

## Execution Strategy

### Batched Approach (Safe Deployment)
Execute optimizations in 4 sequential batches to ensure each works before proceeding:

**Batch 1:** Cache Monitoring (2 hours) - Foundation  
**Batch 2:** Image Optimization (2-3 hours) - Visual improvements  
**Batch 3:** Playwright Setup (3-4 hours) - Testing infrastructure  
**Batch 4:** Mobile Performance (3-4 hours) - Advanced optimization  

---

## BATCH 1: Cache Monitoring Fix

### Objective
Track client-side React Query localStorage cache to eliminate false "low cache hit rate" alarms.

### Implementation Steps

#### Step 1.1: Create Client Cache Hook (30 min)
**File:** `client/src/hooks/useCacheMonitoring.ts` (NEW)

```typescript
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface CacheMetrics {
  totalQueries: number;
  cachedQueries: number;
  hitRate: number;
  cacheSize: number;
  oldestCacheEntry: Date | null;
  newestCacheEntry: Date | null;
}

export function useCacheMonitoring() {
  const queryClient = useQueryClient();
  const [metrics, setMetrics] = useState<CacheMetrics>({
    totalQueries: 0,
    cachedQueries: 0,
    hitRate: 0,
    cacheSize: 0,
    oldestCacheEntry: null,
    newestCacheEntry: null,
  });

  useEffect(() => {
    const calculateMetrics = () => {
      const cache = queryClient.getQueryCache();
      const queries = cache.getAll();
      
      // Count cached vs fetching queries
      const cachedQueries = queries.filter(q => 
        q.state.status === 'success' && q.state.dataUpdatedAt > 0
      );
      
      // Calculate localStorage size
      const localStorageSize = JSON.stringify(
        localStorage.getItem('MUNDO_TANGO_QUERY_CACHE') || '{}'
      ).length;
      
      // Find oldest and newest cache entries
      let oldest: number | null = null;
      let newest: number | null = null;
      
      cachedQueries.forEach(q => {
        const timestamp = q.state.dataUpdatedAt;
        if (!oldest || timestamp < oldest) oldest = timestamp;
        if (!newest || timestamp > newest) newest = timestamp;
      });

      setMetrics({
        totalQueries: queries.length,
        cachedQueries: cachedQueries.length,
        hitRate: queries.length > 0 
          ? (cachedQueries.length / queries.length) * 100 
          : 0,
        cacheSize: localStorageSize,
        oldestCacheEntry: oldest ? new Date(oldest) : null,
        newestCacheEntry: newest ? new Date(newest) : null,
      });
    };

    // Initial calculation
    calculateMetrics();

    // Update every 5 seconds
    const interval = setInterval(calculateMetrics, 5000);

    return () => clearInterval(interval);
  }, [queryClient]);

  return metrics;
}
```

#### Step 1.2: Add Server-Side Endpoint (30 min)
**File:** `server/routes.ts`

Add endpoint to receive client cache metrics:

```typescript
// Phase 15 Batch 1: Client cache monitoring
app.post('/api/monitoring/client-cache', async (req, res) => {
  try {
    const { hitRate, cacheSize, totalQueries, cachedQueries } = req.body;
    
    console.log('📊 Client Cache Metrics:', {
      hitRate: `${hitRate.toFixed(2)}%`,
      cacheSize: `${(cacheSize / 1024).toFixed(2)}KB`,
      totalQueries,
      cachedQueries,
      timestamp: new Date().toISOString()
    });
    
    // Store in performance monitoring system
    // (intelligentPerformanceMonitor can consume this)
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record client cache metrics' });
  }
});
```

#### Step 1.3: Integrate into Performance Monitor (45 min)
**File:** `server/services/intelligentPerformanceMonitor.ts`

Add client cache pattern:

```typescript
// Add to initializePatterns() method (after line 100)

// Phase 15 Batch 1: Client-side cache monitoring
this.patterns.push({
  name: 'client_cache_hit_rate_low',
  condition: (metric) => 
    metric.clientCacheHitRate !== undefined && 
    metric.clientCacheHitRate < 30, // 30% threshold
  action: async () => {
    console.log('🔧 Low client cache hit rate - consider increasing staleTime...');
  },
  severity: 'low',
  learningFromPhase: 15
});
```

#### Step 1.4: Add Dev Mode Display (15 min)
**File:** `client/src/components/dev/SuperAdminToggle.tsx`

Add cache metrics display (visible when dev mode active):

```typescript
// Show cache metrics in dev console
if (import.meta.env.DEV) {
  console.log('📊 Cache Metrics:', metrics);
}
```

**Validation:**
- ✅ Client cache metrics appear in server logs
- ✅ False "low cache hit rate" alarms stop
- ✅ Real cache performance visible

---

## BATCH 2: Image Optimization

### Objective
Reduce image load times and bundle size through lazy loading and format optimization.

### Implementation Steps

#### Step 2.1: Install Dependencies (5 min)
```bash
npm install react-lazy-load-image-component
npm install @types/react-lazy-load-image-component --save-dev
```

#### Step 2.2: Create Lazy Image Component (30 min)
**File:** `client/src/components/ui/lazy-image.tsx` (NEW)

```typescript
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  effect?: 'blur' | 'opacity' | 'black-and-white';
}

export function LazyImage({ 
  src, 
  alt, 
  width, 
  height, 
  className = '',
  effect = 'blur'
}: LazyImageProps) {
  return (
    <LazyLoadImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      effect={effect}
      placeholderSrc="/placeholder.svg"
    />
  );
}
```

#### Step 2.3: Update Image-Heavy Pages (60-90 min)
**Files to Update:**
- GroupDetailPage.tsx
- search.tsx
- housing-marketplace.tsx
- listing-detail.tsx
- NotionEntryPage.tsx
- PublicResumePage.tsx
- LiveStreaming.tsx
- FriendshipPage.tsx
- Favorites.tsx

**Pattern:**
```typescript
// BEFORE
<img src={imageUrl} alt="Description" />

// AFTER
import { LazyImage } from '@/components/ui/lazy-image';
<LazyImage src={imageUrl} alt="Description" />
```

#### Step 2.4: Optimize PNG Icons (30 min)
Create WebP versions of large PNGs:

```bash
# Create script
cat > scripts/optimize-images.sh << 'EOF'
#!/bin/bash
cd client/public/icons
# Convert PNG to WebP (requires imagemagick or webp tools)
for file in *.png; do
  cwebp "$file" -o "${file%.png}.webp" -q 80
done
echo "✅ WebP images created"
EOF

chmod +x scripts/optimize-images.sh
./scripts/optimize-images.sh
```

**Result:** icon-512.png (28KB) → icon-512.webp (~8-10KB)

**Validation:**
- ✅ Images lazy load on scroll
- ✅ Blur effect visible during load
- ✅ LCP improved by 10-15%
- ✅ WebP images created

---

## BATCH 3: Playwright E2E Setup

### Objective
Create comprehensive E2E test suite for core features across desktop and mobile.

### Implementation Steps

#### Step 3.1: Install Playwright Browsers (10 min)
```bash
npx playwright install
```

#### Step 3.2: Create Test Directory Structure (5 min)
```bash
mkdir -p tests/e2e/auth
mkdir -p tests/e2e/features
mkdir -p tests/e2e/mobile
mkdir -p tests/e2e/helpers
```

#### Step 3.3: Create Test Helpers (30 min)
**File:** `tests/e2e/helpers/test-helpers.ts` (NEW)

```typescript
import { Page, expect } from '@playwright/test';

export async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/feed', { timeout: 5000 });
}

export async function waitForSocketConnection(page: Page) {
  await page.waitForFunction(() => {
    return (window as any).socketConnected === true;
  }, { timeout: 10000 });
}

export async function createTestPost(page: Page, content: string) {
  await page.goto('/feed');
  await page.fill('textarea[name="content"]', content);
  await page.click('button:has-text("Post")');
  await expect(page.locator(`text=${content}`)).toBeVisible();
}
```

#### Step 3.4: Create Auth Tests (45 min)
**File:** `tests/e2e/auth/login.spec.ts` (NEW)

```typescript
import { test, expect } from '@playwright/test';
import { login } from '../helpers/test-helpers';

test.describe('Authentication', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="input-email"]', 'test@example.com');
    await page.fill('[data-testid="input-password"]', 'password123');
    await page.click('[data-testid="button-login"]');
    
    await expect(page).toHaveURL('/feed');
    await expect(page.locator('[data-testid="text-username"]')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="input-email"]', 'wrong@example.com');
    await page.fill('[data-testid="input-password"]', 'wrongpassword');
    await page.click('[data-testid="button-login"]');
    
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    await login(page, 'test@example.com', 'password123');
    await page.click('[data-testid="button-logout"]');
    
    await expect(page).toHaveURL('/');
  });
});
```

#### Step 3.5: Create Core Feature Tests (60 min)
**File:** `tests/e2e/features/posts.spec.ts` (NEW)

```typescript
import { test, expect } from '@playwright/test';
import { login, createTestPost } from '../helpers/test-helpers';

test.describe('Posts Feature', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'test@example.com', 'password123');
  });

  test('should create a post', async ({ page }) => {
    const testContent = `Test post ${Date.now()}`;
    await createTestPost(page, testContent);
    
    await expect(page.locator(`text=${testContent}`)).toBeVisible();
  });

  test('should like a post', async ({ page }) => {
    await page.goto('/feed');
    const firstPost = page.locator('[data-testid^="card-post-"]').first();
    await firstPost.locator('[data-testid^="button-like-"]').click();
    
    await expect(firstPost.locator('.text-red-500')).toBeVisible();
  });

  test('should comment on a post', async ({ page }) => {
    await page.goto('/feed');
    const firstPost = page.locator('[data-testid^="card-post-"]').first();
    await firstPost.locator('[data-testid^="button-comment-"]').click();
    
    await page.fill('textarea[name="comment"]', 'Test comment');
    await page.click('button:has-text("Post Comment")');
    
    await expect(page.locator('text=Test comment')).toBeVisible();
  });
});
```

#### Step 3.6: Create Mobile Tests (45 min)
**File:** `tests/e2e/mobile/mobile-navigation.spec.ts` (NEW)

```typescript
import { test, expect, devices } from '@playwright/test';

test.use({ ...devices['iPhone 12'] });

test.describe('Mobile Navigation', () => {
  test('should navigate using mobile menu', async ({ page }) => {
    await page.goto('/');
    
    // Open mobile menu
    await page.click('[data-testid="button-mobile-menu"]');
    await expect(page.locator('nav')).toBeVisible();
    
    // Navigate to profile
    await page.click('[data-testid="link-profile"]');
    await expect(page).toHaveURL(/profile/);
  });

  test('should handle touch gestures', async ({ page }) => {
    await page.goto('/feed');
    
    // Swipe down to refresh
    await page.touchscreen.tap(100, 100);
    await page.mouse.move(100, 300);
    
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
  });
});
```

**Validation:**
- ✅ `npm run test:e2e` passes
- ✅ Tests run on Chrome, Firefox, Safari
- ✅ Mobile tests pass on Pixel 5 and iPhone 12
- ✅ CI/CD ready

---

## BATCH 4: Mobile Performance

### Objective
Optimize for slow mobile connections and add performance benchmarks.

### Implementation Steps

#### Step 4.1: Update Playwright Config (15 min)
**File:** `playwright.config.ts`

Add network throttling:

```typescript
// Add after line 39
use: {
  baseURL: process.env.BASE_URL || 'http://localhost:5000',
  trace: 'on-first-retry',
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
  
  // Phase 15 Batch 4: Network throttling for mobile
  launchOptions: {
    slowMo: process.env.SLOW_MO ? 100 : 0,
  },
},

// Add new project for slow 3G testing
projects: [
  // ... existing projects ...
  
  {
    name: 'mobile-3g',
    use: {
      ...devices['Pixel 5'],
      // Simulate Slow 3G
      offline: false,
      // Custom network conditions
      contextOptions: {
        // @ts-ignore
        networkCondition: {
          download: 400 * 1024 / 8, // 400 Kbps
          upload: 400 * 1024 / 8,
          latency: 400, // 400ms RTT
        },
      },
    },
  },
  
  {
    name: 'mobile-4g',
    use: {
      ...devices['iPhone 12'],
      // Simulate Fast 4G
      contextOptions: {
        // @ts-ignore
        networkCondition: {
          download: 4 * 1024 * 1024 / 8, // 4 Mbps
          upload: 3 * 1024 * 1024 / 8, // 3 Mbps
          latency: 20, // 20ms RTT
        },
      },
    },
  },
],
```

#### Step 4.2: Create Mobile Performance Tests (60 min)
**File:** `tests/e2e/mobile/performance.spec.ts` (NEW)

```typescript
import { test, expect, devices } from '@playwright/test';

test.describe('Mobile Performance', () => {
  test('should load page under 2.5s on 4G', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('load');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(2500);
  });

  test('should show loading states on slow 3G', async ({ page }) => {
    test.use({ ...devices['Pixel 5'] });
    
    await page.goto('/feed');
    
    // Should show skeleton loader
    await expect(page.locator('[data-testid="skeleton-loader"]')).toBeVisible();
    
    // Eventually shows content
    await expect(page.locator('[data-testid="card-post-"]').first()).toBeVisible({
      timeout: 10000
    });
  });

  test('should handle offline gracefully', async ({ page, context }) => {
    await context.setOffline(true);
    
    await page.goto('/');
    
    await expect(page.locator('text=No internet connection')).toBeVisible();
  });
});
```

#### Step 4.3: Add Mobile Performance Monitoring (30 min)
**File:** `client/src/hooks/useMobilePerformance.ts` (NEW)

```typescript
import { useEffect } from 'react';

export function useMobilePerformance() {
  useEffect(() => {
    // Detect mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (!isMobile) return;

    // Monitor connection type
    const connection = (navigator as any).connection;
    if (connection) {
      console.log('📱 Mobile Connection:', {
        type: connection.effectiveType, // 2g, 3g, 4g
        downlink: connection.downlink, // Mbps
        rtt: connection.rtt, // ms
        saveData: connection.saveData,
      });
      
      // Warn on slow connections
      if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
        console.warn('⚠️ Slow connection detected - optimizing...');
        // Could disable auto-play videos, reduce image quality, etc.
      }
    }
  }, []);
}
```

**Validation:**
- ✅ Performance tests pass on 3G/4G
- ✅ LCP < 2.5s on Fast 4G
- ✅ Loading states work on slow connections
- ✅ Mobile-specific optimizations active

---

## Testing Strategy

### After Each Batch
1. Run affected tests
2. Check logs for errors
3. Validate performance metrics
4. Create git checkpoint

### Final Validation (After All Batches)
1. Run full E2E suite: `npm run test:e2e`
2. Check LCP on mobile: Should be <2.5s on 4G
3. Verify image lazy loading works
4. Confirm cache monitoring shows correct metrics

---

## Rollback Procedures

### If Batch Fails
1. **Cache Monitoring:** Remove new endpoint, revert monitoring changes
2. **Images:** Revert to `<img>` tags, remove lazy-load package
3. **Playwright:** Delete test files, no production impact
4. **Mobile:** Revert playwright.config.ts changes

### Git Checkpoints
Create commit after each batch:
- `git commit -m "Phase 15 Batch 1: Cache monitoring"`
- `git commit -m "Phase 15 Batch 2: Image optimization"`
- `git commit -m "Phase 15 Batch 3: Playwright setup"`
- `git commit -m "Phase 15 Batch 4: Mobile performance"`

---

## Success Criteria

### Overall Phase 15 Success
- ✅ Client cache hit rate visible and accurate
- ✅ 10+ E2E tests passing
- ✅ Images lazy load on scroll
- ✅ Mobile performance tests pass
- ✅ No production regressions
- ✅ LCP remains <5s on desktop, <2.5s on mobile 4G

---

## Next Phase: MITIGATION

Begin implementation starting with Batch 1 (Cache Monitoring).

**MB.MD Phase:** BREAKDOWN ✅ Complete → **MITIGATION** (Next)
