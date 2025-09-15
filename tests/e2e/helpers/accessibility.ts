import { Page, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { A11yResult } from './types';

/**
 * Accessibility testing helpers for Mundo Tango
 */

/**
 * Run accessibility scan on current page
 */
export async function runAccessibilityScan(
  page: Page,
  options?: {
    includedImpacts?: Array<'minor' | 'moderate' | 'serious' | 'critical'>;
    exclude?: string[];
    include?: string[];
    disableRules?: string[];
  }
): Promise<A11yResult> {
  const builder = new AxeBuilder({ page });
  
  // Configure included impact levels
  if (options?.includedImpacts) {
    builder.include(options.includedImpacts);
  }
  
  // Configure excluded selectors
  if (options?.exclude) {
    options.exclude.forEach((selector) => builder.exclude(selector));
  }
  
  // Configure included selectors
  if (options?.include) {
    options.include.forEach((selector) => builder.include(selector));
  }
  
  // Disable specific rules if needed
  if (options?.disableRules) {
    builder.disableRules(options.disableRules);
  }
  
  // Run the scan
  const results = await builder.analyze();
  
  return {
    violations: results.violations,
    passes: results.passes,
    incomplete: results.incomplete,
  };
}

/**
 * Assert no accessibility violations
 */
export async function assertNoA11yViolations(
  page: Page,
  options?: {
    allowedViolations?: string[];
    maxViolations?: number;
    skipImpacts?: Array<'minor' | 'moderate' | 'serious' | 'critical'>;
  }
): Promise<void> {
  const results = await runAccessibilityScan(page);
  
  // Filter violations based on options
  let violations = results.violations;
  
  if (options?.allowedViolations) {
    violations = violations.filter(
      (v) => !options.allowedViolations?.includes(v.id)
    );
  }
  
  if (options?.skipImpacts) {
    violations = violations.filter(
      (v) => !options.skipImpacts?.includes(v.impact)
    );
  }
  
  // Check max violations threshold
  if (options?.maxViolations !== undefined) {
    expect(violations.length).toBeLessThanOrEqual(options.maxViolations);
  } else {
    // Format violations for better error reporting
    if (violations.length > 0) {
      const violationDetails = violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        help: v.help,
        helpUrl: v.helpUrl,
        nodes: v.nodes.length,
      }));
      
      console.error('Accessibility Violations Found:', JSON.stringify(violationDetails, null, 2));
      
      // Fail the test
      expect(violations).toHaveLength(0);
    }
  }
}

/**
 * Check specific WCAG criteria
 */
export async function checkWCAGCriteria(
  page: Page,
  level: 'A' | 'AA' | 'AAA' = 'AA'
): Promise<void> {
  const builder = new AxeBuilder({ page })
    .withTags(`wcag2${level.toLowerCase()}`, `wcag21${level.toLowerCase()}`);
  
  const results = await builder.analyze();
  
  expect(results.violations).toHaveLength(0);
}

/**
 * Check keyboard navigation
 */
export async function checkKeyboardNavigation(
  page: Page,
  elements: string[]
): Promise<void> {
  // Start from the top of the page
  await page.keyboard.press('Tab');
  
  for (const selector of elements) {
    // Check if element is focused
    const isFocused = await page.evaluate((sel) => {
      const element = document.querySelector(sel);
      return element === document.activeElement;
    }, selector);
    
    expect(isFocused).toBe(true);
    
    // Move to next element
    await page.keyboard.press('Tab');
  }
}

/**
 * Check focus indicators
 */
export async function checkFocusIndicators(
  page: Page,
  selector: string
): Promise<void> {
  const element = page.locator(selector);
  
  // Focus the element
  await element.focus();
  
  // Check for focus styles
  const hasFocusStyles = await element.evaluate((el) => {
    const styles = window.getComputedStyle(el);
    const outline = styles.outline;
    const boxShadow = styles.boxShadow;
    const border = styles.border;
    
    return outline !== 'none' || boxShadow !== 'none' || border !== 'none';
  });
  
  expect(hasFocusStyles).toBe(true);
}

/**
 * Check color contrast
 */
