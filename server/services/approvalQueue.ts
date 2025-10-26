/**
 * STREAM 2: Guardrails - Human-in-the-Loop Approval Queue
 * 
 * High-risk operations require human approval before execution
 * Research: docs/research/AUTONOMOUS_CODING_RESEARCH.md
 */

import { logger } from '../lib/logger';
import { randomUUID } from 'crypto';

export interface ApprovalRequest {
  id: string;
  type: 'file_edit' | 'terminal_command' | 'deployment' | 'database_migration';
  operation: string;
  context: any;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  requestedBy: number; // User ID
  requestedAt: Date;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  approvedBy?: number;
  approvedAt?: Date;
  rejectedBy?: number;
  rejectedAt?: Date;
  rejectionReason?: string;
  expiresAt: Date;
}

/**
 * Approval queue service for human-in-the-loop gates
 */
export class ApprovalQueue {
  private queue: Map<string, ApprovalRequest> = new Map();
  private expiryCheckInterval: NodeJS.Timeout;

  constructor() {
    // Check for expired requests every minute
    this.expiryCheckInterval = setInterval(() => {
      this.checkExpiredRequests();
    }, 60000);

    logger.info('[ApprovalQueue] Initialized');
  }

  /**
   * Create approval request
   */
  async createRequest(
    type: ApprovalRequest['type'],
    operation: string,
    context: any,
    requestedBy: number,
    riskLevel: ApprovalRequest['riskLevel'] = 'medium'
  ): Promise<ApprovalRequest> {
    const id = randomUUID();

    // High/critical risk expires in 5 minutes, low/medium in 15 minutes
    const expiryMinutes = riskLevel === 'high' || riskLevel === 'critical' ? 5 : 15;
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    const request: ApprovalRequest = {
      id,
      type,
      operation,
      context,
      riskLevel,
      requestedBy,
      requestedAt: new Date(),
      status: 'pending',
      expiresAt,
    };

    this.queue.set(id, request);

    logger.info({
      requestId: id,
      type,
      riskLevel,
      operation: operation.substring(0, 100),
    }, '[ApprovalQueue] Request created');

    return request;
  }

  /**
   * Approve request
   */
  async approve(requestId: string, approvedBy: number): Promise<ApprovalRequest | null> {
    const request = this.queue.get(requestId);

    if (!request) {
      logger.warn({ requestId }, '[ApprovalQueue] Request not found');
      return null;
    }

    if (request.status !== 'pending') {
      logger.warn({ requestId, status: request.status }, '[ApprovalQueue] Request already processed');
      return null;
    }

    if (new Date() > request.expiresAt) {
      request.status = 'expired';
      logger.warn({ requestId }, '[ApprovalQueue] Request expired');
      return null;
    }

    request.status = 'approved';
    request.approvedBy = approvedBy;
    request.approvedAt = new Date();

    this.queue.set(requestId, request);

    logger.info({
      requestId,
      approvedBy,
      type: request.type,
    }, '[ApprovalQueue] Request approved');

    return request;
  }

  /**
   * Reject request
   */
  async reject(requestId: string, rejectedBy: number, reason?: string): Promise<ApprovalRequest | null> {
    const request = this.queue.get(requestId);

    if (!request) {
      logger.warn({ requestId }, '[ApprovalQueue] Request not found');
      return null;
    }

    if (request.status !== 'pending') {
      logger.warn({ requestId, status: request.status }, '[ApprovalQueue] Request already processed');
      return null;
    }

    request.status = 'rejected';
    request.rejectedBy = rejectedBy;
    request.rejectedAt = new Date();
    request.rejectionReason = reason;

    this.queue.set(requestId, request);

    logger.info({
      requestId,
      rejectedBy,
      reason,
    }, '[ApprovalQueue] Request rejected');

    return request;
  }

  /**
   * Get request by ID
   */
  getRequest(requestId: string): ApprovalRequest | null {
    return this.queue.get(requestId) || null;
  }

  /**
   * Get all pending requests
   */
  getPendingRequests(userId?: number): ApprovalRequest[] {
    const pending = Array.from(this.queue.values()).filter(
      (r) => r.status === 'pending' && new Date() <= r.expiresAt
    );

    if (userId) {
      return pending.filter((r) => r.requestedBy === userId);
    }

    return pending;
  }

  /**
   * Wait for approval decision (with timeout)
   */
  async waitForDecision(requestId: string, timeoutMs: number = 300000): Promise<'approved' | 'rejected' | 'timeout'> {
    const startTime = Date.now();

    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        const request = this.queue.get(requestId);

        if (!request) {
          clearInterval(checkInterval);
          resolve('timeout');
          return;
        }

        if (request.status === 'approved') {
          clearInterval(checkInterval);
          resolve('approved');
          return;
        }

        if (request.status === 'rejected' || request.status === 'expired') {
          clearInterval(checkInterval);
          resolve('rejected');
          return;
        }

        // Timeout check
        if (Date.now() - startTime > timeoutMs) {
          clearInterval(checkInterval);
          request.status = 'expired';
          this.queue.set(requestId, request);
          resolve('timeout');
          return;
        }
      }, 1000); // Check every second
    });
  }

  /**
   * Check and expire old requests
   */
  private checkExpiredRequests(): void {
    const now = new Date();
    let expiredCount = 0;

    for (const [id, request] of this.queue.entries()) {
      if (request.status === 'pending' && now > request.expiresAt) {
        request.status = 'expired';
        this.queue.set(id, request);
        expiredCount++;
      }
    }

    if (expiredCount > 0) {
      logger.info({ expiredCount }, '[ApprovalQueue] Expired pending requests');
    }
  }

  /**
   * Cleanup old requests (keep last 100)
   */
  cleanup(): void {
    const requests = Array.from(this.queue.values())
      .sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime());

    if (requests.length > 100) {
      const toRemove = requests.slice(100);
      for (const request of toRemove) {
        this.queue.delete(request.id);
      }
      logger.info({ removed: toRemove.length }, '[ApprovalQueue] Cleaned up old requests');
    }
  }

  /**
   * Shutdown
   */
  shutdown(): void {
    if (this.expiryCheckInterval) {
      clearInterval(this.expiryCheckInterval);
    }
    logger.info('[ApprovalQueue] Shutdown complete');
  }
}

// Export singleton instance
export const approvalQueue = new ApprovalQueue();
