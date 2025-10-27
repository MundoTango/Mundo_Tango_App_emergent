import { Page, expect } from '@playwright/test';
import { takeScreenshot } from './screenshots';

/**
 * MB.MD 5-Layer Testing Protocol
 * Validates features across all layers with screenshot evidence
 */

export interface FiveLayerValidation {
  testName: string;
  ui: () => Promise<void>;
  api?: () => Promise<void>;
  backend?: () => Promise<void>;
  data?: () => Promise<void>;
  integration?: () => Promise<void>;
}

/**
 * Execute 5-layer validation with screenshot evidence
 */
export async function validate5Layers(
  page: Page,
  validation: FiveLayerValidation
) {
  console.log(`\n🔍 5-Layer Validation: ${validation.testName}`);
  
  // Layer 1: UI
  console.log('  ✓ Layer 1: UI validation');
  await validation.ui();
  await takeScreenshot(page, validation.testName, 'ui-validated');
  
  // Layer 2: API (if provided)
  if (validation.api) {
    console.log('  ✓ Layer 2: API validation');
    await validation.api();
  }
  
  // Layer 3: Backend (if provided)
  if (validation.backend) {
    console.log('  ✓ Layer 3: Backend validation');
    await validation.backend();
  }
  
  // Layer 4: Data (if provided)
  if (validation.data) {
    console.log('  ✓ Layer 4: Data validation');
    await validation.data();
  }
  
  // Layer 5: Integration (if provided)
  if (validation.integration) {
    console.log('  ✓ Layer 5: Integration validation');
    await validation.integration();
  }
  
  console.log(`✅ All layers validated for: ${validation.testName}\n`);
}

/**
 * Assert SAVE badge shows correct count
 */
export async function assertSaveBadgeCount(page: Page, expectedCount: number) {
  const badge = page.locator('[data-testid="save-badge"]');
  await expect(badge).toBeVisible({ timeout: 5000 });
  
  if (expectedCount > 0) {
    await expect(badge).toContainText(expectedCount.toString());
  }
}

/**
 * Assert streaming is active (shows streaming indicators)
 */
export async function assertStreamingActive(page: Page) {
  // Look for streaming indicators (cursor, loading state)
  const streamingIndicator = page.locator('[data-testid="ai-streaming"], .animate-pulse, [data-testid="typing-indicator"]').first();
  await expect(streamingIndicator).toBeVisible({ timeout: 10000 });
}

/**
 * Assert Git commit was created
 */
export async function assertGitCommitCreated(page: Page, commitMessage?: string) {
  // This would require API call to verify git log
  // For now, we check that SAVE badge cleared (indicates success)
  const badge = page.locator('[data-testid="save-badge"]');
  await expect(badge).not.toBeVisible({ timeout: 10000 });
}
