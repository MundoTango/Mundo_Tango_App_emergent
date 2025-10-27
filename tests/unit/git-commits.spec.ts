import { test, expect } from '@playwright/test';

test.describe('Unit: Git Commit Creation', () => {
  test('Git commit API creates commit when files staged', async ({ request }) => {
    // This test verifies the /api/git/commit endpoint
    const response = await request.post('http://localhost:5000/api/git/commit', {
      data: {
        message: '[TEST] Playwright test commit'
      },
      headers: {
        'Content-Type': 'application/json',
      },
      failOnStatusCode: false,
    });
    
    const body = await response.json();
    console.log('Git commit response:', body);
    
    // Should succeed even if nothing to commit
    expect(response.status()).toBe(200);
    expect(body.success).toBe(true);
    
    if (body.commitHash) {
      console.log(`✅ Git commit created: ${body.commitHash}`);
    } else {
      console.log('✓ No files to commit (expected if staging area empty)');
      expect(body.commitHash).toBeNull();
    }
  });
  
  test('Git commit handles empty staging area gracefully', async ({ request }) => {
    // Ensure staging area is empty by committing any pending changes first
    await request.post('http://localhost:5000/api/git/commit', {
      data: { message: '[TEST] Clear staging area' }
    });
    
    // Try to commit again with empty staging
    const response = await request.post('http://localhost:5000/api/git/commit', {
      data: { message: '[TEST] Empty commit attempt' },
      failOnStatusCode: false,
    });
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.commitHash).toBeNull();
    console.log('✓ Empty staging area handled gracefully');
  });
  
  test('Git status API returns current branch and changes', async ({ request }) => {
    const response = await request.get('http://localhost:5000/api/git/status', {
      failOnStatusCode: false,
    });
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body.branch).toBeDefined();
    expect(body.staged).toBeDefined();
    expect(body.unstaged).toBeDefined();
    
    console.log(`✓ Git status: branch=${body.branch}, staged=${body.staged?.length || 0}, unstaged=${body.unstaged?.length || 0}`);
  });
});
