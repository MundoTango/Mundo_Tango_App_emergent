/**
 * ESA LIFE CEO 61×21 - Comprehensive Memories Feed Component Tests
 * Tests all components of the unified memory/post feed system
 * 
 * Components Tested:
 * - CleanMemoryCard: Memory display, reactions, comments, reporting
 * - VideoMemoryCard: Video-specific memory display
 * - RichTextCommentEditor: Rich text comment editing
 * - FacebookReactionSelector: All 6 reaction types
 * - ReportModal: Content reporting workflow
 * 
 * Test Coverage:
 * - Component rendering and display
 * - User interactions (click, input, hover)
 * - API integrations and data mutations
 * - Privacy and visibility controls
 * - Error handling and edge cases
 * - End-to-end user journeys
 */

import { test, expect, Page } from '@playwright/test';
import {
  createTestUser,
  createTestMemory,
  cleanupAllTestData,
  verifyDatabaseConnection,
  closeDatabaseConnection,
  TestUser,
  testDb
} from './test-setup';
import { posts, reactions } from '../../shared/schema';
import { eq } from 'drizzle-orm';

// Test users
let testUser: TestUser | null = null;
let friendUser: TestUser | null = null;

// Test data
let testPostId: number;

// Setup before all tests
test.beforeAll(async () => {
  console.log('🚀 Setting up Memories Feed comprehensive tests...');
  
  // Verify database connection
  const isConnected = await verifyDatabaseConnection();
  if (!isConnected) {
    throw new Error('Database connection failed - cannot run tests');
  }
  
  // Clean up any existing test data
  await cleanupAllTestData();
  
  // Create test users
  testUser = await createTestUser({
    email: `memfeed-tester-${Date.now()}@test.com`,
    password: 'TestPass123!',
    name: 'Memory Feed Tester',
    username: `memfeedtester${Date.now()}`,
    city: 'Buenos Aires',
    country: 'Argentina',
    tangoRoles: ['leader', 'dj'],
    isOnboardingComplete: true
  });
  
  friendUser = await createTestUser({
    email: `memfeed-friend-${Date.now()}@test.com`,
    password: 'TestPass123!',
    name: 'Friend User',
    username: `memfeedfriend${Date.now()}`,
    city: 'Madrid',
    country: 'Spain',
    tangoRoles: ['follower'],
    isOnboardingComplete: true
  });
  
  // Create a test post for testing
  const testPost = await createTestMemory(testUser.id, {
    content: 'Test memory post for comprehensive testing',
    visibility: 'public',
    mediaEmbeds: []
  });
  testPostId = testPost.id;
  
  console.log('✅ Test setup completed successfully');
});

// Cleanup after all tests
test.afterAll(async () => {
  console.log('🧹 Cleaning up Memories Feed test data...');
  await cleanupAllTestData();
  await closeDatabaseConnection();
  console.log('✅ Cleanup completed');
});

// Helper function to login
async function loginUser(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByTestId('input-email').fill(email);
  await page.getByTestId('input-password').fill(password);
  await page.getByTestId('button-submit').click();
  await expect(page).toHaveURL(/dashboard|feed|memories/, { timeout: 10000 });
}

