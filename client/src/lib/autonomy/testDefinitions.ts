/**
 * Phase 11 - Track 1B: Predefined Test Suites
 * Common test definitions for standard component types
 */

import type { ComponentTest } from './useSelfTest';

/**
 * Button Component Tests
 */
export const BUTTON_TESTS = {
  isClickable: (): ComponentTest => ({
    name: 'is-clickable',
    run: () => {
      const button = document.querySelector('[data-agent-id^="BUTTON_"]');
      if (!button) {
        return {
          passed: false,
          issue: {
            description: 'Button element not found in DOM',
            severity: 'critical'
          }
        };
      }

      const isDisabled = button.hasAttribute('disabled');
      return {
        passed: !isDisabled,
        issue: isDisabled ? {
          description: 'Button is disabled',
          severity: 'low'
        } : undefined
      };
    },
    critical: false
  }),

  hasProperAria: (): ComponentTest => ({
    name: 'has-proper-aria',
    run: () => {
      const button = document.querySelector('[data-agent-id^="BUTTON_"]');
      if (!button) {
        return { passed: false, issue: { description: 'Button not found', severity: 'critical' } };
      }

      const hasAriaLabel = button.hasAttribute('aria-label') || button.textContent?.trim();
      return {
        passed: !!hasAriaLabel,
        issue: !hasAriaLabel ? {
          description: 'Button missing aria-label or visible text',
          severity: 'medium',
          suggestedFix: 'Add aria-label attribute or visible text content'
        } : undefined
      };
    },
    critical: false
  }),

  hasVisibleText: (): ComponentTest => ({
    name: 'has-visible-text',
    run: () => {
      const button = document.querySelector('[data-agent-id^="BUTTON_"]');
      if (!button) {
        return { passed: false, issue: { description: 'Button not found', severity: 'critical' } };
      }

      const hasText = !!button.textContent?.trim();
      return {
        passed: hasText,
        issue: !hasText ? {
          description: 'Button has no visible text',
          severity: 'low'
        } : undefined
      };
    },
    critical: false
  })
};

/**
 * Form Component Tests
 */
export const FORM_TESTS = {
  hasValidation: (): ComponentTest => ({
    name: 'has-validation',
    run: () => {
      const form = document.querySelector('[data-agent-id^="FORM_"]');
      if (!form) {
        return { passed: false, issue: { description: 'Form not found', severity: 'critical' } };
      }

      const hasNoValidate = form.hasAttribute('novalidate');
      return {
        passed: !hasNoValidate,
        issue: hasNoValidate ? {
          description: 'Form has novalidate attribute',
          severity: 'medium',
          suggestedFix: 'Remove novalidate or add custom validation'
        } : undefined
      };
    },
    critical: false
  }),

  hasLabels: (): ComponentTest => ({
    name: 'has-labels',
    run: () => {
      const form = document.querySelector('[data-agent-id^="FORM_"]');
      if (!form) {
        return { passed: false, issue: { description: 'Form not found', severity: 'critical' } };
      }

      const inputs = form.querySelectorAll('input, select, textarea');
      const unlabeled: Element[] = [];

      inputs.forEach(input => {
        const hasLabel = input.hasAttribute('aria-label') || 
                        input.hasAttribute('aria-labelledby') ||
                        form.querySelector(`label[for="${input.id}"]`);
        if (!hasLabel) {
          unlabeled.push(input);
        }
      });

      return {
        passed: unlabeled.length === 0,
        issue: unlabeled.length > 0 ? {
          description: `${unlabeled.length} input(s) missing labels`,
          severity: 'high',
          suggestedFix: 'Add <label> elements or aria-label attributes'
        } : undefined
      };
    },
    critical: true
  })
};

/**
 * Page Component Tests
 */
