/**
 * PostHog Server-Side Analytics
 * Track server events for complete analytics coverage
 */

import { PostHog } from 'posthog-node';

let posthogClient: PostHog | null = null;

// Initialize PostHog server-side client
export function initPostHogServer() {
  // MB.MD S1: PostHog requires POSTHOG_API_KEY environment variable
  // User's key: phx_2S37cvpmZaJn17tzSw84o6jNEOGl7BjHv3gKzCkoj5RKSLv
  const apiKey = process.env.POSTHOG_API_KEY;
  const host = process.env.POSTHOG_HOST || 'https://us.i.posthog.com';

  if (!apiKey) {
    console.log('[PostHog Server] Analytics disabled - POSTHOG_API_KEY not set');
    console.log('[PostHog Server] To enable: Add POSTHOG_API_KEY to Secrets');
    return null;
  }

  posthogClient = new PostHog(apiKey, {
    host,
  });

  console.log('📊 [PostHog Server] Analytics initialized');
  return posthogClient;
}

// Track server-side event
export function trackServerEvent(
  userId: number,
  event: string,
  properties?: Record<string, any>
) {
  if (!posthogClient) return;

  posthogClient.capture({
    distinctId: userId.toString(),
    event,
    properties,
  });
}

// Shutdown (call on server shutdown)
export async function shutdownPostHog() {
  if (posthogClient) {
    await posthogClient.shutdown();
  }
}

export { posthogClient };
