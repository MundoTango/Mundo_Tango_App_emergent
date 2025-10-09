/**
 * Bundle Size Tracker
 * ESA Layer 48: Performance Monitoring
 * 
 * Tracks bundle size changes over time and alerts on significant increases
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';

export interface BundleSizeEntry {
  name: string;
  size: number;
  gzipSize: number;
  percent: number;
}

export interface BundleSizeSnapshot {
  totalSize: number;
  totalGzipSize: number;
  entries: BundleSizeEntry[];
  timestamp: string;
  commit?: string;
}

export interface BundleSizeComparison {
  current: BundleSizeSnapshot;
  previous?: BundleSizeSnapshot;
  changes: {
    totalDiff: number;
    totalDiffPercent: number;
    significantChanges: {
      name: string;
      oldSize: number;
      newSize: number;
      diff: number;
      diffPercent: number;
    }[];
    newBundles: string[];
    removedBundles: string[];
  };
  alerts: {
    level: 'critical' | 'warning' | 'info';
    message: string;
  }[];
}

class BundleSizeTrackerService {
  private trackerDir = join(process.cwd(), 'docs/bundle-tracking');
  private alertThreshold = 10; // Alert if bundle increases by >10%

  constructor() {
    if (!existsSync(this.trackerDir)) {
      mkdirSync(this.trackerDir, { recursive: true });
    }
  }

  async captureSnapshot(commit?: string): Promise<BundleSizeSnapshot> {
    // Mock bundle analysis (in production, parse actual build output)
    const mockEntries: BundleSizeEntry[] = [
      { name: 'main.js', size: 245000, gzipSize: 82000, percent: 45 },
      { name: 'vendor.js', size: 180000, gzipSize: 65000, percent: 33 },
      { name: 'runtime.js', size: 15000, gzipSize: 5500, percent: 3 },
      { name: 'polyfills.js', size: 35000, gzipSize: 12000, percent: 6 },
      { name: 'styles.css', size: 48000, gzipSize: 12500, percent: 9 },
      { name: 'assets/*', size: 22000, gzipSize: 18000, percent: 4 }
    ];

    const totalSize = mockEntries.reduce((sum, e) => sum + e.size, 0);
    const totalGzipSize = mockEntries.reduce((sum, e) => sum + e.gzipSize, 0);

    const snapshot: BundleSizeSnapshot = {
      totalSize,
      totalGzipSize,
      entries: mockEntries,
      timestamp: new Date().toISOString(),
      commit
    };

    this.saveSnapshot(snapshot);
    return snapshot;
  }

  async compareWithPrevious(): Promise<BundleSizeComparison> {
    const snapshots = this.loadSnapshots();
    
    if (snapshots.length === 0) {
      throw new Error('No snapshots available. Run bundle:capture first.');
    }

    const current = snapshots[snapshots.length - 1];
    const previous = snapshots.length > 1 ? snapshots[snapshots.length - 2] : undefined;

    const comparison: BundleSizeComparison = {
      current,
      previous,
      changes: {
        totalDiff: 0,
        totalDiffPercent: 0,
        significantChanges: [],
        newBundles: [],
        removedBundles: []
      },
      alerts: []
    };

    if (!previous) {
      comparison.alerts.push({
        level: 'info',
        message: 'First snapshot - no comparison available'
      });
      return comparison;
    }

    // Calculate total diff
    comparison.changes.totalDiff = current.totalSize - previous.totalSize;
    comparison.changes.totalDiffPercent = 
      (comparison.changes.totalDiff / previous.totalSize) * 100;

    // Find significant changes
    const currentMap = new Map(current.entries.map(e => [e.name, e]));
    const previousMap = new Map(previous.entries.map(e => [e.name, e]));

    for (const [name, currentEntry] of currentMap) {
      const prevEntry = previousMap.get(name);
      
      if (!prevEntry) {
        comparison.changes.newBundles.push(name);
      } else {
        const diff = currentEntry.size - prevEntry.size;
        const diffPercent = (diff / prevEntry.size) * 100;

        if (Math.abs(diffPercent) >= 5) { // 5% threshold for significance
          comparison.changes.significantChanges.push({
            name,
            oldSize: prevEntry.size,
            newSize: currentEntry.size,
            diff,
            diffPercent
          });
        }
      }
    }

    for (const [name] of previousMap) {
      if (!currentMap.has(name)) {
        comparison.changes.removedBundles.push(name);
      }
    }

    // Generate alerts
    if (comparison.changes.totalDiffPercent > this.alertThreshold) {
      comparison.alerts.push({
        level: 'critical',
        message: `Bundle size increased by ${comparison.changes.totalDiffPercent.toFixed(1)}% (>${this.alertThreshold}% threshold)`
      });
    } else if (comparison.changes.totalDiffPercent > 5) {
      comparison.alerts.push({
        level: 'warning',
        message: `Bundle size increased by ${comparison.changes.totalDiffPercent.toFixed(1)}%`
      });
    } else if (comparison.changes.totalDiffPercent < -5) {
      comparison.alerts.push({
        level: 'info',
        message: `Bundle size decreased by ${Math.abs(comparison.changes.totalDiffPercent).toFixed(1)}% 🎉`
      });
    }

    if (comparison.changes.newBundles.length > 0) {
      comparison.alerts.push({
        level: 'warning',
        message: `${comparison.changes.newBundles.length} new bundle(s) detected`
      });
    }

    return comparison;
  }

  private loadSnapshots(): BundleSizeSnapshot[] {
    if (!existsSync(this.trackerDir)) {
      return [];
    }

    const files = readdirSync(this.trackerDir)
      .filter(f => f.startsWith('bundle-') && f.endsWith('.json'))
      .sort();

    return files.map(f => {
      const content = readFileSync(join(this.trackerDir, f), 'utf-8');
      return JSON.parse(content);
    });
  }

  private saveSnapshot(snapshot: BundleSizeSnapshot) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filePath = join(this.trackerDir, `bundle-${timestamp}.json`);
    writeFileSync(filePath, JSON.stringify(snapshot, null, 2));
  }

  formatComparison(comparison: BundleSizeComparison): string {
    let output = '\n' + '═'.repeat(80) + '\n';
    output += '📦 BUNDLE SIZE TRACKING\n';
    output += '═'.repeat(80) + '\n\n';

    // Current snapshot
    output += `📊 Current Snapshot:\n`;
    output += `   Total Size: ${this.formatBytes(comparison.current.totalSize)}\n`;
    output += `   Gzip Size:  ${this.formatBytes(comparison.current.totalGzipSize)}\n`;
    output += `   Timestamp:  ${new Date(comparison.current.timestamp).toLocaleString()}\n\n`;

    // Alerts
    if (comparison.alerts.length > 0) {
      output += `🚨 Alerts:\n`;
      comparison.alerts.forEach(alert => {
        const icon = alert.level === 'critical' ? '🔴' : 
                     alert.level === 'warning' ? '🟡' : '🔵';
        output += `   ${icon} ${alert.message}\n`;
      });
      output += '\n';
    }

    // Comparison
    if (comparison.previous) {
      output += `📈 Comparison with Previous:\n`;
      const diffIcon = comparison.changes.totalDiff > 0 ? '📈' : '📉';
      const diffColor = comparison.changes.totalDiff > 0 ? '+' : '';
      output += `   ${diffIcon} Total Change: ${diffColor}${this.formatBytes(comparison.changes.totalDiff)} `;
      output += `(${diffColor}${comparison.changes.totalDiffPercent.toFixed(2)}%)\n\n`;

      if (comparison.changes.significantChanges.length > 0) {
        output += `   🔄 Significant Changes:\n`;
        comparison.changes.significantChanges.forEach(change => {
          const icon = change.diff > 0 ? '📈' : '📉';
          const sign = change.diff > 0 ? '+' : '';
          output += `      ${icon} ${change.name}: ${sign}${this.formatBytes(change.diff)} `;
          output += `(${sign}${change.diffPercent.toFixed(1)}%)\n`;
          output += `         ${this.formatBytes(change.oldSize)} → ${this.formatBytes(change.newSize)}\n`;
        });
        output += '\n';
      }

      if (comparison.changes.newBundles.length > 0) {
        output += `   ✨ New Bundles: ${comparison.changes.newBundles.join(', ')}\n\n`;
      }

      if (comparison.changes.removedBundles.length > 0) {
        output += `   🗑️  Removed Bundles: ${comparison.changes.removedBundles.join(', ')}\n\n`;
      }
    }

    // Bundle breakdown
    output += `📋 Bundle Breakdown:\n`;
    comparison.current.entries.forEach((entry, i) => {
      output += `   ${i + 1}. ${entry.name.padEnd(20)} ${this.formatBytes(entry.size).padStart(12)} `;
      output += `(gzip: ${this.formatBytes(entry.gzipSize).padStart(10)}) ${entry.percent}%\n`;
    });
    output += '\n';

    output += '═'.repeat(80) + '\n';
    return output;
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
    const value = bytes / Math.pow(k, i);
    return `${value.toFixed(2)} ${sizes[i]}`;
  }
}

export const bundleSizeTracker = new BundleSizeTrackerService();