test.describe('CleanMemoryCard Component', () => {
  test.beforeEach(async ({ page }) => {
    if (!testUser) throw new Error('Test user not initialized');
    await loginUser(page, testUser.email, testUser.password);
    await page.goto('/memories');
    await page.waitForLoadState('networkidle');
  });

  test('should render memory card with all elements', async ({ page }) => {
    // Wait for memory card to appear
    await page.waitForSelector(`[data-testid="card-memory-${testPostId}"]`, { timeout: 10000 });
    
    // Verify card structure
    const card = page.locator(`[data-testid="card-memory-${testPostId}"]`);
    await expect(card).toBeVisible();
    
    // Verify user info
    await expect(page.getByTestId(`text-username-${testPostId}`)).toBeVisible();
    await expect(page.getByTestId(`text-timestamp-${testPostId}`)).toBeVisible();
    
    // Verify action buttons
    await expect(page.getByTestId('button-like')).toBeVisible();
    await expect(page.getByTestId('button-comment-toggle')).toBeVisible();
    await expect(page.getByTestId('button-share')).toBeVisible();
    await expect(page.getByTestId('button-menu')).toBeVisible();
  });

  test('should display post content correctly', async ({ page }) => {
    const card = page.locator(`[data-testid="card-memory-${testPostId}"]`);
    await expect(card).toContainText('Test memory post for comprehensive testing');
  });

  test('should show menu options when menu button clicked', async ({ page }) => {
    // Click menu button
    await page.getByTestId('button-menu').click();
    
    // Verify menu options appear
    await expect(page.getByTestId('button-edit')).toBeVisible();
    await expect(page.getByTestId('button-delete')).toBeVisible();
    await expect(page.getByTestId('button-report')).toBeVisible();
  });

  test('should toggle comments section', async ({ page }) => {
    // Initially comments should not be visible
    const commentInput = page.getByTestId(`input-comment-clean-${testPostId}`);
    await expect(commentInput).not.toBeVisible();
    
    // Click comment toggle
    await page.getByTestId('button-comment-toggle').click();
    
    // Comments section should now be visible
    await expect(commentInput).toBeVisible();
    await expect(page.getByTestId(`button-submit-comment-clean-${testPostId}`)).toBeVisible();
  });

  test('should post a comment successfully', async ({ page }) => {
    // Open comments section
    await page.getByTestId('button-comment-toggle').click();
    await page.waitForTimeout(500);
    
    // Enter comment text
    const commentInput = page.getByTestId(`input-comment-clean-${testPostId}`);
    await commentInput.fill('This is a test comment from comprehensive tests');
    
    // Submit comment
    await page.getByTestId(`button-submit-comment-clean-${testPostId}`).click();
    
    // Wait for success indication
    await expect(page.getByText('Comment posted!')).toBeVisible({ timeout: 5000 });
    
    // Verify comment appears in the list
    await expect(page.getByText('This is a test comment from comprehensive tests')).toBeVisible();
  });

  test('should handle empty comment submission', async ({ page }) => {
    // Open comments section
    await page.getByTestId('button-comment-toggle').click();
    await page.waitForTimeout(500);
    
    // Try to submit without typing anything
    await page.getByTestId(`button-submit-comment-clean-${testPostId}`).click();
    
    // Should not show success message
    await expect(page.getByText('Comment posted!')).not.toBeVisible({ timeout: 2000 });
  });

  test('should display comment count correctly', async ({ page }) => {
    // Add a comment first
    await page.getByTestId('button-comment-toggle').click();
    await page.waitForTimeout(500);
    
    const commentInput = page.getByTestId(`input-comment-clean-${testPostId}`);
    await commentInput.fill('Test comment for count verification');
    await page.getByTestId(`button-submit-comment-clean-${testPostId}`).click();
    await page.waitForTimeout(1000);
    
    // Verify comment count increases
    const commentButton = page.getByTestId('button-comment-toggle');
    await expect(commentButton).toContainText('1');
  });
});

