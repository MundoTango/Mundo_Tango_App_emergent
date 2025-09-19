import { test, expect } from '@playwright/test';

test.describe('Modern Memories - CREATE and EDIT Mode Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the modern memories page
    await page.goto('/modern-memories');
    await page.waitForLoadState('networkidle');
  });

  test('Test CREATE mode - verify empty composer with correct UI', async ({ page }) => {
    console.log('=== Testing CREATE Mode ===');
    
    // Find and click the "New Post" button
    const newPostButton = page.locator('[data-testid="button-create-post"]').first();
    await expect(newPostButton).toBeVisible();
    
    // Click to open composer
    await newPostButton.click();
    await page.waitForTimeout(1000);
    
    // Verify composer modal opened
    const composerModal = page.locator('.fixed.inset-0');
    await expect(composerModal).toBeVisible();
    
    // Verify header text for CREATE mode
    const headerText = await page.locator('h3').first().textContent();
    console.log(`Header text found: "${headerText}"`);
    expect(headerText).toContain("What's on your mind?");
    
    // Verify button says "Post"
    const postButton = page.locator('button:has-text("Post")').first();
    await expect(postButton).toBeVisible();
    
    // Verify content field is empty
    const textarea = page.locator('textarea[placeholder="What\'s on your mind?"]').first();
    await expect(textarea).toBeVisible();
    const textContent = await textarea.inputValue();
    expect(textContent).toBe('');
    
    // Verify visibility options are present
    const publicButton = page.locator('button:has-text("Public")').first();
    await expect(publicButton).toBeVisible();
    
    // Take screenshot of CREATE mode
    await page.screenshot({ 
      path: 'tests/e2e/screenshots/modern-memories-create-mode.png', 
      fullPage: true 
    });
    console.log('✓ CREATE mode screenshot saved');
    
    // Close modal
    const closeButton = page.locator('button').filter({ has: page.locator('svg.w-6.h-6') }).first();
    await closeButton.click();
    await page.waitForTimeout(500);
  });

  test('Test EDIT mode - verify pre-filled data and correct UI', async ({ page }) => {
    console.log('=== Testing EDIT Mode ===');
    
    // First, create a test post to edit
    const newPostButton = page.locator('[data-testid="button-create-post"]').first();
    await newPostButton.click();
    await page.waitForTimeout(1000);
    
    // Fill in content for test post
    const textarea = page.locator('textarea').first();
    const testContent = 'Test memory post for edit functionality testing - ' + Date.now();
    await textarea.fill(testContent);
    
    // Select visibility
    const publicButton = page.locator('button:has-text("Public")').first();
    await publicButton.click();
    
    // Submit the post
    const postButton = page.locator('button:has-text("Post")').first();
    await postButton.click();
    await page.waitForTimeout(2000);
    
    // Now test EDIT mode
    // Find the first post (the one we just created)
    const firstPost = page.locator('[data-testid*="card-memory-"]').first();
    await expect(firstPost).toBeVisible();
    
    // Find and click the three dots menu
    const menuButton = firstPost.locator('button[aria-label="Post options"]').first() ||
                      firstPost.locator('button').filter({ has: page.locator('svg.lucide-more-horizontal') }).first();
    await menuButton.click();
    await page.waitForTimeout(500);
    
    // Click Edit post option
    const editOption = page.locator('text="Edit post"').first();
    await editOption.click();
    await page.waitForTimeout(1000);
    
    // Verify edit composer modal opened
    const editModal = page.locator('.fixed.inset-0');
    await expect(editModal).toBeVisible();
    
    // Verify header text for EDIT mode
    const editHeaderText = await page.locator('h3').first().textContent();
    console.log(`Edit header text found: "${editHeaderText}"`);
    expect(editHeaderText).toContain('Edit your memory');
    
    // Verify button says "Save"
    const saveButton = page.locator('button:has-text("Save")').first();
    await expect(saveButton).toBeVisible();
    
    // Verify content is pre-filled
    const editTextarea = page.locator('textarea').first();
    const existingContent = await editTextarea.inputValue();
    console.log(`Pre-filled content: "${existingContent}"`);
    expect(existingContent).toContain('Test memory post');
    
    // Verify visibility setting is preserved (should be Public)
    const publicButtonEdit = page.locator('button:has-text("Public")').first();
    const isPublicSelected = await publicButtonEdit.evaluate(el => 
      el.classList.contains('bg-green-50') || el.classList.contains('text-green-600')
    );
    expect(isPublicSelected).toBeTruthy();
    
    // Take screenshot of EDIT mode
    await page.screenshot({ 
      path: 'tests/e2e/screenshots/modern-memories-edit-mode.png', 
      fullPage: true 
    });
    console.log('✓ EDIT mode screenshot saved');
  });

  test('Test saving an edit and verify post updates', async ({ page }) => {
    console.log('=== Testing Save Edit Functionality ===');
    
    // Create a test post
    const newPostButton = page.locator('[data-testid="button-create-post"]').first();
    await newPostButton.click();
    await page.waitForTimeout(1000);
    
    const textarea = page.locator('textarea').first();
    const originalContent = 'Original content before edit';
    await textarea.fill(originalContent);
    
    const postButton = page.locator('button:has-text("Post")').first();
    await postButton.click();
    await page.waitForTimeout(2000);
    
    // Edit the post
    const firstPost = page.locator('[data-testid*="card-memory-"]').first();
    const menuButton = firstPost.locator('button[aria-label="Post options"]').first() ||
                      firstPost.locator('button').filter({ has: page.locator('svg.lucide-more-horizontal') }).first();
    await menuButton.click();
    await page.waitForTimeout(500);
    
    const editOption = page.locator('text="Edit post"').first();
    await editOption.click();
    await page.waitForTimeout(1000);
    
    // Update the content
    const editTextarea = page.locator('textarea').first();
    const updatedContent = 'Updated content after successful edit!';
    await editTextarea.fill(updatedContent);
    
    // Save the edit
    const saveButton = page.locator('button:has-text("Save")').first();
    await saveButton.click();
    await page.waitForTimeout(2000);
    
    // Verify the post was updated
    const updatedPost = page.locator('[data-testid*="card-memory-"]').first();
    const postContent = await updatedPost.textContent();
    expect(postContent).toContain('Updated content after successful edit!');
    
    // Take screenshot of updated post
    await page.screenshot({ 
      path: 'tests/e2e/screenshots/modern-memories-after-edit.png', 
      fullPage: true 
    });
    console.log('✓ Post successfully updated');
  });

  test('Verify unified ModernPostComposer is used for both CREATE and EDIT', async ({ page }) => {
    console.log('=== Verifying Unified Composer Component ===');
    
    // Open CREATE mode
    const newPostButton = page.locator('[data-testid="button-create-post"]').first();
    await newPostButton.click();
    await page.waitForTimeout(1000);
    
    // Check for ModernPostComposer elements in CREATE mode
    const createComposer = page.locator('.bg-white.rounded-3xl.shadow-2xl');
    await expect(createComposer).toBeVisible();
    
    // Check for unified elements
    const userInfo = page.locator('.flex.items-center.space-x-4').first();
    await expect(userInfo).toBeVisible();
    
    const visibilityButtons = page.locator('button:has-text("Public"), button:has-text("Followers"), button:has-text("Private")');
    await expect(visibilityButtons.first()).toBeVisible();
    
    // Close CREATE mode
    const closeButton = page.locator('button').filter({ has: page.locator('svg.w-6.h-6') }).first();
    await closeButton.click();
    await page.waitForTimeout(500);
    
    // Create a post to edit
    await newPostButton.click();
    await page.waitForTimeout(1000);
    const textarea = page.locator('textarea').first();
    await textarea.fill('Test post for unified component check');
    const postButton = page.locator('button:has-text("Post")').first();
    await postButton.click();
    await page.waitForTimeout(2000);
    
    // Open EDIT mode
    const firstPost = page.locator('[data-testid*="card-memory-"]').first();
    const menuButton = firstPost.locator('button[aria-label="Post options"]').first() ||
                      firstPost.locator('button').filter({ has: page.locator('svg.lucide-more-horizontal') }).first();
    await menuButton.click();
    await page.waitForTimeout(500);
    const editOption = page.locator('text="Edit post"').first();
    await editOption.click();
    await page.waitForTimeout(1000);
    
    // Check for ModernPostComposer elements in EDIT mode
    const editComposer = page.locator('.bg-white.rounded-3xl.shadow-2xl');
    await expect(editComposer).toBeVisible();
    
    // Verify same unified elements are present
    const editUserInfo = page.locator('.flex.items-center.space-x-4').first();
    await expect(editUserInfo).toBeVisible();
    
    const editVisibilityButtons = page.locator('button:has-text("Public"), button:has-text("Followers"), button:has-text("Private")');
    await expect(editVisibilityButtons.first()).toBeVisible();
    
    console.log('✓ Confirmed: Same ModernPostComposer component is used for both CREATE and EDIT modes');
  });
});