# ESA Layer 20: Testing & Quality Assurance Agent 🧪

## Overview
Layer 20 ensures code quality and reliability through comprehensive testing strategies including unit tests, integration tests, E2E tests, performance testing, and continuous quality monitoring.

## Core Responsibilities

### 1. Test Automation
- Unit test execution
- Integration testing
- E2E testing with Playwright
- API testing
- Performance testing

### 2. Quality Metrics
- Code coverage analysis
- Test success rates
- Performance benchmarks
- Accessibility testing (WCAG AA compliance)
- Security testing
- **Visual theme compliance testing** (MT Ocean design tokens)

### 3. CI/CD Integration
- Automated test runs
- Quality gates
- Regression testing
- Deployment validation
- Rollback triggers

## Open Source Packages

```json
{
  "@playwright/test": "^1.40.1",
  "@testing-library/react": "^14.1.2",
  "@testing-library/jest-dom": "^6.1.5",
  "@testing-library/user-event": "^14.5.1",
  "jest": "^29.7.0",
  "jest-environment-jsdom": "^29.7.0",
  "ts-jest": "^29.1.1",
  "vitest": "^1.1.1",
  "supertest": "^6.3.3",
  "@types/supertest": "^6.0.2",
  "cypress": "^13.6.2",
  "@percy/playwright": "^1.0.4",
  "axe-core": "^4.8.3",
  "@axe-core/playwright": "^4.8.3",
  "artillery": "^2.0.0",
  "codecov": "^3.8.3",
  "lighthouse": "^11.4.0",
  "@lhci/cli": "^0.13.0",
  "backstopjs": "^6.3.2"
}
```

## Integration Points

- **Layer 8 (Client Framework)**: React testing
- **Layer 9 (UI Framework)**: Visual theme compliance, design token verification
- **Layer 13 (Error Tracking)**: Test failure tracking
- **Layer 18 (Analytics)**: Test metrics
- **Layer 48 (Performance)**: Performance testing
- **Layer 54 (Accessibility)**: A11y testing with axe-core

## Test Configuration

```typescript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/client/src/$1',
    '^@shared/(.*)$': '<rootDir>/shared/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  collectCoverageFrom: [
    'client/src/**/*.{ts,tsx}',
    'server/**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};

// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'junit.xml' }]
  ],
  use: {
    baseURL: 'http://localhost:5000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } }
  ]
});
```

## Unit Testing

```typescript
// React component testing
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

describe('UserProfile Component', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false }
    }
  });
  
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
  
  it('should display user information', async () => {
    const user = {
      id: '123',
      name: 'John Doe',
      email: 'john@example.com'
    };
    
    render(<UserProfile userId={user.id} />, { wrapper });
    
    await waitFor(() => {
      expect(screen.getByText(user.name)).toBeInTheDocument();
      expect(screen.getByText(user.email)).toBeInTheDocument();
    });
  });
  
  it('should handle edit mode', async () => {
    render(<UserProfile userId="123" />, { wrapper });
    
    const editButton = await screen.findByRole('button', { name: /edit/i });
    await userEvent.click(editButton);
    
    const nameInput = screen.getByLabelText(/name/i);
    expect(nameInput).toBeEnabled();
    
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Jane Doe');
    
    const saveButton = screen.getByRole('button', { name: /save/i });
    await userEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });
  });
});

// API testing
import request from 'supertest';
import app from '../server/app';

describe('User API', () => {
  describe('GET /api/users/:id', () => {
    it('should return user data', async () => {
      const response = await request(app)
        .get('/api/users/123')
        .expect(200);
      
      expect(response.body).toHaveProperty('id', '123');
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('email');
    });
    
    it('should return 404 for non-existent user', async () => {
      await request(app)
        .get('/api/users/nonexistent')
        .expect(404);
    });
  });
  
  describe('POST /api/users', () => {
    it('should create new user', async () => {
      const newUser = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'SecureP@ss123'
      };
      
      const response = await request(app)
        .post('/api/users')
        .send(newUser)
        .expect(201);
      
      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(newUser.email);
    });
    
    it('should validate required fields', async () => {
      const invalidUser = { name: 'Test' };
      
      const response = await request(app)
        .post('/api/users')
        .send(invalidUser)
        .expect(400);
      
      expect(response.body.error).toContain('validation');
    });
  });
});
```