test.describe('FacebookReactionSelector Component', () => {
  test.beforeEach(async ({ page }) => {
    if (!testUser) throw new Error('Test user not initialized');
    await loginUser(page, testUser.email, testUser.password);
    await page.goto('/memories');
    await page.waitForLoadState('networkidle');
  });

  test('should display reaction button', async ({ page }) => {
    const reactionButton = page.getByTestId(`button-reaction-toggle-${testPostId}`);
    await expect(reactionButton).toBeVisible();
    await expect(reactionButton).toContainText('Like');
  });

  test('should show reaction picker on hover', async ({ page }) => {
    const reactionButton = page.getByTestId(`button-reaction-toggle-${testPostId}`);
    
    // Hover over the button
    await reactionButton.hover();
    await page.waitForTimeout(300);
    
    // Reaction picker should appear
    const reactionPopover = page.getByTestId(`popover-reactions-${testPostId}`);
    await expect(reactionPopover).toBeVisible();
  });

  test('should display all 6 reaction types', async ({ page }) => {
    const reactionButton = page.getByTestId(`button-reaction-toggle-${testPostId}`);
    await reactionButton.hover();
    await page.waitForTimeout(300);
    
    // Verify all 6 reactions are present
    const reactionTypes = ['like', 'love', 'haha', 'wow', 'sad', 'angry'];
    for (const reactionType of reactionTypes) {
      const reactionBtn = page.getByTestId(`button-reaction-${testPostId}-${reactionType}`);
      await expect(reactionBtn).toBeVisible();
    }
  });

  test('should add a like reaction', async ({ page }) => {
    const reactionButton = page.getByTestId(`button-reaction-toggle-${testPostId}`);
    
    // Click to add like reaction
    await reactionButton.click();
    await page.waitForTimeout(1000);
    
    // Button should now show as selected
    await expect(reactionButton).toHaveClass(/bg-blue/);
  });

  test('should change reaction type', async ({ page }) => {
    const reactionButton = page.getByTestId(`button-reaction-toggle-${testPostId}`);
    
    // Hover to show picker
    await reactionButton.hover();
    await page.waitForTimeout(300);
    
    // Click on love reaction
    await page.getByTestId(`button-reaction-${testPostId}-love`).click();
    await page.waitForTimeout(1000);
    
    // Button should show "Love"
    await expect(reactionButton).toContainText('Love');
  });

  test('should remove reaction on toggle', async ({ page }) => {
    const reactionButton = page.getByTestId(`button-reaction-toggle-${testPostId}`);
    
    // Add a reaction first
    await reactionButton.click();
    await page.waitForTimeout(1000);
    
    // Click again to remove
    await reactionButton.click();
    await page.waitForTimeout(1000);
    
    // Should return to default state
    await expect(reactionButton).toContainText('Like');
    await expect(reactionButton).not.toHaveClass(/bg-blue/);
  });

  test('should display reaction count', async ({ page }) => {
    const reactionButton = page.getByTestId(`button-reaction-toggle-${testPostId}`);
    
    // Add a reaction
    await reactionButton.click();
    await page.waitForTimeout(1000);
    
    // Verify count is displayed
    const reactionCount = page.getByTestId(`text-reaction-count-${testPostId}`);
    await expect(reactionCount).toBeVisible();
    await expect(reactionCount).toContainText('1');
  });
});

