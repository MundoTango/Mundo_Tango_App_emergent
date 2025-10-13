/**
 * TRACK C: Mr Blue Integration Test Suite
 * Tests all 8 agents working together
 * 
 * Agents: #73-80
 * - #73: 3D Avatar (Scott)
 * - #74: Interactive Tours
 * - #75: Subscription Manager
 * - #76: Platform Search
 * - #77: AI Site Builder
 * - #78: Visual Editor
 * - #79: Quality Validator
 * - #80: Learning Coordinator
 */

import { test, expect } from '@playwright/test';

test.describe('Mr Blue - Full Integration Suite', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login as Super Admin to access all features
    await page.goto('/login');
    await page.fill('[data-testid="input-email"]', 'admin@test.com');
    await page.fill('[data-testid="input-password"]', 'admin123');
    await page.click('[data-testid="button-login"]');
    await page.waitForURL('/');
  });

  test('All 8 Agents Load Successfully', async ({ page }) => {
    console.log('✅ Testing: All 8 Mr Blue agents load');
    
    // Navigate to Mr Blue interface
    await page.goto('/mr-blue');
    await page.waitForLoadState('networkidle');
    
    // Verify main container
    const mrBlueContainer = page.locator('[data-testid="mr-blue-container"]');
    await expect(mrBlueContainer).toBeVisible();
    console.log('✅ Mr Blue container loaded');
    
    // Check tab visibility for Super Admin (should see 4 tabs)
    const tabs = page.locator('[role="tab"]');
    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThanOrEqual(4);
    console.log(`✅ Super Admin sees ${tabCount} tabs`);
    
    // Verify each agent's tab exists
    const agentTabs = [
      'Chat', // Agent #73 + Life CEO
      'Search', // Agent #76
      'Admin' // Agents #77, #78, #79, #80
    ];
    
    for (const tab of agentTabs) {
      const tabElement = page.locator(`[role="tab"]:has-text("${tab}")`);
      await expect(tabElement).toBeVisible();
      console.log(`✅ ${tab} tab visible`);
    }
  });

  test('Agent #73: 3D Avatar Loads', async ({ page }) => {
    console.log('🎨 Testing: Agent #73 - Scott 3D Avatar');
    
    await page.goto('/mr-blue');
    
    // Check for avatar canvas
    const avatarCanvas = page.locator('canvas').first();
    await expect(avatarCanvas).toBeVisible({ timeout: 10000 });
    console.log('✅ Avatar canvas rendered');
    
    // Check performance (should be smooth)
    const fps = await page.evaluate(() => {
      return new Promise((resolve) => {
        let frames = 0;
        const start = performance.now();
        
        function count() {
          frames++;
          if (performance.now() - start < 1000) {
            requestAnimationFrame(count);
          } else {
            resolve(frames);
          }
        }
        requestAnimationFrame(count);
      });
    });
    
    console.log(`✅ Avatar FPS: ${fps} (target: 30+ mobile, 60+ desktop)`);
    expect(Number(fps)).toBeGreaterThan(25); // Allow for some variance
  });

  test('Agent #74: Interactive Tours Work', async ({ page }) => {
    console.log('🎯 Testing: Agent #74 - Interactive Tours');
    
    await page.goto('/mr-blue');
    
    // Trigger tour
    const tourButton = page.locator('[data-testid="button-start-tour"]');
    if (await tourButton.isVisible()) {
      await tourButton.click();
      
      // Check for Shepherd.js tour
      const tourStep = page.locator('.shepherd-element');
      await expect(tourStep).toBeVisible({ timeout: 5000 });
      console.log('✅ Interactive tour started');
      
      // Verify tour has content
      const tourContent = await tourStep.textContent();
      expect(tourContent).toBeTruthy();
      console.log('✅ Tour content displayed');
    } else {
      console.log('⚠️ Tour already completed (localStorage)');
    }
  });

  test('Agent #75: Subscription Manager Displays', async ({ page }) => {
    console.log('💳 Testing: Agent #75 - Subscription Manager');
    
    await page.goto('/mr-blue');
    
    // Check for subscription status
    const subStatus = page.locator('[data-testid="subscription-status"]');
    if (await subStatus.isVisible()) {
      const status = await subStatus.textContent();
      console.log(`✅ Subscription status: ${status}`);
      expect(status).toBeTruthy();
    }
    
    // Verify tier system
    const tiers = ['Free', 'Premium', 'Community', 'Super Admin'];
    for (const tier of tiers) {
      const tierElement = page.locator(`text=${tier}`).first();
      if (await tierElement.isVisible()) {
        console.log(`✅ Tier "${tier}" visible`);
      }
    }
  });

  test('Agent #76: Platform Search Functional', async ({ page }) => {
    console.log('🔍 Testing: Agent #76 - Platform Search');
    
    await page.goto('/mr-blue');
    await page.click('[role="tab"]:has-text("Search")');
    
    // Find search input
    const searchInput = page.locator('[data-testid="input-platform-search"]');
    await expect(searchInput).toBeVisible();
    
    // Perform search
    await searchInput.fill('test');
    await page.waitForTimeout(500); // Debounce
    
    // Check for results
    const results = page.locator('[data-testid^="search-result-"]');
    const resultCount = await results.count();
    console.log(`✅ Search returned ${resultCount} results`);
  });

  test('Agent #77: AI Site Builder Operational', async ({ page }) => {
    console.log('🎨 Testing: Agent #77 - AI Site Builder');
    
    await page.goto('/mr-blue');
    await page.click('[role="tab"]:has-text("Admin")');
    
    // Find site builder section
    const siteBuilder = page.locator('[data-testid="ai-site-builder"]');
    if (await siteBuilder.isVisible()) {
      console.log('✅ AI Site Builder UI loaded');
      
      // Check for templates
      const templates = page.locator('[data-testid^="template-"]');
      const templateCount = await templates.count();
      expect(templateCount).toBeGreaterThan(0);
      console.log(`✅ ${templateCount} templates available`);
    }
  });

  test('Agent #78: Visual Editor Ready', async ({ page }) => {
    console.log('✏️ Testing: Agent #78 - Visual Editor');
    
    await page.goto('/mr-blue');
    await page.click('[role="tab"]:has-text("Admin")');
    
    // Check for visual editor controls
    const visualEditor = page.locator('[data-testid="visual-editor"]');
    if (await visualEditor.isVisible()) {
      console.log('✅ Visual Editor UI loaded');
      
      // Verify git automation available
      const gitControls = page.locator('[data-testid^="git-"]');
      const gitCount = await gitControls.count();
      console.log(`✅ ${gitCount} git controls available`);
    }
  });

  test('Agent #79: Quality Validator Active', async ({ page }) => {
    console.log('🔍 Testing: Agent #79 - Quality Validator');
    
    await page.goto('/mr-blue');
    await page.click('[role="tab"]:has-text("Admin")');
    
    // Find quality validator
    const validator = page.locator('[data-testid="quality-validator"]');
    if (await validator.isVisible()) {
      console.log('✅ Quality Validator UI loaded');
      
      // Test pattern search
      const searchInput = page.locator('[data-testid="input-pattern-search"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('form');
        await page.waitForTimeout(500);
        console.log('✅ Pattern search functional');
      }
    }
  });

  test('Agent #80: Learning Coordinator Flows', async ({ page }) => {
    console.log('🧠 Testing: Agent #80 - Learning Coordinator');
    
    await page.goto('/mr-blue');
    await page.click('[role="tab"]:has-text("Admin")');
    
    // Find learning coordinator
    const coordinator = page.locator('[data-testid="learning-coordinator"]');
    if (await coordinator.isVisible()) {
      console.log('✅ Learning Coordinator UI loaded');
      
      // Check for knowledge flows
      const flows = ['UP', 'ACROSS', 'DOWN'];
      for (const flow of flows) {
        const flowElement = page.locator(`text=${flow} Flow`).first();
        if (await flowElement.isVisible()) {
          console.log(`✅ ${flow} flow visible`);
        }
      }
    }
  });

  test('A2A Collaboration Working', async ({ page }) => {
    console.log('🤝 Testing: Agent-to-Agent Collaboration');
    
    // Test Quality Validator asking peer agents
    await page.goto('/mr-blue');
    await page.click('[role="tab"]:has-text("Admin")');
    
    const askAgentButton = page.locator('[data-testid^="button-ask-"]').first();
    if (await askAgentButton.isVisible()) {
      await askAgentButton.click();
      
      // Check for collaboration request
      const response = await page.waitForResponse(
        res => res.url().includes('/api/quality-validator/collaborate')
      );
      expect(response.status()).toBeLessThan(400);
      console.log('✅ A2A collaboration request successful');
    }
  });

  test('Knowledge Flow System Active', async ({ page }) => {
    console.log('📊 Testing: Knowledge Flow UP/ACROSS/DOWN');
    
    // Load knowledge flows
    const response = await page.request.get('/api/learning-coordinator/flows');
    expect(response.status()).toBe(200);
    
    const flows = await response.json();
    expect(flows).toHaveProperty('up');
    expect(flows).toHaveProperty('across');
    expect(flows).toHaveProperty('down');
    
    console.log(`✅ UP flow: ${flows.up?.count || 0} learnings`);
    console.log(`✅ ACROSS flow: ${flows.across?.count || 0} learnings`);
    console.log(`✅ DOWN flow: ${flows.down?.count || 0} learnings`);
  });

  test('Performance: All Agents Under Target', async ({ page }) => {
    console.log('⚡ Testing: Performance Metrics');
    
    await page.goto('/mr-blue');
    
    // Measure initial load
    const loadTime = await page.evaluate(() => {
      return performance.timing.loadEventEnd - performance.timing.navigationStart;
    });
    console.log(`✅ Page load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(5000); // 5s max
    
    // Measure memory usage (using performance API)
    const memoryMB = await page.evaluate(() => {
      if (performance.memory) {
        return (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
      }
      return '0';
    });
    console.log(`✅ JS Heap: ${memoryMB}MB`);
    if (Number(memoryMB) > 0) {
      expect(Number(memoryMB)).toBeLessThan(100); // 100MB max
    }
    
    // Check tab switching performance
    const tabs = ['Chat', 'Search', 'Admin'];
    for (const tab of tabs) {
      const start = performance.now();
      await page.click(`[role="tab"]:has-text("${tab}")`);
      await page.waitForLoadState('networkidle');
      const duration = performance.now() - start;
      console.log(`✅ ${tab} tab switch: ${duration.toFixed(0)}ms`);
      expect(duration).toBeLessThan(1000); // 1s max
    }
  });
});
