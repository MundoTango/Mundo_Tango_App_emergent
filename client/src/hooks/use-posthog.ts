/**
 * React hooks for PostHog analytics
 */

import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { trackPageView } from '@/lib/posthog';

/**
 * Hook to track page views automatically
 * Usage: Call in App.tsx to track all route changes
 */
export function usePageTracking() {
  const [location] = useLocation();

  useEffect(() => {
    trackPageView(location);
  }, [location]);
}