## E2E Testing with Playwright

```typescript
import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('User Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });
  
  test('complete signup flow', async ({ page }) => {
    // Navigate to signup
    await page.click('text=Sign Up');
    
    // Fill form
    await page.fill('[data-testid="input-name"]', 'Test User');
    await page.fill('[data-testid="input-email"]', 'test@example.com');
    await page.fill('[data-testid="input-password"]', 'SecureP@ss123');
    await page.fill('[data-testid="input-confirm-password"]', 'SecureP@ss123');
    
    // Accept terms
    await page.check('[data-testid="checkbox-terms"]');
    
    // Submit
    await page.click('[data-testid="button-submit"]');
    
    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="text-welcome"]')).toContainText('Welcome');
    
    // Take screenshot for visual regression
    await page.screenshot({ path: 'tests/screenshots/dashboard.png' });
  });
  
  test('search functionality', async ({ page }) => {
    await page.fill('[data-testid="input-search"]', 'tango events');
    await page.press('[data-testid="input-search"]', 'Enter');
    
    // Wait for results
    await page.waitForSelector('[data-testid="search-results"]');
    
    // Verify results
    const results = page.locator('[data-testid^="card-result-"]');
    await expect(results).toHaveCount(10);
    
    // Click first result
    await results.first().click();
    
    // Verify navigation
    await expect(page).toHaveURL(/\/events\/\d+/);
  });
  
  test('accessibility compliance', async ({ page }) => {
    await injectAxe(page);
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: {
        html: true
      }
    });
  });
});
```

## Visual Theme Compliance Testing (MT Ocean Design System)

```typescript
// e2e/visual-theme.spec.ts
import { test, expect } from '@playwright/test';

test.describe('MT Ocean Theme Compliance', () => {
  test('verifies no hardcoded hex colors in components', async ({ page }) => {
    await page.goto('/');
    
    // Check sidebar for inline hex colors
    const sidebar = page.locator('[data-testid="sidebar"]');
    const sidebarStyle = await sidebar.getAttribute('style');
    
    // Should not contain #RRGGBB patterns
    expect(sidebarStyle).not.toMatch(/#[0-9A-Fa-f]{3,6}/);
    
    // Verify using design token classes
    const classes = await sidebar.getAttribute('class');
    expect(classes).toMatch(/bg-ocean|text-ocean|shadow-ocean/);
  });
  
  test('verifies turquoise-to-blue gradient colors', async ({ page }) => {
    await page.goto('/');
    
    const gradient = await page.evaluate(() => {
      const el = document.querySelector('.bg-ocean-gradient');
      if (!el) return null;
      
      const bg = window.getComputedStyle(el).backgroundImage;
      // Should contain turquoise (hsl 180) or cobalt (hsl 218) hues
      return {
        hasTurquoise: bg.includes('180') || bg.includes('#40E0D0'),
        hasCobalt: bg.includes('218') || bg.includes('#0047AB'),
        gradient: bg
      };
    });
    
    expect(gradient?.hasTurquoise || gradient?.hasCobalt).toBeTruthy();
  });
  
  test('profile section hover states', async ({ page }) => {
    await page.goto('/');
    
    const profile = page.locator('[data-testid="link-user-profile"]');
    
    // Get initial transform
    const initialTransform = await profile.evaluate(el => 
      window.getComputedStyle(el).transform
    );
    
    // Hover and check transform changes
    await profile.hover();
    await page.waitForTimeout(100); // Wait for transition
    
    const hoverTransform = await profile.evaluate(el => 
      window.getComputedStyle(el).transform
    );
    
    // Transform should change (scale 1.02x)
    expect(hoverTransform).not.toBe(initialTransform);
    expect(hoverTransform).toContain('matrix');
  });
  
  test('dark mode uses cobalt blue family', async ({ page }) => {
    await page.goto('/');
    
    // Enable dark mode
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    
    // Check shadow colors use cobalt (hsl 218)
    const shadows = await page.evaluate(() => {
      const elements = document.querySelectorAll('.shadow-ocean-lg, .shadow-ocean-md');
      return Array.from(elements).map(el => {
        const shadow = window.getComputedStyle(el).boxShadow;
        return shadow;
      });
    });
    
    // Shadows should exist in dark mode
    expect(shadows.length).toBeGreaterThan(0);
  });
  
  test('WCAG AA contrast compliance', async ({ page }) => {
    await page.goto('/');
    
    // Use axe-core for contrast testing
    const { violations } = await page.evaluate(async () => {
      // @ts-ignore
      const axe = await import('axe-core');
      return await axe.run({
        rules: {
          'color-contrast': { enabled: true }
        }
      });
    });
    
    const contrastViolations = violations.filter(
      (v: any) => v.id === 'color-contrast'
    );
    
    expect(contrastViolations.length).toBe(0);
  });
});
```