export async function checkColorContrast(
  page: Page,
  options?: {
    normalText?: number; // Default 4.5:1
    largeText?: number; // Default 3:1
  }
): Promise<void> {
  const results = await runAccessibilityScan(page, {
    disableRules: [], // Only check color contrast
  });
  
  const contrastViolations = results.violations.filter(
    (v) => v.id === 'color-contrast'
  );
  
  expect(contrastViolations).toHaveLength(0);
}

/**
 * Check ARIA attributes
 */
export async function checkAriaAttributes(
  page: Page,
  selector: string
): Promise<void> {
  const element = page.locator(selector);
  
  // Check for required ARIA attributes
  const ariaLabel = await element.getAttribute('aria-label');
  const ariaLabelledBy = await element.getAttribute('aria-labelledby');
  const ariaDescribedBy = await element.getAttribute('aria-describedby');
  const role = await element.getAttribute('role');
  
  // At least one labeling method should be present
  const hasLabeling = ariaLabel || ariaLabelledBy;
  expect(hasLabeling).toBeTruthy();
  
  // Check role if present
  if (role) {
    const validRoles = [
      'button', 'link', 'navigation', 'main', 'complementary',
      'contentinfo', 'banner', 'search', 'form', 'region',
    ];
    expect(validRoles).toContain(role);
  }
}

/**
 * Check heading hierarchy
 */
export async function checkHeadingHierarchy(page: Page): Promise<void> {
  const headings = await page.evaluate(() => {
    const allHeadings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    return allHeadings.map((h) => ({
      level: parseInt(h.tagName[1]),
      text: h.textContent?.trim(),
    }));
  });
  
  // Check for single h1
  const h1Count = headings.filter((h) => h.level === 1).length;
  expect(h1Count).toBe(1);
  
  // Check hierarchy is not skipped
  for (let i = 1; i < headings.length; i++) {
    const currentLevel = headings[i].level;
    const previousLevel = headings[i - 1].level;
    
    // Level should not skip more than 1
    expect(currentLevel - previousLevel).toBeLessThanOrEqual(1);
  }
}

/**
 * Check form labels
 */
export async function checkFormLabels(page: Page): Promise<void> {
  const inputs = await page.evaluate(() => {
    const allInputs = Array.from(document.querySelectorAll('input, select, textarea'));
    return allInputs.map((input) => {
      const id = input.id;
      const label = id ? document.querySelector(`label[for="${id}"]`) : null;
      const ariaLabel = input.getAttribute('aria-label');
      
      return {
        hasLabel: !!label,
        hasAriaLabel: !!ariaLabel,
        type: input.getAttribute('type') || input.tagName.toLowerCase(),
      };
    });
  });
  
  // All inputs should have labels (except hidden inputs)
  const visibleInputs = inputs.filter((i) => i.type !== 'hidden');
  visibleInputs.forEach((input) => {
    expect(input.hasLabel || input.hasAriaLabel).toBe(true);
  });
}

/**
 * Check alt text for images
 */
export async function checkImageAltText(page: Page): Promise<void> {
  const images = await page.evaluate(() => {
    const allImages = Array.from(document.querySelectorAll('img'));
    return allImages.map((img) => ({
      src: img.src,
      alt: img.alt,
      decorative: img.getAttribute('role') === 'presentation',
    }));
  });
  
  // All images should have alt text or be marked as decorative
  images.forEach((img) => {
    if (!img.decorative) {
      expect(img.alt).toBeTruthy();
    }
  });
}

/**
 * Generate accessibility report
 */
export async function generateA11yReport(
  page: Page,
  reportName: string
): Promise<void> {
  const results = await runAccessibilityScan(page);
  
  const report = {
    url: page.url(),
    timestamp: new Date().toISOString(),
    summary: {
      violations: results.violations.length,
      passes: results.passes.length,
      incomplete: results.incomplete.length,
    },
    violations: results.violations,
    passes: results.passes.map((p) => ({ id: p.id, description: p.description })),
    incomplete: results.incomplete.map((i) => ({ id: i.id, description: i.description })),
  };
  
  // Save report to file
  const fs = require('fs').promises;
  await fs.writeFile(
    `test-results/a11y-reports/${reportName}.json`,
    JSON.stringify(report, null, 2)
  );
}