export const PAGE_TESTS = {
  hasTranslations: (): ComponentTest => ({
    name: 'has-translations',
    run: () => {
      const page = document.querySelector('[data-agent-id^="PAGE_"]');
      if (!page) {
        return { passed: false, issue: { description: 'Page not found', severity: 'critical' } };
      }

      // Check for hardcoded English text patterns
      const textContent = page.textContent || '';
      const hardcodedPatterns = [
        /\b(Login|Sign Up|Submit|Cancel|Delete|Edit|Save|Update)\b/,
        /\b(Email|Password|Username|First Name|Last Name)\b/
      ];

      const hasHardcodedText = hardcodedPatterns.some(pattern => pattern.test(textContent));

      return {
        passed: !hasHardcodedText,
        issue: hasHardcodedText ? {
          description: 'Page contains hardcoded English text',
          severity: 'high',
          suggestedFix: 'Replace hardcoded strings with {t("key")} from useTranslation'
        } : undefined
      };
    },
    critical: false
  }),

  hasDarkMode: (): ComponentTest => ({
    name: 'has-dark-mode',
    run: () => {
      const page = document.querySelector('[data-agent-id^="PAGE_"]');
      if (!page) {
        return { passed: false, issue: { description: 'Page not found', severity: 'critical' } };
      }

      // Check if page has dark mode variants
      const elementsWithColor = page.querySelectorAll('[class*="text-"], [class*="bg-"]');
      let missingDarkMode = 0;

      elementsWithColor.forEach(el => {
        const classes = el.className.split(' ');
        const hasColorClass = classes.some(c => c.startsWith('text-') || c.startsWith('bg-'));
        const hasDarkClass = classes.some(c => c.startsWith('dark:'));

        if (hasColorClass && !hasDarkClass) {
          missingDarkMode++;
        }
      });

      return {
        passed: missingDarkMode === 0,
        issue: missingDarkMode > 0 ? {
          description: `${missingDarkMode} elements missing dark: variants`,
          severity: 'medium',
          suggestedFix: 'Add dark: variants to all color classes'
        } : undefined
      };
    },
    critical: false
  }),

  isResponsive: (): ComponentTest => ({
    name: 'is-responsive',
    run: () => {
      const page = document.querySelector('[data-agent-id^="PAGE_"]');
      if (!page) {
        return { passed: false, issue: { description: 'Page not found', severity: 'critical' } };
      }

      // Check for responsive classes
      const hasResponsiveClasses = page.querySelector('[class*="sm:"], [class*="md:"], [class*="lg:"]');

      return {
        passed: !!hasResponsiveClasses,
        issue: !hasResponsiveClasses ? {
          description: 'Page may not be responsive (no breakpoint classes found)',
          severity: 'low',
          suggestedFix: 'Add responsive Tailwind classes (sm:, md:, lg:)'
        } : undefined
      };
    },
    critical: false
  })
};

/**
 * Widget Component Tests
 */
export const WIDGET_TESTS = {
  hasDataTestId: (): ComponentTest => ({
    name: 'has-data-testid',
    run: () => {
      const widget = document.querySelector('[data-agent-id^="WIDGET_"]');
      if (!widget) {
        return { passed: false, issue: { description: 'Widget not found', severity: 'critical' } };
      }

      const hasTestId = widget.hasAttribute('data-testid');
      return {
        passed: hasTestId,
        issue: !hasTestId ? {
          description: 'Widget missing data-testid attribute',
          severity: 'low',
          suggestedFix: 'Add data-testid for testing'
        } : undefined
      };
    },
    critical: false
  })
};

/**
 * Create a complete test suite for a component type
 */
export function createTestSuite(type: 'button' | 'form' | 'page' | 'widget'): ComponentTest[] {
  switch (type) {
    case 'button':
      return [
        BUTTON_TESTS.isClickable(),
        BUTTON_TESTS.hasProperAria(),
        BUTTON_TESTS.hasVisibleText()
      ];
    case 'form':
      return [
        FORM_TESTS.hasValidation(),
        FORM_TESTS.hasLabels()
      ];
    case 'page':
      return [
        PAGE_TESTS.hasTranslations(),
        PAGE_TESTS.hasDarkMode(),
        PAGE_TESTS.isResponsive()
      ];
    case 'widget':
      return [
        WIDGET_TESTS.hasDataTestId()
      ];
    default:
      return [];
  }
}