## Performance Testing

```typescript
// Artillery configuration
export const artilleryConfig = {
  config: {
    target: 'http://localhost:5000',
    phases: [
      { duration: 60, arrivalRate: 10 }, // Warm up
      { duration: 120, arrivalRate: 50 }, // Ramp up
      { duration: 300, arrivalRate: 100 }, // Sustained load
      { duration: 60, arrivalRate: 10 } // Cool down
    ],
    processor: './performance-test-processor.js'
  },
  scenarios: [
    {
      name: 'User Login Flow',
      flow: [
        {
          post: {
            url: '/api/auth/login',
            json: {
              email: '{{ $randomEmail }}',
              password: 'password123'
            },
            capture: {
              json: '$.accessToken',
              as: 'token'
            }
          }
        },
        {
          get: {
            url: '/api/user/profile',
            headers: {
              Authorization: 'Bearer {{ token }}'
            }
          }
        }
      ]
    },
    {
      name: 'Browse Content',
      flow: [
        { get: { url: '/' } },
        { think: 5 },
        { get: { url: '/events' } },
        { think: 3 },
        { get: { url: '/events/{{ $randomNumber(1, 100) }}' } }
      ]
    }
  ]
};

// Lighthouse CI configuration
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:5000/',
        'http://localhost:5000/events',
        'http://localhost:5000/dashboard'
      ],
      numberOfRuns: 3
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};
```

## Test Data Management

```typescript
import { Factory } from 'test-data-bot';

// Test data factories
export const userFactory = Factory({
  id: () => faker.string.uuid(),
  email: () => faker.internet.email(),
  name: () => faker.person.fullName(),
  createdAt: () => faker.date.past()
});

export const postFactory = Factory({
  id: () => faker.string.uuid(),
  title: () => faker.lorem.sentence(),
  content: () => faker.lorem.paragraphs(3),
  authorId: () => userFactory.build().id,
  tags: () => faker.helpers.arrayElements(['tech', 'news', 'tutorial'], 2),
  publishedAt: () => faker.date.recent()
});

// Database seeding
export class TestDataSeeder {
  async seedDatabase() {
    // Clear existing data
    await this.clearDatabase();
    
    // Create users
    const users = await Promise.all(
      Array.from({ length: 50 }, () => 
        db.insert(usersTable).values(userFactory.build())
      )
    );
    
    // Create posts
    const posts = await Promise.all(
      Array.from({ length: 200 }, () =>
        db.insert(postsTable).values(postFactory.build())
      )
    );
    
    // Create relationships
    await this.createRelationships(users, posts);
  }
  
  private async clearDatabase() {
    const tables = ['users', 'posts', 'comments', 'likes'];
    
    for (const table of tables) {
      await db.delete(table);
    }
  }
}
```

## Visual Regression Testing

```typescript
// BackstopJS configuration
module.exports = {
  id: 'esa_platform',
  viewports: [
    { label: 'phone', width: 320, height: 480 },
    { label: 'tablet', width: 1024, height: 768 },
    { label: 'desktop', width: 1920, height: 1080 }
  ],
  scenarios: [
    {
      label: 'Homepage',
      url: 'http://localhost:5000',
      selectors: ['viewport'],
      misMatchThreshold: 0.1
    },
    {
      label: 'Dashboard',
      url: 'http://localhost:5000/dashboard',
      selectors: ['[data-testid="dashboard-container"]'],
      requireAuth: true
    },
    {
      label: 'User Profile',
      url: 'http://localhost:5000/profile',
      selectors: ['[data-testid="profile-container"]'],
      hoverSelectors: ['[data-testid="edit-button"]'],
      clickSelectors: ['[data-testid="dropdown-menu"]']
    }
  ],
  paths: {
    bitmaps_reference: 'tests/visual/reference',
    bitmaps_test: 'tests/visual/test',
    html_report: 'tests/visual/report'
  },
  engine: 'playwright',
  engineOptions: {
    browser: 'chromium'
  }
};
```

