/**
 * TESTER AGENT - Automated Testing with Playwright
 * MB.MD SIMULTANEOUS - Agent #4: Multi-Agent Orchestration Specialist
 * 
 * Responsibilities:
 * - Run Playwright tests automatically
 * - Capture screenshots on failure
 * - Self-correction loop (screenshot → analyze → fix)
 * - Report test results
 * 
 * Created: October 23, 2025
 */

import { chromium, type Browser, type Page } from 'playwright';
import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs/promises';
import * as path from 'path';

interface TestResult {
  passed: boolean;
  failures: string[];
  screenshots: string[];
  retryCount: number;
}

interface TestContext {
  url: string;
  testDescription: string;
  maxRetries?: number;
}

/**
 * TesterAgent - Automated testing with self-correction
 */
export class TesterAgent {
  private browser: Browser | null = null;
  private anthropic: Anthropic;
  private model: string = 'claude-3-5-sonnet-20241022';

  constructor() {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not found in environment');
    }
    this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  /**
   * Run automated test
   */
  async runTest(context: TestContext): Promise<TestResult> {
    const maxRetries = context.maxRetries || 3;
    const failures: string[] = [];
    const screenshots: string[] = [];
    let retryCount = 0;

    try {
      // Launch browser
      this.browser = await chromium.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        retryCount = attempt;

        const result = await this.attemptTest(context);

        if (result.passed) {
          await this.cleanup();
          return {
            passed: true,
            failures: [],
            screenshots: result.screenshots,
            retryCount
          };
        }

        // Test failed - capture screenshot and analyze
        failures.push(...result.failures);
        screenshots.push(...result.screenshots);

        if (attempt < maxRetries - 1) {
          // Self-correction: Ask Claude to analyze failure
          const fix = await this.analyzeFailure(
            result.screenshots[result.screenshots.length - 1],
            result.failures[result.failures.length - 1]
          );

          // TODO: Apply fix automatically
          console.log('[TesterAgent] Suggested fix:', fix);
        }
      }

      // All retries exhausted
      await this.cleanup();
      return {
        passed: false,
        failures,
        screenshots,
        retryCount
      };
    } catch (error) {
      await this.cleanup();
      return {
        passed: false,
        failures: [error instanceof Error ? error.message : 'Unknown error'],
        screenshots,
        retryCount
      };
    }
  }

  /**
   * Attempt single test
   */
  private async attemptTest(context: TestContext): Promise<{
    passed: boolean;
    failures: string[];
    screenshots: string[];
  }> {
    if (!this.browser) {
      throw new Error('Browser not initialized');
    }

    const page = await this.browser.newPage();
    const failures: string[] = [];
    const screenshots: string[] = [];

    try {
      // Navigate to URL
      await page.goto(context.url, { waitUntil: 'networkidle' });

      // TODO: Run actual test based on testDescription
      // For now, just check if page loaded
      const title = await page.title();
      
      if (!title) {
        failures.push('Page title is empty');
        
        // Capture screenshot
        const screenshotPath = await this.captureScreenshot(page);
        screenshots.push(screenshotPath);

        return { passed: false, failures, screenshots };
      }

      return { passed: true, failures: [], screenshots };
    } catch (error) {
      failures.push(error instanceof Error ? error.message : 'Unknown error');
      
      // Capture screenshot on error
      try {
        const screenshotPath = await this.captureScreenshot(page);
        screenshots.push(screenshotPath);
      } catch {}

      return { passed: false, failures, screenshots };
    } finally {
      await page.close();
    }
  }

  /**
   * Capture screenshot
   */
  private async captureScreenshot(page: Page): Promise<string> {
    const timestamp = Date.now();
    const filename = `test-failure-${timestamp}.png`;
    const filepath = path.join('/tmp', filename);

    await page.screenshot({ path: filepath, fullPage: true });
    return filepath;
  }

  /**
   * Analyze failure using Claude Vision
   */
  private async analyzeFailure(
    screenshotPath: string,
    errorMessage: string
  ): Promise<string> {
    try {
      // Read screenshot as base64
      const imageBuffer = await fs.readFile(screenshotPath);
      const base64Image = imageBuffer.toString('base64');

      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/png',
                  data: base64Image
                }
              },
              {
                type: 'text',
                text: `This screenshot shows a test failure. Error message: "${errorMessage}"

Analyze the screenshot and suggest what code changes might fix this issue. Be specific about file paths and code changes.`
              }
            ]
          }
        ]
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return content.text;
      }

      return 'No suggestions available';
    } catch (error) {
      console.error('[TesterAgent] Error analyzing failure:', error);
      return 'Analysis failed';
    }
  }

  /**
   * Cleanup browser
   */
  private async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

/**
 * Factory function
 */
export function createTesterAgent(): TesterAgent {
  return new TesterAgent();
}
