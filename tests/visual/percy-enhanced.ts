/**
 * ESA-61x21 Percy Enhanced Visual Testing Utility
 * Provides enhanced Percy snapshot functionality with MT Ocean theme support
 */

import percySnapshot from '@percy/playwright';
import { Page } from '@playwright/test';

interface PercyOptions {
  widths?: number[];
  minHeight?: number;
  percyCSS?: string;
  enableJavaScript?: boolean;
  scope?: string;
}

const MT_OCEAN_PERCY_CSS = `
  /* Ensure MT Ocean theme is properly rendered */
  .glassmorphic-card {
    backdrop-filter: blur(10px) !important;
    background: rgba(255, 255, 255, 0.1) !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    box-shadow: 0 8px 32px 0 rgba(94, 234, 212, 0.15) !important;
  }
  
  .gradient-turquoise {
    background: linear-gradient(135deg, #5EEAD4 0%, #155E75 100%) !important;
  }
  
  /* Ocean theme colors */
  :root {
    --ocean-primary: #5EEAD4 !important;
    --ocean-secondary: #155E75 !important;
    --ocean-accent: #34D399 !important;
    --ocean-glass: rgba(94, 234, 212, 0.1) !important;
  }
  
  /* Hide dynamic content for consistent snapshots */
  .timestamp,
  .dynamic-date,
  [data-testid*="timestamp"],
  .relative-time,
  .loading-skeleton,
  .last-seen,
  .online-status,
  .notification-badge {
    visibility: hidden !important;
  }
  
  /* Stabilize animations */
  *, *::before, *::after {
    animation-duration: 0s !important;
    animation-delay: 0s !important;
    transition-duration: 0s !important;
    transition-delay: 0s !important;
  }
  
  /* Ensure consistent font rendering */
  * {
    -webkit-font-smoothing: antialiased !important;
    -moz-osx-font-smoothing: grayscale !important;
  }
`;

export class PercyEnhanced {
  private defaultOptions: PercyOptions = {
    widths: [375, 768, 1280, 1920],
    minHeight: 1024,
    enableJavaScript: true,
    percyCSS: MT_OCEAN_PERCY_CSS
  };
  
  /**
   * Take an enhanced Percy snapshot with MT Ocean theme support
   */
  async snapshot(
    page: Page,
    name: string,
    options?: Partial<PercyOptions>
  ) {
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Wait for MT Ocean theme elements to load
    await this.waitForThemeElements(page);
    
    // Hide dynamic content
    await this.hideDynamicContent(page);
    
    // Take Percy snapshot
    await percySnapshot(page, name, {
      ...this.defaultOptions,
      ...options
    });
  }
  
  /**
   * Wait for MT Ocean theme elements to be fully rendered
   */
  private async waitForThemeElements(page: Page) {
    // Wait for glassmorphic cards to be visible
    const hasGlassmorphic = await page.locator('.glassmorphic-card').count() > 0;
    if (hasGlassmorphic) {
      await page.locator('.glassmorphic-card').first().waitFor({ 
        state: 'visible',
        timeout: 5000 
      }).catch(() => {}); // Don't fail if element doesn't exist
    }
    
    // Wait for gradient elements
    const hasGradient = await page.locator('.gradient-turquoise').count() > 0;
    if (hasGradient) {
      await page.locator('.gradient-turquoise').first().waitFor({ 
        state: 'visible',
        timeout: 5000 
      }).catch(() => {});
    }
    
    // Wait for ocean theme buttons
    const hasOceanButtons = await page.locator('[class*="ocean"], [class*="turquoise"]').count() > 0;
    if (hasOceanButtons) {
      await page.locator('[class*="ocean"], [class*="turquoise"]').first().waitFor({ 
        state: 'visible',
        timeout: 5000 
      }).catch(() => {});
    }
    
    // Wait for fonts to load
    await page.evaluate(() => document.fonts.ready);
    
    // Wait for animations to complete
    await page.waitForTimeout(500);
  }
  
