/**
 * MB.MD TRACK 10.1: E2E Tests for Admin Analytics
 * Phase 19: End-to-End Data Flow Validation
 * 
 * Tests: Admin Analytics page shows REAL data from database (not mock/404)
 */

import { test, expect } from '@playwright/test';

test.describe('Admin Analytics - Data Flow Validation', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login as admin user (Pierre)
    await page.goto('/login');
    await page.fill('[data-testid="input-email"]', 'pierre@example.com');
    await page.fill('[data-testid="input-password"]', 'password123');
    await page.click('[data-testid="button-login"]');
    await page.waitForURL('/');
  });
  
  test('Admin Analytics endpoint returns real data', async ({ request }) => {
    // Test API endpoint directly
    const response = await request.get('/api/admin/analytics?range=7d');
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    
    // Verify structure
    expect(data).toHaveProperty('users');
    expect(data).toHaveProperty('posts');
    expect(data).toHaveProperty('events');
    expect(data).toHaveProperty('demographics');
    expect(data).toHaveProperty('engagement');
    
    // Verify real data (not mock)
    expect(data.users.total).toBeGreaterThan(0);
    expect(data.posts.total).toBeGreaterThan(0);
    
    // Verify date range applied
    expect(data.users).toHaveProperty('growth');
    expect(data.posts).toHaveProperty('growth');
  });
  
  test('Admin Analytics page displays real metrics', async ({ page }) => {
    await page.goto('/admin/analytics');
    
    // Wait for data to load
    await page.waitForSelector('[data-testid="metric-total-users"]');
    
    // Verify metrics are displayed (not loading state)
    const totalUsers = await page.textContent('[data-testid="metric-total-users"]');
    expect(totalUsers).not.toBe('0');
    expect(totalUsers).not.toContain('Loading');
    
    const totalPosts = await page.textContent('[data-testid="metric-total-posts"]');
    expect(totalPosts).not.toBe('0');
    
    const totalEvents = await page.textContent('[data-testid="metric-total-events"]');
    expect(totalEvents).not.toBe('0');
  });
  
  test('Date range filter works correctly', async ({ page }) => {
    await page.goto('/admin/analytics');
    
    // Test 7 days range
    await page.click('[data-testid="button-range-7d"]');
    await page.waitForResponse(response => 
      response.url().includes('/api/admin/analytics?range=7d') && response.status() === 200
    );
    
    // Test 30 days range
    await page.click('[data-testid="button-range-30d"]');
    await page.waitForResponse(response => 
      response.url().includes('/api/admin/analytics?range=30d') && response.status() === 200
    );
    
    // Verify data updates
    const growth = await page.textContent('[data-testid="metric-user-growth"]');
    expect(growth).toBeTruthy();
  });
  
  test('No 404 or mock data fallbacks', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('/admin/analytics');
    await page.waitForLoadState('networkidle');
    
    // Check for 404 errors
    const has404 = consoleErrors.some(error => 
      error.includes('404') || error.includes('Not Found')
    );
    expect(has404).toBe(false);
    
    // Check for mock data warnings
    const hasMockData = consoleErrors.some(error => 
      error.includes('mock') || error.includes('fallback')
    );
    expect(hasMockData).toBe(false);
  });
  
  test('ESA Agent Health endpoint works', async ({ request }) => {
    const response = await request.get('/api/esa-agents/health');
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    
    expect(data).toHaveProperty('systemMetrics');
    expect(data).toHaveProperty('agentMetrics');
    expect(data).toHaveProperty('errors');
    
    // Verify real system metrics
    expect(data.systemMetrics).toHaveProperty('uptime');
    expect(data.systemMetrics).toHaveProperty('memory');
    expect(data.systemMetrics.uptime).toBeGreaterThan(0);
  });
  
  test('ESA Agent Analytics endpoint works', async ({ request }) => {
    const response = await request.get('/api/esa-agents/analytics');
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    
    expect(data).toHaveProperty('jobStats');
    expect(data).toHaveProperty('trends');
    expect(data).toHaveProperty('topAgents');
    
    // Verify real job statistics
    expect(data.jobStats.total).toBeGreaterThanOrEqual(0);
  });
  
  test('All admin endpoints are accessible', async ({ request }) => {
    const endpoints = [
      '/api/admin/analytics',
      '/api/admin/dashboard/stats',
      '/api/esa-agents/health',
      '/api/esa-agents/analytics'
    ];
    
    for (const endpoint of endpoints) {
      const response = await request.get(endpoint);
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data).toBeTruthy();
      expect(Object.keys(data).length).toBeGreaterThan(0);
    }
  });
});
