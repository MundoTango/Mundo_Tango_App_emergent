/**
 * Phase 10 - Track B3: Memory Leak Detection & Cleanup
 * Detects memory leaks and triggers cleanup
 */

export interface MemorySnapshot {
  timestamp: Date;
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
  arrayBuffers: number;
}

export interface MemoryLeakReport {
  isLeaking: boolean;
  growthRate: number; // MB per hour
  snapshots: MemorySnapshot[];
  recommendation: string;
}

export class MemoryLeakDetector {
  private snapshots: MemorySnapshot[] = [];
  private maxSnapshots = 60; // Keep last 60 snapshots (1 hour at 1 min intervals)
  private leakThreshold = 10; // MB per hour growth = potential leak

  /**
   * Take a memory snapshot
   */
  takeSnapshot(): MemorySnapshot {
    const usage = process.memoryUsage();
    const snapshot: MemorySnapshot = {
      timestamp: new Date(),
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
      external: Math.round(usage.external / 1024 / 1024),
      rss: Math.round(usage.rss / 1024 / 1024),
      arrayBuffers: Math.round(usage.arrayBuffers / 1024 / 1024)
    };

    this.snapshots.push(snapshot);

    // Keep only recent snapshots
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift();
    }

    return snapshot;
  }

  /**
   * Analyze memory growth for leaks
   */
  analyzeLeaks(): MemoryLeakReport {
    if (this.snapshots.length < 10) {
      return {
        isLeaking: false,
        growthRate: 0,
        snapshots: this.snapshots,
        recommendation: 'Insufficient data for leak detection (need 10+ snapshots)'
      };
    }

    // Calculate growth rate (linear regression)
    const heapValues = this.snapshots.map(s => s.heapUsed);
    const growthRate = this.calculateGrowthRate(heapValues);

    // Convert to MB per hour
    const minutesBetweenSnapshots = 1; // Assuming 1 minute intervals
    const growthPerHour = (growthRate * 60) / minutesBetweenSnapshots;

    const isLeaking = growthPerHour > this.leakThreshold;

    let recommendation = '';
    if (isLeaking) {
      recommendation = `MEMORY LEAK DETECTED: Growing at ${growthPerHour.toFixed(2)}MB/hour. Recommend: 1) Check for unclosed connections, 2) Review event listeners, 3) Consider graceful restart`;
    } else if (growthPerHour > 5) {
      recommendation = `Moderate memory growth (${growthPerHour.toFixed(2)}MB/hour). Monitor closely`;
    } else {
      recommendation = 'Memory usage stable';
    }

    return {
      isLeaking,
      growthRate: growthPerHour,
      snapshots: this.snapshots.slice(-10), // Last 10 snapshots
      recommendation
    };
  }

  /**
   * Calculate growth rate using linear regression
   */
  private calculateGrowthRate(values: number[]): number {
    const n = values.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumXX += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope;
  }

  /**
   * Force garbage collection (if --expose-gc flag enabled)
   */
  forceGarbageCollection(): boolean {
    if (global.gc) {
      console.log('♻️  [Memory Leak Detector] Forcing garbage collection...');
      global.gc();
      return true;
    } else {
      console.log('⚠️  [Memory Leak Detector] Garbage collection not available (run with --expose-gc flag)');
      return false;
    }
  }

  /**
   * Cleanup caches and optimize memory
   */
  async optimizeMemory(): Promise<void> {
    console.log('🧹 [Memory Leak Detector] Optimizing memory...');

    // Force GC if available
    this.forceGarbageCollection();

    // Clear any internal caches
    // (Application-specific cleanup would go here)

    // Take snapshot after cleanup
    const afterCleanup = this.takeSnapshot();
    console.log(`✅ [Memory Leak Detector] Memory after cleanup: ${afterCleanup.heapUsed}MB`);
  }

  /**
   * Start periodic monitoring
   */
  startMonitoring(intervalMs: number = 60000): NodeJS.Timeout {
    console.log(`✅ [Memory Leak Detector] Started monitoring (interval: ${intervalMs}ms)`);

    return setInterval(async () => {
      this.takeSnapshot();
      const report = this.analyzeLeaks();

      if (report.isLeaking) {
        console.error(`🚨 [Memory Leak Detector] ${report.recommendation}`);
        // Trigger cleanup
        await this.optimizeMemory();
      } else {
        console.log(`✅ [Memory Leak Detector] ${report.recommendation}`);
      }
    }, intervalMs);
  }

  /**
   * Get current memory status
   */
  getCurrentStatus(): {
    current: MemorySnapshot;
    leakDetected: boolean;
    growthRate: number;
  } {
    const current = this.takeSnapshot();
    const report = this.analyzeLeaks();

    return {
      current,
      leakDetected: report.isLeaking,
      growthRate: report.growthRate
    };
  }
}

// Singleton instance
export const memoryLeakDetector = new MemoryLeakDetector();
