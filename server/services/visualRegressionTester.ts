/**
 * Visual Regression Testing Service
 * ESA Layer 51: Testing Infrastructure
 * 
 * Automated visual regression testing using Playwright
 */

import { chromium, Browser, Page } from 'playwright';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

export interface VisualTest {
  name: string;
  url: string;
  viewport?: { width: number; height: number };
  waitForSelector?: string;
  fullPage?: boolean;
}

export interface VisualTestResult {
  name: string;
  status: 'passed' | 'failed' | 'new';
  screenshotPath: string;
  baselinePath?: string;
  diffPath?: string;
  diffPercentage?: number;
  timestamp: string;
}

export interface VisualTestSuite {
  suiteName: string;
  results: VisualTestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    new: number;
  };
  timestamp: string;
}

class VisualRegressionTesterService {
  private baselineDir = join(process.cwd(), 'tests/visual/baselines');
  private screenshotsDir = join(process.cwd(), 'tests/visual/screenshots');
  private diffsDir = join(process.cwd(), 'tests/visual/diffs');
  private reportsDir = join(process.cwd(), 'docs/visual-reports');

  constructor() {
    this.ensureDirectories();
  }

  /**
   * Ensure all required directories exist
   */
  private ensureDirectories() {
    [this.baselineDir, this.screenshotsDir, this.diffsDir, this.reportsDir].forEach(dir => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Run visual regression tests
   */
  async runTests(tests: VisualTest[], baseUrl: string = 'http://localhost:5000'): Promise<VisualTestSuite> {
    const browser = await chromium.launch({ headless: true });
    const results: VisualTestResult[] = [];

    try {
      for (const test of tests) {
        const result = await this.runSingleTest(browser, test, baseUrl);
        results.push(result);
      }
    } finally {
      await browser.close();
    }

    const summary = {
      total: results.length,
      passed: results.filter(r => r.status === 'passed').length,
      failed: results.filter(r => r.status === 'failed').length,
      new: results.filter(r => r.status === 'new').length
    };

    const suite: VisualTestSuite = {
      suiteName: 'Visual Regression Tests',
      results,
      summary,
      timestamp: new Date().toISOString()
    };

    this.saveSuiteReport(suite);
    return suite;
  }

  /**
   * Run a single visual test
   */
  private async runSingleTest(browser: Browser, test: VisualTest, baseUrl: string): Promise<VisualTestResult> {
    const page = await browser.newPage({
      viewport: test.viewport || { width: 1920, height: 1080 }
    });

    try {
      // Navigate to page
      await page.goto(`${baseUrl}${test.url}`, { waitUntil: 'networkidle' });

      // Wait for specific selector if provided
      if (test.waitForSelector) {
        await page.waitForSelector(test.waitForSelector, { timeout: 10000 });
      }

      // Take screenshot
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const screenshotName = `${test.name}-${timestamp}.png`;
      const screenshotPath = join(this.screenshotsDir, screenshotName);

      await page.screenshot({
        path: screenshotPath,
        fullPage: test.fullPage || false
      });

      // Compare with baseline
      const baselinePath = join(this.baselineDir, `${test.name}.png`);
      
      if (!existsSync(baselinePath)) {
        // No baseline exists - this is a new test
        return {
          name: test.name,
          status: 'new',
          screenshotPath,
          timestamp: new Date().toISOString()
        };
      }

      // Compare screenshots
      const diffResult = await this.compareScreenshots(screenshotPath, baselinePath, test.name);

      return {
        name: test.name,
        status: diffResult.percentage < 0.1 ? 'passed' : 'failed', // 0.1% threshold
        screenshotPath,
        baselinePath,
        diffPath: diffResult.diffPath,
        diffPercentage: diffResult.percentage,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error(`Error testing ${test.name}:`, error);
      return {
        name: test.name,
        status: 'failed',
        screenshotPath: '',
        timestamp: new Date().toISOString()
      };
    } finally {
      await page.close();
    }
  }

  /**
   * Compare two screenshots (simplified - using file hash comparison)
   */
  private async compareScreenshots(
    currentPath: string,
    baselinePath: string,
    testName: string
  ): Promise<{ percentage: number; diffPath?: string }> {
    const currentBuffer = readFileSync(currentPath);
    const baselineBuffer = readFileSync(baselinePath);

    // Simple hash comparison (in production, use pixelmatch or similar)
    const currentHash = createHash('md5').update(currentBuffer).digest('hex');
    const baselineHash = createHash('md5').update(baselineBuffer).digest('hex');

    if (currentHash === baselineHash) {
      return { percentage: 0 };
    }

    // Calculate approximate difference based on file size difference
    const sizeDiff = Math.abs(currentBuffer.length - baselineBuffer.length);
    const avgSize = (currentBuffer.length + baselineBuffer.length) / 2;
    const percentage = (sizeDiff / avgSize) * 100;

    // In a real implementation, generate a diff image here
    const diffPath = join(this.diffsDir, `${testName}-diff.png`);

    return { percentage, diffPath };
  }

  /**
   * Update baselines from current screenshots
   */
  async updateBaselines(testNames?: string[]) {
    const screenshots = require('fs').readdirSync(this.screenshotsDir)
      .filter((f: string) => f.endsWith('.png'));

    let updated = 0;

    for (const screenshot of screenshots) {
      const testName = screenshot.split('-')[0];
      
      if (testNames && !testNames.includes(testName)) {
        continue;
      }

      const sourcePath = join(this.screenshotsDir, screenshot);
      const targetPath = join(this.baselineDir, `${testName}.png`);

      require('fs').copyFileSync(sourcePath, targetPath);
      updated++;
    }

    return { updated, total: screenshots.length };
  }

  /**
   * Save suite report
   */
  private saveSuiteReport(suite: VisualTestSuite) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const reportPath = join(this.reportsDir, `visual-tests-${timestamp}.json`);
    writeFileSync(reportPath, JSON.stringify(suite, null, 2));
  }

  /**
   * Format test results for console output
   */
  formatReport(suite: VisualTestSuite): string {
    let report = '\n' + '═'.repeat(80) + '\n';
    report += '📸 VISUAL REGRESSION TEST REPORT\n';
    report += '═'.repeat(80) + '\n\n';

    report += `📊 Summary:\n`;
    report += `   Total Tests: ${suite.summary.total}\n`;
    report += `   ✅ Passed: ${suite.summary.passed}\n`;
    report += `   ❌ Failed: ${suite.summary.failed}\n`;
    report += `   🆕 New: ${suite.summary.new}\n\n`;

    report += `📋 Test Results:\n\n`;

    suite.results.forEach((result, index) => {
      const icon = result.status === 'passed' ? '✅' : result.status === 'failed' ? '❌' : '🆕';
      report += `${index + 1}. ${icon} ${result.name} - ${result.status.toUpperCase()}\n`;
      
      if (result.diffPercentage !== undefined) {
        report += `   Difference: ${result.diffPercentage.toFixed(2)}%\n`;
      }
      
      report += `   Screenshot: ${result.screenshotPath}\n`;
      
      if (result.diffPath) {
        report += `   Diff: ${result.diffPath}\n`;
      }
      
      report += '\n';
    });

    report += '═'.repeat(80) + '\n';

    return report;
  }

  /**
   * Get predefined test suite for platform pages
   */
  getPlatformTestSuite(): VisualTest[] {
    return [
      {
        name: 'home-page',
        url: '/',
        waitForSelector: 'main',
        fullPage: true
      },
      {
        name: 'memories-feed',
        url: '/memories',
        waitForSelector: '[data-testid="memories-container"]',
        fullPage: true
      },
      {
        name: 'housing-marketplace',
        url: '/housing',
        waitForSelector: '[data-testid="housing-listings"]',
        fullPage: true
      },
      {
        name: 'events-page',
        url: '/events',
        waitForSelector: '[data-testid="events-list"]',
        fullPage: true
      },
      {
        name: 'profile-page',
        url: '/profile',
        waitForSelector: '[data-testid="profile-container"]',
        fullPage: false
      },
      {
        name: 'admin-dashboard',
        url: '/admin',
        waitForSelector: '[data-testid="admin-nav"]',
        fullPage: true
      }
    ];
  }
}

export const visualRegressionTester = new VisualRegressionTesterService();
