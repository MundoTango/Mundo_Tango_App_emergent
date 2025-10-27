import { test, expect } from '@playwright/test';

test('AI chat streaming works end-to-end', async ({ page }) => {
  // Navigate to homepage
  await page.goto('/');
  
  // Wait for app to load and auto-login
  await page.waitForSelector('[data-testid="text-username"]', { timeout: 10000 });
  
  // Open Mr Blue chat (click Life CEO card)
  await page.click('text=Life CEO');
  
  // Wait for chat interface to load
  await page.waitForSelector('[data-testid="input-chat"]', { timeout: 5000 });
  
  // Type a test message
  await page.fill('[data-testid="input-chat"]', 'count to 3');
  
  // Send the message
  await page.click('[data-testid="button-send"]');
  
  // Wait for AI response to appear (streaming should complete within 10 seconds)
  await page.waitForSelector('text=/Hi.*GPT.*OpenAI/i', { timeout: 10000 });
  
  // Verify the response contains expected content from the stub
  const responseText = await page.textContent('text=/Hi.*GPT.*OpenAI/i');
  expect(responseText).toContain('GPT-4o');
  
  console.log('✅ AI streaming test passed! Response:', responseText);
});
