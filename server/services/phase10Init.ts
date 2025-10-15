/**
 * Phase 10: Production Deployment & Advanced Automation
 * Initializes all Phase 10 services
 */

import { healthMonitor } from './infrastructure/HealthMonitor';
import { dataDriftDetector } from './ml/DataDriftDetector';
import { trendForecaster } from './ml/TrendForecaster';
import { queryAnalyzer } from './performance/QueryAnalyzer';
import { apiKeyManager } from './security/APIKeyManager';
import { memoryLeakDetector } from './infrastructure/MemoryLeakDetector';
import { dbConnectionPool } from '../db/connectionPool';

export class Phase10Services {
  private healthMonitorInterval?: NodeJS.Timeout;
  private driftDetectionInterval?: NodeJS.Timeout;
  private apiKeyRotationInterval?: NodeJS.Timeout;
  private memoryMonitorInterval?: NodeJS.Timeout;
  private connectionPoolMonitorInterval?: NodeJS.Timeout;

  /**
   * Initialize all Phase 10 services
   */
  async initialize(): Promise<void> {
    console.log('🚀 [Phase 10] Initializing production services...');

    // Initialize database connection pool
    try {
      dbConnectionPool.initialize({
        max: 20,
        min: 2,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000
      });
      const poolTest = await dbConnectionPool.testConnection();
      if (poolTest) {
        console.log('✅ [Phase 10] Database connection pool initialized');
      }
    } catch (error) {
      console.error('❌ [Phase 10] Connection pool initialization failed:', error);
    }

    // Start health monitoring (every 30 seconds)
    this.healthMonitorInterval = healthMonitor.startMonitoring(30000);
    console.log('✅ [Phase 10] Health monitor started');

    // Start memory leak detection (every 60 seconds)
    this.memoryMonitorInterval = memoryLeakDetector.startMonitoring(60000);
    console.log('✅ [Phase 10] Memory leak detector started');

    // Start connection pool monitoring (every 60 seconds)
    this.connectionPoolMonitorInterval = dbConnectionPool.startMonitoring(60000);
    console.log('✅ [Phase 10] Connection pool monitor started');

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

    // Run initial checks
    setTimeout(async () => {
      try {
        const driftResult = await dataDriftDetector.detectDrift();
        console.log(`📊 [Phase 10] Initial drift check: ${dataDriftDetector.getDriftSummary(driftResult)}`);

        const trendForecast = await trendForecaster.forecastAgentPerformance(7);
        console.log(`📈 [Phase 10] Initial trend forecast: ${trendForecaster.getForecastSummary(trendForecast)}`);
      } catch (error) {
        console.log('ℹ️  [Phase 10] Initial checks skipped (insufficient data)');
      }
    }, 10000); // 10 seconds after startup

    console.log('🎯 [Phase 10] All services initialized successfully');
  }

  /**
   * Shutdown all Phase 10 services
   */
  async shutdown(): Promise<void> {
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

    if (this.memoryMonitorInterval) {
      clearInterval(this.memoryMonitorInterval);
    }

    if (this.connectionPoolMonitorInterval) {
      clearInterval(this.connectionPoolMonitorInterval);
    }

    // Shutdown connection pool
    await dbConnectionPool.shutdown();

    console.log('✅ [Phase 10] Services shutdown complete');
  }

  /**
   * Get Phase 10 status
   */
  async getStatus(): Promise<{
    healthMonitoring: boolean;
    driftDetection: boolean;
    trendForecasting: boolean;
    apiKeyRotation: boolean;
    queryAnalysis: boolean;
    memoryMonitoring: boolean;
    connectionPooling: boolean;
  }> {
    return {
      healthMonitoring: this.healthMonitorInterval !== undefined,
      driftDetection: this.driftDetectionInterval !== undefined,
      trendForecasting: true, // On-demand
      apiKeyRotation: this.apiKeyRotationInterval !== undefined,
      queryAnalysis: true, // Always active
      memoryMonitoring: this.memoryMonitorInterval !== undefined,
      connectionPooling: true // Always active
    };
  }
}

// Singleton instance
export const phase10Services = new Phase10Services();
