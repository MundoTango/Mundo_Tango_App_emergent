/**
 * Phase 10: Production Deployment & Advanced Automation
 * Initializes all Phase 10 services
 */

import { healthMonitor } from './infrastructure/HealthMonitor';
import { dataDriftDetector } from './ml/DataDriftDetector';
import { queryAnalyzer } from './performance/QueryAnalyzer';
import { apiKeyManager } from './security/APIKeyManager';

export class Phase10Services {
  private healthMonitorInterval?: NodeJS.Timeout;
  private driftDetectionInterval?: NodeJS.Timeout;
  private apiKeyRotationInterval?: NodeJS.Timeout;

  /**
   * Initialize all Phase 10 services
   */
  async initialize(): Promise<void> {
    console.log('🚀 [Phase 10] Initializing production services...');

    // Start health monitoring (every 30 seconds)
    this.healthMonitorInterval = healthMonitor.startMonitoring(30000);
    console.log('✅ [Phase 10] Health monitor started');

    // Start drift detection (every 24 hours)
    this.driftDetectionInterval = setInterval(async () => {
      try {
        const result = await dataDriftDetector.detectDrift();
        if (result.hasDrift) {
          console.warn(`⚠️  [Phase 10] ${dataDriftDetector.getDriftSummary(result)}`);
        } else {
          console.log('✅ [Phase 10] No data drift detected');
        }
      } catch (error) {
        console.error('❌ [Phase 10] Drift detection error:', error);
      }
    }, 24 * 60 * 60 * 1000); // 24 hours

    console.log('✅ [Phase 10] Drift detection scheduled (daily)');

    // Start API key rotation monitoring (every 24 hours)
    this.apiKeyRotationInterval = apiKeyManager.startRotationMonitoring(24);
    console.log('✅ [Phase 10] API key rotation monitor started');

    // Clear old query stats (every 24 hours)
    setInterval(() => {
      queryAnalyzer.clearOldStats(24);
    }, 24 * 60 * 60 * 1000);

    console.log('✅ [Phase 10] Query analyzer cleanup scheduled');

    // Run initial drift detection
    setTimeout(async () => {
      try {
        const result = await dataDriftDetector.detectDrift();
        console.log(`📊 [Phase 10] Initial drift check: ${dataDriftDetector.getDriftSummary(result)}`);
      } catch (error) {
        console.log('ℹ️  [Phase 10] Initial drift check skipped (insufficient data)');
      }
    }, 5000); // 5 seconds after startup

    console.log('🎯 [Phase 10] All services initialized successfully');
  }

  /**
   * Shutdown all Phase 10 services
   */
  shutdown(): void {
    console.log('🛑 [Phase 10] Shutting down services...');

    if (this.healthMonitorInterval) {
      clearInterval(this.healthMonitorInterval);
    }

    if (this.driftDetectionInterval) {
      clearInterval(this.driftDetectionInterval);
    }

    if (this.apiKeyRotationInterval) {
      clearInterval(this.apiKeyRotationInterval);
    }

    console.log('✅ [Phase 10] Services shutdown complete');
  }

  /**
   * Get Phase 10 status
   */
  async getStatus(): Promise<{
    healthMonitoring: boolean;
    driftDetection: boolean;
    apiKeyRotation: boolean;
    queryAnalysis: boolean;
  }> {
    return {
      healthMonitoring: this.healthMonitorInterval !== undefined,
      driftDetection: this.driftDetectionInterval !== undefined,
      apiKeyRotation: this.apiKeyRotationInterval !== undefined,
      queryAnalysis: true // Always active
    };
  }
}

// Singleton instance
export const phase10Services = new Phase10Services();
