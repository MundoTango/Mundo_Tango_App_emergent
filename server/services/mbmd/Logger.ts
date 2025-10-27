/**
 * MB.MD Logger Utility
 * Phase 0: Logging Standards - Oct 27, 2025
 */

export type MBMDPhase = 'MAPPING' | 'BREAKDOWN' | 'MITIGATION' | 'DEPLOYMENT';

export class MBMDLogger {
  private sessionId?: number;
  private feature: string;

  constructor(feature: string, sessionId?: number) {
    this.feature = feature;
    this.sessionId = sessionId;
  }

  private formatMessage(phase: MBMDPhase, message: string): string {
    const sessionPrefix = this.sessionId ? `[Session:${this.sessionId}]` : '';
    return `[MB.MD:${phase}] ${sessionPrefix} [${this.feature}] ${message}`;
  }

  mapping(message: string, data?: any): void {
    console.log(this.formatMessage('MAPPING', message), data || '');
  }

  breakdown(message: string, data?: any): void {
    console.log(this.formatMessage('BREAKDOWN', message), data || '');
  }

  mitigation(message: string, data?: any): void {
    console.log(this.formatMessage('MITIGATION', message), data || '');
  }

  deployment(message: string, data?: any): void {
    console.log(this.formatMessage('DEPLOYMENT', message), data || '');
  }

  dataInspection(label: string, data: any): void {
    console.log(`[DATA_INSPECTION] [${this.feature}] ${label}:`, JSON.stringify(data, null, 2));
  }

  unitTest(testName: string, passed: boolean, message?: string): void {
    const status = passed ? '✅ PASSED' : '❌ FAILED';
    console.log(`[UNIT_TEST] [${this.feature}] ${testName}: ${status}`, message || '');
  }

  evidence(type: string, path: string): void {
    console.log(`[EVIDENCE] [${this.feature}] ${type} saved: ${path}`);
  }

  phaseComplete(phase: MBMDPhase, summary?: string): void {
    console.log(this.formatMessage(phase, `✅ PHASE COMPLETE`), summary || '');
  }

  error(phase: MBMDPhase, error: Error | string): void {
    const message = error instanceof Error ? error.message : error;
    console.error(this.formatMessage(phase, `❌ ERROR: ${message}`));
  }
}

// Global logger factory
export function createMBMDLogger(feature: string, sessionId?: number): MBMDLogger {
  return new MBMDLogger(feature, sessionId);
}
