# Mundo Tango E2E Testing Framework

## Overview

This comprehensive Playwright testing framework provides robust end-to-end testing capabilities for the Mundo Tango platform, including mobile/desktop/tablet testing, accessibility validation, visual regression, and performance monitoring.

## Features

✅ **Multi-Device Testing**: Desktop, tablet, and mobile viewports  
✅ **Cross-Browser Support**: Chrome, Firefox, Safari, Edge  
✅ **Accessibility Testing**: WCAG compliance with @axe-core/playwright  
✅ **Visual Regression**: Screenshot comparison with @percy/playwright  
✅ **Page Object Model**: Maintainable test structure  
✅ **Test Data Management**: Fixtures and factories  
✅ **Parallel Execution**: Optimized test running  
✅ **Debugging Tools**: Traces, videos, screenshots  
✅ **Network Mocking**: API response simulation  
✅ **Performance Monitoring**: Core Web Vitals tracking  

## Installation

```bash
# Install Playwright and browsers
npm run test:install

# Install dependencies (already included in package.json)
npm install
```

## Configuration

### Environment Variables

```bash
# .env.test
BASE_URL=http://localhost:5000
TEST_DATABASE_URL=postgresql://test:test@localhost:5432/mundotango_test
PERCY_TOKEN=your_percy_token_here
```

### Main Configuration Files

- `playwright.config.ts`: Root configuration
- `tests/e2e/playwright.config.ts`: E2E specific configuration
- `tests/e2e/helpers/`: Test utilities and helpers
- `tests/e2e/pages/`: Page Object Models
- `tests/e2e/fixtures/`: Test data and fixtures

## Running Tests

### Basic Commands

```bash
# Run all tests
npm run test:e2e

# Run tests with UI
npm run test:e2e:ui

# Run tests in debug mode
npm run test:e2e:debug

# Run specific test file
npx playwright test tests/e2e/auth.e2e.test.ts

# Run tests for specific project
npx playwright test --project="Mobile Chrome"
```

### Test Categories

```bash
# Run accessibility tests only
npx playwright test --project=a11y

# Run visual regression tests only
npx playwright test --project=visual

# Run API tests only
npx playwright test --project=api

# Run performance tests only
npx playwright test --project=performance
```

### Device-Specific Testing

```bash
# Run mobile tests
npx playwright test --project="iPhone 14 Pro"

# Run tablet tests
npx playwright test --project="iPad Pro"

# Run desktop tests
npx playwright test --project="Desktop Chrome"
```

## Test Structure

### Page Object Model

```typescript
// pages/LoginPage.ts
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  async login(email: string, password: string) {
    await this.fillInput('[data-testid="input-email"]', email);
    await this.fillInput('[data-testid="input-password"]', password);
    await this.clickElement('[data-testid="button-login"]');
  }
}
```

### Test Example

```typescript
// auth.e2e.test.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { testUsers } from './fixtures/test-data';

test('User can login successfully', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(testUsers.regularUser.email, testUsers.regularUser.password);
  
  await expect(page).toHaveURL('/dashboard');
  await loginPage.expectToastMessage('Welcome back', 'success');
});
```

## Accessibility Testing

### WCAG Compliance Check

```typescript
import { assertNoA11yViolations, checkWCAGCriteria } from './helpers/accessibility';

test('Page meets WCAG AA standards', async ({ page }) => {
  await page.goto('/');
  
  // Check for violations
  await assertNoA11yViolations(page);
  
  // Check specific WCAG level
  await checkWCAGCriteria(page, 'AA');
});
```

### Generate Accessibility Reports

```typescript
import { generateA11yReport } from './helpers/accessibility';

test('Generate accessibility report', async ({ page }) => {
  await page.goto('/');
  await generateA11yReport(page, 'homepage-accessibility');
  // Report saved to test-results/a11y-reports/
});
```

## Visual Regression Testing

### Percy Integration

```typescript
import { takePercySnapshot } from './helpers/visual-regression';

test('Visual consistency check', async ({ page }) => {
  await page.goto('/');
  await takePercySnapshot(page, 'Homepage', {
    widths: [375, 768, 1280, 1920],
  });
});
```

### Local Screenshot Comparison

