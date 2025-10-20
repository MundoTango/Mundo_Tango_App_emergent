/**
 * PostHog Server-Side Analytics
 * Track server events for complete analytics coverage
 */

import { PostHog } from 'posthog-node';

let posthogClient: PostHog | null = null;

// Initialize PostHog server-side client
export function initPostHogServer() {
  // MB.MD S1: PostHog API key from user (phx_2S37cvpmZaJn17tzSw84o6jNEOGl7BjHv3gKzCkoj5RKSLv)
  const apiKey = process.env.POSTHOG_API_KEY || 'phx_2S37cvpmZaJn17tzSw84o6jNEOGl7BjHv3gKzCkoj5RKSLv';
  const host = process.env.POSTHOG_HOST || 'https://us.i.posthog.com';
  const enablePostHog = process.env.POSTHOG_ENABLE !== 'false'; // Enabled by default

  if (!enablePostHog) {
    console.log('[PostHog Server] Analytics disabled via POSTHOG_ENABLE=false');
    return null;
  }

  if (!apiKey) {
    console.log('[PostHog Server] API key missing');
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
