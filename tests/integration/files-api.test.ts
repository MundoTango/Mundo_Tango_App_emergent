/**
 * STREAM 2: Files API Integration Tests
 * Tests enhanced Files API (/api/files-v2) with security validation
 */

import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:5000';

test.describe('Files API - Enhanced (/api/files-v2)', () => {
  
  test('GET /tree - should return project file tree', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/files-v2/tree`);
    
    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.tree).toBeDefined();
    expect(body.data.tree.type).toBe('directory');
    expect(body.data.tree.children).toBeDefined();
    expect(Array.isArray(body.data.tree.children)).toBe(true);
    
    console.log('✅ File tree returned:', body.data.tree.children?.length, 'items');
  });

  test('GET /tree - should filter node_modules and .git', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/files-v2/tree`);
    const body = await response.json();
    
    const hasNodeModules = body.data.tree.children?.some((n: any) => n.name === 'node_modules');
    const hasGit = body.data.tree.children?.some((n: any) => n.name === '.git');
    
    expect(hasNodeModules).toBe(false);
    expect(hasGit).toBe(false);
    
    console.log('✅ Sensitive folders filtered correctly');
  });

  test('GET /read - should read package.json', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/files-v2/read?filePath=package.json`);
    
    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.content).toContain('"name"');
    expect(body.data.content).toContain('"version"');
    
    console.log('✅ File read successful');
  });

  test('SECURITY: GET /read - should block directory traversal', async ({ request }) => {
    const attacks = [
      '../../../etc/passwd',
      '../../evil.sh',
      '/etc/passwd',
      'client/../../server/../../../etc/passwd'
    ];
    
    for (const attack of attacks) {
      const response = await request.get(`${API_BASE}/api/files-v2/read?filePath=${encodeURIComponent(attack)}`);
      
      expect(response.status()).toBe(403);
      
      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error).toContain('Access denied');
      
      console.log(`✅ Blocked attack: ${attack}`);
    }
  });

  test('POST /write - should create test file', async ({ request }) => {
    const testContent = `// Test file created at ${new Date().toISOString()}\nconsole.log('test');`;
    
    const response = await request.post(`${API_BASE}/api/files-v2/write`, {
      data: {
        filePath: 'test-write-temp.js',
        content: testContent
      }
    });
    
    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(body.success).toBe(true);
    
    console.log('✅ File written successfully');
  });

  test('POST /create - should create directory', async ({ request }) => {
    const response = await request.post(`${API_BASE}/api/files-v2/create`, {
      data: {
        filePath: 'test-dir-temp',
        type: 'directory'
      }
    });
    
    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(body.success).toBe(true);
    
    console.log('✅ Directory created successfully');
  });

  test('DELETE /delete - should delete test file', async ({ request }) => {
    const response = await request.delete(`${API_BASE}/api/files-v2/delete?filePath=test-write-temp.js`);
    
    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(body.success).toBe(true);
    
    console.log('✅ File deleted successfully');
  });

  test('SECURITY: POST /write - should block path traversal', async ({ request }) => {
    const response = await request.post(`${API_BASE}/api/files-v2/write`, {
      data: {
        filePath: '../../evil.sh',
        content: 'rm -rf /'
      }
    });
    
    expect(response.status()).toBe(403);
    
    const body = await response.json();
    expect(body.success).toBe(false);
    
    console.log('✅ Blocked write attack');
  });

  test('ROUND-TRIP: tree → read should work with absolute paths', async ({ request }) => {
    // Step 1: Get file tree
    const treeResponse = await request.get(`${API_BASE}/api/files-v2/tree`);
    const treeBody = await treeResponse.json();
    
    // Step 2: Find package.json in tree
    const packageJson = treeBody.data.tree.children?.find((n: any) => n.name === 'package.json');
    expect(packageJson).toBeDefined();
    
    console.log('📍 package.json path from tree:', packageJson.path);
    
    // Step 3: Use absolute path from tree to read file
    const readResponse = await request.get(`${API_BASE}/api/files-v2/read?filePath=${encodeURIComponent(packageJson.path)}`);
    
    expect(readResponse.status()).toBe(200);
    
    const readBody = await readResponse.json();
    expect(readBody.success).toBe(true);
    expect(readBody.data.content).toContain('"name"');
    
    console.log('✅ Round-trip test passed: tree → read with absolute path works!');
  });
});