```typescript
import { compareScreenshot } from './helpers/visual-regression';

test('Component visual test', async ({ page }) => {
  await page.goto('/events');
  await compareScreenshot(page, {
    name: 'events-page',
    fullPage: true,
    threshold: 0.2,
  });
});
```

## Mobile Testing

### Touch Gestures

```typescript
test('Mobile swipe gesture', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  
  const card = page.locator('[data-testid="swipeable-card"]');
  await card.dragTo(card, {
    sourcePosition: { x: 300, y: 50 },
    targetPosition: { x: 50, y: 50 },
  });
});
```

### Device-Specific Features

```typescript
test('Camera permission', async ({ page, context }) => {
  await context.grantPermissions(['camera']);
  await page.goto('/profile/photo');
  await page.click('[data-testid="button-take-photo"]');
});
```

## Performance Testing

### Core Web Vitals

```typescript
test('Performance metrics', async ({ page }) => {
  await page.goto('/');
  
  const metrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0];
    return {
      domContentLoaded: navigation.domContentLoadedEventEnd,
      firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
    };
  });
  
  expect(metrics.firstContentfulPaint).toBeLessThan(2000);
});
```

## Network Mocking

### API Response Mocking

```typescript
import { mockApiResponse } from './helpers/test-helpers';

test('Handle API errors', async ({ page }) => {
  await mockApiResponse(page, {
    url: '/api/events',
    status: 500,
    body: { error: 'Server error' },
  });
  
  await page.goto('/events');
  await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
});
```

## Debugging

### Enable Debug Mode

```bash
# Run with debug UI
npm run test:e2e:debug

# Enable verbose logging
DEBUG=pw:api npm run test:e2e
```

### Trace Viewer

```bash
# View trace after test failure
npx playwright show-trace test-results/trace.zip
```

### Screenshots and Videos

Tests automatically capture:
- Screenshots on failure: `test-results/screenshots/`
- Videos on failure: `test-results/videos/`
- Traces on retry: `test-results/traces/`

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: test-results
          path: test-results/
```

## Best Practices

### 1. Use Data Attributes
Always use `data-testid` attributes for element selection:
```html
<button data-testid="button-submit">Submit</button>
```

### 2. Page Object Pattern
Encapsulate page interactions in Page Objects:
```typescript
class EventPage extends BasePage {
  async createEvent(eventData: TestEvent) {
    // Implementation
  }
}
```

### 3. Test Independence
Each test should be independent and not rely on others:
```typescript
test.beforeEach(async ({ page }) => {
  // Reset state
  await page.goto('/');
});
```

### 4. Meaningful Assertions
Use specific, meaningful assertions:
```typescript
await expect(page.locator('[data-testid="event-title"]'))
  .toHaveText('Milonga Night');
```

### 5. Wait Strategies
Use proper wait strategies instead of fixed timeouts:
```typescript
// Good
await page.waitForResponse('**/api/events');

// Avoid
await page.waitForTimeout(5000);
```

## Troubleshooting

### Common Issues

1. **Tests timing out**
   - Increase timeout in config
   - Check network conditions
   - Verify selectors exist

2. **Visual regression failures**
   - Update baseline screenshots
   - Check for dynamic content
   - Disable animations

3. **Accessibility violations**
   - Review violation details
   - Update allowedViolations if intentional
   - Fix underlying issues

4. **Flaky tests**
   - Add proper wait conditions
   - Mock external dependencies
   - Ensure test isolation

## Reporting

### Generate HTML Report
```bash
npx playwright show-report
```

### Percy Dashboard
View visual regression results at:
```
https://percy.io/your-org/mundo-tango
```

### Custom Reports
Reports are generated in:
- `test-results/results.json`: JSON format
- `test-results/junit.xml`: JUnit format
- `playwright-report/`: HTML report
- `test-results/a11y-reports/`: Accessibility reports
- `test-results/visual-reports/`: Visual regression reports

## Contributing

1. Follow the existing test structure
2. Use meaningful test descriptions
3. Add data-testid attributes for new elements
4. Update fixtures when adding test data
5. Document new helpers and utilities

## Support

For issues or questions:
- Check existing tests for examples
- Review Playwright documentation
- Contact the QA team

---

Happy Testing! 🎭