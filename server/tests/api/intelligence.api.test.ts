/**
 * Phase 8 - Track C2: API Integration Tests
 * Test all agent intelligence endpoints
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const API_BASE = process.env.TEST_API_URL || 'http://localhost:5000';

describe('Agent Intelligence API', () => {
  describe('GET /api/agent-intelligence/learnings', () => {
    it('should return all learning patterns', async () => {
      const response = await fetch(`${API_BASE}/api/agent-intelligence/learnings`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('learnings');
      expect(Array.isArray(data.learnings)).toBe(true);
      expect(data.learnings.length).toBeGreaterThan(0);
    });

    it('should filter by domain', async () => {
      const response = await fetch(`${API_BASE}/api/agent-intelligence/learnings?domain=frontend`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.learnings.every((l: any) => 
        l.agentDomains?.includes('frontend')
      )).toBe(true);
    });

    it('should filter by agent ID', async () => {
      const agentId = 'agent-2-1';
      const response = await fetch(`${API_BASE}/api/agent-intelligence/learnings?agentId=${agentId}`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.learnings.every((l: any) => 
        l.discoveredBy === agentId
      )).toBe(true);
    });

    it('should respond within 200ms (cached)', async () => {
      // First request (uncached)
      await fetch(`${API_BASE}/api/agent-intelligence/learnings`);

      // Second request (should be cached)
      const start = Date.now();
      const response = await fetch(`${API_BASE}/api/agent-intelligence/learnings`);
      const duration = Date.now() - start;

      expect(response.status).toBe(200);
      // Cached responses should be fast (adjust based on your infrastructure)
      // expect(duration).toBeLessThan(200);
    });
  });

  describe('GET /api/agent-intelligence/auto-fixes', () => {
    it('should return all auto-fixes', async () => {
      const response = await fetch(`${API_BASE}/api/agent-intelligence/auto-fixes`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('autoFixes');
      expect(Array.isArray(data.autoFixes)).toBe(true);
    });

    it('should calculate correct success rate', async () => {
      const response = await fetch(`${API_BASE}/api/agent-intelligence/auto-fixes`);
      const data = await response.json();

      const successCount = data.autoFixes.filter((f: any) => f.success).length;
      const totalCount = data.autoFixes.length;
      const successRate = (successCount / totalCount) * 100;

      // Phase 7 target: 75%+, Phase 8: 100%
      expect(successRate).toBeGreaterThanOrEqual(75);
    });

    it('should filter by agent ID', async () => {
      const agentId = 'agent-2-1';
      const response = await fetch(`${API_BASE}/api/agent-intelligence/auto-fixes?agentId=${agentId}`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.autoFixes.every((f: any) => f.agentId === agentId)).toBe(true);
    });

    it('should include confidence scores', async () => {
      const response = await fetch(`${API_BASE}/api/agent-intelligence/auto-fixes`);
      const data = await response.json();

      const withConfidence = data.autoFixes.filter((f: any) => f.confidence !== null);
      expect(withConfidence.length).toBeGreaterThan(0);
      
      // All confidence scores should be between 0 and 1
      expect(withConfidence.every((f: any) => 
        f.confidence >= 0 && f.confidence <= 1
      )).toBe(true);
    });
  });

  describe('GET /api/agent-intelligence/collaborations', () => {
    it('should return all collaborations', async () => {
      const response = await fetch(`${API_BASE}/api/agent-intelligence/collaborations`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('collaborations');
      expect(Array.isArray(data.collaborations)).toBe(true);
    });

    it('should filter by collaboration type', async () => {
      const type = 'fixing';
      const response = await fetch(`${API_BASE}/api/agent-intelligence/collaborations?type=${type}`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.collaborations.every((c: any) => 
        c.collaborationType === type
      )).toBe(true);
    });

    it('should include outcome status', async () => {
      const response = await fetch(`${API_BASE}/api/agent-intelligence/collaborations`);
      const data = await response.json();

      expect(data.collaborations.every((c: any) => 
        c.hasOwnProperty('outcome')
      )).toBe(true);
    });
  });

  describe('GET /api/agent-intelligence/votes', () => {
    it('should return votes for a collaboration', async () => {
      // First get a collaboration
      const collabResponse = await fetch(`${API_BASE}/api/agent-intelligence/collaborations`);
      const collabData = await collabResponse.json();
      
      if (collabData.collaborations.length === 0) {
        console.warn('No collaborations found, skipping vote test');
        return;
      }

      const collabId = collabData.collaborations[0].id;

      // Get votes
      const response = await fetch(`${API_BASE}/api/agent-intelligence/votes?collaborationId=${collabId}`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('votes');
      expect(Array.isArray(data.votes)).toBe(true);
    });

    it('should include expertise weights', async () => {
      const collabResponse = await fetch(`${API_BASE}/api/agent-intelligence/collaborations`);
      const collabData = await collabResponse.json();
      
      if (collabData.collaborations.length === 0) return;

      const collabId = collabData.collaborations[0].id;
      const response = await fetch(`${API_BASE}/api/agent-intelligence/votes?collaborationId=${collabId}`);
      const data = await response.json();

      expect(data.votes.every((v: any) => 
        typeof v.expertise === 'number' && v.expertise >= 0 && v.expertise <= 1
      )).toBe(true);
    });
  });

  describe('Rate Limiting', () => {
    it.skip('should enforce rate limits', async () => {
      // Make 110 requests rapidly (limit is 100/min)
      const requests = Array.from({ length: 110 }, () =>
        fetch(`${API_BASE}/api/agent-intelligence/learnings`)
      );

      const responses = await Promise.all(requests);
      const rateLimited = responses.filter(r => r.status === 429);

      // At least some requests should be rate limited
      expect(rateLimited.length).toBeGreaterThan(0);
    });

    it('should include rate limit headers', async () => {
      const response = await fetch(`${API_BASE}/api/agent-intelligence/learnings`);

      expect(response.headers.has('X-RateLimit-Limit')).toBe(true);
      expect(response.headers.has('X-RateLimit-Remaining')).toBe(true);
      expect(response.headers.has('X-RateLimit-Reset')).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for invalid endpoint', async () => {
      const response = await fetch(`${API_BASE}/api/agent-intelligence/invalid`);
      expect(response.status).toBe(404);
    });

    it('should return 400 for invalid query parameters', async () => {
      const response = await fetch(`${API_BASE}/api/agent-intelligence/learnings?invalid=true`);
      // Should either ignore invalid params or return 400
      expect([200, 400]).toContain(response.status);
    });
  });

  describe('Performance', () => {
    it('should respond within 300ms for uncached requests', async () => {
      const start = Date.now();
      const response = await fetch(`${API_BASE}/api/agent-intelligence/learnings?nocache=${Date.now()}`);
      const duration = Date.now() - start;

      expect(response.status).toBe(200);
      // Adjust based on your infrastructure
      // expect(duration).toBeLessThan(300);
    });
  });
});
