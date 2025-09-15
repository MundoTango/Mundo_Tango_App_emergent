/**
 * Mundo Tango Visual Regression - Dark Mode Setup
 * Sets dark mode before scenario execution
 */

module.exports = async (page, scenario, viewport, isReference, browserContext) => {
  // Set dark mode in localStorage before navigation
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('theme', 'dark');
    localStorage.setItem('color-theme', 'dark');
  });

  // Also run the standard onBefore script
  const onBefore = require('./onBefore');
  await onBefore(page, scenario, viewport, isReference, browserContext);

  // Override to ensure dark mode is applied
  await page.evaluateOnNewDocument(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      :root {
        color-scheme: dark;
      }
      html {
        background-color: hsl(217, 32%, 17%) !important;
      }
      body {
        background-color: hsl(217, 32%, 17%) !important;
        color: hsl(200, 100%, 97%) !important;
      }
      .dark {
        --background: hsl(217, 32%, 17%) !important;
        --foreground: hsl(200, 100%, 97%) !important;
      }
    `;
    document.head.appendChild(style);
    document.documentElement.classList.add('dark');
    document.documentElement.setAttribute('data-theme', 'dark');
  });
};