test.describe('RichTextCommentEditor Component', () => {
  test.beforeEach(async ({ page }) => {
    if (!testUser) throw new Error('Test user not initialized');
    await loginUser(page, testUser.email, testUser.password);
    await page.goto('/memories');
    await page.waitForLoadState('networkidle');
    
    // Open comments section
    await page.getByTestId('button-comment-toggle').click();
    await page.waitForTimeout(500);
  });

  test('should render editor with formatting toolbar', async ({ page }) => {
    // Verify editor input exists
    const editor = page.getByTestId(`editor-input-${testPostId}`);
    await expect(editor).toBeVisible();
    
    // Click to expand and show toolbar
    await editor.click();
    await page.waitForTimeout(300);
    
    // Verify formatting buttons
    await expect(page.getByTestId(`button-editor-bold-${testPostId}`)).toBeVisible();
    await expect(page.getByTestId(`button-editor-italic-${testPostId}`)).toBeVisible();
    await expect(page.getByTestId(`button-editor-link-${testPostId}`)).toBeVisible();
  });

  test('should apply bold formatting', async ({ page }) => {
    const editor = page.getByTestId(`editor-input-${testPostId}`);
    await editor.click();
    await page.waitForTimeout(300);
    
    // Type some text
    await editor.fill('Bold text test');
    
    // Select all text
    await page.keyboard.press('Control+A');
    
    // Click bold button
    await page.getByTestId(`button-editor-bold-${testPostId}`).click();
    
    // Verify bold tag is applied
    const content = await editor.innerHTML();
    expect(content).toContain('<b>');
  });

  test('should show emoji picker on button click', async ({ page }) => {
    const editor = page.getByTestId(`editor-input-${testPostId}`);
    await editor.click();
    await page.waitForTimeout(300);
    
    // Click emoji toggle button
    await page.getByTestId(`button-editor-emoji-toggle-${testPostId}`).click();
    await page.waitForTimeout(300);
    
    // Verify emoji picker appears
    const emojiButton = page.getByTestId(`button-editor-emoji-${testPostId}-0`);
    await expect(emojiButton).toBeVisible();
  });

  test('should insert emoji into editor', async ({ page }) => {
    const editor = page.getByTestId(`editor-input-${testPostId}`);
    await editor.click();
    await page.waitForTimeout(300);
    
    // Open emoji picker
    await page.getByTestId(`button-editor-emoji-toggle-${testPostId}`).click();
    await page.waitForTimeout(300);
    
    // Click first emoji
    await page.getByTestId(`button-editor-emoji-${testPostId}-0`).click();
    await page.waitForTimeout(300);
    
    // Verify emoji was inserted
    const content = await editor.innerHTML();
    expect(content.length).toBeGreaterThan(0);
  });

  test('should submit comment from editor', async ({ page }) => {
    const editor = page.getByTestId(`editor-input-${testPostId}`);
    await editor.click();
    await page.waitForTimeout(300);
    
    // Type comment
    await editor.fill('Rich text comment test');
    
    // Submit
    await page.getByTestId(`button-submit-comment-editor-${testPostId}`).click();
    
    // Wait for success
    await expect(page.getByText('Comment posted!')).toBeVisible({ timeout: 5000 });
  });

  test('should cancel comment editing', async ({ page }) => {
    const editor = page.getByTestId(`editor-input-${testPostId}`);
    await editor.click();
    await page.waitForTimeout(300);
    
    // Type some text
    await editor.fill('Text to be cancelled');
    
    // Click cancel button if it exists
    const cancelButton = page.getByTestId(`button-editor-cancel-${testPostId}`);
    if (await cancelButton.isVisible()) {
      await cancelButton.click();
      
      // Editor should be cleared or collapsed
      const content = await editor.innerHTML();
      expect(content).toBe('');
    }
  });
});

test.describe('ReportModal Component', () => {
  test.beforeEach(async ({ page }) => {
    if (!testUser) throw new Error('Test user not initialized');
    await loginUser(page, testUser.email, testUser.password);
    await page.goto('/memories');
    await page.waitForLoadState('networkidle');
    
    // Open menu and click report
    await page.getByTestId('button-menu').click();
    await page.getByTestId('button-report').click();
    await page.waitForTimeout(500);
  });

  test('should display report modal', async ({ page }) => {
    const modal = page.getByTestId(`modal-report-${testPostId}`);
    await expect(modal).toBeVisible();
  });

  test('should display all report categories', async ({ page }) => {
    const categories = [
      'spam',
      'inappropriate',
      'harassment',
      'fake_profile',
      'false_information',
      'hate_speech',
      'copyright',
      'other'
    ];
    
    for (const category of categories) {
      const categoryButton = page.getByTestId(`button-category-${testPostId}-${category}`);
      await expect(categoryButton).toBeVisible();
    }
  });

  test('should select a report category', async ({ page }) => {
    const spamButton = page.getByTestId(`button-category-${testPostId}-spam`);
    await spamButton.click();
    
    // Button should be selected
    await expect(spamButton).toHaveClass(/ring/);
  });

  test('should enable submit after selecting category and adding description', async ({ page }) => {
    // Select category
    await page.getByTestId(`button-category-${testPostId}-spam`).click();
    
    // Add description
    const textarea = page.getByTestId(`textarea-report-description-${testPostId}`);
    await textarea.fill('This is spam content that violates community guidelines');
    
    // Submit button should be enabled
    const submitButton = page.getByTestId(`button-submit-report-${testPostId}`);
    await expect(submitButton).toBeEnabled();
  });

  test('should submit report successfully', async ({ page }) => {
    // Select category
    await page.getByTestId(`button-category-${testPostId}-spam`).click();
    
    // Add description
    await page.getByTestId(`textarea-report-description-${testPostId}`).fill('Test report submission');
    
    // Submit
    await page.getByTestId(`button-submit-report-${testPostId}`).click();
    
    // Wait for success message
    await expect(page.getByText('Report submitted')).toBeVisible({ timeout: 5000 });
    
    // Modal should close
    await expect(page.getByTestId(`modal-report-${testPostId}`)).not.toBeVisible();
  });

  test('should close modal on close button click', async ({ page }) => {
    const closeButton = page.getByTestId(`button-close-report-${testPostId}`);
    await closeButton.click();
    
    // Modal should be hidden
    await expect(page.getByTestId(`modal-report-${testPostId}`)).not.toBeVisible();
  });

  test('should show validation for empty description', async ({ page }) => {
    // Select category but don't add description
    await page.getByTestId(`button-category-${testPostId}-spam`).click();
    
    // Try to submit
    await page.getByTestId(`button-submit-report-${testPostId}`).click();
    
    // Should not close modal (report not submitted)
    await page.waitForTimeout(1000);
    await expect(page.getByTestId(`modal-report-${testPostId}`)).toBeVisible();
  });
});

