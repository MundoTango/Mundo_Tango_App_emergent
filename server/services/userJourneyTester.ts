/**
 * User Journey Testing Service
 * ESA Layer 51: Testing Infrastructure
 * 
 * Automated testing of critical user paths and flows
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export interface JourneyStep {
  action: 'navigate' | 'click' | 'fill' | 'wait' | 'assert';
  selector?: string;
  value?: string;
  url?: string;
  timeout?: number;
  assertion?: {
    type: 'visible' | 'text' | 'url' | 'count';
    expected: any;
  };
}

export interface UserJourney {
  name: string;
  description: string;
  category: string;
  criticalPath: boolean;
  steps: JourneyStep[];
  timeout?: number;
}

export interface JourneyTestResult {
  journeyName: string;
  status: 'passed' | 'failed';
  steps: {
    step: number;
    action: string;
    status: 'passed' | 'failed' | 'skipped';
    error?: string;
    duration: number;
  }[];
  totalDuration: number;
  screenshotPath?: string;
  timestamp: string;
}

export interface JourneyTestSuite {
  suiteName: string;
  results: JourneyTestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    criticalPaths: number;
    criticalPathsPassed: number;
  };
  timestamp: string;
}

class UserJourneyTesterService {
  private screenshotsDir = join(process.cwd(), 'tests/journey/screenshots');
  private reportsDir = join(process.cwd(), 'docs/journey-reports');

  constructor() {
    this.ensureDirectories();
  }

  /**
   * Ensure required directories exist
   */
  private ensureDirectories() {
    [this.screenshotsDir, this.reportsDir].forEach(dir => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Run journey tests
   */
  async runJourneys(
    journeys: UserJourney[], 
    baseUrl: string = 'http://localhost:5000'
  ): Promise<JourneyTestSuite> {
    const browser = await chromium.launch({ headless: true });
    const results: JourneyTestResult[] = [];

    try {
      for (const journey of journeys) {
        const result = await this.runSingleJourney(browser, journey, baseUrl);
        results.push(result);
      }
    } finally {
      await browser.close();
    }

    const summary = {
      total: results.length,
      passed: results.filter(r => r.status === 'passed').length,
      failed: results.filter(r => r.status === 'failed').length,
      criticalPaths: journeys.filter(j => j.criticalPath).length,
      criticalPathsPassed: results.filter((r, i) => 
        journeys[i].criticalPath && r.status === 'passed'
      ).length
    };

    const suite: JourneyTestSuite = {
      suiteName: 'User Journey Tests',
      results,
      summary,
      timestamp: new Date().toISOString()
    };

    this.saveSuiteReport(suite);
    return suite;
  }

  /**
   * Run a single journey test
   */
  private async runSingleJourney(
    browser: Browser, 
    journey: UserJourney, 
    baseUrl: string
  ): Promise<JourneyTestResult> {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    const startTime = Date.now();
    
    const stepResults: JourneyTestResult['steps'] = [];
    let journeyFailed = false;

    try {
      for (let i = 0; i < journey.steps.length; i++) {
        const step = journey.steps[i];
        const stepStart = Date.now();

        if (journeyFailed) {
          stepResults.push({
            step: i + 1,
            action: step.action,
            status: 'skipped',
            duration: 0
          });
          continue;
        }

        try {
          await this.executeStep(page, step, baseUrl);
          stepResults.push({
            step: i + 1,
            action: step.action,
            status: 'passed',
            duration: Date.now() - stepStart
          });
        } catch (error) {
          journeyFailed = true;
          stepResults.push({
            step: i + 1,
            action: step.action,
            status: 'failed',
            error: error instanceof Error ? error.message : String(error),
            duration: Date.now() - stepStart
          });
        }
      }

      // Take screenshot if journey failed
      let screenshotPath: string | undefined;
      if (journeyFailed) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        screenshotPath = join(this.screenshotsDir, `${journey.name}-failed-${timestamp}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });
      }

      return {
        journeyName: journey.name,
        status: journeyFailed ? 'failed' : 'passed',
        steps: stepResults,
        totalDuration: Date.now() - startTime,
        screenshotPath,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        journeyName: journey.name,
        status: 'failed',
        steps: stepResults,
        totalDuration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    } finally {
      await context.close();
    }
  }

  /**
   * Execute a single journey step
   */
  private async executeStep(page: Page, step: JourneyStep, baseUrl: string) {
    const timeout = step.timeout || 10000;

    switch (step.action) {
      case 'navigate':
        if (!step.url) throw new Error('Navigate step requires url');
        await page.goto(`${baseUrl}${step.url}`, { waitUntil: 'networkidle', timeout });
        break;

      case 'click':
        if (!step.selector) throw new Error('Click step requires selector');
        await page.click(step.selector, { timeout });
        break;

      case 'fill':
        if (!step.selector || !step.value) throw new Error('Fill step requires selector and value');
        await page.fill(step.selector, step.value, { timeout });
        break;

      case 'wait':
        if (step.selector) {
          await page.waitForSelector(step.selector, { timeout });
        } else {
          await page.waitForTimeout(step.timeout || 1000);
        }
        break;

      case 'assert':
        if (!step.assertion) throw new Error('Assert step requires assertion');
        await this.executeAssertion(page, step.assertion);
        break;

      default:
        throw new Error(`Unknown step action: ${step.action}`);
    }
  }

  /**
   * Execute assertion
   */
  private async executeAssertion(page: Page, assertion: JourneyStep['assertion']) {
    if (!assertion) return;

    switch (assertion.type) {
      case 'visible':
        const isVisible = await page.isVisible(assertion.expected);
        if (!isVisible) throw new Error(`Element not visible: ${assertion.expected}`);
        break;

      case 'text':
        const text = await page.textContent('body');
        if (!text?.includes(assertion.expected)) {
          throw new Error(`Text not found: ${assertion.expected}`);
        }
        break;

      case 'url':
        const url = page.url();
        if (!url.includes(assertion.expected)) {
          throw new Error(`URL does not match. Expected: ${assertion.expected}, Got: ${url}`);
        }
        break;

      case 'count':
        const count = await page.locator(assertion.expected.selector).count();
        if (count !== assertion.expected.value) {
          throw new Error(`Count mismatch. Expected: ${assertion.expected.value}, Got: ${count}`);
        }
        break;
    }
  }

  /**
   * Save suite report
   */
  private saveSuiteReport(suite: JourneyTestSuite) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const reportPath = join(this.reportsDir, `journey-tests-${timestamp}.json`);
    writeFileSync(reportPath, JSON.stringify(suite, null, 2));
  }

  /**
   * Format test results for console output
   */
  formatReport(suite: JourneyTestSuite): string {
    let report = '\n' + '═'.repeat(80) + '\n';
    report += '🚶 USER JOURNEY TEST REPORT\n';
    report += '═'.repeat(80) + '\n\n';

    report += `📊 Summary:\n`;
    report += `   Total Journeys: ${suite.summary.total}\n`;
    report += `   ✅ Passed: ${suite.summary.passed}\n`;
    report += `   ❌ Failed: ${suite.summary.failed}\n`;
    report += `   🔥 Critical Paths: ${suite.summary.criticalPathsPassed}/${suite.summary.criticalPaths} passed\n\n`;

    report += `📋 Journey Results:\n\n`;

    suite.results.forEach((result, index) => {
      const icon = result.status === 'passed' ? '✅' : '❌';
      report += `${index + 1}. ${icon} ${result.journeyName} - ${result.status.toUpperCase()}\n`;
      report += `   Duration: ${result.totalDuration}ms\n`;
      
      if (result.status === 'failed') {
        const failedStep = result.steps.find(s => s.status === 'failed');
        if (failedStep) {
          report += `   Failed at step ${failedStep.step}: ${failedStep.action}\n`;
          if (failedStep.error) {
            report += `   Error: ${failedStep.error}\n`;
          }
        }
        if (result.screenshotPath) {
          report += `   Screenshot: ${result.screenshotPath}\n`;
        }
      }
      
      report += '\n';
    });

    report += '═'.repeat(80) + '\n';

    return report;
  }

  /**
   * Get predefined critical user journeys
   */
  getCriticalJourneys(): UserJourney[] {
    return [
      {
        name: 'user-signup-flow',
        description: 'New user registration and profile setup',
        category: 'authentication',
        criticalPath: true,
        steps: [
          { action: 'navigate', url: '/signup' },
          { action: 'fill', selector: '[data-testid="input-email"]', value: 'test@example.com' },
          { action: 'fill', selector: '[data-testid="input-password"]', value: 'SecurePass123!' },
          { action: 'click', selector: '[data-testid="button-signup"]' },
          { action: 'wait', selector: '[data-testid="profile-setup"]' },
          { action: 'assert', assertion: { type: 'url', expected: '/profile/setup' } }
        ]
      },
      {
        name: 'memory-creation-flow',
        description: 'Create and publish a new memory',
        category: 'social',
        criticalPath: true,
        steps: [
          { action: 'navigate', url: '/memories' },
          { action: 'click', selector: '[data-testid="button-create-memory"]' },
          { action: 'fill', selector: '[data-testid="input-memory-content"]', value: 'Test memory content' },
          { action: 'click', selector: '[data-testid="button-publish"]' },
          { action: 'wait', selector: '[data-testid="memory-success"]' },
          { action: 'assert', assertion: { type: 'text', expected: 'Memory published successfully' } }
        ]
      },
      {
        name: 'housing-search-flow',
        description: 'Search for housing listings',
        category: 'housing',
        criticalPath: true,
        steps: [
          { action: 'navigate', url: '/housing' },
          { action: 'wait', selector: '[data-testid="housing-listings"]' },
          { action: 'fill', selector: '[data-testid="input-search-location"]', value: 'Buenos Aires' },
          { action: 'click', selector: '[data-testid="button-search"]' },
          { action: 'wait', selector: '[data-testid="listing-card"]' },
          { action: 'assert', assertion: { type: 'visible', expected: '[data-testid="listing-card"]' } }
        ]
      },
      {
        name: 'event-rsvp-flow',
        description: 'RSVP to an event',
        category: 'social',
        criticalPath: true,
        steps: [
          { action: 'navigate', url: '/events' },
          { action: 'wait', selector: '[data-testid="event-card"]' },
          { action: 'click', selector: '[data-testid="event-card"]:first-child' },
          { action: 'wait', selector: '[data-testid="button-rsvp"]' },
          { action: 'click', selector: '[data-testid="button-rsvp"]' },
          { action: 'assert', assertion: { type: 'text', expected: 'RSVP confirmed' } }
        ]
      },
      {
        name: 'profile-edit-flow',
        description: 'Edit user profile information',
        category: 'core',
        criticalPath: false,
        steps: [
          { action: 'navigate', url: '/profile' },
          { action: 'click', selector: '[data-testid="button-edit-profile"]' },
          { action: 'fill', selector: '[data-testid="input-bio"]', value: 'Updated bio text' },
          { action: 'click', selector: '[data-testid="button-save"]' },
          { action: 'wait', selector: '[data-testid="save-success"]' },
          { action: 'assert', assertion: { type: 'text', expected: 'Profile updated' } }
        ]
      }
    ];
  }
}

export const userJourneyTester = new UserJourneyTesterService();
