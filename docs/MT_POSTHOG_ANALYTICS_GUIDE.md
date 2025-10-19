# Mundo Tango PostHog Analytics Guide  
**Version:** 1.0  
**Last Updated:** October 19, 2025  
**Platform:** PostHog (Product Analytics + Feature Flags)  
**References:** 50 codebase instances (implementation in progress)

## Overview

Mundo Tango will use **PostHog** for product analytics, event tracking, feature flags, and A/B testing. This guide covers implementation patterns for production deployment.

**Status:** ⚠️ Planned for production (not yet fully implemented)

---

## Configuration

### **Environment Variables**

```bash
# .env
POSTHOG_API_KEY=phc_...
POSTHOG_HOST=https://app.posthog.com
POSTHOG_ENABLE=true
```

---

## Installation

```bash
npm install posthog-js posthog-node
```

---

## Frontend Integration

### **Pattern 1: PostHog Provider**

```typescript
// client/src/lib/posthog.ts
import posthog from 'posthog-js';

export function initPostHog() {
  if (import.meta.env.VITE_POSTHOG_ENABLE !== 'true') {
    return;
  }

  posthog.init(import.meta.env.VITE_POSTHOG_API_KEY!, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',
    autocapture: true,
    capture_pageview: true,
    capture_pageleave: true,
    loaded: (posthog) => {
      if (import.meta.env.DEV) {
        posthog.opt_out_capturing(); // Disable in development
      }
    },
  });
}

// Initialize in main.tsx
import { initPostHog } from './lib/posthog';

initPostHog();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

### **Pattern 2: Event Tracking**

```typescript
import posthog from 'posthog-js';

// User actions
function trackPostCreated(post: Post) {
  posthog.capture('post_created', {
    post_id: post.id,
    post_type: post.type,
    privacy: post.privacy,
    has_media: !!post.media,
  });
}

function trackEventRSVP(event: Event, status: string) {
  posthog.capture('event_rsvp', {
    event_id: event.id,
    status, // 'going', 'maybe', 'not_going'
    event_type: event.type,
  });
}

// Usage
const createPostMutation = useMutation({
  mutationFn: createPost,
  onSuccess: (post) => {
    trackPostCreated(post);
    queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
  },
});
```

---

### **Pattern 3: User Identification**

```typescript
import posthog from 'posthog-js';

function identifyUser(user: User) {
  posthog.identify(user.id.toString(), {
    email: user.email,
    name: user.name,
    username: user.username,
    journey_state: user.customerJourneyState, // J1-J5
    subscription_tier: user.subscriptionTier,
    city: user.city,
    country: user.country,
  });
}

// Call after login
const loginMutation = useMutation({
  mutationFn: login,
  onSuccess: (data) => {
    identifyUser(data.user);
    setLocation('/');
  },
});
```

---

### **Pattern 4: Page Views**

```typescript
import { useLocation } from 'wouter';
import { useEffect } from 'react';
import posthog from 'posthog-js';

function usePageTracking() {
  const [location] = useLocation();

  useEffect(() => {
    posthog.capture('$pageview', {
      $current_url: window.location.href,
      path: location,
    });
  }, [location]);
}

// Use in App.tsx
function App() {
  usePageTracking();

  return (
    <Switch>
      {/* Routes */}
    </Switch>
  );
}
```

---

## Backend Integration

### **Pattern 1: Server-Side Events**

```typescript
// server/services/posthog.ts
import { PostHog } from 'posthog-node';

const posthog = new PostHog(process.env.POSTHOG_API_KEY!, {
  host: process.env.POSTHOG_HOST,
});

export function trackServerEvent(
  userId: number,
  event: string,
  properties?: Record<string, any>
) {
  if (process.env.POSTHOG_ENABLE !== 'true') return;

  posthog.capture({
    distinctId: userId.toString(),
    event,
    properties,
  });
}

// Usage in routes
app.post('/api/subscriptions', authMiddleware, async (req, res) => {
  const subscription = await createSubscription(req.user.id, req.body);

  // Track conversion
  trackServerEvent(req.user.id, 'subscription_created', {
    tier: subscription.tier,
    price: subscription.price,
    payment_method: subscription.paymentMethod,
  });

  res.json(apiSuccess({ data: subscription }));
});
```

---

## Feature Flags

### **Pattern: A/B Testing**

```typescript
import posthog from 'posthog-js';
import { useEffect, useState } from 'react';

