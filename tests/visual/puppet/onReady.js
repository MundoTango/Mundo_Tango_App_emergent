/**
 * Mundo Tango Visual Regression - onReady Script
 * Runs after page loads to ensure content is ready for snapshot
 */

module.exports = async (page, scenario, viewport, isReference, browserContext) => {
  console.log('SCENARIO > ' + scenario.label);
  
  // Wait for fonts to load
  await page.evaluateHandle('document.fonts.ready');
  
  // Wait for images to load
  await page.evaluate(() => {
    const images = Array.from(document.querySelectorAll('img'));
    return Promise.all(images.map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve, reject) => {
        img.addEventListener('load', resolve);
        img.addEventListener('error', resolve); // Resolve even on error to not block
        setTimeout(resolve, 5000); // Timeout after 5 seconds
      });
    }));
  });

  // Hide dynamic content that changes between snapshots
  if (scenario.hideSelectors) {
    for (const selector of scenario.hideSelectors) {
      await page.evaluate((sel) => {
        const elements = document.querySelectorAll(sel);
        elements.forEach(el => {
          el.style.visibility = 'hidden';
        });
      }, selector);
    }
  }

  // Remove elements completely if specified
  if (scenario.removeSelectors) {
    for (const selector of scenario.removeSelectors) {
      await page.evaluate((sel) => {
        const elements = document.querySelectorAll(sel);
        elements.forEach(el => {
          el.remove();
        });
      }, selector);
    }
  }

  // Set fixed date/time for consistent snapshots
  await page.evaluate(() => {
    // Override Date to return fixed timestamp
    const fixedDate = new Date('2025-01-01T12:00:00Z');
    Date = class extends Date {
      constructor(...args) {
        if (args.length === 0) {
          super(fixedDate);
        } else {
          super(...args);
        }
      }
      static now() {
        return fixedDate.getTime();
      }
    };
  });

  // Scroll to top for consistent viewport
  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });

  // Additional wait if specified
  if (scenario.delay) {
    await page.waitForTimeout(scenario.delay);
  }

  // Wait for specific selector if specified
  if (scenario.readySelector) {
    await page.waitForSelector(scenario.readySelector, {
      visible: true,
      timeout: 30000
    });
  }

  // Perform click action if specified
  if (scenario.clickSelector) {
    await page.click(scenario.clickSelector);
    if (scenario.postInteractionWait) {
      await page.waitForTimeout(scenario.postInteractionWait);
    }
  }

  // Perform hover action if specified
  if (scenario.hoverSelector) {
    await page.hover(scenario.hoverSelector);
    if (scenario.postInteractionWait) {
      await page.waitForTimeout(scenario.postInteractionWait);
    }
  }

  // Final check for Ocean theme application
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'ocean');
  });
};