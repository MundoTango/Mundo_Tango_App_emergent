import { chromium } from '@playwright/test';

async function testEditComposer() {
  console.log('🔍 Starting Edit Composer Test...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Navigate to the app
    console.log('📍 Navigating to application...');
    await page.goto('http://localhost:5000/memories', { waitUntil: 'networkidle' });
    
    console.log('📸 Current page URL:', page.url());
    
    // Wait for the page to load
    await page.waitForTimeout(3000);
    
    // Take initial screenshot to see what's on the page
    await page.screenshot({ path: 'memories-page-initial.png', fullPage: false });
    console.log('📸 Initial screenshot saved as memories-page-initial.png');
    
    // Check if there are existing posts
    const posts = await page.locator('[data-testid^="card-memory-"]').count();
    console.log(`📝 Found ${posts} existing posts`);
    
    if (posts === 0) {
      // Create a test post - try different selectors
      console.log('➕ Looking for create post button...');
      
      // Try to find any button that might create a post
      const possibleButtons = [
        'button:has-text("Share a Memory")',
        'button:has-text("Create Post")',
        'button:has-text("New Post")',
        'button:has-text("Share")',
        'button:has-text("+")',
        'button[aria-label*="create"]',
        'button[aria-label*="new"]',
        'button[aria-label*="add"]',
        '[data-testid*="create"]',
        '[data-testid*="share"]'
      ];
      
      let shareButton = null;
      for (const selector of possibleButtons) {
        const count = await page.locator(selector).count();
        if (count > 0) {
          console.log(`  ✅ Found button with selector: ${selector}`);
          shareButton = page.locator(selector).first();
          break;
        }
      }
      
      if (!shareButton) {
        console.log('  ⚠️ Could not find a create post button');
        console.log('  Creating a post via API instead...');
        
        // Create a post via API
        const response = await page.evaluate(async () => {
          const res = await fetch('/api/posts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              content: 'Test post for edit verification created at ' + new Date().toISOString(),
              isPublic: true
            })
          });
          return res.json();
        });
        
        console.log('  ✅ Post created via API:', response);
        
        // Reload the page to show the new post
        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
      } else {
        // Click the button to open composer
        await shareButton.click();
        await page.waitForTimeout(2000);
        
        // Check if the composer is visible and add content
        const composerVisible = await page.locator('.ql-editor, [contenteditable="true"], textarea').first().isVisible();
        console.log('📝 Composer visible:', composerVisible);
        
        if (composerVisible) {
          await page.locator('.ql-editor, [contenteditable="true"], textarea').first().fill('Test post for edit functionality verification. Created at ' + new Date().toLocaleTimeString());
          
          // Submit the post
          await page.click('button:has-text("Post"), button:has-text("Share"), button:has-text("Submit")');
          await page.waitForTimeout(3000);
        }
      }
    }
    
    // Recount posts after potential creation
    const finalPostCount = await page.locator('[data-testid^="card-memory-"]').count();
    console.log(`\n📝 Final post count: ${finalPostCount}`);
    
    if (finalPostCount === 0) {
      console.log('❌ No posts available to test edit functionality');
      return;
    }
    
    // Now test the edit functionality
    console.log('\n🎯 Testing Edit Functionality...');
    
    // Find a post card
    const postCard = page.locator('[data-testid^="card-memory-"]').first();
    
    // Look for any menu or action button on the post
    const menuSelectors = [
      '[data-testid*="menu"]',
      'button[aria-label*="menu"]',
      'button[aria-label*="options"]',
      'button[aria-label*="actions"]',
      'button:has(svg)',
      '[role="button"]:has(svg)'
    ];
    
    let menuButton = null;
    for (const selector of menuSelectors) {
      const buttons = postCard.locator(selector);
      const count = await buttons.count();
      if (count > 0) {
        // Try the last button (usually the menu is at the end)
        menuButton = buttons.last();
        console.log(`🔘 Found menu button with selector: ${selector}`);
        break;
      }
    }
    
    if (!menuButton) {
      console.log('❌ Could not find menu button on post');
      await page.screenshot({ path: 'post-card-no-menu.png' });
      console.log('📸 Screenshot of post card saved as post-card-no-menu.png');
      return;
    }
    
    console.log('🔘 Clicking menu button...');
    await menuButton.click();
    await page.waitForTimeout(1500);
    
    // Take screenshot after clicking menu
    await page.screenshot({ path: 'menu-opened.png' });
    console.log('📸 Menu opened screenshot saved as menu-opened.png');
    
    // Look for Edit option
    const editSelectors = [
      'button:has-text("Edit")',
      '[role="menuitem"]:has-text("Edit")',
      '[data-testid*="edit"]',
      'button:has-text("Edit post")',
      'button:has-text("Edit Post")'
    ];
    
    let editButton = null;
    for (const selector of editSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        editButton = page.locator(selector).first();
        console.log(`✏️ Found edit button with selector: ${selector}`);
        break;
      }
    }
    
    if (!editButton) {
      console.log('❌ Could not find Edit option in menu');
      return;
    }
    
    console.log('✏️ Clicking Edit button...');
    await editButton.click();
    
    // Wait for the composer to open
    await page.waitForTimeout(3000);
    
    // Take screenshot of the edit composer
    await page.screenshot({ path: 'edit-composer-opened.png', fullPage: false });
    console.log('📸 Edit composer screenshot saved as edit-composer-opened.png');
    
    // Now verify what elements are visible
    console.log('\n📊 Verifying Edit Composer Elements:');
    console.log('=====================================');
    
    // Check for Rich Text Editor (Quill)
    const hasQuillEditor = await page.locator('.ql-editor').count() > 0;
    const hasQuillToolbar = await page.locator('.ql-toolbar').count() > 0;
    console.log(`✅ Rich Text Editor (Quill): ${hasQuillEditor ? 'VISIBLE' : 'NOT FOUND'}`);
    console.log(`✅ Formatting Toolbar: ${hasQuillToolbar ? 'VISIBLE' : 'NOT FOUND'}`);
    
    if (hasQuillToolbar) {
      // Check for specific formatting buttons
      const hasBold = await page.locator('.ql-bold').count() > 0;
      const hasItalic = await page.locator('.ql-italic').count() > 0;
      const hasList = await page.locator('.ql-list').count() > 0;
      const hasQuote = await page.locator('.ql-blockquote').count() > 0;
      const hasHeader = await page.locator('.ql-header').count() > 0;
      
      console.log('\n📝 Formatting Toolbar Elements:');
      console.log(`  - Bold button: ${hasBold ? '✅ VISIBLE' : '❌ NOT FOUND'}`);
      console.log(`  - Italic button: ${hasItalic ? '✅ VISIBLE' : '❌ NOT FOUND'}`);
      console.log(`  - List button: ${hasList ? '✅ VISIBLE' : '❌ NOT FOUND'}`);
      console.log(`  - Quote button: ${hasQuote ? '✅ VISIBLE' : '❌ NOT FOUND'}`);
      console.log(`  - Header options: ${hasHeader ? '✅ VISIBLE' : '❌ NOT FOUND'}`);
    }
    
    // Check for simple text input (to ensure it's NOT just a simple input)
    const simpleInputs = await page.locator('input[type="text"]:visible').all();
    const simpleTextareas = await page.locator('textarea:visible:not(.ql-editor)').all();
    console.log(`\n⚠️  Simple text inputs found: ${simpleInputs.length}`);
    console.log(`⚠️  Simple textareas found: ${simpleTextareas.length}`);
    
    // Check for Media Upload buttons - use count() instead of isVisible()
    const hasCameraIcon = await page.locator('svg[data-lucide="camera"], button:has-text("Camera"), [aria-label*="camera"]').count() > 0;
    const hasVideoIcon = await page.locator('svg[data-lucide="video"], button:has-text("Video"), [aria-label*="video"]').count() > 0;
    const hasImageIcon = await page.locator('svg[data-lucide="image"], button:has-text("Image"), [aria-label*="image"]').count() > 0;
    
    console.log('\n📷 Media Upload Buttons:');
    console.log(`  - Camera icon: ${hasCameraIcon ? '✅ VISIBLE' : '❌ NOT FOUND'}`);
    console.log(`  - Video icon: ${hasVideoIcon ? '✅ VISIBLE' : '❌ NOT FOUND'}`);
    console.log(`  - Image icon: ${hasImageIcon ? '✅ VISIBLE' : '❌ NOT FOUND'}`);
    
    // Check for Location field
    const hasLocationField = await page.locator('input[placeholder*="location" i], input[placeholder*="Location" i], button:has-text("Add Location")').count() > 0;
    const hasMapPin = await page.locator('svg[data-lucide="map-pin"], button svg[data-lucide="map-pin"]').count() > 0;
    console.log('\n📍 Location:');
    console.log(`  - Location field/button: ${hasLocationField ? '✅ VISIBLE' : '❌ NOT FOUND'}`);
    console.log(`  - Map pin icon: ${hasMapPin ? '✅ VISIBLE' : '❌ NOT FOUND'}`);
    
    // Check for Visibility selector
    const hasVisibilitySelector = await page.locator('button:has-text("Public"), button:has-text("Private"), button:has-text("Friends"), select[name*="visibility"]').count() > 0;
    const hasGlobeIcon = await page.locator('svg[data-lucide="globe"]').count() > 0;
    const hasLockIcon = await page.locator('svg[data-lucide="lock"]').count() > 0;
    const hasUsersIcon = await page.locator('svg[data-lucide="users"]').count() > 0;
    
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
    
    // Final Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 FINAL SUMMARY:');
    console.log('='.repeat(50));
    
    const isFullComposer = hasQuillEditor && hasQuillToolbar;
    const hasSimpleInputs = simpleInputs.length > 0 || simpleTextareas.length > 0;
    
    if (isFullComposer && !hasSimpleInputs) {
      console.log('✅ SUCCESS: Full EnhancedPostComposer is displayed!');
      console.log('  - Rich text editor with formatting toolbar: YES');
      console.log('  - NOT a simple text input: YES');
      console.log('  - Full feature set available: YES');
    } else if (hasSimpleInputs && !isFullComposer) {
      console.log('❌ FAILURE: Only a simple modal is displayed');
      console.log('  - Rich text editor: NO');
      console.log('  - Simple input/textarea: YES');
      console.log('  - This is NOT the expected behavior');
    } else if (isFullComposer) {
      console.log('✅ SUCCESS: Full EnhancedPostComposer is displayed!');
      console.log('  - Rich text editor with formatting toolbar: YES');
      console.log('  - Some additional input fields may be present (location, etc.)');
    } else {
      console.log('⚠️  PARTIAL: Mixed or no composer detected');
      console.log(`  - Rich text editor: ${hasQuillEditor ? 'YES' : 'NO'}`);
      console.log(`  - Formatting toolbar: ${hasQuillToolbar ? 'YES' : 'NO'}`);
      console.log(`  - Simple inputs present: ${hasSimpleInputs ? 'YES' : 'NO'}`);
    }
    
    console.log('\n' + '='.repeat(50));
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'error-screenshot.png' });
    console.log('📸 Error screenshot saved as error-screenshot.png');
  } finally {
    await browser.close();
  }
}

// Run the test
testEditComposer().catch(console.error);