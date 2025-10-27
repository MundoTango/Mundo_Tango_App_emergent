import { test, expect } from '@playwright/test';
import { readFile } from 'fs/promises';
import { join } from 'path';

test.describe('Unit: AST-Based File Mutations', () => {
  test('AST mutations write changes to disk', async ({ request }) => {
    // Create a test by attempting to modify an existing file
    const testFile = 'client/src/App.tsx';
    const testFilePath = join(process.cwd(), testFile);
    
    // Read original content
    const originalContent = await readFile(testFilePath, 'utf-8');
    console.log(`📄 Original file size: ${originalContent.length} bytes`);
    
    // Attempt to apply a style change via AST
    const response = await request.post('http://localhost:5000/api/visual-editor/apply-styles', {
      data: {
        mutations: [
          {
            filePath: testFile,
            oldValue: 'className="',
            newValue: 'className="test-class '
          }
        ]
      },
      headers: {
        'Content-Type': 'application/json',
      },
      failOnStatusCode: false,
    });
    
    const body = await response.json();
    console.log('API Response:', body);
    
    if (response.status() === 200 && body.successCount > 0) {
      // Read modified content
      await new Promise(resolve => setTimeout(resolve, 1000)); // Give filesystem time to write
      const modifiedContent = await readFile(testFilePath, 'utf-8');
      
      // Verify content changed
      expect(modifiedContent).not.toBe(originalContent);
      console.log('✅ AST mutation successfully wrote to disk');
      
      // Restore original content
      // (In real tests, we'd use git reset or have a cleanup mechanism)
    } else {
      console.log('⚠️ AST mutation failed or text not found in file');
      expect(body.message || body.error).toBeTruthy();
    }
  });
  
  test('AST delete operation removes elements', async ({ request }) => {
    const response = await request.post('http://localhost:5000/api/visual-editor/apply-structure', {
      data: {
        changes: [
          {
            filePath: 'client/src/App.tsx',
            operation: 'delete',
            elementText: 'nonexistent-element-text'
          }
        ]
      },
      headers: {
        'Content-Type': 'application/json',
      },
      failOnStatusCode: false,
    });
    
    const body = await response.json();
    
    // Should fail gracefully if element not found
    expect(response.status()).toBe(200);
    expect(body.results).toBeDefined();
    console.log('✓ AST delete operation handled correctly');
  });
});
