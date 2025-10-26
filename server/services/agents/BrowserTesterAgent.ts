/**
 * Browser Tester Agent - Playwright-based autonomous testing
 * MB.MD Phase 1.1: Self-Testing Infrastructure for 200-minute runtime
 * 
 * Research: docs/research/AUTONOMOUS_CODING_RESEARCH.md (Replit Agent 3 pattern)
 * Pattern: Run browser tests → Take screenshots → Return structured results
 * 
 * Created: October 26, 2025
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright';
import { writeFileSync } from 'fs';
import { join } from 'path';

export interface BrowserTestResult {
  passed: boolean;
  testName: string;
  duration: number;
  screenshots: Screenshot[];
  errors: TestError[];
  userJourney: UserAction[];
}

export interface Screenshot {
  path: string;
  timestamp: Date;
  description: string;
  type: 'success' | 'failure' | 'info';
}

export interface TestError {
  message: string;
  stack?: string;
  screenshot?: string;
  timestamp: Date;
}

export interface UserAction {
  type: 'click' | 'type' | 'navigate' | 'wait' | 'assert';
  selector?: string;
  value?: string;
  description: string;
  timestamp: Date;
}

export interface TestSpec {
  name: string;
  url: string;
  actions: Array<{
    type: 'click' | 'type' | 'assert' | 'wait';
    selector?: string;
    value?: string;
    expected?: string;
    description: string;
  }>;
}

/**
 * BrowserTesterAgent - Automated browser testing with Playwright
 * 
 * Key Features (from Replit Agent 3 research):
 * - Headless browser automation
 * - Screenshot on success/failure
 * - Structured test results for SelfHealerAgent
 * - 3x faster than Computer Use API
 */
export class BrowserTesterAgent {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private screenshotDir: string;
  
  constructor() {
    this.screenshotDir = join(process.cwd(), 'test-screenshots');
  }
  
  /**
   * Initialize browser (headless mode for CI/CD)
   */
  async initialize(): Promise<void> {
    try {
      this.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-dev-shm-usage']
      });
      
      this.context = await this.browser.newContext({
        viewport: { width: 1920, height: 1080 },
        userAgent: 'MundoTango-BrowserTester/1.0'
      });
      
