#!/usr/bin/env tsx

import { bundleSizeTracker } from '../server/services/bundleSizeTracker';

async function main() {
  const command = process.argv[2] || 'compare';

  if (command === 'capture') {
    const commit = process.argv[3];
    console.log('\n📦 Capturing bundle size snapshot...\n');
    
    const snapshot = await bundleSizeTracker.captureSnapshot(commit);
    console.log(`✅ Snapshot captured!`);
    console.log(`   Total Size: ${formatBytes(snapshot.totalSize)}`);
    console.log(`   Gzip Size:  ${formatBytes(snapshot.totalGzipSize)}`);
    console.log(`   Timestamp:  ${new Date(snapshot.timestamp).toLocaleString()}\n`);
  } else if (command === 'compare') {
    console.log('\n📦 Comparing bundle sizes...\n');
    
    try {
      const comparison = await bundleSizeTracker.compareWithPrevious();
      const formatted = bundleSizeTracker.formatComparison(comparison);
      
      console.log(formatted);

      const criticalAlerts = comparison.alerts.filter(a => a.level === 'critical');
      if (criticalAlerts.length > 0) {
        console.log('🚨 CRITICAL: Bundle size increased beyond threshold!\n');
        process.exit(1);
      }

      console.log('✅ Bundle tracking complete!\n');
    } catch (error) {
      console.error('⚠️ ', error instanceof Error ? error.message : error);
      console.log('\n💡 Run "npm run bundle:capture" to create the first snapshot.\n');
      process.exit(1);
    }
  } else {
    console.log('Usage:');
    console.log('  npm run bundle:capture [commit-hash]  # Capture snapshot');
    console.log('  npm run bundle:compare                # Compare with previous');
    process.exit(1);
  }

  process.exit(0);
}

function formatBytes(bytes: number): string {
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

main().catch(error => {
  console.error('❌ Bundle tracking failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
