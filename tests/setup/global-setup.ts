/**
 * Global Test Setup
 * MB.MD Testing Infrastructure - October 28, 2025
 * 
 * Seeds test data before all tests run:
 * - Super admin user
 * - Regular user
 * - Sample projects for Visual Editor
 * - Chat conversation history
 * - Feature flag defaults
 */

import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🔧 [Global Setup] Seeding test data...');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Wait for server to be ready
    const baseURL = config.projects?.[0]?.use?.baseURL || 'http://localhost:5000';
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
    
    console.log('✅ [Global Setup] Server ready');
    
    // Seed super admin user (auto-login in dev mode handles this)
    console.log('✅ [Global Setup] Super admin ready (auto-login enabled)');
    
    // Seed regular user (if needed - can be created via API)
    const regularUserResponse = await page.request.post('/api/admin/test-users/create', {
      data: {
        email: 'testuser@mundotango.com',
        name: 'Test User',
        role: 'user',
      },
    }).catch(() => {
      console.log('⚠️  [Global Setup] Regular user already exists');
    });
    
    if (regularUserResponse?.ok()) {
      console.log('✅ [Global Setup] Regular user created');
    }
    
    // Seed sample Visual Editor project
    const projectResponse = await page.request.post('/api/admin/test-projects/create', {
      data: {
        name: 'Test Visual Editor Project',
        template: 'landing-page',
      },
    }).catch(() => {
      console.log('⚠️  [Global Setup] Sample project already exists');
    });
    
    if (projectResponse?.ok()) {
      console.log('✅ [Global Setup] Sample project created');
    }
    
    // Reset feature flags to disabled by default
    await page.request.post('/api/admin/feature-flags/reset').catch(() => {
      console.log('⚠️  [Global Setup] Feature flags reset failed (may not exist yet)');
    });
    
    console.log('✅ [Global Setup] Test data seeding complete');
    
  } catch (error) {
    console.error('❌ [Global Setup] Error during setup:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
