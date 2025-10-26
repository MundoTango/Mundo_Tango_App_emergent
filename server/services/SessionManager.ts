/**
 * Session Manager - 200-minute autonomous runtime tracking
 * MB.MD Phase 1.3: Extended runtime with checkpoints and metrics
 * 
 * Research: docs/research/AUTONOMOUS_CODING_RESEARCH.md (Replit Agent 3)
 * Pattern: Track elapsed time → Save checkpoints every 10 min → Resume on interruption
 * 
 * Created: October 26, 2025
 */

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface AutonomousSession {
  sessionId: string;
  userRequest: string;
  startTime: Date;
  endTime?: Date;
  elapsedMinutes: number;
  maxMinutes: number;
  status: 'running' | 'paused' | 'completed' | 'failed';
  checkpoints: SessionCheckpoint[];
  metrics: SessionMetrics;
  currentTask?: string;
}

export interface SessionCheckpoint {
  timestamp: Date;
  elapsedMinutes: number;
  tasksCompleted: number;
  codeChangesApplied: number;
  testsRun: number;
  testsPassed: number;
  retryCount: number;
  snapshot: {
    tasks: any[];
    codeChanges: any[];
    errors: string[];
  };
}

export interface SessionMetrics {
  tasksTotal: number;
  tasksCompleted: number;
  codeChangesProposed: number;
  codeChangesApplied: number;
  testsRun: number;
  testsPassed: number;
  testsFailed: number;
  selfHealingAttempts: number;
  selfHealingSuccesses: number;
  totalRetries: number;
  aiModelCalls: {
    claude: number;
    gpt4: number;
    gemini: number;
  };
  estimatedCostUSD: number;
}

/**
 * SessionManager - Manages long-running autonomous sessions
 * 
 * Key Features (from Replit Agent 3 research):
 * - 200-minute maximum runtime
 * - Auto-save checkpoints every 10 minutes
 * - Resume from last checkpoint on crash
 * - Real-time metrics for Grafana
 */
export class SessionManager {
  private session: AutonomousSession;
  private checkpointInterval: NodeJS.Timeout | null = null;
  private checkpointDir: string;
  
