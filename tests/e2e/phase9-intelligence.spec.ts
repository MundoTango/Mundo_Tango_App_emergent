import { test, expect } from '@playwright/test';
import { testUsers, phase9TestData } from '../fixtures/testData';

test.describe('Phase 9 Intelligence Agents', () => {
  test.beforeEach(async ({ page }) => {
    // Login as Super Admin
    await page.goto('/login');
    await page.fill('[data-testid="input-email"]', testUsers.superAdmin.email);
    await page.fill('[data-testid="input-password"]', testUsers.superAdmin.password);
    await page.click('[data-testid="button-login"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('Intelligence Dashboard is accessible to Super Admin', async ({ page }) => {
    await page.goto('/admin/intelligence-dashboard');
    await expect(page.locator('[data-testid="intelligence-dashboard"]')).toBeVisible();
    await expect(page.locator('text=Intelligence Dashboard')).toBeVisible();
  });

  test('All 7 Phase 9 agents are displayed', async ({ page }) => {
    await page.goto('/admin/intelligence-dashboard');
    
    for (const agent of phase9TestData.agents) {
      await expect(
        page.locator(`[data-testid="agent-card-${agent.id}"]`)
      ).toBeVisible();
    }
  });

  test('Code Intelligence Agent (110) analyzes code', async ({ page }) => {
    await page.goto('/admin/intelligence-dashboard');
    
    await page.click('[data-testid="agent-110-test"]');
    await page.fill('[data-testid="code-input"]', phase9TestData.testCode.typescript);
    await page.click('[data-testid="analyze-button"]');
    
    await expect(page.locator('[data-testid="analysis-result"]')).toBeVisible({ timeout: 5000 });
  });

  test('Visual Preview Agent (111) generates preview', async ({ page }) => {
    await page.goto('/admin/intelligence-dashboard');
    
    await page.click('[data-testid="agent-111-test"]');
    await page.fill('[data-testid="code-input"]', phase9TestData.testCode.react);
    await page.click('[data-testid="generate-preview"]');
    
    await expect(page.locator('[data-testid="preview-iframe"]')).toBeVisible({ timeout: 5000 });
  });

  test('Cross-Phase Coordinator (113) shows phase dependencies', async ({ page }) => {
    await page.goto('/admin/intelligence-dashboard');
    
    await page.click('[data-testid="agent-113-view"]');
    await expect(page.locator('[data-testid="phase-coordinator-view"]')).toBeVisible();
    await expect(page.locator('[data-testid="phase-dependency-graph"]')).toBeVisible();
  });

  test('Dependency Mapper (116) visualizes dependencies', async ({ page }) => {
    await page.goto('/admin/dependency-visualizer');
    
    await expect(page.locator('[data-testid="dependency-graph"]')).toBeVisible();
    await expect(page.locator('svg')).toBeVisible(); // D3 graph
  });

  test('Mr Blue Chat is accessible to Super Admin', async ({ page }) => {
    // Mr Blue floating button should be visible
    await expect(page.locator('[data-testid="mr-blue-button"]')).toBeVisible();
    
    await page.click('[data-testid="mr-blue-button"]');
    await expect(page.locator('[data-testid="mr-blue-chat"]')).toBeVisible();
    
    // Test chat interaction
    await page.fill('[data-testid="mr-blue-input"]', 'Help me understand Phase 9');
    await page.click('[data-testid="mr-blue-send"]');
    
    await expect(page.locator('[data-testid="mr-blue-response"]')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Agent Expert Sources', () => {
  test('Each agent has 10 unique expert sources documented', async ({ page }) => {
    await page.goto('/admin/intelligence-dashboard');
    
    for (const agent of phase9TestData.agents) {
      await page.click(`[data-testid="agent-${agent.id}-info"]`);
      
      const expertSources = page.locator('[data-testid="expert-source"]');
      await expect(expertSources).toHaveCount(10);
      
      await page.click('[data-testid="close-info"]');
    }
  });
});

test.describe('Performance Metrics', () => {
  test('Web Vitals are being tracked', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Check that vitals are sent to analytics
    const analyticsRequests = [];
    page.on('request', request => {
      if (request.url().includes('/api/analytics/vitals')) {
        analyticsRequests.push(request);
      }
    });
    
    // Trigger some interactions
    await page.click('[data-testid="nav-groups"]');
    await page.waitForTimeout(1000);
    
    expect(analyticsRequests.length).toBeGreaterThan(0);
  });
});
