import { Page, expect, Locator } from '@playwright/test';
import { VisualRegressionOptions } from './types';

// Make Percy optional - only load if available
let percySnapshot: any;
try {
  percySnapshot = require('@percy/playwright').default;
} catch (e) {
  console.warn('Percy not installed, visual regression tests will be skipped');
}

/**
 * Visual regression testing helpers for Mundo Tango
 */

/**
 * Take Percy snapshot
 */
export async function takePercySnapshot(
  page: Page,
  name: string,
  options?: {
    widths?: number[];
    minHeight?: number;
    percyCSS?: string;
    enableJavaScript?: boolean;
    scope?: string;
  }
): Promise<void> {
  // Skip if Percy not available or token not available
  if (!percySnapshot || !process.env.PERCY_TOKEN) {
    console.warn('Percy not available or token not found, skipping visual regression test');
    return;
  }
  
  await percySnapshot(page, name, {
    widths: options?.widths || [375, 768, 1280, 1920],
    minHeight: options?.minHeight || 1024,
    percyCSS: options?.percyCSS,
    enableJavaScript: options?.enableJavaScript || false,
    scope: options?.scope,
  });
}

/**
 * Compare screenshot with baseline
 */
export async function compareScreenshot(
  page: Page,
  options: VisualRegressionOptions
): Promise<void> {
  const screenshotOptions: any = {
    fullPage: options.fullPage ?? true,
    animations: options.animations || 'disabled',
  };
  
  if (options.clip) {
    screenshotOptions.clip = options.clip;
  }
  
  if (options.mask) {
    screenshotOptions.mask = options.mask;
  }
  
  await expect(page).toHaveScreenshot(options.name, {
    ...screenshotOptions,
    maxDiffPixels: options.maxDiffPixels || 100,
    threshold: options.threshold || 0.2,
  });
}

/**
 * Hide dynamic elements before screenshot
 */
export async function hideDynamicElements(
  page: Page,
  selectors?: string[]
): Promise<void> {
  const defaultSelectors = [
    '[data-testid*="timestamp"]',
    '[data-testid*="date"]',
    '[data-testid*="time"]',
    '.loading-spinner',
    '.skeleton',
    'video',
    'iframe',
  ];
  
  const allSelectors = [...defaultSelectors, ...(selectors || [])];
  
  for (const selector of allSelectors) {
    await page.evaluate((sel) => {
      document.querySelectorAll(sel).forEach((el) => {
        (el as HTMLElement).style.visibility = 'hidden';
      });
    }, selector);
  }
}

/**
 * Wait for animations to complete
 */
export async function waitForAnimations(page: Page): Promise<void> {
  await page.evaluate(() => {
    return new Promise<void>((resolve) => {
      // Wait for all CSS animations
      const animations = document.getAnimations();
      Promise.all(animations.map((a) => a.finished)).then(() => resolve());
      
      // Fallback timeout
      setTimeout(resolve, 500);
    });
  });
}

/**
 * Stabilize page for screenshot
 */
