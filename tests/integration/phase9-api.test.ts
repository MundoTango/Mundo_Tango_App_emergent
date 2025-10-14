import { describe, it, expect, beforeAll } from 'vitest';

describe('Phase 9 API Endpoints', () => {
  let authToken: string;
  
  beforeAll(async () => {
    // Login to get auth token
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@test.com',
        password: 'Test123!@#'
      })
    });
    
    const data = await response.json();
    authToken = data.token;
  });

  describe('Agent Metadata API', () => {
    it('should return all Phase 9 agents', async () => {
      const response = await fetch('http://localhost:5000/api/phase9/agents/metadata', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data.agents).toHaveLength(7);
      expect(data.agents[0].id).toBe(110);
    });
    
    it('should include expert sources for each agent', async () => {
      const response = await fetch('http://localhost:5000/api/phase9/agents/110/sources', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data.sources).toHaveLength(10);
      expect(data.sources[0]).toHaveProperty('name');
      expect(data.sources[0]).toHaveProperty('expertise');
    });
  });

  describe('Code Intelligence API (Agent 110)', () => {
    it('should analyze TypeScript code', async () => {
      const response = await fetch('http://localhost:5000/api/phase9/code-intelligence/analyze', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: 'const add = (a: number, b: number): number => a + b;',
          language: 'typescript'
        })
      });
      
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data).toHaveProperty('ast');
      expect(data).toHaveProperty('analysis');
    });
  });

  describe('Visual Preview API (Agent 111)', () => {
    it('should generate component preview', async () => {
      const response = await fetch('http://localhost:5000/api/phase9/visual-preview/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: 'const Button = () => <button>Click me</button>;',
          framework: 'react'
        })
      });
      
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data).toHaveProperty('preview');
      expect(data.preview).toHaveProperty('html');
    });
  });

  describe('Predictive Planning API (Agent 114)', () => {
    it('should predict task duration', async () => {
      const response = await fetch('http://localhost:5000/api/phase9/predictive-planning/estimate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          taskType: 'feature_implementation',
          complexity: 'medium',
          historicalData: []
        })
      });
      
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data).toHaveProperty('estimatedDuration');
      expect(data).toHaveProperty('confidence');
    });
  });

  describe('Dependency Mapping API (Agent 116)', () => {
    it('should map project dependencies', async () => {
      const response = await fetch('http://localhost:5000/api/phase9/dependency-mapper/analyze', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectId: 1
        })
      });
      
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data).toHaveProperty('graph');
      expect(data.graph).toHaveProperty('nodes');
      expect(data.graph).toHaveProperty('edges');
    });
  });
});

describe('Analytics API', () => {
  it('should accept Web Vitals data', async () => {
    const response = await fetch('http://localhost:5000/api/analytics/vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'LCP',
        value: 1500,
        id: 'v3-123',
        rating: 'good',
        url: '/',
        timestamp: Date.now()
      })
    });
    
    expect(response.ok).toBe(true);
  });
});

describe('Push Notifications API', () => {
  it('should accept push subscription', async () => {
    const response = await fetch('http://localhost:5000/api/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        endpoint: 'https://fcm.googleapis.com/fcm/send/test',
        keys: {
          p256dh: 'test-key',
          auth: 'test-auth'
        }
      })
    });
    
    expect(response.ok).toBe(true);
  });
});
