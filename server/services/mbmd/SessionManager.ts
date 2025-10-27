/**
 * MB.MD Session Manager
 * Coordinates all phases of MB.MD workflow
 * Phase 0: Shared Infrastructure - Oct 27, 2025
 */

import { db } from '../../db';
import { mbmdSessions } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { EvidenceCollector } from './EvidenceCollector';
import { QAAgent } from './QAAgent';
import { ArchitectReviewService } from './ArchitectReviewService';

export interface SessionConfig {
  feature: string;
  userId?: number;
  executionMode?: 'FOCUSED' | 'PARALLEL' | 'SIMULTANEOUS';
}

export class SessionManager {
  private sessionId?: number;
  private evidenceCollector?: EvidenceCollector;
  private qaAgent: QAAgent;
  private architectService: ArchitectReviewService;

  constructor() {
    this.qaAgent = new QAAgent();
    this.architectService = new ArchitectReviewService();
  }

  async startSession(config: SessionConfig): Promise<number> {
    const [session] = await db.insert(mbmdSessions).values({
      feature: config.feature,
      userId: config.userId,
      status: 'mapping',
      executionMode: config.executionMode || 'FOCUSED',
      metadata: {}
    }).returning();

    this.sessionId = session.id;
    this.evidenceCollector = new EvidenceCollector(session.id);
    await this.evidenceCollector.initialize();

    console.log('[SessionManager] Session started:', this.sessionId, 'Feature:', config.feature);

    return this.sessionId;
  }

  async updatePhase(phase: 'mapping' | 'breakdown' | 'mitigation' | 'deployment'): Promise<void> {
    if (!this.sessionId) {
      throw new Error('No active session');
    }

    await db.update(mbmdSessions)
      .set({ status: phase })
      .where(eq(mbmdSessions.id, this.sessionId));

    console.log('[SessionManager] Phase updated:', phase);
  }

  async completeSession(): Promise<void> {
    if (!this.sessionId) {
      throw new Error('No active session');
    }

    await db.update(mbmdSessions)
      .set({ 
        status: 'complete',
        completedAt: new Date()
      })
      .where(eq(mbmdSessions.id, this.sessionId));

    console.log('[SessionManager] Session completed:', this.sessionId);
  }

  async failSession(reason: string): Promise<void> {
    if (!this.sessionId) {
      throw new Error('No active session');
    }

    await db.update(mbmdSessions)
      .set({ 
        status: 'failed',
        metadata: { failureReason: reason }
      })
      .where(eq(mbmdSessions.id, this.sessionId));

    console.log('[SessionManager] Session failed:', this.sessionId, 'Reason:', reason);
  }

  getSessionId(): number | undefined {
    return this.sessionId;
  }

  getEvidenceCollector(): EvidenceCollector {
    if (!this.evidenceCollector) {
      throw new Error('No active session');
    }
    return this.evidenceCollector;
  }

  getQAAgent(): QAAgent {
    return this.qaAgent;
  }

  getArchitectService(): ArchitectReviewService {
    return this.architectService;
  }
}
