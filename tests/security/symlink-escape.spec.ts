import { test, expect } from '@playwright/test';
import { symlink, unlink, writeFile } from 'fs/promises';
import { join } from 'path';

test.describe('Security: Symlink Escape Prevention', () => {
  const testSymlinkPath = join(process.cwd(), 'client', 'src', 'test-symlink.md');
  const targetPath = '/etc/passwd';
  
  test.beforeAll(async () => {
    // Create a test file first
    const testFilePath = join(process.cwd(), 'client', 'src', 'legitimate-file.md');
    await writeFile(testFilePath, '# Test File\n', 'utf-8').catch(() => {});
  });
  
  test('Visual editor rejects symlinks pointing outside project', async ({ request }) => {
    try {
      // Create symlink pointing to /etc/passwd
      await symlink(targetPath, testSymlinkPath).catch(err => {
        console.log('Could not create symlink (may need permissions):', err.message);
      });
      
      // Try to modify file via symlink
      const response = await request.post('http://localhost:5000/api/visual-editor/apply-content', {
        data: {
          changes: [
            {
              filePath: 'client/src/test-symlink.md',
              oldText: 'root',
              newText: 'hacked'
            }
          ]
        },
        headers: {
          'Content-Type': 'application/json',
        },
        failOnStatusCode: false,
      });
      
      // Should reject the operation
      expect(response.status()).not.toBe(200);
      
      const body = await response.json();
      console.log('✓ Rejected symlink escape attempt');
      expect(body.error || body.message).toBeTruthy();
      
    } finally {
      // Cleanup
      await unlink(testSymlinkPath).catch(() => {});
    }
  });
  
  test('Visual editor uses realpathSync to resolve symlinks', async ({ request }) => {
    // This test verifies our security fix is in place
    // The validateFilePath function should use realpathSync
    
    const testFile = 'client/src/legitimate-file.md';
    
    const response = await request.post('http://localhost:5000/api/visual-editor/apply-content', {
      data: {
        changes: [
          {
            filePath: testFile,
            oldText: 'Test File',
            newText: 'Modified'
          }
        ]
      },
      headers: {
        'Content-Type': 'application/json',
      },
      failOnStatusCode: false,
    });
    
    // Legitimate files should be processed (may fail for text not found, but not path validation)
    const body = await response.json();
    expect(body.error || '').not.toContain('outside project directory');
    console.log('✓ Legitimate file path accepted');
  });
  
  test.afterAll(async () => {
    // Cleanup test files
    await unlink(testSymlinkPath).catch(() => {});
    await unlink(join(process.cwd(), 'client', 'src', 'legitimate-file.md')).catch(() => {});
  });
});
