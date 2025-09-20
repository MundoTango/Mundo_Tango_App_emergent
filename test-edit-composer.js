const { chromium } = require('@playwright/test');

async function testEditComposer() {
  console.log('🔍 Starting Edit Composer Test...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Navigate to the app
    console.log('📍 Navigating to application...');
    await page.goto('http://localhost:5000', { waitUntil: 'networkidle' });
    
    // Check if we need to login
    if (page.url().includes('/login') || page.url().includes('/auth')) {
      console.log('🔐 Logging in...');
      
      // Try to login with test credentials
      await page.fill('input[name="email"], input[type="email"]', 'test@example.com');
      await page.fill('input[name="password"], input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // Wait for navigation
      await page.waitForURL('**/memories', { timeout: 10000 }).catch(() => {
        // If not automatically redirected, navigate manually
        return page.goto('http://localhost:5000/memories');
      });
    } else {
      // Navigate to memories page
      await page.goto('http://localhost:5000/memories', { waitUntil: 'networkidle' });
    }
    
    console.log('📸 On memories page:', page.url());
    
    // Wait for the page to load
    await page.waitForTimeout(3000);
    
    // Check if there are existing posts
    const posts = await page.locator('[data-testid^="card-memory-"]').count();
    console.log(`📝 Found ${posts} existing posts`);
    
    if (posts === 0) {
      // Create a test post
      console.log('➕ Creating a test post...');
      
      // Click on "Share a Memory" button
      const shareButton = await page.locator('button:has-text("Share a Memory"), button:has-text("Create Post"), button:has-text("New Post")').first();
      await shareButton.click();
      
      // Wait for composer to appear
      await page.waitForTimeout(2000);
      
      // Check if the composer is visible
      const composerVisible = await page.locator('.ql-editor, [contenteditable="true"], textarea').first().isVisible();
      console.log('📝 Composer visible:', composerVisible);
      
      if (composerVisible) {
        // Add content to the post
        await page.locator('.ql-editor, [contenteditable="true"], textarea').first().fill('Test post for edit functionality verification. Created at ' + new Date().toLocaleTimeString());
        
        // Submit the post
        await page.click('button:has-text("Post"), button:has-text("Share"), button:has-text("Submit")');
        
        // Wait for the post to be created
        await page.waitForTimeout(3000);
      }
    }
    
    // Now test the edit functionality
    console.log('\n🎯 Testing Edit Functionality...');
    
    // Find a post and click its three-dot menu
    const postCard = page.locator('[data-testid^="card-memory-"]').first();
    const menuButton = postCard.locator('[data-testid*="menu"], button[aria-label*="menu"], button:has(svg)').last();
    
    console.log('🔘 Clicking three-dot menu...');
    await menuButton.click();
    await page.waitForTimeout(1000);
    
    // Click on Edit option
    console.log('✏️ Clicking Edit post...');
    const editButton = page.locator('button:has-text("Edit"), [role="menuitem"]:has-text("Edit")').first();
    await editButton.click();
    
    // Wait for the composer to open
    await page.waitForTimeout(2000);
    
    // Now verify what elements are visible
    console.log('\n📊 Verifying Edit Composer Elements:');
    console.log('=====================================');
    
    // Check for Rich Text Editor (Quill)
    const hasQuillEditor = await page.locator('.ql-editor').isVisible();
    const hasQuillToolbar = await page.locator('.ql-toolbar').isVisible();
    console.log(`✅ Rich Text Editor (Quill): ${hasQuillEditor ? 'VISIBLE' : 'NOT FOUND'}`);
    console.log(`✅ Formatting Toolbar: ${hasQuillToolbar ? 'VISIBLE' : 'NOT FOUND'}`);
    
    if (hasQuillToolbar) {
      // Check for specific formatting buttons
      const hasBold = await page.locator('.ql-bold').isVisible();
      const hasItalic = await page.locator('.ql-italic').isVisible();
      const hasList = await page.locator('.ql-list').isVisible();
      const hasQuote = await page.locator('.ql-blockquote').isVisible();
      const hasHeader = await page.locator('.ql-header').isVisible();
      
      console.log('\n📝 Formatting Toolbar Elements:');
      console.log(`  - Bold button: ${hasBold ? '✅ VISIBLE' : '❌ NOT FOUND'}`);
      console.log(`  - Italic button: ${hasItalic ? '✅ VISIBLE' : '❌ NOT FOUND'}`);
      console.log(`  - List button: ${hasList ? '✅ VISIBLE' : '❌ NOT FOUND'}`);
      console.log(`  - Quote button: ${hasQuote ? '✅ VISIBLE' : '❌ NOT FOUND'}`);
      console.log(`  - Header options: ${hasHeader ? '✅ VISIBLE' : '❌ NOT FOUND'}`);
    }
    
    // Check for simple text input (to ensure it's NOT just a simple input)
    const hasSimpleInput = await page.locator('input[type="text"]:not([placeholder*="location"]):not([placeholder*="search"])').isVisible();
    const hasSimpleTextarea = await page.locator('textarea:not(.ql-editor)').isVisible();
    console.log(`\n⚠️  Simple text input: ${hasSimpleInput ? 'FOUND (BAD)' : 'NOT FOUND (GOOD)'}`);
    console.log(`⚠️  Simple textarea: ${hasSimpleTextarea ? 'FOUND (BAD)' : 'NOT FOUND (GOOD)'}`);
    
    // Check for Media Upload buttons
    const hasCameraIcon = await page.locator('button:has(svg[data-lucide="camera"]), button:has-text("Camera"), [aria-label*="camera"]').isVisible();
    const hasVideoIcon = await page.locator('button:has(svg[data-lucide="video"]), button:has-text("Video"), [aria-label*="video"]').isVisible();
    const hasImageIcon = await page.locator('button:has(svg[data-lucide="image"]), button:has-text("Image"), [aria-label*="image"]').isVisible();
    
    console.log('\n📷 Media Upload Buttons:');
    console.log(`  - Camera icon: ${hasCameraIcon ? '✅ VISIBLE' : '❌ NOT FOUND'}`);
    console.log(`  - Video icon: ${hasVideoIcon ? '✅ VISIBLE' : '❌ NOT FOUND'}`);
    console.log(`  - Image icon: ${hasImageIcon ? '✅ VISIBLE' : '❌ NOT FOUND'}`);
    
    // Check for Location field
    const hasLocationField = await page.locator('input[placeholder*="location"], input[placeholder*="Location"], button:has-text("Add Location")').isVisible();
    const hasMapPin = await page.locator('svg[data-lucide="map-pin"], button:has(svg[data-lucide="map-pin"])').isVisible();
    console.log('\n📍 Location:');
    console.log(`  - Location field/button: ${hasLocationField ? '✅ VISIBLE' : '❌ NOT FOUND'}`);
    console.log(`  - Map pin icon: ${hasMapPin ? '✅ VISIBLE' : '❌ NOT FOUND'}`);
    
    // Check for Visibility selector
    const hasVisibilitySelector = await page.locator('button:has-text("Public"), button:has-text("Private"), button:has-text("Friends"), select[name*="visibility"]').isVisible();
    const hasGlobeIcon = await page.locator('svg[data-lucide="globe"]').isVisible();
    const hasLockIcon = await page.locator('svg[data-lucide="lock"]').isVisible();
    const hasUsersIcon = await page.locator('svg[data-lucide="users"]').isVisible();
    
    console.log('\n🔐 Visibility Selector:');
    console.log(`  - Visibility selector: ${hasVisibilitySelector ? '✅ VISIBLE' : '❌ NOT FOUND'}`);
    console.log(`  - Globe icon (public): ${hasGlobeIcon ? '✅ VISIBLE' : '❌ NOT FOUND'}`);
    console.log(`  - Lock icon (private): ${hasLockIcon ? '✅ VISIBLE' : '❌ NOT FOUND'}`);
    console.log(`  - Users icon (friends): ${hasUsersIcon ? '✅ VISIBLE' : '❌ NOT FOUND'}`);
    
    // Check if existing content is pre-filled
    let hasPrefilledContent = false;
    if (hasQuillEditor) {
      const editorContent = await page.locator('.ql-editor').textContent();
      hasPrefilledContent = editorContent && editorContent.trim().length > 0;
      console.log('\n📄 Content Pre-filled:');
      console.log(`  - Has content: ${hasPrefilledContent ? '✅ YES' : '❌ NO'}`);
      if (hasPrefilledContent) {
        console.log(`  - Content preview: "${editorContent.substring(0, 50)}..."`);
      }
    }
    
    // Take a screenshot for verification
    await page.screenshot({ path: 'edit-composer-test.png', fullPage: false });
    console.log('\n📸 Screenshot saved as edit-composer-test.png');
    
    // Final Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 FINAL SUMMARY:');
    console.log('='.repeat(50));
    
    const isFullComposer = hasQuillEditor && hasQuillToolbar;
    const isSimpleModal = hasSimpleInput || hasSimpleTextarea;
    
    if (isFullComposer && !isSimpleModal) {
      console.log('✅ SUCCESS: Full EnhancedPostComposer is displayed!');
      console.log('  - Rich text editor with formatting toolbar: YES');
      console.log('  - NOT a simple text input: YES');
      console.log('  - Full feature set available: YES');
    } else if (isSimpleModal && !isFullComposer) {
      console.log('❌ FAILURE: Only a simple modal is displayed');
      console.log('  - Rich text editor: NO');
      console.log('  - Simple input/textarea: YES');
      console.log('  - This is NOT the expected behavior');
    } else {
      console.log('⚠️  PARTIAL: Mixed results detected');
      console.log(`  - Rich text editor: ${hasQuillEditor ? 'YES' : 'NO'}`);
      console.log(`  - Formatting toolbar: ${hasQuillToolbar ? 'YES' : 'NO'}`);
      console.log(`  - Simple inputs present: ${isSimpleModal ? 'YES' : 'NO'}`);
    }
    
    console.log('\n' + '='.repeat(50));
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Run the test
testEditComposer().catch(console.error);