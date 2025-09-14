/**
 * ESA LIFE CEO 61×21 - Memories & Media Handling Tests
 * Tests memory creation with media uploads, compression, and CDN delivery
 * Uses real database connections and test data
 */

import { test, expect } from '@playwright/test';
import path from 'path';
import {
  createTestUser,
  createTestMemory,
  cleanupAllTestData,
  verifyDatabaseConnection,
  closeDatabaseConnection,
  TestUser,
  testDb
} from './test-setup';
import { posts, media } from '../../shared/schema';
import { eq, desc } from 'drizzle-orm';

// Test user that will be created in the database
let testUser: TestUser | null = null;

// Setup before all tests - create real database user
test.beforeAll(async () => {
  console.log('🚀 Setting up test user for memories tests...');
  
  // Verify database connection
  const isConnected = await verifyDatabaseConnection();
  if (!isConnected) {
    throw new Error('Database connection failed - cannot run tests');
  }
  
  // Clean up any existing test data first
  await cleanupAllTestData();
  
  // Create test user with real database record
  testUser = await createTestUser({
    email: `memory-tester-${Date.now()}@mundotango-test.com`,
    password: 'MemoryTest123!',
    name: 'Memory Test User',
    username: `memorytester${Date.now()}`,
    city: 'Buenos Aires',
    country: 'Argentina',
    tangoRoles: ['follower', 'leader'],
    isOnboardingComplete: true
  });
  
  console.log('✅ Test user created successfully for memories tests');
});

// Cleanup after all tests
test.afterAll(async () => {
  console.log('🧹 Cleaning up memories test data...');
  await cleanupAllTestData();
  await closeDatabaseConnection();
  console.log('✅ Memories test cleanup completed');
});

