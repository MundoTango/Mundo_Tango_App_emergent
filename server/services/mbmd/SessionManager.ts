/**
 * MB.MD Session Manager - Enhanced with Full Orchestration
 * Coordinates all phases of MB.MD workflow
 * FIX #2: Complete orchestration service
 * Phase 0: Shared Infrastructure - Oct 27, 2025
 */

import { db } from '../../db';
import { mbmdSessions, mbmdEvidence, mbmdReviews } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { EvidenceCollector } from './EvidenceCollector';
import { QAAgent } from './QAAgent';
import { ArchitectReviewService } from './ArchitectReviewService';
import { createMBMDLogger } from './Logger';

export interface SessionConfig {
  feature: string;
  userId?: number;
  executionMode?: 'FOCUSED' | 'PARALLEL' | 'SIMULTANEOUS';
}

interface MappingResult {
  intent?: string;
  documentationRead?: string[];
  dataStructures?: any;
  executionMode?: string;
  integrationPoints?: string[];
  toolsRequired?: string[];
  requiresArchitectReview?: boolean;
}

export class SessionManager {
  private sessionId?: number;
  private evidenceCollector?: EvidenceCollector;
  private qaAgent: QAAgent;
  private architectService: ArchitectReviewService;
  private logger = createMBMDLogger('session-manager', undefined);

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

  /**
   * FIX #2: Record evidence for a phase
   */
  async recordEvidence(
    sessionId: number,
    phase: 'MAPPING' | 'BREAKDOWN' | 'MITIGATION' | 'DEPLOYMENT',
    evidenceType: string,
    evidencePath?: string | null,
    evidenceData?: any
  ): Promise<any> {
    this.logger.mapping(`Recording evidence for session ${sessionId}`, { phase, evidenceType });

    const [evidence] = await db.insert(mbmdEvidence).values({
      sessionId,
      phase,
      evidenceType,
      evidencePath: evidencePath || null,
      evidenceData: evidenceData || null,
      metadata: { recordedAt: new Date().toISOString() },
      timestamp: new Date()
    }).returning();

    return evidence;
  }

  /**
   * FIX #2: Get all evidence for a session
   */
  async getSessionEvidence(sessionId: number): Promise<any[]> {
    const evidence = await db.select()
      .from(mbmdEvidence)
      .where(eq(mbmdEvidence.sessionId, sessionId))
      .orderBy(desc(mbmdEvidence.timestamp));

    return evidence;
  }

  /**
   * FIX #2: Request a review (architect or QA)
   */
  async requestReview(
    sessionId: number,
    reviewer: 'architect' | 'qa',
    phase: string
  ): Promise<any> {
    this.logger.mitigation(`Requesting ${reviewer} review for session ${sessionId}`, { phase });

    const evidence = await this.getSessionEvidence(sessionId);

    const [review] = await db.insert(mbmdReviews).values({
      sessionId,
      reviewer,
      phase,
      approved: false,
      feedback: 'Review pending...',
      metadata: { evidenceCount: evidence.length },
      reviewedAt: new Date()
    }).returning();

    return review;
  }

  /**
   * FIX #2: Integration - Notify chat mapping complete
   */
  async notifyChatMapping(sessionId: number, mappingResult: MappingResult): Promise<void> {
    this.logger.mapping('Chat mapping notification received', { sessionId });

    await this.recordEvidence(
      sessionId,
      'MAPPING',
      'chat_mapping',
      null,
      {
        intent: mappingResult.intent,
        documentationRead: mappingResult.documentationRead,
        executionMode: mappingResult.executionMode,
        toolsRequired: mappingResult.toolsRequired
      }
    );

    if (mappingResult.requiresArchitectReview) {
      await this.requestReview(sessionId, 'architect', 'MAPPING');
    }
  }

  /**
   * FIX #2: Integration - Notify visual editor mapping complete
   */
  async notifyVisualEditorMapping(sessionId: number, mappingResult: any): Promise<void> {
    this.logger.mapping('Visual editor mapping notification received', { sessionId });

    await this.recordEvidence(
      sessionId,
      'MAPPING',
      'visual_editor_mapping',
      null,
      {
        componentDocs: mappingResult.componentDocs,
        scope: mappingResult.scope,
        integrationPoints: mappingResult.integrationPoints
      }
    );
  }

  /**
   * FIX #2: Integration - Notify VibeGraph phase transition
   */
  async notifyVibeGraphPhase(
    sessionId: number,
    phase: 'MAPPING' | 'BREAKDOWN' | 'MITIGATION' | 'DEPLOYMENT',
    data: any
  ): Promise<void> {
    this.logger.mapping(`VibeGraph ${phase} phase notification`, { sessionId });

    await this.recordEvidence(
      sessionId,
      phase,
      `vibe_graph_${phase.toLowerCase()}`,
      null,
      data
    );
  }

  /**
   * FIX #2: Verify session ownership (security)
   */
  async verifySessionOwnership(sessionId: number, userId: number): Promise<boolean> {
    const [session] = await db.select()
      .from(mbmdSessions)
      .where(and(
        eq(mbmdSessions.id, sessionId),
        eq(mbmdSessions.userId, userId)
      ))
      .limit(1);

    return !!session;
  }
}

// Export singleton for global access
export const mbmdSessionManager = new SessionManager();