export async function stabilizePage(
  page: Page,
  options?: {
    waitForFonts?: boolean;
    waitForImages?: boolean;
    disableAnimations?: boolean;
  }
): Promise<void> {
  // Wait for network to be idle
  await page.waitForLoadState('networkidle');
  
  // Wait for fonts to load
  if (options?.waitForFonts !== false) {
    await page.evaluate(() => document.fonts.ready);
  }
  
  // Wait for images to load
  if (options?.waitForImages !== false) {
    await page.evaluate(() => {
      return new Promise<void>((resolve) => {
        const images = Array.from(document.images);
        if (images.length === 0) {
          resolve();
          return;
        }
        
        let loaded = 0;
        images.forEach((img) => {
          if (img.complete) {
            loaded++;
          } else {
            img.addEventListener('load', () => {
              loaded++;
              if (loaded === images.length) resolve();
            });
            img.addEventListener('error', () => {
              loaded++;
              if (loaded === images.length) resolve();
            });
          }
        });
        
        if (loaded === images.length) resolve();
      });
    });
  }
  
  // Disable animations
  if (options?.disableAnimations !== false) {
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `,
    });
  }
  
  // Wait for any remaining animations
  await waitForAnimations(page);
}

/**
 * Take responsive screenshots
 */
export async function takeResponsiveScreenshots(
  page: Page,
  name: string,
  viewports?: Array<{ width: number; height: number; label: string }>
): Promise<void> {
  const defaultViewports = [
    { width: 375, height: 667, label: 'mobile' },
    { width: 768, height: 1024, label: 'tablet' },
    { width: 1280, height: 720, label: 'desktop' },
    { width: 1920, height: 1080, label: 'desktop-full' },
  ];
  
  const viewportsToTest = viewports || defaultViewports;
  
  for (const viewport of viewportsToTest) {
    await page.setViewportSize(viewport);
    await stabilizePage(page);
    
    await compareScreenshot(page, {
      name: `${name}-${viewport.label}`,
      fullPage: true,
    });
  }
}

/**
 * Visual regression test for component
 */
export async function testComponentVisually(
  page: Page,
  componentSelector: string,
  name: string,
  states?: Array<{ name: string; action: () => Promise<void> }>
): Promise<void> {
  const component = page.locator(componentSelector);
  
  // Test default state
  await stabilizePage(page);
  await expect(component).toHaveScreenshot(`${name}-default.png`);
  
  // Test additional states
  if (states) {
    for (const state of states) {
      await state.action();
      await stabilizePage(page);
      await expect(component).toHaveScreenshot(`${name}-${state.name}.png`);
    }
  }
}

/**
 * Check CSS properties
 */
export async function checkCSSProperties(
  page: Page,
  selector: string,
  expectedStyles: Record<string, string>
): Promise<void> {
  const element = page.locator(selector);
  
  for (const [property, expectedValue] of Object.entries(expectedStyles)) {
    const actualValue = await element.evaluate(
      (el, prop) => window.getComputedStyle(el).getPropertyValue(prop),
      property
    );
    
    expect(actualValue).toBe(expectedValue);
  }
}

/**
 * Test dark mode appearance
 */
export async function testDarkMode(
  page: Page,
  name: string
): Promise<void> {
  // Take light mode screenshot
  await stabilizePage(page);
  await compareScreenshot(page, {
    name: `${name}-light`,
    fullPage: true,
  });
  
  // Switch to dark mode
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  });
  
  // Take dark mode screenshot
  await stabilizePage(page);
  await compareScreenshot(page, {
    name: `${name}-dark`,
    fullPage: true,
  });
}

/**
 * Test print layout
 */
export async function testPrintLayout(
  page: Page,
  name: string
): Promise<void> {
  // Emulate print media
  await page.emulateMedia({ media: 'print' });
  
  await stabilizePage(page);
  await compareScreenshot(page, {
    name: `${name}-print`,
    fullPage: true,
  });
  
  // Reset to screen media
  await page.emulateMedia({ media: 'screen' });
}

/**
 * Visual diff specific regions
 */
export async function compareRegions(
  page: Page,
  regions: Array<{ selector: string; name: string }>
): Promise<void> {
  for (const region of regions) {
    const element = page.locator(region.selector);
    await expect(element).toHaveScreenshot(`${region.name}.png`);
  }
}

/**
 * Test loading states
 */
export async function testLoadingStates(
  page: Page,
  name: string,
  triggerLoading: () => Promise<void>
): Promise<void> {
  // Slow down network to capture loading state
  await page.route('**/*', (route) => {
    setTimeout(() => route.continue(), 2000);
  });
  
  await triggerLoading();
  
  // Capture loading state
  await page.waitForTimeout(500);
  await compareScreenshot(page, {
    name: `${name}-loading`,
    fullPage: false,
  });
  
  // Wait for content to load
  await page.waitForLoadState('networkidle');
  await compareScreenshot(page, {
    name: `${name}-loaded`,
    fullPage: false,
  });
}

/**
 * Generate visual regression report
 */
export async function generateVisualReport(
  results: Array<{ name: string; passed: boolean; diff?: number }>
): Promise<void> {
  const report = {
    timestamp: new Date().toISOString(),
    total: results.length,
    passed: results.filter((r) => r.passed).length,
    failed: results.filter((r) => !r.passed).length,
    results: results,
  };
  
  const fs = require('fs').promises;
  await fs.writeFile(
    `test-results/visual-reports/report-${Date.now()}.json`,
    JSON.stringify(report, null, 2)
  );
}