function useFeatureFlag(flagKey: string): boolean {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    posthog.onFeatureFlags(() => {
      setIsEnabled(posthog.isFeatureEnabled(flagKey));
    });
  }, [flagKey]);

  return isEnabled;
}

// Usage
function HomePage() {
  const showNewFeed = useFeatureFlag('new-feed-algorithm');

  return (
    <div>
      {showNewFeed ? (
        <NewFeedAlgorithm />
      ) : (
        <OldFeedAlgorithm />
      )}
    </div>
  );
}
```

---

## Common Events to Track

### **User Journey Events**

```typescript
// Registration flow
posthog.capture('registration_started');
posthog.capture('registration_completed', { method: 'email' });

// Onboarding
posthog.capture('onboarding_step_completed', { step: 1, step_name: 'profile' });
posthog.capture('onboarding_completed', { total_steps: 5 });

// Content creation
posthog.capture('post_created', { type: 'memory', privacy: 'public' });
posthog.capture('event_created', { type: 'milonga', is_recurring: false });

// Social interactions
posthog.capture('post_liked', { post_id: 123 });
posthog.capture('comment_added', { post_id: 123 });
posthog.capture('user_followed', { following_id: 456 });

// Subscriptions
posthog.capture('subscription_started', { tier: 'professional' });
posthog.capture('subscription_cancelled', { reason: 'too_expensive' });

// Journey progression
posthog.capture('journey_progression', { from: 'J1', to: 'J2' });
```

---

## Performance Monitoring

```typescript
// Page load time
posthog.capture('page_performance', {
  page: window.location.pathname,
  load_time: window.performance.timing.loadEventEnd - window.performance.timing.navigationStart,
  dom_ready: window.performance.timing.domContentLoadedEventEnd - window.performance.timing.navigationStart,
});

// API response time
const start = Date.now();
const response = await apiRequest('/api/posts');
const duration = Date.now() - start;

posthog.capture('api_performance', {
  endpoint: '/api/posts',
  method: 'GET',
  duration,
  status: response.status,
});
```

---

## Privacy & GDPR

### **Opt-Out Support**

```typescript
// User settings page
function PrivacySettings() {
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  const handleToggle = (enabled: boolean) => {
    if (enabled) {
      posthog.opt_in_capturing();
    } else {
      posthog.opt_out_capturing();
    }
    setAnalyticsEnabled(enabled);
  };

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={analyticsEnabled}
          onChange={(e) => handleToggle(e.target.checked)}
        />
        Enable analytics
      </label>
    </div>
  );
}
```

---

## Dashboard Setup

### **Key Metrics to Track**

1. **Acquisition:**
   - Signups per day
   - Registration conversion rate
   - Traffic sources

2. **Activation:**
   - Onboarding completion rate
   - Time to first post
   - Profile completion rate

3. **Engagement:**
   - Daily active users (DAU)
   - Posts per user
   - Session duration

4. **Retention:**
   - Day 1, 7, 30 retention
   - Churn rate
   - Journey progression (J1→J2→J3→J4)

5. **Revenue:**
   - Subscription conversion rate
   - Average revenue per user (ARPU)
   - Lifetime value (LTV)

---

## Testing

```typescript
import { describe, it, expect, vi } from 'vitest';

// Mock PostHog
vi.mock('posthog-js', () => ({
  default: {
    capture: vi.fn(),
    identify: vi.fn(),
    isFeatureEnabled: vi.fn().mockReturnValue(true),
  },
}));

describe('Analytics', () => {
  it('tracks post creation', () => {
    trackPostCreated({ id: 1, type: 'memory', privacy: 'public' });

    expect(posthog.capture).toHaveBeenCalledWith('post_created', {
      post_id: 1,
      post_type: 'memory',
      privacy: 'public',
    });
  });
});
```

---

## Production Deployment

### **Environment Configuration**

```bash
# Production .env
POSTHOG_API_KEY=phc_prod_...
POSTHOG_HOST=https://app.posthog.com
POSTHOG_ENABLE=true

# Development .env
POSTHOG_ENABLE=false  # Disable in development
```

---

## Next Steps

1. Set up PostHog account: https://posthog.com
2. Create project and get API key
3. Implement event tracking across all user actions
4. Set up dashboards for key metrics
5. Configure feature flags for A/B testing

**Related Files:**
- `client/src/lib/posthog.ts` - PostHog initialization (to be created)
- `server/services/posthog.ts` - Server-side tracking (to be created)
- `docs/REPLIT_PERFORMANCE_MONITORING.md` - Performance tracking patterns