test.describe('VideoMemoryCard Component', () => {
  let videoPostId: number;
  
  test.beforeAll(async () => {
    if (!testUser) throw new Error('Test user not initialized');
    
    // Create a post with video media
    const videoPost = await createTestMemory(testUser.id, {
      content: 'Test video memory post',
      visibility: 'public',
      mediaEmbeds: ['https://example.com/video.mp4', 'https://example.com/image.jpg']
    });
    videoPostId = videoPost.id;
  });

  test.beforeEach(async ({ page }) => {
    if (!testUser) throw new Error('Test user not initialized');
    await loginUser(page, testUser.email, testUser.password);
    await page.goto('/memories');
    await page.waitForLoadState('networkidle');
  });

  test('should render video and image media', async ({ page }) => {
    // Check for video element
    const video = page.getByTestId(`video-media-${videoPostId}-0`);
    await expect(video).toBeVisible();
    
    // Check for image element
    const image = page.getByTestId(`img-media-${videoPostId}-1`);
    await expect(image).toBeVisible();
  });

  test('should display video controls', async ({ page }) => {
    const video = page.getByTestId(`video-media-${videoPostId}-0`);
    
    // Video should have controls attribute
    const hasControls = await video.getAttribute('controls');
    expect(hasControls).not.toBeNull();
  });

  test('should show action buttons', async ({ page }) => {
    const actionsSection = page.getByTestId(`section-actions-${videoPostId}`);
    await expect(actionsSection).toBeVisible();
    
    // Verify buttons
    await expect(page.getByTestId(`button-like-${videoPostId}`)).toBeVisible();
    await expect(page.getByTestId(`button-comment-toggle-${videoPostId}`)).toBeVisible();
  });

  test('should add comment to video post', async ({ page }) => {
    // Open comments
    await page.getByTestId(`button-comment-toggle-${videoPostId}`).click();
    await page.waitForTimeout(500);
    
    // Add comment
    await page.getByTestId(`input-comment-video-${videoPostId}`).fill('Great video!');
    await page.getByTestId(`button-submit-comment-video-${videoPostId}`).click();
    
    // Verify success
    await expect(page.getByText('Comment added')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('End-to-End User Journey', () => {
  test('should complete full interaction flow: post → react → comment → report', async ({ page }) => {
    if (!testUser) throw new Error('Test user not initialized');
    
    // Step 1: Login
    await loginUser(page, testUser.email, testUser.password);
    await page.goto('/memories');
    await page.waitForLoadState('networkidle');
    
    // Step 2: Add a reaction
    const reactionButton = page.getByTestId(`button-reaction-toggle-${testPostId}`);
    await reactionButton.hover();
    await page.waitForTimeout(300);
    await page.getByTestId(`button-reaction-${testPostId}-love`).click();
    await page.waitForTimeout(1000);
    
    // Verify reaction added
    await expect(reactionButton).toContainText('Love');
    
    // Step 3: Add a comment
    await page.getByTestId('button-comment-toggle').click();
    await page.waitForTimeout(500);
    await page.getByTestId(`input-comment-clean-${testPostId}`).fill('Amazing post! Love the content.');
    await page.getByTestId(`button-submit-comment-clean-${testPostId}`).click();
    await expect(page.getByText('Comment posted!')).toBeVisible({ timeout: 5000 });
    
    // Step 4: Open report modal
    await page.getByTestId('button-menu').click();
    await page.getByTestId('button-report').click();
    await page.waitForTimeout(500);
    
    // Step 5: Select category and submit report
    await page.getByTestId(`button-category-${testPostId}-spam`).click();
    await page.getByTestId(`textarea-report-description-${testPostId}`).fill('Testing full flow');
    await page.getByTestId(`button-submit-report-${testPostId}`).click();
    
    // Verify report submitted
    await expect(page.getByText('Report submitted')).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Full user journey completed successfully');
  });

  test('should handle multiple reactions from different users', async ({ browser }) => {
    if (!testUser || !friendUser) throw new Error('Test users not initialized');
    
    // User 1 reacts
    const page1 = await browser.newPage();
    await loginUser(page1, testUser.email, testUser.password);
    await page1.goto('/memories');
    await page1.waitForLoadState('networkidle');
    
    const reactionBtn1 = page1.getByTestId(`button-reaction-toggle-${testPostId}`);
    await reactionBtn1.click();
    await page1.waitForTimeout(1000);
    
    // User 2 reacts
    const page2 = await browser.newPage();
    await loginUser(page2, friendUser.email, friendUser.password);
    await page2.goto('/memories');
    await page2.waitForLoadState('networkidle');
    
    const reactionBtn2 = page2.getByTestId(`button-reaction-toggle-${testPostId}`);
    await reactionBtn2.hover();
    await page2.waitForTimeout(300);
    await page2.getByTestId(`button-reaction-${testPostId}-haha`).click();
    await page2.waitForTimeout(1000);
    
    // Verify total count is 2
    const reactionCount = page2.getByTestId(`text-reaction-count-${testPostId}`);
    await expect(reactionCount).toContainText('2');
    
    await page1.close();
    await page2.close();
  });
});

test.describe('Error Handling & Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    if (!testUser) throw new Error('Test user not initialized');
    await loginUser(page, testUser.email, testUser.password);
    await page.goto('/memories');
    await page.waitForLoadState('networkidle');
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate network failure by blocking API
    await page.route('**/api/posts/*/reactions', route => route.abort());
    
    // Try to add reaction
    const reactionButton = page.getByTestId(`button-reaction-toggle-${testPostId}`);
    await reactionButton.click();
    await page.waitForTimeout(1000);
    
    // Should show error message
    await expect(page.getByText(/error|failed/i)).toBeVisible({ timeout: 3000 });
  });

  test('should handle very long comment text', async ({ page }) => {
    await page.getByTestId('button-comment-toggle').click();
    await page.waitForTimeout(500);
    
    // Create very long text (> 1000 characters)
    const longText = 'A'.repeat(1500);
    
    const commentInput = page.getByTestId(`input-comment-clean-${testPostId}`);
    await commentInput.fill(longText);
    await page.getByTestId(`button-submit-comment-clean-${testPostId}`).click();
    
    // Should handle appropriately (either truncate or show validation)
    await page.waitForTimeout(2000);
  });

  test('should handle rapid consecutive reactions', async ({ page }) => {
    const reactionButton = page.getByTestId(`button-reaction-toggle-${testPostId}`);
    
    // Click multiple times rapidly
    await reactionButton.click();
    await reactionButton.click();
    await reactionButton.click();
    await page.waitForTimeout(1500);
    
    // Should stabilize to final state
    const buttonText = await reactionButton.textContent();
    expect(buttonText).toBeTruthy();
  });
});

console.log('📝 Memories Feed Comprehensive Test Suite - All tests defined');