      console.log('✅ [BrowserTester] Browser initialized');
    } catch (error) {
      console.error('❌ [BrowserTester] Failed to initialize:', error);
      throw error;
    }
  }
  
  /**
   * Execute a test specification
   * 
   * Research Pattern (Replit Agent 3):
   * 1. Navigate to URL
   * 2. Execute user actions (click, type, etc.)
   * 3. Take screenshots at each step
   * 4. Return structured results for AI analysis
   */
  async runTest(spec: TestSpec): Promise<BrowserTestResult> {
    const startTime = Date.now();
    const screenshots: Screenshot[] = [];
    const errors: TestError[] = [];
    const userJourney: UserAction[] = [];
    let passed = true;
    
    if (!this.context) {
      throw new Error('Browser not initialized. Call initialize() first');
    }
    
    const page = await this.context.newPage();
    
    try {
      console.log(`🧪 [BrowserTester] Running test: ${spec.name}`);
      
      // Navigate to test URL
      console.log(`🌐 [BrowserTester] Navigating to ${spec.url}`);
      await page.goto(spec.url, { waitUntil: 'networkidle', timeout: 30000 });
      
      userJourney.push({
        type: 'navigate',
        description: `Navigated to ${spec.url}`,
        timestamp: new Date()
      });
      
      // Take initial screenshot
      const initialScreenshot = await this.takeScreenshot(page, 'initial-state', 'info');
      screenshots.push(initialScreenshot);
      
      // Execute test actions
      for (let i = 0; i < spec.actions.length; i++) {
        const action = spec.actions[i];
        
        try {
          console.log(`▶️  [BrowserTester] Action ${i + 1}/${spec.actions.length}: ${action.description}`);
          
          switch (action.type) {
            case 'click':
              if (!action.selector) throw new Error('Click action requires selector');
              await page.click(action.selector, { timeout: 10000 });
              userJourney.push({
                type: 'click',
                selector: action.selector,
                description: action.description,
                timestamp: new Date()
              });
              break;
              
            case 'type':
              if (!action.selector || !action.value) {
                throw new Error('Type action requires selector and value');
              }
              await page.fill(action.selector, action.value, { timeout: 10000 });
              userJourney.push({
                type: 'type',
                selector: action.selector,
                value: action.value,
                description: action.description,
                timestamp: new Date()
              });
              break;
              
            case 'assert':
              if (!action.selector) throw new Error('Assert action requires selector');
              const element = await page.locator(action.selector).first();
              const isVisible = await element.isVisible({ timeout: 5000 });
              
              if (!isVisible && action.expected !== 'hidden') {
                throw new Error(`Element ${action.selector} not visible`);
              }
              
              if (action.expected) {
                const text = await element.textContent();
                if (!text?.includes(action.expected)) {
                  throw new Error(`Expected text "${action.expected}" not found. Got: "${text}"`);
                }
              }
              
              userJourney.push({
                type: 'assert',
                selector: action.selector,
                value: action.expected,
                description: action.description,
                timestamp: new Date()
              });
              break;
              
            case 'wait':
              const waitTime = parseInt(action.value || '1000');
              await page.waitForTimeout(waitTime);
              userJourney.push({
                type: 'wait',
                value: `${waitTime}ms`,
                description: action.description,
                timestamp: new Date()
              });
              break;
          }
          
          // Take screenshot after each action
          const actionScreenshot = await this.takeScreenshot(
            page,
            `action-${i + 1}-${action.type}`,
            'success'
          );
          screenshots.push(actionScreenshot);
          
        } catch (actionError) {
          // Capture failure screenshot
          const failureScreenshot = await this.takeScreenshot(
            page,
            `failure-action-${i + 1}`,
            'failure'
          );
          screenshots.push(failureScreenshot);
          
          const error: TestError = {
            message: actionError instanceof Error ? actionError.message : 'Unknown error',
            stack: actionError instanceof Error ? actionError.stack : undefined,
            screenshot: failureScreenshot.path,
            timestamp: new Date()
          };
          errors.push(error);
          
          console.error(`❌ [BrowserTester] Action ${i + 1} failed:`, error.message);
          passed = false;
          break; // Stop on first failure
        }
      }
      
      // Final screenshot
      const finalScreenshot = await this.takeScreenshot(
        page,
        'final-state',
        passed ? 'success' : 'failure'
      );
      screenshots.push(finalScreenshot);
      
    } catch (error) {
      // Capture critical failure screenshot
      try {
        const criticalScreenshot = await this.takeScreenshot(page, 'critical-failure', 'failure');
        screenshots.push(criticalScreenshot);
      } catch (screenshotError) {
        console.error('Failed to capture failure screenshot:', screenshotError);
      }
      
      errors.push({
        message: error instanceof Error ? error.message : 'Unknown critical error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date()
      });
      
      passed = false;
      
    } finally {
      await page.close();
    }
    
    const duration = Date.now() - startTime;
    
    console.log(`${passed ? '✅' : '❌'} [BrowserTester] Test ${passed ? 'PASSED' : 'FAILED'} in ${duration}ms`);
    
    return {
      passed,
      testName: spec.name,
      duration,
      screenshots,
      errors,
      userJourney
    };
  }
  
  /**
   * Take screenshot and save to disk
   * Returns screenshot metadata for AI analysis
   */
  private async takeScreenshot(
    page: Page,
    name: string,
    type: Screenshot['type']
  ): Promise<Screenshot> {
    const timestamp = new Date();
    const filename = `${name}-${timestamp.getTime()}.png`;
    const path = join(this.screenshotDir, filename);
    
    try {
      await page.screenshot({ path, fullPage: true });
      
      return {
        path,
        timestamp,
        description: name,
        type
      };
    } catch (error) {
      console.error(`Failed to take screenshot ${name}:`, error);
      throw error;
    }
  }
  
  /**
   * Generate test spec from Visual Editor context
   * 
   * Pattern: Convert selected element + user request into executable test
   */
  async generateTestFromRequest(
    userRequest: string,
    selectedElement?: { xpath: string; tag: string; id?: string }
  ): Promise<TestSpec> {
    // MVP: Simple test spec generation
    // TODO: Use Claude to generate intelligent test specs
    
    const actions: TestSpec['actions'] = [];
    
    if (selectedElement?.xpath) {
      // Test that the element exists and is visible
      actions.push({
        type: 'assert',
        selector: `xpath=${selectedElement.xpath}`,
        description: `Verify ${selectedElement.tag} element exists`,
        expected: 'visible'
      });
    }
    
    // Parse user request for common patterns
    if (userRequest.toLowerCase().includes('click')) {
      const match = userRequest.match(/click\s+(?:the\s+)?(?:on\s+)?([a-zA-Z0-9\-_]+)/i);
      if (match) {
        actions.push({
          type: 'click',
          selector: `[data-testid="${match[1]}"], button:has-text("${match[1]}")`,
          description: `Click ${match[1]}`
        });
      }
    }
    
    return {
      name: `Generated test: ${userRequest.substring(0, 50)}`,
      url: 'http://localhost:5000',
      actions
    };
  }
  
  /**
   * Cleanup: Close browser
   */
  async cleanup(): Promise<void> {
    if (this.context) {
      await this.context.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
    console.log('✅ [BrowserTester] Browser closed');
  }
}
