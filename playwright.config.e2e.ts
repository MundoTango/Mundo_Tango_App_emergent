/**
 * Playwright E2E Test Configuration
 * 
 * Configured for Plan/Build mode testing with:
 * - Network monitoring
 * - Console log capture
 * - Screenshot comparison
 * - HAR file generation
 * - Evidence collection
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  
  // Maximum time one test can run
  timeout: 60 * 1000,
  
  // Fail the build on CI if you accidentally left test.only
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Parallel tests
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter to use
  reporter: [
    ['html', { outputFolder: 'evidence/test-report', open: 'never' }],
    ['json', { outputFile: 'evidence/test-results.json' }],
    ['list'],
  ],
  
  use: {
    // Base URL
    baseURL: process.env.VITE_PUBLIC_URL || 'http://localhost:5000',
    
    // Collect trace on failure
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video on failure
    video: 'retain-on-failure',
    
    // HAR file for network debugging
    recordHar: {
      path: 'evidence/network-traces/test-har.har',
      mode: 'minimal',
    },
    
    // Navigation timeout
    navigationTimeout: 30 * 1000,
    
    // Action timeout
    actionTimeout: 10 * 1000,
  },

  // Configure projects for different test categories
  projects: [
    {
      name: 'plan-mode',
      testMatch: '**/plan-mode-*.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'build-mode',
      testMatch: '**/build-mode-*.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'visual-editor',
      testMatch: '**/element-selection-*.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'auto-queue',
      testMatch: '**/auto-queue-*.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'universal-save',
      testMatch: '**/universal-save-*.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'network-monitoring',
      testMatch: '**/network-monitoring.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'console-validation',
      testMatch: '**/console-log-validation.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'visual-regression',
      testMatch: '**/visual-regression.spec.ts',
      use: { 
        ...devices['Desktop Chrome'],
        // Consistent viewport for visual comparison
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'error-handling',
      testMatch: '**/error-handling.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mode-persistence',
      testMatch: '**/mode-persistence.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Run local dev server before tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
