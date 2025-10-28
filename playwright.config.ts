import { defineConfig, devices } from '@playwright/test';

/**
 * Mundo Tango Comprehensive E2E Test Configuration
 * MB.MD S4: Testing & QA Infrastructure
 * Updated: October 28, 2025 - Comprehensive Testing Suite
 * 
 * 6 Feature-Based Projects for Simultaneous Testing:
 * - visual-editor: Element selection, inspector, styles, preview
 * - mrblue-chat: Vibe coding, change queueing, AI responses
 * - streaming-sync: Real-time chat/preview synchronization
 * - voice-pipeline: Transcription, AI summarization, evidence
 * - universal-save: Change collection, git commits
 * - github-sync: Authentication, push workflow
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, // Retry once locally for flaky network
  workers: process.env.CI ? 6 : 4, // 6 workers for 6 projects in CI
  
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list'],
    ['junit', { outputFile: 'test-results/junit.xml' }], // For CI
  ],
  
  timeout: 60000, // 60s timeout for comprehensive tests
  expect: {
    timeout: 10000, // 10s for assertions (streaming may take time)
  },
  
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5000',
    trace: 'on', // Always capture trace for evidence
    screenshot: 'on', // Always capture screenshots for evidence
    video: 'on', // Always capture video for streaming proof
    ignoreHTTPSErrors: true,
    
    // Evidence collection settings
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  // 6 Feature-Based Test Projects (Run Simultaneously)
  projects: [
    // ========== FEATURE PROJECT 1: Visual Editor ==========
    {
      name: 'visual-editor',
      testDir: './tests/e2e/visual-editor',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }, // Large viewport for editor
      },
    },
    
    // ========== FEATURE PROJECT 2: Mr Blue Chat ==========
    {
      name: 'mrblue-chat',
      testDir: './tests/e2e/mrblue-chat',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
    
    // ========== FEATURE PROJECT 3: Streaming Sync ==========
    {
      name: 'streaming-sync',
      testDir: './tests/e2e/streaming-sync',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    
    // ========== FEATURE PROJECT 4: Voice Pipeline ==========
    {
      name: 'voice-pipeline',
      testDir: './tests/e2e/voice-pipeline',
      use: { 
        ...devices['Desktop Chrome'],
        permissions: ['microphone'], // Voice permissions
      },
    },
    
    // ========== FEATURE PROJECT 5: Universal Save ==========
    {
      name: 'universal-save',
      testDir: './tests/e2e/universal-save',
      use: { 
        ...devices['Desktop Chrome'],
      },
    },
    
    // ========== FEATURE PROJECT 6: GitHub Sync ==========
    {
      name: 'github-sync',
      testDir: './tests/e2e/github-sync',
      use: { 
        ...devices['Desktop Chrome'],
      },
    },
    
    // ========== CROSS-BROWSER VALIDATION (Run after feature tests pass) ==========
    {
      name: 'firefox-smoke',
      testDir: './tests/smoke',
      use: { ...devices['Desktop Firefox'] },
    },
    
    // ========== MOBILE VALIDATION ==========
    {
      name: 'mobile-chrome',
      testDir: './tests/smoke',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
  
  // Global setup for test data seeding
  globalSetup: require.resolve('./tests/setup/global-setup.ts'),
});
