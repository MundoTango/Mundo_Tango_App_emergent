import { defineConfig, devices } from '@playwright/test';
import { TestOptions } from './helpers/types';

/**
 * Mundo Tango Comprehensive E2E Test Configuration
 * ESA-61x21 Compliant Testing Framework
 */

// Load environment variables
const IS_CI = !!process.env.CI;
const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;

export default defineConfig<TestOptions>({
  testDir: './',
  testMatch: ['**/*.e2e.test.ts', '**/*.spec.ts'],
  
  // Parallel execution configuration
  fullyParallel: !IS_CI, // Sequential on CI for stability
  workers: IS_CI ? 2 : 4, // Limited workers on CI
  
  // Retry configuration
  retries: IS_CI ? 2 : 1,
  
  // Fail fast on CI
  forbidOnly: IS_CI,
  maxFailures: IS_CI ? 5 : undefined,
  
  // Global timeouts
  globalTimeout: IS_CI ? 60 * 60 * 1000 : undefined, // 1 hour on CI
  timeout: 60 * 1000, // 60 seconds per test
  
  // Reporter configuration
  reporter: [
    ['line'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    IS_CI ? ['github'] : null,
    // Percy reporter for visual regression
    process.env.PERCY_TOKEN ? ['@percy/playwright/reporter'] : null,
  ].filter(Boolean) as any,
  
  // Shared test options
  use: {
    // Base URL
    baseURL: BASE_URL,
    
    // Browser launch options
    launchOptions: {
      slowMo: IS_CI ? 0 : 50, // Slow down actions for debugging
    },
    
    // Context options
    contextOptions: {
      ignoreHTTPSErrors: true,
      recordVideo: {
        dir: 'test-results/videos',
        size: { width: 1280, height: 720 },
      },
    },
    
    // Tracing configuration
    trace: IS_CI ? 'on-first-retry' : 'retain-on-failure',
    
    // Screenshot configuration
    screenshot: {
      mode: 'only-on-failure',
      fullPage: true,
    },
    
    // Video configuration
    video: IS_CI ? 'retain-on-failure' : 'on',
    
    // Timeouts
    actionTimeout: 15 * 1000,
    navigationTimeout: 30 * 1000,
    
    // Viewport
    viewport: { width: 1280, height: 720 },
    
    // Geolocation (Buenos Aires)
    geolocation: { latitude: -34.6037, longitude: -58.3816 },
    permissions: ['geolocation', 'notifications', 'camera'],
    
    // Custom test options
    testOptions: {
      enableAccessibilityTesting: true,
      enableVisualRegression: process.env.PERCY_TOKEN ? true : false,
      testDataPath: './fixtures/test-data',
    },
  },
  
  // Test projects configuration
  projects: [
    // Desktop browsers
    {
      name: 'Desktop Chrome',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'Desktop Firefox',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'Desktop Safari',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'Desktop Edge',
      use: { 
        ...devices['Desktop Edge'],
        channel: 'msedge',
        viewport: { width: 1920, height: 1080 },
      },
    },
    
    // Tablet devices
    {
      name: 'iPad Pro',
      use: { 
        ...devices['iPad Pro'],
        viewport: { width: 1024, height: 1366 },
      },
    },
    {
      name: 'iPad Mini',
      use: { 
        ...devices['iPad Mini'],
        viewport: { width: 768, height: 1024 },
      },
    },
    {
      name: 'Galaxy Tab S4',
      use: {
        ...devices['Galaxy Tab S4'],
        viewport: { width: 712, height: 1138 },
      },
    },
    
    // Mobile devices
    {
      name: 'iPhone 14 Pro',
      use: { 
        ...devices['iPhone 14 Pro'],
        viewport: { width: 393, height: 852 },
      },
    },
    {
      name: 'iPhone 12',
      use: { 
        ...devices['iPhone 12'],
        viewport: { width: 390, height: 844 },
      },
    },
    {
      name: 'iPhone SE',
      use: { 
        ...devices['iPhone SE'],
        viewport: { width: 375, height: 667 },
      },
    },
    {
      name: 'Pixel 7',
      use: { 
        ...devices['Pixel 7'],
        viewport: { width: 412, height: 915 },
      },
    },
    {
      name: 'Galaxy S20',
      use: {
        ...devices['Galaxy S20'],
        viewport: { width: 360, height: 800 },
      },
    },
    
    // Accessibility testing project
    {
      name: 'a11y',
      testMatch: '**/*.a11y.test.ts',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    
    // Visual regression testing project
    {
      name: 'visual',
      testMatch: '**/*.visual.test.ts',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    
    // API testing project
    {
      name: 'api',
      testMatch: '**/*.api.test.ts',
      use: {
        // No browser needed for API tests
        ...devices['Desktop Chrome'],
      },
    },
    
    // Performance testing project
    {
      name: 'performance',
      testMatch: '**/*.perf.test.ts',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--enable-gpu-benchmarking', '--enable-thread-composting'],
        },
      },
    },
  ],
  
  // Web server configuration
  webServer: {
    command: 'npm run dev',
    url: BASE_URL,
    reuseExistingServer: !IS_CI,
    timeout: 120 * 1000,
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: TEST_DATABASE_URL || process.env.DATABASE_URL,
    },
  },
  
  // Output configuration
  outputDir: 'test-results/',
  
  // Expect configuration
  expect: {
    timeout: 10 * 1000,
    toHaveScreenshot: {
      maxDiffPixels: 100,
      threshold: 0.2,
      animations: 'disabled',
    },
  },
});