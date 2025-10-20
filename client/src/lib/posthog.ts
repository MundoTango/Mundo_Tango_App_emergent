/**
 * PostHog Analytics Integration
 * Tracks user events, page views, and product analytics
 */

import posthog from 'posthog-js';

let isInitialized = false;

export function initPostHog() {
  // Only initialize once
  if (isInitialized) {
    return;
  }

  // MB.MD S1: PostHog requires VITE_POSTHOG_API_KEY environment variable
  // User's key: phx_2S37cvpmZaJn17tzSw84o6jNEOGl7BjHv3gKzCkoj5RKSLv
  const apiKey = import.meta.env.VITE_POSTHOG_API_KEY;
  const host = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';

  if (!apiKey) {
    console.log('[PostHog] Analytics disabled - VITE_POSTHOG_API_KEY not set');
    console.log('[PostHog] To enable: Add VITE_POSTHOG_API_KEY to Secrets');
    return;
  }

  posthog.init(apiKey, {
    api_host: host,
    autocapture: true,
    capture_pageview: true,
    capture_pageleave: true,
    loaded: (posthog) => {
      if (import.meta.env.DEV) {
        posthog.opt_out_capturing(); // Disable in development
        console.log('[PostHog] Development mode - analytics disabled');
      } else {
        console.log('[PostHog] Analytics initialized');
      }
    },
  });

  isInitialized = true;
}

// Identify user after login
export function identifyUser(user: { id: number; email: string; name: string; username?: string }) {
  if (!isInitialized) return;

  posthog.identify(user.id.toString(), {
    email: user.email,
    name: user.name,
    username: user.username,
  });
}

// Track custom event
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (!isInitialized) return;

  posthog.capture(eventName, properties);
}

// Track page view
export function trackPageView(pagePath: string) {
  if (!isInitialized) return;

  posthog.capture('$pageview', {
    $current_url: window.location.href,
    path: pagePath,
  });
}

// Reset on logout
export function resetPostHog() {
  if (!isInitialized) return;

  posthog.reset();
}

export { posthog };
