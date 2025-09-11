import { defineConfig, devices } from '@playwright/test';

/**
 * Replit-optimized Playwright Configuration
 * Modified to work with Replit's container environment
 */
export default defineConfig({
  testDir: './',
  testMatch: ['**/*.e2e.test.ts', '**/*.spec.ts'],
  fullyParallel: false,
  forbidOnly: false,
  retries: 0,
  workers: 1,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report' }]],
  
  use: {
    baseURL: 'http://localhost:5000',
    trace: 'off',
    screenshot: 'only-on-failure',
    video: 'off',
    actionTimeout: 30000,
    navigationTimeout: 30000,
    
    // Replit-specific browser launch options
    launchOptions: {
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-blink-features=AutomationControlled',
        '--ignore-certificate-errors',
        '--allow-running-insecure-content'
      ],
      chromiumSandbox: false,
      headless: true,
      ignoreDefaultArgs: ['--disable-extensions'],
    },
  },

  projects: [
    {
      name: 'chromium-replit',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        ignoreHTTPSErrors: true,
        permissions: [],
        geolocation: undefined,
        locale: 'en-US',
        timezoneId: 'America/New_York',
      },
    },
  ],

  webServer: {
    command: 'echo "Using existing server on port 5000"',
    url: 'http://localhost:5000',
    reuseExistingServer: true,
    timeout: 10000,
  },
  
  globalTimeout: 10 * 60 * 1000, // 10 minutes
  timeout: 60 * 1000, // 1 minute per test
  
  expect: {
    timeout: 10000,
  },
  
  outputDir: 'test-results/',
});