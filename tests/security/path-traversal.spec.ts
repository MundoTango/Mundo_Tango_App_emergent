import { test, expect } from '@playwright/test';

test.describe('Security: Path Traversal Prevention', () => {
  test('Visual editor rejects path traversal attempts', async ({ request }) => {
    const maliciousPaths = [
      '../../../etc/passwd',
      '../../.ssh/id_rsa',
      '../../../../../proc/self/environ',
      '..\\..\\..\\windows\\system32\\config\\sam',
      '/etc/passwd',
      '/etc/shadow',
      'C:\\Windows\\System32\\config\\SAM',
    ];
    
    for (const path of maliciousPaths) {
      const response = await request.post('http://localhost:5000/api/visual-editor/apply-content', {
        data: {
          changes: [
            {
              filePath: path,
              oldText: 'test',
              newText: 'test2'
            }
          ]
        },
        headers: {
          'Content-Type': 'application/json',
        },
        failOnStatusCode: false,
      });
      
      // Should reject with error
      expect(response.status()).not.toBe(200);
      
      const body = await response.json();
      console.log(`✓ Rejected path: ${path}`);
      const errorMessage = body.error || body.message || '';
      const hasExpectedError = errorMessage.includes('Invalid file path') || errorMessage.includes('Absolute paths not allowed');
      expect(hasExpectedError).toBe(true);
    }
  });
  
  test('Visual editor only allows project files', async ({ request }) => {
    const validPaths = [
      'client/src/App.tsx',
      'server/routes/test.ts',
      './shared/schema.ts',
    ];
    
    for (const path of validPaths) {
      const response = await request.post('http://localhost:5000/api/visual-editor/apply-content', {
        data: {
          changes: [
            {
              filePath: path,
              oldText: 'nonexistent-text-should-not-match',
              newText: 'test'
            }
          ]
        },
        headers: {
          'Content-Type': 'application/json',
        },
        failOnStatusCode: false,
      });
      
      // Should not reject based on path validation
      // (may fail for other reasons like file not found, text not matching)
      const body = await response.json();
      expect(body.error || '').not.toContain('Absolute paths not allowed');
      console.log(`✓ Accepted valid path: ${path} (status: ${response.status()})`);
    }
  });
});
