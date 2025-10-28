/**
 * MB.MD Evidence Collector Service
 * Phase 0: Shared Infrastructure - Oct 27, 2025
 */

import { db } from '../../db';
import { mbmdEvidence, InsertMbmdEvidence } from '@shared/schema';
import fs from 'fs/promises';
import path from 'path';

export interface EvidenceArtifact {
  type: 'screenshot' | 'log' | 'test' | 'document' | 'bundle';
  phase: 'MAPPING' | 'BREAKDOWN' | 'MITIGATION' | 'DEPLOYMENT';
  data?: any;
  path?: string;
  metadata?: Record<string, any>;
}

export class EvidenceCollector {
  private sessionId: number;
  private evidenceDir: string;

  constructor(sessionId: number) {
    this.sessionId = sessionId;
    this.evidenceDir = path.join(process.cwd(), 'tests', 'evidence', `session-${sessionId}`);
  }

  async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.evidenceDir, { recursive: true });
      console.log('[EvidenceCollector] Initialized:', this.evidenceDir);
    } catch (error) {
      console.error('[EvidenceCollector] Failed to create directory:', error);
    }
  }

  async collect(artifact: EvidenceArtifact): Promise<number> {
    let evidencePath: string | null = null;
    let evidenceData: any = null;

    // If artifact has inline data, store it
    if (artifact.data) {
      evidenceData = artifact.data;
    }

    // If artifact has file path, copy/reference it
    if (artifact.path) {
      evidencePath = artifact.path;
    }

    // Insert into database
    const [evidence] = await db.insert(mbmdEvidence).values({
      sessionId: this.sessionId,
      phase: artifact.phase,
      evidenceType: artifact.type,
      evidencePath,
      evidenceData,
      metadata: artifact.metadata || {},
    }).returning();

    console.log(`[EvidenceCollector] Collected ${artifact.type} for ${artifact.phase}:`, evidence.id);

    return evidence.id;
  }

  async collectMultiple(artifacts: EvidenceArtifact[]): Promise<number[]> {
    const ids: number[] = [];
    for (const artifact of artifacts) {
      const id = await this.collect(artifact);
      ids.push(id);
    }
    return ids;
  }

  async saveFile(filename: string, content: string): Promise<string> {
    const filePath = path.join(this.evidenceDir, filename);
    await fs.writeFile(filePath, content);
    console.log('[EvidenceCollector] Saved file:', filePath);
    return filePath;
  }

  async saveScreenshot(filename: string, buffer: Buffer, phase: 'MAPPING' | 'BREAKDOWN' | 'MITIGATION' | 'DEPLOYMENT' = 'DEPLOYMENT'): Promise<string> {
    const filePath = path.join(this.evidenceDir, filename);
    await fs.writeFile(filePath, buffer);
    console.log('[EvidenceCollector] Saved screenshot:', filePath);
    
    // CRITICAL FIX (Oct 28, 2025): Persist screenshot to database
    await this.collect({
      type: 'screenshot',
      phase,
      path: filePath,
      metadata: {
        filename,
        size: buffer.length,
      },
    });
    
    return filePath;
  }

  /**
   * Collect browser console logs
   * Enhanced: October 28, 2025
   */
  async collectBrowserLogs(logs: string[]): Promise<number> {
    const logsString = logs.join('\n');
    const filePath = await this.saveFile('browser-console.log', logsString);
    
    return await this.collect({
      type: 'log',
      phase: 'DEPLOYMENT',
      path: filePath,
      metadata: {
        source: 'browser',
        lineCount: logs.length,
      },
    });
  }

  /**
   * Collect server logs
   * Enhanced: October 28, 2025
   */
  async collectServerLogs(logs: string[]): Promise<number> {
    const logsString = logs.join('\n');
    const filePath = await this.saveFile('server.log', logsString);
    
    return await this.collect({
      type: 'log',
      phase: 'DEPLOYMENT',
      path: filePath,
      metadata: {
        source: 'server',
        lineCount: logs.length,
      },
    });
  }

  /**
   * Collect test results
   * Enhanced: October 28, 2025
   */
  async collectTestResults(results: {
    passed: number;
    failed: number;
    skipped: number;
    total: number;
    failures?: string[];
  }): Promise<number> {
    return await this.collect({
      type: 'test',
      phase: 'MITIGATION',
      data: results,
      metadata: {
        passRate: (results.passed / results.total) * 100,
        hasFailures: results.failed > 0,
      },
    });
  }

  /**
   * Collect voice transcripts as evidence
   * WS3: Voice Mode integration (Oct 28, 2025)
   */
  async collectVoiceTranscript(transcript: {
    text: string;
    timestamp: Date;
    audioLength: number;
    user?: any;
  }): Promise<number> {
    return await this.collect({
      type: 'log',
      phase: 'MAPPING',
      data: {
        transcript: transcript.text,
        audioLength: transcript.audioLength,
        userId: transcript.user?.id,
      },
      metadata: {
        source: 'voice',
        transcriptLength: transcript.text.length,
        timestamp: transcript.timestamp.toISOString(),
      },
    });
  }

  /**
   * Add voice evidence (alias for collectVoiceTranscript)
   */
  async addVoiceEvidence(voiceData: {
    transcript: string;
    timestamp: Date;
    audioLength: number;
  }): Promise<number> {
    return await this.collectVoiceTranscript({
      text: voiceData.transcript,
      timestamp: voiceData.timestamp,
      audioLength: voiceData.audioLength,
    });
  }

  getEvidenceDir(): string {
    return this.evidenceDir;
  }
}