  constructor(userRequest: string, maxMinutes: number = 200) {
    this.checkpointDir = join(process.cwd(), '.sessions');
    
    this.session = {
      sessionId: this.generateSessionId(),
      userRequest,
      startTime: new Date(),
      elapsedMinutes: 0,
      maxMinutes,
      status: 'running',
      checkpoints: [],
      metrics: {
        tasksTotal: 0,
        tasksCompleted: 0,
        codeChangesProposed: 0,
        codeChangesApplied: 0,
        testsRun: 0,
        testsPassed: 0,
        testsFailed: 0,
        selfHealingAttempts: 0,
        selfHealingSuccesses: 0,
        totalRetries: 0,
        aiModelCalls: {
          claude: 0,
          gpt4: 0,
          gemini: 0
        },
        estimatedCostUSD: 0
      },
      currentTask: undefined
    };
    
    console.log(`🚀 [SessionManager] Starting session ${this.session.sessionId}`);
    console.log(`⏱️  [SessionManager] Max runtime: ${maxMinutes} minutes`);
    
    // Start auto-checkpoint every 10 minutes
    this.startAutoCheckpoint();
  }
  
  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `session-${timestamp}-${random}`;
  }
  
  /**
   * Start automatic checkpoint saving every 10 minutes
   */
  private startAutoCheckpoint(): void {
    const intervalMinutes = 10;
    const intervalMs = intervalMinutes * 60 * 1000;
    
    this.checkpointInterval = setInterval(() => {
      this.saveCheckpoint();
    }, intervalMs);
    
    console.log(`💾 [SessionManager] Auto-checkpoint every ${intervalMinutes} minutes`);
  }
  
  /**
   * Save checkpoint to disk
   * Allows resuming session after crash
   */
  saveCheckpoint(snapshot?: SessionCheckpoint['snapshot']): void {
    const checkpoint: SessionCheckpoint = {
      timestamp: new Date(),
      elapsedMinutes: this.getElapsedMinutes(),
      tasksCompleted: this.session.metrics.tasksCompleted,
      codeChangesApplied: this.session.metrics.codeChangesApplied,
      testsRun: this.session.metrics.testsRun,
      testsPassed: this.session.metrics.testsPassed,
      retryCount: this.session.metrics.totalRetries,
      snapshot: snapshot || {
        tasks: [],
        codeChanges: [],
        errors: []
      }
    };
    
    this.session.checkpoints.push(checkpoint);
    
    // Save to disk
    try {
      const checkpointPath = join(this.checkpointDir, `${this.session.sessionId}.json`);
      writeFileSync(checkpointPath, JSON.stringify(this.session, null, 2));
      
      console.log(`💾 [SessionManager] Checkpoint saved at ${checkpoint.elapsedMinutes} min`);
    } catch (error) {
      console.error('❌ [SessionManager] Failed to save checkpoint:', error);
    }
  }
  
  /**
   * Resume session from saved checkpoint
   */
  static resumeFromCheckpoint(sessionId: string): SessionManager | null {
    const checkpointDir = join(process.cwd(), '.sessions');
    const checkpointPath = join(checkpointDir, `${sessionId}.json`);
    
    if (!existsSync(checkpointPath)) {
      console.log(`⚠️  [SessionManager] No checkpoint found for ${sessionId}`);
      return null;
    }
    
    try {
      const data = readFileSync(checkpointPath, 'utf-8');
      const session: AutonomousSession = JSON.parse(data);
      
      const manager = new SessionManager(session.userRequest, session.maxMinutes);
      manager.session = session;
      manager.session.status = 'running'; // Resume
      
      console.log(`✅ [SessionManager] Resumed session ${sessionId}`);
      console.log(`📊 Progress: ${session.metrics.tasksCompleted}/${session.metrics.tasksTotal} tasks`);
      
      return manager;
      
    } catch (error) {
      console.error('❌ [SessionManager] Failed to resume checkpoint:', error);
      return null;
    }
  }
  
  /**
   * Get elapsed time in minutes
   */
  getElapsedMinutes(): number {
    const elapsedMs = Date.now() - this.session.startTime.getTime();
    return Math.floor(elapsedMs / 60000);
  }
  
  /**
   * Check if session has exceeded max runtime
   */
  hasExceededMaxRuntime(): boolean {
    const elapsed = this.getElapsedMinutes();
    this.session.elapsedMinutes = elapsed;
    
    if (elapsed >= this.session.maxMinutes) {
      console.log(`⏱️  [SessionManager] Max runtime exceeded (${elapsed}/${this.session.maxMinutes} min)`);
      return true;
    }
    
    return false;
  }
  
  /**
   * Update metrics - called by VibeGraph after each step
   * 🚀 PHASE 3.2: Exports to Grafana Cloud via observability.ts
   */
  updateMetrics(update: Partial<SessionMetrics>): void {
    Object.assign(this.session.metrics, update);
    
    // 🚀 PHASE 3.2 & 6: Export metrics to Grafana
    try {
      // Dynamically import to avoid circular dependency
      const { updateAutonomousMetrics } = require('../observability');
      updateAutonomousMetrics(this.getGrafanaMetrics());
    } catch (error) {
      // Graceful degradation if observability isn't available
      console.warn('⚠️  [SessionManager] Failed to export Grafana metrics:', error);
    }
  }
  
  /**
   * Track AI model usage for cost calculation
   * 
   * Cost estimates (per 1M tokens):
   * - Claude Sonnet 4: $3 input, $15 output
   * - GPT-4: $2.50 input, $10 output
   * - Gemini Pro: $0.125 input, $0.375 output
   */
  trackModelCall(
    model: 'claude' | 'gpt4' | 'gemini',
    inputTokens: number,
    outputTokens: number
  ): void {
    this.session.metrics.aiModelCalls[model]++;
    
    // Estimate cost (simplified)
    const costPer1M = {
      claude: { input: 3, output: 15 },
      gpt4: { input: 2.5, output: 10 },
      gemini: { input: 0.125, output: 0.375 }
    };
    
    const costs = costPer1M[model];
    const inputCost = (inputTokens / 1_000_000) * costs.input;
    const outputCost = (outputTokens / 1_000_000) * costs.output;
    
    this.session.metrics.estimatedCostUSD += inputCost + outputCost;
  }
  
  /**
   * Get current session state
   */
  getSession(): AutonomousSession {
    this.session.elapsedMinutes = this.getElapsedMinutes();
    return this.session;
  }
  
  /**
   * Set current task being worked on
   */
  setCurrentTask(taskDescription: string): void {
    this.session.currentTask = taskDescription;
    console.log(`📋 [SessionManager] Current task: ${taskDescription}`);
  }
  
  /**
   * Complete session (success or failure)
   */
  completeSession(status: 'completed' | 'failed', reason?: string): void {
    this.session.status = status;
    this.session.endTime = new Date();
    
    // Stop auto-checkpoint
    if (this.checkpointInterval) {
      clearInterval(this.checkpointInterval);
    }
    
    // Final checkpoint
    this.saveCheckpoint();
    
    const emoji = status === 'completed' ? '✅' : '❌';
    console.log(`${emoji} [SessionManager] Session ${status} after ${this.getElapsedMinutes()} minutes`);
    
    if (reason) {
      console.log(`📝 [SessionManager] Reason: ${reason}`);
    }
    
    // Summary
    this.printSummary();
  }
  
  /**
   * Print session summary
   */
  private printSummary(): void {
    const m = this.session.metrics;
    
    console.log('\n📊 [SessionManager] Session Summary:');
    console.log(`   Duration: ${this.getElapsedMinutes()} minutes`);
    console.log(`   Tasks: ${m.tasksCompleted}/${m.tasksTotal} completed`);
    console.log(`   Code changes: ${m.codeChangesApplied}/${m.codeChangesProposed} applied`);
    console.log(`   Tests: ${m.testsPassed}/${m.testsRun} passed`);
    console.log(`   Self-healing: ${m.selfHealingSuccesses}/${m.selfHealingAttempts} successful`);
    console.log(`   Retries: ${m.totalRetries}`);
    console.log(`   AI calls: Claude ${m.aiModelCalls.claude}, GPT-4 ${m.aiModelCalls.gpt4}, Gemini ${m.aiModelCalls.gemini}`);
    console.log(`   Estimated cost: $${m.estimatedCostUSD.toFixed(2)}\n`);
  }
  
  /**
   * Get Grafana metrics in OpenTelemetry format
   * Returns metrics for export to Grafana Cloud
   */
  getGrafanaMetrics(): Record<string, number> {
    const m = this.session.metrics;
    
    return {
      'autonomous.runtime.minutes': this.getElapsedMinutes(),
      'autonomous.tasks.total': m.tasksTotal,
      'autonomous.tasks.completed': m.tasksCompleted,
      'autonomous.tasks.completion_rate': m.tasksTotal > 0 ? (m.tasksCompleted / m.tasksTotal) * 100 : 0,
      'autonomous.code_changes.proposed': m.codeChangesProposed,
      'autonomous.code_changes.applied': m.codeChangesApplied,
      'autonomous.tests.run': m.testsRun,
      'autonomous.tests.passed': m.testsPassed,
      'autonomous.tests.failed': m.testsFailed,
      'autonomous.tests.pass_rate': m.testsRun > 0 ? (m.testsPassed / m.testsRun) * 100 : 0,
      'autonomous.self_healing.attempts': m.selfHealingAttempts,
      'autonomous.self_healing.successes': m.selfHealingSuccesses,
      'autonomous.self_healing.success_rate': m.selfHealingAttempts > 0 ? (m.selfHealingSuccesses / m.selfHealingAttempts) * 100 : 0,
      'autonomous.retries.total': m.totalRetries,
      'autonomous.ai_calls.claude': m.aiModelCalls.claude,
      'autonomous.ai_calls.gpt4': m.aiModelCalls.gpt4,
      'autonomous.ai_calls.gemini': m.aiModelCalls.gemini,
      'autonomous.cost.usd': m.estimatedCostUSD
    };
  }
}
