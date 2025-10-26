/**
 * AGENT #145: Self-Testing & Self-Healing
 * Playwright browser automation for autonomous code testing
 * MB.MD: Replit Agent 3-style self-testing loops
 */

import { chromium, Browser, Page } from 'playwright';
import { ObjectStorageService } from '../../objectStorage';

const objectStorage = new ObjectStorageService();

export interface TestResult {
  passed: boolean;
  errors: string[];
  screenshot?: string; // URL to screenshot in Object Storage
  logs: string[];
  timestamp: Date;
}

let browser: Browser | null = null;

/**
 * Initialize browser (reuse across tests for performance)
 */
async function getBrowser(): Promise<Browser> {
  if (!browser) {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }
  return browser;
}

/**
 * Close browser
 */
export async function closeBrowser() {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

/**
 * Test generated code in isolated environment
 */
export async function testGeneratedCode(
  code: string,
  testType: 'component' | 'page',
  options: {
    maxIterations?: number;
    captureScreenshot?: boolean;
  } = {}
): Promise<TestResult> {
  const { maxIterations = 20, captureScreenshot = true } = options;
  
  const browser = await getBrowser();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const errors: string[] = [];
  const logs: string[] = [];
  
  // Capture console messages
  page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
  
  // Capture page errors
  page.on('pageerror', err => errors.push(err.message));
  
  try {
    // Inject code into test environment
    if (testType === 'component') {
      // Test React component
      const testHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
            <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
            <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          </head>
          <body>
            <div id="root"></div>
            <script type="text/babel">
              ${code}
              const root = ReactDOM.createRoot(document.getElementById('root'));
              root.render(React.createElement(App));
            </script>
          </body>
        </html>
      `;
      
      await page.setContent(testHTML);
    } else {
      // Test full page
      await page.setContent(code);
    }
    
    // Wait for page to settle
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
    
    // Capture screenshot if enabled
    let screenshotUrl: string | undefined;
    if (captureScreenshot) {
      const screenshotBuffer = await page.screenshot({ fullPage: true });
      screenshotUrl = await objectStorage.saveScreenshot(screenshotBuffer, 1, `Test ${testType}`) || undefined;
      console.log('📸 [Testing] Screenshot saved:', screenshotUrl);
    }
    
    // Run accessibility tests
    const a11yIssues = await page.evaluate(() => {
      const issues = [];
      
      // Check for images without alt text
      const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
      if (imagesWithoutAlt.length > 0) {
        issues.push(`Found ${imagesWithoutAlt.length} images without alt text`);
      }
      
      // Check for buttons without accessible names
      const unlabeledButtons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
      if (unlabeledButtons.length > 0) {
        issues.push(`Found ${unlabeledButtons.length} buttons without accessible names`);
      }
      
      return issues;
    });
    
    errors.push(...a11yIssues);
    
    await context.close();
    
    return {
      passed: errors.length === 0,
      errors,
      screenshot: screenshotUrl,
      logs,
      timestamp: new Date(),
    };
  } catch (error) {
    await context.close();
    
    return {
      passed: false,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
      logs,
      timestamp: new Date(),
    };
  }
}

/**
 * Self-healing loop: test → fix → retest
 */
export async function selfHealingLoop(
  initialCode: string,
  testType: 'component' | 'page',
  fixFunction: (code: string, errors: string[]) => Promise<string>,
  maxIterations: number = 20
): Promise<{ finalCode: string; iterations: number; success: boolean; history: TestResult[] }> {
  let currentCode = initialCode;
  let iteration = 0;
  const history: TestResult[] = [];
  
  console.log('🔧 [Self-Healing] Starting loop, max iterations:', maxIterations);
  
  while (iteration < maxIterations) {
    iteration++;
    console.log(`🔄 [Self-Healing] Iteration ${iteration}/${maxIterations}`);
    
    // Test current code
    const testResult = await testGeneratedCode(currentCode, testType);
    history.push(testResult);
    
    if (testResult.passed) {
      console.log(`✅ [Self-Healing] Success on iteration ${iteration}`);
      return { finalCode: currentCode, iterations: iteration, success: true, history };
    }
    
    console.log(`❌ [Self-Healing] Errors found:`, testResult.errors);
    
    // Fix errors
    try {
      currentCode = await fixFunction(currentCode, testResult.errors);
      console.log(`🔧 [Self-Healing] Code fixed, retesting...`);
    } catch (error) {
      console.error(`❌ [Self-Healing] Fix function failed:`, error);
      break;
    }
  }
  
  console.log(`⚠️ [Self-Healing] Failed to fix after ${maxIterations} iterations`);
  return { finalCode: currentCode, iterations: maxIterations, success: false, history };
}

/**
 * Simple integration test: click button, verify behavior
 */
export async function testInteraction(
  url: string,
  actions: Array<{ type: 'click' | 'type' | 'wait'; selector?: string; value?: string; ms?: number }>
): Promise<TestResult> {
  const browser = await getBrowser();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const errors: string[] = [];
  const logs: string[] = [];
  
  page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => errors.push(err.message));
  
  try {
    await page.goto(url);
    
    for (const action of actions) {
      switch (action.type) {
        case 'click':
          if (action.selector) {
            await page.click(action.selector);
          }
          break;
        case 'type':
          if (action.selector && action.value) {
            await page.fill(action.selector, action.value);
          }
          break;
        case 'wait':
          await page.waitForTimeout(action.ms || 1000);
          break;
      }
    }
    
    const screenshot = await page.screenshot({ fullPage: true });
    const screenshotUrl = await objectStorage.saveScreenshot(screenshot, 1, 'Interaction test') || undefined;
    
    await context.close();
    
    return {
      passed: errors.length === 0,
      errors,
      screenshot: screenshotUrl,
      logs,
      timestamp: new Date(),
    };
  } catch (error) {
    await context.close();
    
    return {
      passed: false,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
      logs,
      timestamp: new Date(),
    };
  }
}
