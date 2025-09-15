/**
 * Mundo Tango Visual Regression - onBefore Script
 * Runs before each scenario to set up authentication and initial state
 */

module.exports = async (page, scenario, viewport, isReference, browserContext) => {
  // Set authentication cookie if testing authenticated pages
  if (scenario.auth) {
    await page.setCookie({
      name: 'auth-token',
      value: process.env.TEST_AUTH_TOKEN || 'test-token',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false
    });
  }

  // Set viewport
  await page.setViewport({
    width: viewport.width,
    height: viewport.height
  });

  // Block unnecessary resources for faster loading
  await page.setRequestInterception(true);
  page.on('request', (request) => {
    const resourceType = request.resourceType();
    const url = request.url();
    
    // Block tracking scripts and analytics
    if (url.includes('analytics') || url.includes('gtag') || url.includes('tracking')) {
      request.abort();
    }
    // Allow all other resources
    else {
      request.continue();
    }
  });

  // Set Ocean theme CSS variables
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('theme', 'light');
    
    // Inject Ocean theme colors
    const style = document.createElement('style');
    style.innerHTML = `
      :root {
        --ocean-primary: hsl(180, 71%, 39%) !important;
        --ocean-secondary: hsl(214, 100%, 59%) !important;
        --ocean-dark: hsl(217, 32%, 17%) !important;
        --ocean-light: hsl(200, 100%, 97%) !important;
      }
    `;
    document.head.appendChild(style);
  });

  // Disable animations for consistent snapshots
  await page.evaluateOnNewDocument(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
    `;
    document.head.appendChild(style);
  });
};