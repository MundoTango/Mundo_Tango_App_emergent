import { Page } from '@playwright/test';
import { mkdirSync } from 'fs';
import { join } from 'path';

const SCREENSHOT_DIR = 'test-results/screenshots';

// Ensure screenshot directory exists
try {
  mkdirSync(SCREENSHOT_DIR, { recursive: true });
} catch (e) {
  // Directory already exists
}

/**
 * Take screenshot with descriptive name and return path
 */
export async function takeScreenshot(
  page: Page,
  testName: string,
  stepName: string
): Promise<string> {
  const sanitizedTest = testName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  const sanitizedStep = stepName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  const timestamp = Date.now();
  const filename = `${sanitizedTest}--${sanitizedStep}--${timestamp}.png`;
  const path = join(SCREENSHOT_DIR, filename);
  
  await page.screenshot({ path, fullPage: true });
  
  console.log(`📸 Screenshot: ${stepName} → ${filename}`);
  return path;
}

/**
 * Take screenshot of specific element
 */
export async function takeElementScreenshot(
  page: Page,
  selector: string,
  testName: string,
  stepName: string
): Promise<string> {
  const element = await page.locator(selector).first();
  const sanitizedTest = testName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  const sanitizedStep = stepName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  const timestamp = Date.now();
  const filename = `${sanitizedTest}--${sanitizedStep}--element--${timestamp}.png`;
  const path = join(SCREENSHOT_DIR, filename);
  
  await element.screenshot({ path });
  
  console.log(`📸 Element Screenshot: ${stepName} → ${filename}`);
  return path;
}