test.describe('Memories + Media with Real Database', () => {
  test.beforeEach(async ({ page }) => {
    if (!testUser) throw new Error('Test user not initialized');
    
    // Login as test user with real authentication
    await page.goto('/login');
    await page.getByTestId('input-email').fill(testUser.email);
    await page.getByTestId('input-password').fill(testUser.password);
    await page.getByTestId('button-submit').click();
    
    // Wait for successful login
    await expect(page).toHaveURL(/dashboard|feed|memories/, { timeout: 10000 });
    
    // Verify user is logged in
    await expect(page.getByTestId('user-menu')).toBeVisible({ timeout: 5000 });
  });

  test('Happy: Create memory with image upload and database verification', async ({ page }) => {
    if (!testUser) throw new Error('Test user not initialized');
    
    await page.goto('/memories');
    await page.getByTestId('button-create-memory').click();
    
    const memoryContent = `Beautiful tango moment at the milonga! ${Date.now()} #tango #milonga`;
    
    // Fill content
    await page.getByTestId('input-memory-content').fill(memoryContent);
    
    // Upload image - using a test fixture
    const fileInput = page.getByTestId('button-upload-image');
    await fileInput.setInputFiles(path.join(__dirname, '../fixtures/test-image.jpg'));
    
    // Wait for upload preview
    await expect(page.getByTestId('image-preview')).toBeVisible({ timeout: 5000 });
    
    // Submit
    await page.getByTestId('button-submit-memory').click();
    
    // Verify success
    await expect(page.getByText('Memory shared successfully')).toBeVisible();
    
    // Verify memory appears in feed with image
    await expect(page.getByTestId('list-memories-feed')).toContainText(memoryContent.substring(0, 30));
    await expect(page.locator('[data-testid^="memory-image-"]')).toBeVisible();
    
    // Verify in database that memory was created
    const [dbMemory] = await testDb
      .select()
      .from(posts)
      .where(eq(posts.userId, testUser.id))
      .orderBy(desc(posts.createdAt))
      .limit(1);
    
    expect(dbMemory).toBeDefined();
    expect(dbMemory.content).toContain('Beautiful tango moment');
    expect(dbMemory.imageUrl).toBeTruthy();
  });

  test('Happy: Embed YouTube video URL with database persistence', async ({ page }) => {
    if (!testUser) throw new Error('Test user not initialized');
    
    await page.goto('/memories');
    await page.getByTestId('button-create-memory').click();
    
    const memoryContent = `Check out this amazing tango performance! ${Date.now()}`;
    const videoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    
    await page.getByTestId('input-memory-content').fill(memoryContent);
    await page.getByTestId('input-video-url').fill(videoUrl);
    await page.getByTestId('button-submit-memory').click();
    
    await expect(page.getByText('Memory shared successfully')).toBeVisible();
    
    // Verify video embed appears
    await expect(page.locator('iframe[src*="youtube.com"]')).toBeVisible();
    
    // Verify in database
    const [dbMemory] = await testDb
      .select()
      .from(posts)
      .where(eq(posts.userId, testUser.id))
      .orderBy(desc(posts.createdAt))
      .limit(1);
    
    expect(dbMemory).toBeDefined();
    expect(dbMemory.videoUrl).toBe(videoUrl);
  });

  test('Edge: Handle oversize file gracefully with proper error', async ({ page }) => {
    if (!testUser) throw new Error('Test user not initialized');
    
    await page.goto('/memories');
    await page.getByTestId('button-create-memory').click();
    
    // Attempt to upload large file (simulated)
    await page.evaluate(() => {
      const input = document.querySelector('[data-testid="button-upload-image"]') as HTMLInputElement;
      const file = new File(['x'.repeat(15 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
      const dt = new DataTransfer();
      dt.items.add(file);
      input.files = dt.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    
    // Should show error for oversized file
    await expect(page.getByText(/file too large|maximum.*10MB/i)).toBeVisible();
    
    // Verify no memory was created in database
    const dbMemories = await testDb
      .select()
      .from(posts)
      .where(eq(posts.userId, testUser.id));
    
    // Should have no memories or only previously created ones
    const recentMemory = dbMemories.find(m => 
      m.createdAt && new Date(m.createdAt).getTime() > Date.now() - 5000
    );
    expect(recentMemory).toBeUndefined();
  });

  test('Edge: Network throttling during upload shows progress', async ({ page, context }) => {
    if (!testUser) throw new Error('Test user not initialized');
    
    // Simulate slow 3G
    await context.route('**/*', route => {
      setTimeout(() => route.continue(), 2000);
    });
    
    await page.goto('/memories');
    await page.getByTestId('button-create-memory').click();
    await page.getByTestId('input-memory-content').fill(`Testing slow upload ${Date.now()}`);
    
    // Should show upload progress
    const fileInput = page.getByTestId('button-upload-image');
    await fileInput.setInputFiles(path.join(__dirname, '../fixtures/test-image.jpg'));
    
    await expect(page.getByTestId('upload-progress')).toBeVisible();
  });

  test('Failure: CDN/Storage failure fallback with retry', async ({ page, context }) => {
    if (!testUser) throw new Error('Test user not initialized');
    
    // Block Cloudinary uploads
    await context.route('**/cloudinary.com/**', route => {
      route.abort('failed');
    });
    
    await page.goto('/memories');
    await page.getByTestId('button-create-memory').click();
    
    const fileInput = page.getByTestId('button-upload-image');
    await fileInput.setInputFiles(path.join(__dirname, '../fixtures/test-image.jpg'));
    
    // Should show error and allow retry
    await expect(page.getByText(/upload failed|try again/i)).toBeVisible();
    await expect(page.getByTestId('button-retry-upload')).toBeVisible();
    
    // Verify no partial data in database
    const dbMemories = await testDb
      .select()
      .from(posts)
      .where(eq(posts.userId, testUser.id));
    
    const failedMemory = dbMemories.find(m => 
      m.imageUrl && m.imageUrl.includes('cloudinary')
    );
    expect(failedMemory).toBeUndefined();
  });
});