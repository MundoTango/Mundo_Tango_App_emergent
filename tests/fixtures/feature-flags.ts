/**
 * Feature Flag Fixtures for Testing
 * MB.MD Testing Infrastructure - October 28, 2025
 * 
 * Utilities for toggling feature flags in tests to validate:
 * - Super admin gets full autonomous mode
 * - Regular users get basic features only
 * - Feature flags control access properly
 */

import { Page, APIRequestContext } from '@playwright/test';

export interface FeatureFlagConfig {
  'mbmd-autonomous': boolean;
  'mbmd-architect-review': boolean;
  'mbmd-voice-evidence': boolean;
}

/**
 * Enable autonomous mode features (super admin only)
 */
export async function enableAutonomousMode(
  request: APIRequestContext,
  userId?: number
): Promise<void> {
  await request.post('/api/admin/feature-flags/toggle', {
    data: {
      flags: {
        'mbmd-autonomous': true,
        'mbmd-architect-review': true,
        'mbmd-voice-evidence': true,
      },
      userId, // Optional: Enable for specific user only
    },
  });
}

/**
 * Disable autonomous mode features
 */
export async function disableAutonomousMode(
  request: APIRequestContext
): Promise<void> {
  await request.post('/api/admin/feature-flags/toggle', {
    data: {
      flags: {
        'mbmd-autonomous': false,
        'mbmd-architect-review': false,
        'mbmd-voice-evidence': false,
      },
    },
  });
}

/**
 * Set specific feature flags
 */
export async function setFeatureFlags(
  request: APIRequestContext,
  flags: Partial<FeatureFlagConfig>
): Promise<void> {
  await request.post('/api/admin/feature-flags/toggle', {
    data: { flags },
  });
}

/**
 * Get current feature flag state
 */
export async function getFeatureFlags(
  request: APIRequestContext
): Promise<FeatureFlagConfig> {
  const response = await request.get('/api/admin/feature-flags');
  return await response.json();
}

/**
 * Verify feature flag is enabled in UI
 */
export async function assertFeatureFlagEnabled(
  page: Page,
  featureName: string,
  shouldBeVisible: boolean = true
): Promise<void> {
  const element = page.locator(`[data-feature="${featureName}"]`);
  
  if (shouldBeVisible) {
    await element.waitFor({ state: 'visible', timeout: 5000 });
  } else {
    await element.waitFor({ state: 'hidden', timeout: 5000 });
  }
}

/**
 * Reset all feature flags to default (disabled)
 */
export async function resetFeatureFlags(
  request: APIRequestContext
): Promise<void> {
  await setFeatureFlags(request, {
    'mbmd-autonomous': false,
    'mbmd-architect-review': false,
    'mbmd-voice-evidence': false,
  });
}
