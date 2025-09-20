import { chromium } from '@playwright/test';

async function directEditTest() {
  console.log('🎯 Direct Edit Composer Test - Starting...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000  // Slow down actions to see what's happening
  });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  try {
    // Step 1: Navigate directly to memories page
    console.log('📍 Step 1: Navigating to /memories page...');
    await page.goto('http://localhost:5000/memories');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Check current URL
    const currentUrl = page.url();
    console.log(`   Current URL: ${currentUrl}`);
    
    // Step 2: Wait for posts to load
    console.log('\n📝 Step 2: Waiting for posts to load...');
    try {
      await page.waitForSelector('[data-testid^="card-memory-"]', { timeout: 10000 });
      const postCount = await page.locator('[data-testid^="card-memory-"]').count();
      console.log(`   ✅ Found ${postCount} posts on the page`);
    } catch (e) {
      console.log('   ❌ No posts found with data-testid');
      
      // Try alternative selectors
      const alternatives = [
        'article',
        '.post-card',
        '[class*="post"]',
        '[class*="memory"]',
        'div[role="article"]'
      ];
      
      for (const selector of alternatives) {
        const count = await page.locator(selector).count();
        if (count > 0) {
          console.log(`   ✅ Found ${count} elements with selector: ${selector}`);
          break;
        }
      }
    }
    
    // Step 3: Find and click the three-dot menu
    console.log('\n🔘 Step 3: Looking for three-dot menu on first post...');
    
    // Take screenshot before clicking menu
    await page.screenshot({ path: 'before-menu-click.png' });
    console.log('   📸 Screenshot saved: before-menu-click.png');
    
    // Try to find menu button using multiple strategies
    const menuFound = await page.evaluate(() => {
      // Find all buttons that might be menu buttons
      const buttons = Array.from(document.querySelectorAll('button'));
      const svgs = Array.from(document.querySelectorAll('svg'));
      
      // Look for three dots pattern
      for (const button of buttons) {
        // Check for aria labels
        const ariaLabel = button.getAttribute('aria-label');
        if (ariaLabel && (ariaLabel.includes('menu') || ariaLabel.includes('option') || ariaLabel.includes('action'))) {
          button.click();
          return 'clicked-by-aria-label';
        }
        
        // Check for three dots in content
        const text = button.textContent;
        if (text && (text === '⋮' || text === '...' || text === '•••')) {
          button.click();
          return 'clicked-by-dots';
        }
        
        // Check for SVG with three dots
        const svg = button.querySelector('svg');
        if (svg && svg.innerHTML.includes('circle')) {
          const circles = svg.querySelectorAll('circle');
          if (circles.length >= 3) {
            button.click();
            return 'clicked-by-svg-circles';
          }
        }
      }
      
      // If no menu button found, click last button in first post card
      const postCards = document.querySelectorAll('[data-testid^="card-memory-"]');
      if (postCards.length > 0) {
        const firstCard = postCards[0];
        const cardButtons = firstCard.querySelectorAll('button');
        if (cardButtons.length > 0) {
          cardButtons[cardButtons.length - 1].click();
          return 'clicked-last-button-in-card';
        }
      }
      
      return 'no-menu-found';
    });
    
    console.log(`   Menu click result: ${menuFound}`);
    await page.waitForTimeout(2000);
    
    // Take screenshot after clicking menu
    await page.screenshot({ path: 'after-menu-click.png' });
    console.log('   📸 Screenshot saved: after-menu-click.png');
    
    // Step 4: Click Edit option
    console.log('\n✏️ Step 4: Looking for Edit option...');
    
    const editClicked = await page.evaluate(() => {
      // Find elements with "Edit" text
      const elements = Array.from(document.querySelectorAll('*'));
      
      for (const el of elements) {
        const text = el.textContent || '';
        if (text.match(/^Edit\s*(post)?$/i) && !el.children.length) {
          if (el.tagName === 'BUTTON') {
            el.click();
            return 'clicked-button';
          } else if (el.closest('button')) {
            el.closest('button').click();
            return 'clicked-parent-button';
          } else if (el.getAttribute('role') === 'menuitem') {
            el.click();
            return 'clicked-menuitem';
          } else {
            el.click();
            return 'clicked-element';
          }
        }
      }
      
      return 'no-edit-found';
    });
    
    console.log(`   Edit click result: ${editClicked}`);
    await page.waitForTimeout(3000);
    
    // Step 5: Take screenshot and analyze the edit composer
    console.log('\n📸 Step 5: Analyzing Edit Composer...');
    await page.screenshot({ path: 'edit-composer-final.png', fullPage: true });
    console.log('   📸 Full page screenshot saved: edit-composer-final.png');
    
    // Detailed analysis of what's visible
    console.log('\n' + '='.repeat(60));
    console.log('📊 EDIT COMPOSER ANALYSIS RESULTS:');
    console.log('='.repeat(60));
    
    // Check for Quill Rich Text Editor
    const quillAnalysis = await page.evaluate(() => {
      const results = {
        hasQuillEditor: false,
        hasQuillToolbar: false,
        toolbarButtons: [],
        editorContent: '',
        editorClasses: []
      };
      
      // Check for Quill editor
      const qlEditor = document.querySelector('.ql-editor');
      if (qlEditor) {
        results.hasQuillEditor = true;
        results.editorContent = qlEditor.textContent || '';
        results.editorClasses = Array.from(qlEditor.classList);
      }
      
      // Check for Quill toolbar
      const qlToolbar = document.querySelector('.ql-toolbar');
      if (qlToolbar) {
        results.hasQuillToolbar = true;
        
        // List all toolbar buttons
        const buttons = qlToolbar.querySelectorAll('button');
        buttons.forEach(btn => {
          const classList = Array.from(btn.classList).join(' ');
          if (classList) {
            results.toolbarButtons.push(classList);
          }
        });
      }
      
      return results;
    });
    
    console.log('\n🎨 Rich Text Editor (Quill):');
    console.log(`   Editor Present: ${quillAnalysis.hasQuillEditor ? '✅ YES' : '❌ NO'}`);
    console.log(`   Toolbar Present: ${quillAnalysis.hasQuillToolbar ? '✅ YES' : '❌ NO'}`);
    
    if (quillAnalysis.hasQuillToolbar) {
      console.log('   Toolbar Buttons Found:');
      quillAnalysis.toolbarButtons.forEach(btn => {
        console.log(`     - ${btn}`);
      });
    }
    
    if (quillAnalysis.hasQuillEditor) {
      console.log(`   Editor Content: "${quillAnalysis.editorContent.substring(0, 50)}..."`);
    }
    
    // Check for simple inputs/textareas
    const simpleInputAnalysis = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input[type="text"]:not([placeholder*="location" i]):not([placeholder*="search" i])');
      const textareas = document.querySelectorAll('textarea:not(.ql-editor)');
      
      return {
        textInputCount: inputs.length,
        textareaCount: textareas.length,
        inputPlaceholders: Array.from(inputs).map(i => i.placeholder),
        textareaPlaceholders: Array.from(textareas).map(t => t.placeholder)
      };
    });
    
    console.log('\n❓ Simple Input Fields:');
    console.log(`   Text Inputs: ${simpleInputAnalysis.textInputCount} ${simpleInputAnalysis.textInputCount > 0 ? '⚠️' : '✅'}`);
    console.log(`   Textareas: ${simpleInputAnalysis.textareaCount} ${simpleInputAnalysis.textareaCount > 0 ? '⚠️' : '✅'}`);
    
    // Check for media buttons
    const mediaButtonsAnalysis = await page.evaluate(() => {
      const results = {
        cameraButton: false,
        videoButton: false,
        imageButton: false,
        buttons: []
      };
      
      // Check for Lucide icons
      const svgs = document.querySelectorAll('svg[data-lucide]');
      svgs.forEach(svg => {
        const lucideType = svg.getAttribute('data-lucide');
        if (lucideType === 'camera') results.cameraButton = true;
        if (lucideType === 'video') results.videoButton = true;
        if (lucideType === 'image') results.imageButton = true;
        if (lucideType) results.buttons.push(lucideType);
      });
      
      return results;
    });
    
    console.log('\n📷 Media Upload Buttons:');
    console.log(`   Camera: ${mediaButtonsAnalysis.cameraButton ? '✅ YES' : '❌ NO'}`);
    console.log(`   Video: ${mediaButtonsAnalysis.videoButton ? '✅ YES' : '❌ NO'}`);
    console.log(`   Image: ${mediaButtonsAnalysis.imageButton ? '✅ YES' : '❌ NO'}`);
    console.log(`   All Icons Found: ${mediaButtonsAnalysis.buttons.join(', ')}`);
    
    // Check for location field
    const locationAnalysis = await page.evaluate(() => {
      const locationInput = document.querySelector('input[placeholder*="location" i]');
      const mapPinSvg = document.querySelector('svg[data-lucide="map-pin"]');
      
      return {
        hasLocationField: !!locationInput,
        hasMapPin: !!mapPinSvg,
        placeholder: locationInput ? locationInput.placeholder : null
      };
    });
    
    console.log('\n📍 Location Field:');
    console.log(`   Field Present: ${locationAnalysis.hasLocationField ? '✅ YES' : '❌ NO'}`);
    console.log(`   Map Pin Icon: ${locationAnalysis.hasMapPin ? '✅ YES' : '❌ NO'}`);
    if (locationAnalysis.placeholder) {
      console.log(`   Placeholder: "${locationAnalysis.placeholder}"`);
    }
    
    // Check for visibility selector
    const visibilityAnalysis = await page.evaluate(() => {
      const results = {
        hasPublicOption: false,
        hasPrivateOption: false,
        hasFriendsOption: false,
        visibilityButtons: []
      };
      
      // Check for visibility text
      const elements = document.querySelectorAll('button, [role="button"]');
      elements.forEach(el => {
        const text = el.textContent || '';
        if (text.includes('Public')) {
          results.hasPublicOption = true;
          results.visibilityButtons.push('Public');
        }
        if (text.includes('Private')) {
          results.hasPrivateOption = true;
          results.visibilityButtons.push('Private');
        }
        if (text.includes('Friends')) {
          results.hasFriendsOption = true;
          results.visibilityButtons.push('Friends');
        }
      });
      
      // Check for icons
      const globeIcon = document.querySelector('svg[data-lucide="globe"]');
      const lockIcon = document.querySelector('svg[data-lucide="lock"]');
      const usersIcon = document.querySelector('svg[data-lucide="users"]');
      
      return {
        ...results,
        hasGlobeIcon: !!globeIcon,
        hasLockIcon: !!lockIcon,
        hasUsersIcon: !!usersIcon
      };
    });
    
    console.log('\n🔐 Visibility Selector:');
    console.log(`   Public Option: ${visibilityAnalysis.hasPublicOption ? '✅ YES' : '❌ NO'}`);
    console.log(`   Private Option: ${visibilityAnalysis.hasPrivateOption ? '✅ YES' : '❌ NO'}`);
    console.log(`   Friends Option: ${visibilityAnalysis.hasFriendsOption ? '✅ YES' : '❌ NO'}`);
    console.log(`   Globe Icon: ${visibilityAnalysis.hasGlobeIcon ? '✅ YES' : '❌ NO'}`);
    console.log(`   Lock Icon: ${visibilityAnalysis.hasLockIcon ? '✅ YES' : '❌ NO'}`);
    console.log(`   Users Icon: ${visibilityAnalysis.hasUsersIcon ? '✅ YES' : '❌ NO'}`);
    
    // FINAL VERDICT
    console.log('\n' + '='.repeat(60));
    console.log('🏁 FINAL VERDICT:');
    console.log('='.repeat(60));
    
    const hasFullComposer = quillAnalysis.hasQuillEditor && quillAnalysis.hasQuillToolbar;
    const hasSimpleModal = simpleInputAnalysis.textInputCount > 0 || simpleInputAnalysis.textareaCount > 0;
    
    if (hasFullComposer) {
      console.log('\n✅ SUCCESS: Full EnhancedPostComposer with Rich Text Editor is shown!');
      console.log('   • Rich text editor (Quill): PRESENT');
      console.log('   • Formatting toolbar: PRESENT');
      console.log('   • This is the EXPECTED behavior for edit functionality');
    } else if (hasSimpleModal && !hasFullComposer) {
      console.log('\n❌ FAILURE: Only a simple modal/input is shown!');
      console.log('   • Rich text editor: NOT FOUND');
      console.log('   • Simple text inputs/textareas: FOUND');
      console.log('   • This is NOT the expected behavior');
    } else {
      console.log('\n⚠️  WARNING: Could not determine composer type');
      console.log('   • Please check the screenshots for visual verification');
    }
    
    console.log('\n📸 Screenshots saved:');
    console.log('   1. before-menu-click.png - Page before clicking menu');
    console.log('   2. after-menu-click.png - After clicking three-dot menu');
    console.log('   3. edit-composer-final.png - Edit composer view');
    
  } catch (error) {
    console.error('\n❌ Test Error:', error.message);
  } finally {
    console.log('\n🔚 Test completed. Closing browser...');
    await browser.close();
  }
}

// Run the test
console.log('Running Direct Edit Test...\n');
directEditTest().catch(console.error);