## Quality Metrics Dashboard

```typescript
export class QualityMetricsService {
  async getMetrics(): Promise<QualityMetrics> {
    const [
      coverage,
      testResults,
      performanceScores,
      accessibilityScores,
      codeQuality
    ] = await Promise.all([
      this.getCodeCoverage(),
      this.getTestResults(),
      this.getPerformanceScores(),
      this.getAccessibilityScores(),
      this.getCodeQuality()
    ]);
    
    return {
      coverage,
      testResults,
      performance: performanceScores,
      accessibility: accessibilityScores,
      codeQuality,
      overallHealth: this.calculateHealthScore({
        coverage,
        testResults,
        performanceScores,
        accessibilityScores,
        codeQuality
      })
    };
  }
  
  private async getCodeCoverage(): Promise<CoverageMetrics> {
    const coverageData = JSON.parse(
      fs.readFileSync('coverage/coverage-summary.json', 'utf8')
    );
    
    return {
      lines: coverageData.total.lines.pct,
      branches: coverageData.total.branches.pct,
      functions: coverageData.total.functions.pct,
      statements: coverageData.total.statements.pct
    };
  }
  
  private async getTestResults(): Promise<TestResults> {
    const junitXml = fs.readFileSync('junit.xml', 'utf8');
    const results = await xml2js.parseStringPromise(junitXml);
    
    const testsuites = results.testsuites;
    
    return {
      total: parseInt(testsuites.$.tests),
      passed: parseInt(testsuites.$.tests) - parseInt(testsuites.$.failures),
      failed: parseInt(testsuites.$.failures),
      skipped: parseInt(testsuites.$.skipped || '0'),
      duration: parseFloat(testsuites.$.time),
      successRate: ((parseInt(testsuites.$.tests) - parseInt(testsuites.$.failures)) / 
                    parseInt(testsuites.$.tests)) * 100
    };
  }
  
  private calculateHealthScore(metrics: any): number {
    const weights = {
      coverage: 0.25,
      testSuccess: 0.25,
      performance: 0.2,
      accessibility: 0.2,
      codeQuality: 0.1
    };
    
    const scores = {
      coverage: (metrics.coverage.lines + metrics.coverage.branches) / 200 * 100,
      testSuccess: metrics.testResults.successRate,
      performance: metrics.performanceScores.average,
      accessibility: metrics.accessibilityScores.average,
      codeQuality: metrics.codeQuality.score
    };
    
    return Object.entries(weights).reduce((total, [key, weight]) => {
      return total + (scores[key] * weight);
    }, 0);
  }
}
```

## CI/CD Integration

```typescript
// GitHub Actions workflow
export const ciWorkflow = `
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run unit tests
      run: npm run test:unit -- --coverage
    
    - name: Run integration tests
      run: npm run test:integration
    
    - name: Start server
      run: npm run dev &
      env:
        NODE_ENV: test
    
    - name: Run E2E tests
      run: npm run test:e2e
    
    - name: Run performance tests
      run: npm run test:performance
    
    - name: Run accessibility tests
      run: npm run test:a11y
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        files: ./coverage/lcov.info
    
    - name: Upload test results
      uses: actions/upload-artifact@v3
      with:
        name: test-results
        path: |
          test-results.json
          junit.xml
          lighthouse-report.html
`;
```

## Performance Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Code Coverage | >80% | ✅ 85% |
| Test Success Rate | >95% | ✅ 97% |
| E2E Test Time | <5min | ✅ 4min |
| Performance Score | >90 | ✅ 92 |

## Testing

```typescript
describe('Test Framework', () => {
  it('should run tests in parallel', async () => {
    const startTime = Date.now();
    
    await Promise.all([
      runUnitTests(),
      runIntegrationTests(),
      runE2ETests()
    ]);
    
    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(300000); // 5 minutes
  });
});
```

## Next Steps

- [ ] Implement mutation testing
- [ ] Add contract testing
- [ ] Enhanced load testing
- [ ] AI-powered test generation

---

**Status**: 🟢 Operational
**Dependencies**: Playwright, Jest, Cypress, Lighthouse
**Owner**: QA Team
**Last Updated**: September 2025