/**
 * Playwright Fixture: Console Logger
 * 
 * Captures console messages, errors, and warnings
 * Provides utilities for asserting console behavior
 */

import { test as base, ConsoleMessage } from '@playwright/test';

type ConsoleLoggerFixture = {
  consoleLogger: {
    logs: ConsoleMessage[];
    errors: ConsoleMessage[];
    warnings: ConsoleMessage[];
    assertLogContains: (pattern: string | RegExp) => void;
    assertNoErrors: () => void;
    assertNoWarnings: () => void;
    getLogText: () => string[];
    clearLogs: () => void;
  };
};

export const test = base.extend<ConsoleLoggerFixture>({
  consoleLogger: async ({ page }, use) => {
    const logs: ConsoleMessage[] = [];
    const errors: ConsoleMessage[] = [];
    const warnings: ConsoleMessage[] = [];

    page.on('console', msg => {
      logs.push(msg);
      
      if (msg.type() === 'error') {
        errors.push(msg);
      } else if (msg.type() === 'warning') {
        warnings.push(msg);
      }
    });

    const logger = {
      logs,
      errors,
      warnings,
      
      assertLogContains: (pattern: string | RegExp) => {
        const found = logs.some(msg => {
          const text = msg.text();
          if (typeof pattern === 'string') {
            return text.includes(pattern);
          }
          return pattern.test(text);
        });
        
        if (!found) {
          throw new Error(`No console log matching ${pattern}`);
        }
      },
      
      assertNoErrors: () => {
        if (errors.length > 0) {
          const errorMessages = errors.map(e => e.text()).join('\n');
          throw new Error(`Found ${errors.length} console errors:\n${errorMessages}`);
        }
      },
      
      assertNoWarnings: () => {
        if (warnings.length > 0) {
          const warningMessages = warnings.map(w => w.text()).join('\n');
          throw new Error(`Found ${warnings.length} console warnings:\n${warningMessages}`);
        }
      },
      
      getLogText: () => logs.map(msg => `[${msg.type()}] ${msg.text()}`),
      
      clearLogs: () => {
        logs.length = 0;
        errors.length = 0;
        warnings.length = 0;
      },
    };

    await use(logger);
  },
});

export { expect } from '@playwright/test';
