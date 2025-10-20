/**
 * PostHog Server-Side Analytics
 * Track server events for complete analytics coverage
 */

import { PostHog } from 'posthog-node';

let posthogClient: PostHog | null = null;

// Initialize PostHog server-side client
export function initPostHogServer() {
  const apiKey = process.env.POSTHOG_API_KEY;
  const host = process.env.POSTHOG_HOST || 'https://app.posthog.com';
  const enablePostHog = process.env.POSTHOG_ENABLE === 'true';

  if (!enablePostHog || !apiKey) {
    console.log('[PostHog Server] Analytics disabled or API key missing');
    return null;
  }

  posthogClient = new PostHog(apiKey, {
    host,
  });

  console.log('[PostHog Server] Analytics initialized');
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
