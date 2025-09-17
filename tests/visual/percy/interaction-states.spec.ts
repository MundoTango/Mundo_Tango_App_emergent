/**
 * ESA Layer 51 - Interaction States Visual Testing
 * Tests all interactive states (hover, focus, active, disabled) for MT Ocean theme
 */

import { test } from '@playwright/test';
import { percyEnhanced } from '../percy-enhanced';

test.describe('Interactive States Visual Regression', () => {
  test.describe('Button States', () => {
    test('Primary Button States', async ({ page }) => {
      await page.goto('/');
      
      const primaryButton = page.locator('button.btn-primary, button[class*="primary"]').first();
      if (await primaryButton.count() > 0) {
        // Normal state
        await percyEnhanced.snapshot(page, 'button-primary-normal');
        
        // Hover state
        await primaryButton.hover();
        await page.waitForTimeout(200);
        await percyEnhanced.snapshot(page, 'button-primary-hover');
        
        // Focus state
        await primaryButton.focus();
        await page.waitForTimeout(200);
        await percyEnhanced.snapshot(page, 'button-primary-focus');
        
        // Active/pressed state
        await primaryButton.dispatchEvent('mousedown');
        await page.waitForTimeout(100);
        await percyEnhanced.snapshot(page, 'button-primary-active');
        await primaryButton.dispatchEvent('mouseup');
      }
    });
    
    test('Secondary Button States', async ({ page }) => {
      await page.goto('/');
      
      const secondaryButton = page.locator('button.btn-secondary, button[class*="secondary"]').first();
      if (await secondaryButton.count() > 0) {
        // Test all states
        await percyEnhanced.snapshotInteractiveStates(page, 'button.btn-secondary', 'button-secondary');
      }
    });
    
    test('Ghost Button States', async ({ page }) => {
      await page.goto('/');
      
      const ghostButton = page.locator('button.btn-ghost, button[class*="ghost"]').first();
      if (await ghostButton.count() > 0) {
        await percyEnhanced.snapshotInteractiveStates(page, 'button.btn-ghost', 'button-ghost');
      }
    });
    
    test('Icon Button States', async ({ page }) => {
      await page.goto('/');
      
      const iconButton = page.locator('button[aria-label], button:has(svg)').first();
      if (await iconButton.count() > 0) {
        await percyEnhanced.snapshotInteractiveStates(page, 'button[aria-label]', 'button-icon');
      }
    });
    
    test('Disabled Button State', async ({ page }) => {
      await page.goto('/auth/login');
      
      // Find or create a disabled button
      const disabledButton = page.locator('button:disabled, button[disabled]').first();
      if (await disabledButton.count() > 0) {
        await percyEnhanced.snapshot(page, 'button-disabled');
      }
    });
  });
  
  test.describe('Form Field States', () => {
    test('Text Input States', async ({ page }) => {
      await page.goto('/auth/register');
      
      const textInput = page.locator('input[type="text"]').first();
      if (await textInput.count() > 0) {
        // Empty state
        await percyEnhanced.snapshot(page, 'input-text-empty');
        
        // Focus state
        await textInput.focus();
        await percyEnhanced.snapshot(page, 'input-text-focus');
        
        // Filled state
        await textInput.type('Test User');
        await percyEnhanced.snapshot(page, 'input-text-filled');
        
        // Blur state
        await textInput.blur();
        await percyEnhanced.snapshot(page, 'input-text-blur');
      }
    });
    
    test('Email Input States', async ({ page }) => {
      await page.goto('/auth/register');
      
      const emailInput = page.locator('input[type="email"]').first();
      if (await emailInput.count() > 0) {
        // Valid email
        await emailInput.type('test@mundotango.com');
        await emailInput.blur();
        await percyEnhanced.snapshot(page, 'input-email-valid');
        
        // Invalid email
        await emailInput.clear();
        await emailInput.type('invalid-email');
        await emailInput.blur();
        await percyEnhanced.snapshot(page, 'input-email-invalid');
      }
    });
    
    test('Password Input States', async ({ page }) => {
      await page.goto('/auth/register');
      
      const passwordInput = page.locator('input[type="password"]').first();
      if (await passwordInput.count() > 0) {
        // Password visibility toggle
        await passwordInput.type('SecurePassword123!');
        await percyEnhanced.snapshot(page, 'input-password-hidden');
        
        // Try to find and click visibility toggle
        const toggleButton = page.locator('[data-testid*="toggle-password"], button[aria-label*="password"]');
        if (await toggleButton.count() > 0) {
          await toggleButton.click();
          await percyEnhanced.snapshot(page, 'input-password-visible');
        }
      }
    });
    
    test('Select/Dropdown States', async ({ page }) => {
      await page.goto('/settings');
      
      const select = page.locator('select, [role="combobox"]').first();
      if (await select.count() > 0) {
        // Closed state
        await percyEnhanced.snapshot(page, 'select-closed');
        
        // Open state
        await select.click();
        await page.waitForTimeout(200);
        await percyEnhanced.snapshot(page, 'select-open');
        
        // Selected state
        const option = page.locator('option, [role="option"]').first();
        if (await option.count() > 0) {
          await option.click();
          await percyEnhanced.snapshot(page, 'select-selected');
        }
      }
    });
    
    test('Checkbox States', async ({ page }) => {
      await page.goto('/settings');
      
      const checkbox = page.locator('input[type="checkbox"]').first();
      if (await checkbox.count() > 0) {
        // Unchecked
        await percyEnhanced.snapshot(page, 'checkbox-unchecked');
        
        // Hover
        await checkbox.hover();
        await percyEnhanced.snapshot(page, 'checkbox-hover');
        
        // Checked
        await checkbox.check();
        await percyEnhanced.snapshot(page, 'checkbox-checked');
        
        // Focus
        await checkbox.focus();
        await percyEnhanced.snapshot(page, 'checkbox-focus');
      }
    });
    
    test('Radio Button States', async ({ page }) => {
      await page.goto('/settings');
      
      const radio = page.locator('input[type="radio"]').first();
      if (await radio.count() > 0) {
        // Unselected
        await percyEnhanced.snapshot(page, 'radio-unselected');
        
        // Selected
        await radio.check();
        await percyEnhanced.snapshot(page, 'radio-selected');
        
        // Focus
        await radio.focus();
        await percyEnhanced.snapshot(page, 'radio-focus');
      }
    });
    
    test('Toggle/Switch States', async ({ page }) => {
      await page.goto('/settings');
      
      const toggle = page.locator('[role="switch"], .toggle, .switch').first();
      if (await toggle.count() > 0) {
        // Off state
        await percyEnhanced.snapshot(page, 'toggle-off');
        
        // Transition
        await toggle.click();
        await page.waitForTimeout(150);
        await percyEnhanced.snapshot(page, 'toggle-transition');
        
        // On state
        await page.waitForTimeout(150);
        await percyEnhanced.snapshot(page, 'toggle-on');
      }
    });
  });
  
  test.describe('Navigation States', () => {
    test('Nav Link States', async ({ page }) => {
      await page.goto('/');
      
      const navLink = page.locator('nav a, header a').first();
      if (await navLink.count() > 0) {
        // Normal
        await percyEnhanced.snapshot(page, 'nav-link-normal');
        
        // Hover
        await navLink.hover();
        await percyEnhanced.snapshot(page, 'nav-link-hover');
        
        // Active/Current page
        const activeLink = page.locator('nav a.active, nav a[aria-current="page"]').first();
        if (await activeLink.count() > 0) {
          await percyEnhanced.snapshot(page, 'nav-link-active');
        }
      }
    });
    
    test('Tab States', async ({ page }) => {
      await page.goto('/profile');
      
      const tabs = page.locator('[role="tablist"]').first();
      if (await tabs.count() > 0) {
        const tab = tabs.locator('[role="tab"]').first();
        
        // Inactive tab
        await percyEnhanced.snapshot(page, 'tab-inactive');
        
        // Hover tab
        await tab.hover();
        await percyEnhanced.snapshot(page, 'tab-hover');
        
        // Active tab
        await tab.click();
        await percyEnhanced.snapshot(page, 'tab-active');
      }
    });
    
    test('Breadcrumb States', async ({ page }) => {
      await page.goto('/events/1');
      
      const breadcrumb = page.locator('.breadcrumb, nav[aria-label="breadcrumb"]').first();
      if (await breadcrumb.count() > 0) {
        await percyEnhanced.snapshot(page, 'breadcrumb-normal');
        
        const link = breadcrumb.locator('a').first();
        if (await link.count() > 0) {
          await link.hover();
          await percyEnhanced.snapshot(page, 'breadcrumb-hover');
        }
      }
    });
  });
  
  test.describe('Card States', () => {
    test('Event Card States', async ({ page }) => {
      await page.goto('/events');
      
      const eventCard = page.locator('.event-card, [data-testid*="event-card"]').first();
      if (await eventCard.count() > 0) {
        // Normal
        await percyEnhanced.snapshot(page, 'event-card-normal');
        
        // Hover
        await eventCard.hover();
        await page.waitForTimeout(300);
        await percyEnhanced.snapshot(page, 'event-card-hover');
        
        // Glassmorphic effect on hover
        const glassmorphicCard = page.locator('.glassmorphic-card').first();
        if (await glassmorphicCard.count() > 0) {
          await glassmorphicCard.hover();
          await page.waitForTimeout(300);
          await percyEnhanced.snapshot(page, 'glassmorphic-card-hover');
        }
      }
    });
    
    test('Profile Card States', async ({ page }) => {
      await page.goto('/community');
      
      const profileCard = page.locator('.profile-card, [data-testid*="profile-card"]').first();
      if (await profileCard.count() > 0) {
        await percyEnhanced.snapshotInteractiveStates(page, '.profile-card', 'profile-card');
      }
    });
  });
  
  test.describe('Modal & Dialog States', () => {
    test('Modal States', async ({ page }) => {
      await page.goto('/events');
      
      // Find modal trigger
      const modalTrigger = page.locator('[data-testid*="open-modal"], button:has-text("View Details")').first();
      if (await modalTrigger.count() > 0) {
        // Open modal
        await modalTrigger.click();
        await page.waitForTimeout(500);
        
        const modal = page.locator('.modal, [role="dialog"]').first();
        if (await modal.count() > 0) {
          // Modal open
          await percyEnhanced.snapshot(page, 'modal-open');
          
          // Modal with backdrop
          await percyEnhanced.snapshot(page, 'modal-with-backdrop');
          
          // Close button hover
          const closeButton = modal.locator('[aria-label*="close"], button:has-text("×")').first();
          if (await closeButton.count() > 0) {
            await closeButton.hover();
            await percyEnhanced.snapshot(page, 'modal-close-hover');
          }
        }
      }
    });
    
    test('Toast/Notification States', async ({ page }) => {
      await page.goto('/');
      
      // Trigger a toast notification
      await page.evaluate(() => {
        // Try to trigger a toast if the function exists
        if (typeof (window as any).showToast === 'function') {
          (window as any).showToast('Success', 'Operation completed successfully');
        }
      });
      
      const toast = page.locator('.toast, [role="alert"]').first();
      if (await toast.count() > 0) {
        await percyEnhanced.snapshot(page, 'toast-notification');
      }
    });
  });
  
  test.describe('Loading & Progress States', () => {
    test('Loading Spinner States', async ({ page }) => {
      await page.goto('/events');
      
      // Find loading spinner
      const spinner = page.locator('.spinner, .loading, [data-testid*="loading"]').first();
      if (await spinner.count() > 0) {
        await percyEnhanced.snapshot(page, 'loading-spinner');
      }
    });
    
    test('Skeleton Loader States', async ({ page }) => {
      await page.goto('/events');
      
      const skeleton = page.locator('.skeleton, [class*="skeleton"]').first();
      if (await skeleton.count() > 0) {
        await percyEnhanced.snapshot(page, 'skeleton-loader');
      }
    });
    
    test('Progress Bar States', async ({ page }) => {
      await page.goto('/onboarding');
      
      const progressBar = page.locator('[role="progressbar"], .progress').first();
      if (await progressBar.count() > 0) {
        await percyEnhanced.snapshot(page, 'progress-bar');
      }
    });
  });
  
  test.describe('Error & Validation States', () => {
    test('Form Error States', async ({ page }) => {
      await page.goto('/auth/register');
      
      // Submit empty form to trigger errors
      const submitButton = page.locator('[type="submit"]').first();
      await submitButton.click();
      await page.waitForTimeout(500);
      
      // Error messages
      const errorMessage = page.locator('.error-message, [class*="error"]').first();
      if (await errorMessage.count() > 0) {
        await percyEnhanced.snapshot(page, 'form-error-state');
      }
      
      // Input with error
      const inputWithError = page.locator('input.error, input[aria-invalid="true"]').first();
      if (await inputWithError.count() > 0) {
        await percyEnhanced.snapshot(page, 'input-error-state');
      }
    });
    
    test('Success States', async ({ page }) => {
      await page.goto('/auth/login');
      
      // Mock successful login feedback
      await page.evaluate(() => {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = 'Login successful!';
        document.body.appendChild(successDiv);
      });
      
      await percyEnhanced.snapshot(page, 'success-state');
    });
    
    test('Warning States', async ({ page }) => {
      await page.goto('/settings');
      
      const warning = page.locator('.warning, [class*="warning"]').first();
      if (await warning.count() > 0) {
        await percyEnhanced.snapshot(page, 'warning-state');
      }
    });
  });
  
  test.describe('MT Ocean Theme Specific States', () => {
    test('Glassmorphic Hover Effects', async ({ page }) => {
      await page.goto('/');
      
      const glassmorphicElements = page.locator('.glassmorphic-card');
      const count = await glassmorphicElements.count();
      
      for (let i = 0; i < Math.min(count, 3); i++) {
        const element = glassmorphicElements.nth(i);
        await element.scrollIntoViewIfNeeded();
        
        // Normal
        await percyEnhanced.snapshot(page, `glassmorphic-normal-${i}`);
        
        // Hover with backdrop filter change
        await element.hover();
        await page.waitForTimeout(300);
        await percyEnhanced.snapshot(page, `glassmorphic-hover-${i}`);
      }
    });
    
    test('Gradient Button States', async ({ page }) => {
      await page.goto('/');
      
      const gradientButton = page.locator('button.gradient-turquoise, button[class*="gradient"]').first();
      if (await gradientButton.count() > 0) {
        await percyEnhanced.snapshotInteractiveStates(page, 'button[class*="gradient"]', 'gradient-button');
      }
    });
    
    test('Ocean Wave Animation States', async ({ page }) => {
      await page.goto('/');
      
      const waveElement = page.locator('.ocean-wave, [class*="wave"]').first();
      if (await waveElement.count() > 0) {
        // Capture at different animation frames
        for (let i = 0; i < 3; i++) {
          await page.waitForTimeout(500);
          await percyEnhanced.snapshot(page, `ocean-wave-frame-${i}`);
        }
      }
    });
  });
});