  /**
   * Hide dynamic content that changes between snapshots
   */
  private async hideDynamicContent(page: Page) {
    await page.evaluate(() => {
      // Hide timestamps and dynamic dates
      const dynamicSelectors = [
        '.timestamp',
        '.dynamic-date',
        '[data-testid*="timestamp"]',
        '.relative-time',
        '.loading-skeleton',
        '.last-seen',
        '.online-status',
        '.notification-badge',
        '.live-indicator',
        '.typing-indicator'
      ];
      
      dynamicSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          (el as HTMLElement).style.visibility = 'hidden';
        });
      });
      
      // Pause animations
      document.querySelectorAll('*').forEach(el => {
        const element = el as HTMLElement;
        element.style.animationPlayState = 'paused';
        element.style.transition = 'none';
      });
      
      // Set fixed time for consistency
      const fixedDate = new Date('2025-01-01T12:00:00Z');
      Date.now = () => fixedDate.getTime();
      
      // Disable video autoplay
      document.querySelectorAll('video').forEach(video => {
        (video as HTMLVideoElement).pause();
      });
      
      // Hide loading spinners
      document.querySelectorAll('.spinner, .loader, [class*="loading"]').forEach(el => {
        (el as HTMLElement).style.visibility = 'hidden';
      });
    });
  }
  
  /**
   * Compare multiple variations of a page
   */
  async comparePages(
    page: Page,
    pageName: string,
    variations: Array<{ name: string; setup: () => Promise<void> }>
  ) {
    for (const variation of variations) {
      await variation.setup();
      await page.waitForTimeout(1000); // Wait for theme changes
      await this.snapshot(page, `${pageName}-${variation.name}`);
    }
  }
  
  /**
   * Take snapshots for all standard viewports
   */
  async snapshotAllViewports(page: Page, baseName: string) {
    const viewports = [
      { name: 'mobile-iphone-se', width: 375, height: 667 },
      { name: 'mobile-iphone-14', width: 393, height: 852 },
      { name: 'tablet-ipad', width: 768, height: 1024 },
      { name: 'tablet-ipad-pro', width: 1024, height: 1366 },
      { name: 'desktop', width: 1280, height: 720 },
      { name: 'desktop-hd', width: 1920, height: 1080 },
      { name: 'desktop-4k', width: 2560, height: 1440 }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ 
        width: viewport.width, 
        height: viewport.height 
      });
      await page.waitForTimeout(500); // Wait for viewport resize
      await this.snapshot(page, `${baseName}-${viewport.name}`, {
        widths: [viewport.width],
        minHeight: viewport.height
      });
    }
  }
  
  /**
   * Test interactive states (hover, focus, active)
   */
  async snapshotInteractiveStates(page: Page, selector: string, elementName: string) {
    const element = page.locator(selector).first();
    
    // Normal state
    await this.snapshot(page, `${elementName}-normal`);
    
    // Hover state
    await element.hover();
    await page.waitForTimeout(300);
    await this.snapshot(page, `${elementName}-hover`);
    
    // Focus state (if applicable)
    const tagName = await element.evaluate(el => el.tagName.toLowerCase());
    if (['input', 'textarea', 'button', 'a', 'select'].includes(tagName)) {
      await element.focus();
      await page.waitForTimeout(300);
      await this.snapshot(page, `${elementName}-focus`);
    }
    
    // Active/pressed state (for buttons)
    if (tagName === 'button') {
      await element.dispatchEvent('mousedown');
      await page.waitForTimeout(300);
      await this.snapshot(page, `${elementName}-active`);
      await element.dispatchEvent('mouseup');
    }
  }
  
  /**
   * Test form validation states
   */
  async snapshotFormStates(page: Page, formSelector: string, formName: string) {
    const form = page.locator(formSelector);
    
    // Empty state
    await this.snapshot(page, `${formName}-empty`);
    
    // With validation errors
    const submitButton = form.locator('[type="submit"], button[data-testid*="submit"]').first();
    if (await submitButton.count() > 0) {
      await submitButton.click();
      await page.waitForTimeout(500);
      await this.snapshot(page, `${formName}-validation-errors`);
    }
    
    // Filled state (mock data)
    const inputs = form.locator('input[type="text"], input[type="email"], textarea');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const type = await input.getAttribute('type');
      
      if (type === 'email') {
        await input.fill('test@mundotango.com');
      } else {
        await input.fill('Test Data');
      }
    }
    
    if (inputCount > 0) {
      await this.snapshot(page, `${formName}-filled`);
    }
  }
  
  /**
   * Test scroll positions
   */
  async snapshotScrollPositions(page: Page, pageName: string) {
    // Top of page
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    await this.snapshot(page, `${pageName}-scroll-top`);
    
    // Middle of page
    const pageHeight = await page.evaluate(() => document.body.scrollHeight);
    await page.evaluate((height) => window.scrollTo(0, height / 2), pageHeight);
    await page.waitForTimeout(300);
    await this.snapshot(page, `${pageName}-scroll-middle`);
    
    // Bottom of page
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);
    await this.snapshot(page, `${pageName}-scroll-bottom`);
  }
  
  /**
   * Validate MT Ocean theme consistency
   */
  async validateThemeConsistency(page: Page) {
    const themeElements = {
      'glassmorphic-cards': '.glassmorphic-card',
      'gradient-turquoise': '.gradient-turquoise',
      'ocean-buttons': 'button[class*="ocean"], button[class*="turquoise"]',
      'ocean-backgrounds': '[class*="bg-ocean"], [class*="bg-turquoise"]',
      'ocean-text': '[class*="text-ocean"], [class*="text-turquoise"]'
    };
    
    for (const [name, selector] of Object.entries(themeElements)) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        const element = page.locator(selector).first();
        await element.scrollIntoViewIfNeeded();
        await this.snapshot(page, `theme-consistency-${name}`, {
          scope: selector
        });
      }
    }
  }
}

// Export singleton instance
export const percyEnhanced = new PercyEnhanced();

// Export class for extension
export default PercyEnhanced;