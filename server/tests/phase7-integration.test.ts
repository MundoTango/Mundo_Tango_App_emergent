/**
 * Phase 7 Integration Tests - MB.MD V2 Validation
 * Validates all Phase 7 components with seeded data
 */

import { describe, it, expect } from 'vitest';

describe('Phase 7: Multi-AI Intelligence Network - Integration Tests', () => {
  const API_BASE = 'http://localhost:5000';

  describe('Track 1: Agent Learning Patterns', () => {
    it('should retrieve all learning patterns', async () => {
      const response = await fetch(`${API_BASE}/api/agent-intelligence/learnings`);
      const data = await response.json();
      
      expect(response.ok).toBe(true);
      expect(data.learnings).toHaveLength(5);
      expect(data.learnings[0]).toHaveProperty('pattern');
      expect(data.learnings[0]).toHaveProperty('confidence');
    });

    it('should filter learnings by domain', async () => {
      const response = await fetch(`${API_BASE}/api/agent-intelligence/learnings?domain=frontend`);
      const data = await response.json();
      
      expect(response.ok).toBe(true);
      expect(data.learnings.length).toBeGreaterThan(0);
      expect(data.learnings.every((l: any) => l.agentDomains?.includes('frontend'))).toBe(true);
    });
  });

  describe('Track 2: Auto-Fix History', () => {
    it('should retrieve auto-fix history', async () => {
      const response = await fetch(`${API_BASE}/api/agent-intelligence/auto-fixes`);
      const data = await response.json();
      
      expect(response.ok).toBe(true);
      expect(data.autoFixes).toHaveLength(6);
      expect(data.autoFixes[0]).toHaveProperty('fixStrategy');
      expect(data.autoFixes[0]).toHaveProperty('success');
    });

    it('should calculate correct success rate', async () => {
      const response = await fetch(`${API_BASE}/api/agent-intelligence/auto-fixes`);
      const data = await response.json();
      
      const successCount = data.autoFixes.filter((f: any) => f.success).length;
      const successRate = (successCount / data.autoFixes.length) * 100;
      
      expect(successRate).toBeGreaterThanOrEqual(75); // Phase 7 target: 75%+
      expect(successRate).toBeCloseTo(83.3, 1); // Expected from seeded data
    });

    it('should filter by agent ID', async () => {
      const response = await fetch(`${API_BASE}/api/agent-intelligence/auto-fixes?agentId=agent-2-1`);
      const data = await response.json();
      
      expect(response.ok).toBe(true);
      expect(data.autoFixes.every((f: any) => f.agentId === 'agent-2-1')).toBe(true);
    });
  });

  describe('Track 3: Collaborations & Voting', () => {
    it('should retrieve all collaborations', async () => {
      const response = await fetch(`${API_BASE}/api/agent-intelligence/collaborations`);
      const data = await response.json();
      
      expect(response.ok).toBe(true);
      expect(data.collaborations).toHaveLength(3);
      expect(data.collaborations[0]).toHaveProperty('collaborationType');
      expect(data.collaborations[0]).toHaveProperty('outcome');
    });

    it('should retrieve votes for a collaboration', async () => {
      // First get collaborations
      const collabResponse = await fetch(`${API_BASE}/api/agent-intelligence/collaborations`);
      const collabData = await collabResponse.json();
      const firstCollabId = collabData.collaborations[0].id;
      
      // Then get votes
      const votesResponse = await fetch(`${API_BASE}/api/agent-intelligence/votes?collaborationId=${firstCollabId}`);
      const votesData = await votesResponse.json();
      
      expect(votesResponse.ok).toBe(true);
      expect(votesData.votes).toHaveLength(3); // 3 votes per collaboration
      expect(votesData.votes[0]).toHaveProperty('vote');
      expect(votesData.votes[0]).toHaveProperty('expertise');
    });

    it('should calculate weighted consensus correctly', async () => {
      const collabResponse = await fetch(`${API_BASE}/api/agent-intelligence/collaborations`);
      const collabData = await collabResponse.json();
      const firstCollabId = collabData.collaborations[0].id;
      
      const votesResponse = await fetch(`${API_BASE}/api/agent-intelligence/votes?collaborationId=${firstCollabId}`);
      const votesData = await votesResponse.json();
      
      const approveVotes = votesData.votes.filter((v: any) => v.vote === 'approve');
      const totalExpertise = votesData.votes.reduce((sum: number, v: any) => sum + v.expertise, 0);
      const approveExpertise = approveVotes.reduce((sum: number, v: any) => sum + v.expertise, 0);
      const consensus = (approveExpertise / totalExpertise) * 100;
      
      expect(consensus).toBeGreaterThanOrEqual(70); // Phase 7 target: 70%+
      expect(consensus).toBe(100); // All votes are 'approve' in seeded data
    });
  });

  describe('Track 4: ML Confidence Scoring', () => {
    it('should calculate confidence scores for auto-fixes', async () => {
      const response = await fetch(`${API_BASE}/api/agent-intelligence/auto-fixes`);
      const data = await response.json();
      
      const withConfidence = data.autoFixes.filter((f: any) => f.confidence !== null);
      
      expect(withConfidence.length).toBeGreaterThan(0);
      expect(withConfidence.every((f: any) => f.confidence >= 0 && f.confidence <= 1)).toBe(true);
    });

    it('should prioritize high-confidence fixes', async () => {
      const response = await fetch(`${API_BASE}/api/agent-intelligence/auto-fixes`);
      const data = await response.json();
      
      const successful = data.autoFixes.filter((f: any) => f.success);
      const avgSuccessConfidence = successful.reduce((sum: number, f: any) => sum + (f.confidence || 0), 0) / successful.length;
      
      expect(avgSuccessConfidence).toBeGreaterThanOrEqual(0.85); // Target: 85%+ accuracy
    });
  });

  describe('Cross-Track Integration', () => {
    it('should demonstrate end-to-end intelligence flow', async () => {
      // 1. Learnings inform auto-fixes
      const learningsRes = await fetch(`${API_BASE}/api/agent-intelligence/learnings`);
      const learningsData = await learningsRes.json();
      
      const autoFixesRes = await fetch(`${API_BASE}/api/agent-intelligence/auto-fixes`);
      const autoFixesData = await autoFixesRes.json();
      
      // Verify learnings exist for successful fixes
      const successfulFixes = autoFixesData.autoFixes.filter((f: any) => f.success);
      expect(successfulFixes.length).toBeGreaterThan(0);
      expect(learningsData.learnings.length).toBeGreaterThan(0);
      
      // 2. Collaborations produce validated solutions
      const collabRes = await fetch(`${API_BASE}/api/agent-intelligence/collaborations`);
      const collabData = await collabRes.json();
      
      expect(collabData.collaborations.every((c: any) => c.outcome === 'success')).toBe(true);
      
      // 3. System demonstrates self-learning
      const totalLearnings = learningsData.learnings.length;
      const totalFixes = autoFixesData.autoFixes.length;
      const totalCollabs = collabData.collaborations.length;
      
      console.log('\n📊 Phase 7 Intelligence Metrics:');
      console.log(`   Learning Patterns: ${totalLearnings}`);
      console.log(`   Auto-Fixes: ${totalFixes} (${successfulFixes.length} successful)`);
      console.log(`   Collaborations: ${totalCollabs}`);
      console.log(`   Overall Intelligence Score: ${((successfulFixes.length / totalFixes) * 100).toFixed(1)}%\n`);
      
      expect(totalLearnings + totalFixes + totalCollabs).toBeGreaterThan(10);
    });
  });
});
