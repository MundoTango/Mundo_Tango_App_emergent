/**
 * VALIDATION STREAM 2: Human Approval Flow Integration Test
 * 
 * Tests the complete approval workflow:
 * 1. User triggers high-risk operation
 * 2. System creates approval request
 * 3. Admin receives approval modal
 * 4. Admin approves/rejects
 * 5. System executes or cancels operation
 */

import { describe, it, expect, beforeAll } from '@jest/globals';

// Mock API client for testing
const API_BASE = process.env.VITE_API_URL || 'http://localhost:5000';

describe('Human Approval Flow - Integration Tests', () => {
  let testUserId = 1; // Super admin user
  let approvalRequestId: string;

  describe('Approval Request Creation', () => {
    it('should create approval request for high-risk file deletion', async () => {
      const response = await fetch(`${API_BASE}/api/approvals/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': 'test-auth=super-admin', // Mock auth
        },
        body: JSON.stringify({
          type: 'file_edit',
          operation: 'delete critical-config.json',
          context: {
            filePath: 'server/critical-config.json',
            operation: 'delete',
            reason: 'Testing approval flow',
          },
          riskLevel: 'critical',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.request).toBeDefined();
      expect(data.request.id).toBeDefined();
      expect(data.request.status).toBe('pending');
      expect(data.request.riskLevel).toBe('critical');
      
      approvalRequestId = data.request.id;
      console.log('✅ Approval request created:', approvalRequestId);
    });

    it('should retrieve pending approval requests', async () => {
      const response = await fetch(`${API_BASE}/api/approvals/pending`, {
        method: 'GET',
        headers: {
          'Cookie': 'test-auth=super-admin',
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.requests).toBeDefined();
      expect(Array.isArray(data.requests)).toBe(true);
      expect(data.requests.length).toBeGreaterThan(0);
      
      console.log(`✅ Found ${data.requests.length} pending approval(s)`);
    });
  });

  describe('Approval Decision', () => {
    it('should approve the request successfully', async () => {
      const response = await fetch(`${API_BASE}/api/approvals/${approvalRequestId}/approve`, {
        method: 'POST',
        headers: {
          'Cookie': 'test-auth=super-admin',
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.request.status).toBe('approved');
      expect(data.request.approvedBy).toBe(testUserId);
      expect(data.request.approvedAt).toBeDefined();
      
      console.log('✅ Approval request approved');
    });

    it('should verify approved request is no longer pending', async () => {
      const response = await fetch(`${API_BASE}/api/approvals/pending`, {
        method: 'GET',
        headers: {
          'Cookie': 'test-auth=super-admin',
        },
      });

      const data = await response.json();
      const stillPending = data.requests.find((r: any) => r.id === approvalRequestId);
      
      expect(stillPending).toBeUndefined();
      console.log('✅ Approved request removed from pending queue');
    });
  });

  describe('Rejection Flow', () => {
    let rejectionRequestId: string;

    it('should create another approval request for rejection test', async () => {
      const response = await fetch(`${API_BASE}/api/approvals/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': 'test-auth=super-admin',
        },
        body: JSON.stringify({
          type: 'terminal_command',
          operation: 'rm -rf /',
          context: { command: 'rm -rf /', risk: 'critical' },
          riskLevel: 'critical',
        }),
      });

      const data = await response.json();
      rejectionRequestId = data.request.id;
      console.log('✅ Rejection test request created:', rejectionRequestId);
    });

    it('should reject the request with reason', async () => {
      const response = await fetch(`${API_BASE}/api/approvals/${rejectionRequestId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': 'test-auth=super-admin',
        },
        body: JSON.stringify({
          reason: 'Extremely dangerous command - absolutely not allowed',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.request.status).toBe('rejected');
      expect(data.request.rejectionReason).toContain('dangerous');
      
      console.log('✅ Request rejected successfully with reason');
    });
  });
});

export {};
