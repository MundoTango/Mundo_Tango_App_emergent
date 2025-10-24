import { Router } from 'express';
import { chromium, Browser, Page } from 'playwright';

const router = Router();

let browser: Browser | null = null;

// Initialize browser on first use
async function getBrowser(): Promise<Browser> {
  if (!browser) {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }
  return browser;
}

/**
 * POST /api/mrblue/test-change
 * Test changes in browser and validate
 */
router.post('/test-change', async (req, res) => {
  try {
    const { 
      url, 
      selector, 
      expectedState,
      takeScreenshot = true,
      timeout = 10000
    } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'url is required and must be a string'
      });
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🌐 [MR BLUE - BROWSER TESTING]');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔗 URL:', url);
    console.log('🎯 Selector:', selector || 'none');
    console.log('📸 Screenshot:', takeScreenshot);

    const browserInstance = await getBrowser();
    const page = await browserInstance.newPage();
    const errors: string[] = [];
    let screenshot: string | null = null;

    try {
      // Navigate to page
      console.log('🌐 Navigating to page...');
      await page.goto(url, { waitUntil: 'networkidle', timeout });

      // Capture console errors
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
          console.log('⚠️  Console error:', msg.text());
        }
      });

      page.on('pageerror', (error) => {
        errors.push(error.message);
        console.log('❌ Page error:', error.message);
      });

      // Wait for selector if provided
      if (selector) {
        console.log('🔍 Waiting for selector:', selector);
        await page.waitForSelector(selector, { timeout });
        
        // Validate expected state if provided
        if (expectedState) {
          const element = await page.$(selector);
          if (element) {
            // Check various properties based on expectedState
            if (expectedState.text) {
              const text = await element.textContent();
              if (text !== expectedState.text) {
                errors.push(`Text mismatch: expected "${expectedState.text}", got "${text}"`);
              }
            }
            if (expectedState.visible !== undefined) {
              const isVisible = await element.isVisible();
              if (isVisible !== expectedState.visible) {
                errors.push(`Visibility mismatch: expected ${expectedState.visible}, got ${isVisible}`);
              }
            }
          }
        }
      }

      // Take screenshot if requested
      if (takeScreenshot) {
        console.log('📸 Taking screenshot...');
        const buffer = await page.screenshot({
          fullPage: false,
          type: 'png'
        });
        screenshot = buffer.toString('base64');
      }

      console.log('✅ Browser test complete');
      console.log('📊 Results:', {
        errors: errors.length,
        screenshotTaken: !!screenshot
      });
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      res.json({
        success: errors.length === 0,
        data: {
          errors,
          screenshot: screenshot || undefined,
          url,
          selector: selector || undefined
        }
      });

    } finally {
      await page.close();
    }

  } catch (error: any) {
    console.error('❌ [BROWSER TEST ERROR]:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Cleanup browser on shutdown
process.on('SIGTERM', async () => {
  if (browser) {
    await browser.close();
  }
});

export default router;
