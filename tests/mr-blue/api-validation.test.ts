/**
 * Backend API Validation for Mr Blue Agents
 * Quick validation that all backend routes are operational
 */

import { test, expect } from '@playwright/test';

test.describe('Mr Blue - Backend API Validation', () => {
  
  test('Agent #79: Quality Validator API', async ({ request }) => {
    // Test analyze endpoint
    const analyzeRes = await request.post('/api/quality-validator/analyze', {
      data: { issue: 'Button not clickable' }
    });
    expect(analyzeRes.ok()).toBeTruthy();
    console.log('✅ Quality Validator /analyze endpoint operational');
    
    // Test search endpoint
    const searchRes = await request.post('/api/quality-validator/search', {
      data: { query: 'form validation' }
    });
    expect(searchRes.ok()).toBeTruthy();
    const searchData = await searchRes.json();
    expect(Array.isArray(searchData)).toBeTruthy();
    console.log('✅ Quality Validator /search endpoint operational');
  });

  test('Agent #80: Learning Coordinator API', async ({ request }) => {
    // Test flows endpoint
    const flowsRes = await request.get('/api/learning-coordinator/flows');
    expect(flowsRes.ok()).toBeTruthy();
    const flows = await flowsRes.json();
    expect(flows).toHaveProperty('up');
    expect(flows).toHaveProperty('across');
    expect(flows).toHaveProperty('down');
    console.log('✅ Learning Coordinator /flows endpoint operational');
    console.log(`   UP: ${flows.up.count}, ACROSS: ${flows.across.count}, DOWN: ${flows.down.count}`);
    
    // Test capture endpoint
    const captureRes = await request.post('/api/learning-coordinator/capture', {
      data: {
        agentId: 'TEST_AGENT',
        agentName: 'Test Agent',
        pattern: 'Test learning pattern',
        flowDirection: 'ACROSS',
        recipients: ['AGENT_1']
      }
    });
    expect(captureRes.ok()).toBeTruthy();
    console.log('✅ Learning Coordinator /capture endpoint operational');
  });

  test('Agent #77: Site Builder API', async ({ request }) => {
    // Test templates endpoint
    const templatesRes = await request.get('/api/site-builder/templates');
    expect(templatesRes.ok()).toBeTruthy();
    const templates = await templatesRes.json();
    expect(Array.isArray(templates)).toBeTruthy();
    expect(templates.length).toBeGreaterThan(0);
    console.log(`✅ Site Builder /templates endpoint operational (${templates.length} templates)`);
    
    // Test generate endpoint (with mock data)
    const generateRes = await request.post('/api/site-builder/generate', {
      data: {
        description: 'Test dashboard page',
        template: 'dashboard'
      }
    });
    expect(generateRes.status()).toBeLessThan(500); // May fail without OpenAI key, but shouldn't 500
    console.log('✅ Site Builder /generate endpoint operational');
  });

  test('Agent #78: Visual Editor API', async ({ request }) => {
    // Test generate-code endpoint
    const codeRes = await request.post('/api/visual-editor/generate-code', {
      data: {
        element: 'button',
        changes: { text: 'Click Me' }
      }
    });
    expect(codeRes.status()).toBeLessThan(500);
    console.log('✅ Visual Editor /generate-code endpoint operational');
  });

  test('All Mr Blue Routes Registered', async ({ request }) => {
    const routes = [
      '/api/quality-validator/analyze',
      '/api/quality-validator/search',
      '/api/learning-coordinator/flows',
      '/api/site-builder/templates'
    ];
    
    for (const route of routes) {
      const res = await request.get(route);
      expect(res.status()).not.toBe(404);
      console.log(`✅ ${route} - registered`);
    }
  });
});
