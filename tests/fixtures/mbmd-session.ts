/**
 * MB.MD Session Fixtures for Testing
 * MB.MD Testing Infrastructure - October 28, 2025
 * 
 * Utilities for managing MB.MD sessions in tests:
 * - Create test sessions
 * - Wait for session completion
 * - Verify session evidence
 * - Check session phases
 */

import { Page, APIRequestContext, expect } from '@playwright/test';

export interface MBMDSession {
  id: number;
  userId: number;
  conversationId: number;
  prompt: string;
  status: 'mapping' | 'breakdown' | 'mitigation' | 'deployment' | 'complete' | 'failed';
  currentPhase: string;
  startedAt: string;
  completedAt?: string;
  evidence: {
    screenshots: string[];
    tests: string[];
    logs: string[];
    voiceTranscripts?: string[];
  };
}

/**
 * Create a new MB.MD session
 */
export async function createMBMDSession(
  request: APIRequestContext,
  conversationId: number,
  prompt: string
): Promise<MBMDSession> {
  const response = await request.post('/api/mrblue/build', {
    data: {
      conversationId,
      prompt,
      maxMinutes: 200,
      evidenceLevel: 'comprehensive',
    },
  });
  
  expect(response.ok()).toBeTruthy();
  return await response.json();
}

/**
 * Get session status
 */
export async function getSessionStatus(
  request: APIRequestContext,
  sessionId: number
): Promise<MBMDSession> {
  const response = await request.get(`/api/mbmd/session/${sessionId}`);
  expect(response.ok()).toBeTruthy();
  return await response.json();
}

/**
 * Wait for session to reach specific phase
 */
export async function waitForPhase(
  request: APIRequestContext,
  sessionId: number,
  targetPhase: MBMDSession['status'],
  timeout: number = 60000
): Promise<void> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const session = await getSessionStatus(request, sessionId);
    
    if (session.status === targetPhase || session.status === 'failed') {
      return;
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  throw new Error(`Session ${sessionId} did not reach phase "${targetPhase}" within ${timeout}ms`);
}

/**
 * Wait for session to complete (any terminal state)
 */
export async function waitForSessionComplete(
  request: APIRequestContext,
  sessionId: number,
  timeout: number = 200000 // 200 minutes for autonomous mode
): Promise<MBMDSession> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const session = await getSessionStatus(request, sessionId);
    
    if (session.status === 'complete' || session.status === 'failed') {
      return session;
    }
    
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  throw new Error(`Session ${sessionId} did not complete within ${timeout}ms`);
}

/**
 * Verify session has evidence captured
 */
export async function assertSessionHasEvidence(
  request: APIRequestContext,
  sessionId: number
): Promise<void> {
  const session = await getSessionStatus(request, sessionId);
  
  expect(session.evidence.screenshots.length).toBeGreaterThan(0);
  expect(session.evidence.tests.length).toBeGreaterThan(0);
  expect(session.evidence.logs.length).toBeGreaterThan(0);
}

/**
 * Verify session progressed through all MB.MD phases
 */
export async function assertSessionCompletedAllPhases(
  request: APIRequestContext,
  sessionId: number
): Promise<void> {
  const session = await getSessionStatus(request, sessionId);
  
  // Get session history
  const historyResponse = await request.get(`/api/mbmd/session/${sessionId}/history`);
  const history = await historyResponse.json();
  
  const phases = history.map((h: any) => h.phase);
  
  expect(phases).toContain('mapping');
  expect(phases).toContain('breakdown');
  expect(phases).toContain('mitigation');
  expect(phases).toContain('deployment');
}

/**
 * Cancel a running session
 */
export async function cancelSession(
  request: APIRequestContext,
  sessionId: number
): Promise<void> {
  const response = await request.post(`/api/mbmd/session/${sessionId}/cancel`);
  expect(response.ok()).toBeTruthy();
}

/**
 * Get session evidence URLs for verification
 */
export async function getSessionEvidence(
  request: APIRequestContext,
  sessionId: number
): Promise<MBMDSession['evidence']> {
  const session = await getSessionStatus(request, sessionId);
  return session.evidence;
}
