#!/usr/bin/env tsx

import { performanceMetricsDashboard } from '../server/services/performanceMetricsDashboard';

async function main() {
  console.log('\n📊 Generating Performance Metrics Dashboard...\n');
  console.log('Running all performance audits...');
  
  const dashboard = await performanceMetricsDashboard.generateDashboard();
  const formatted = performanceMetricsDashboard.formatDashboard(dashboard);
  
  console.log(formatted);

  // Exit codes based on health status
  if (dashboard.overall.status === 'critical') {
    console.log('🚨 CRITICAL: Performance is severely degraded!\n');
    process.exit(1);
  } else if (dashboard.overall.status === 'needs-improvement') {
    console.log('⚠️  WARNING: Performance needs improvement.\n');
    process.exit(1);
  } else if (dashboard.overall.status === 'good') {
    console.log('✅ Performance is good.\n');
    process.exit(0);
  } else {
    console.log('🎉 Excellent performance across all metrics!\n');
    process.exit(0);
  }
}

main().catch(error => {
  console.error('❌ Dashboard generation failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
