#!/usr/bin/env tsx

import { bundleAnalyzer } from '../server/services/bundleAnalyzer';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === 'quick' || command === 'stats') {
    await showQuickStats();
    return;
  }

  console.log('\n📦 Analyzing bundle impact...\n');

  try {
    const analysis = await bundleAnalyzer.analyze();
    const report = bundleAnalyzer.formatReport(analysis);
    
    console.log(report);

    // Save to file
    const reportsDir = join(process.cwd(), 'docs/bundle-reports');
    mkdirSync(reportsDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filepath = join(reportsDir, `bundle-analysis-${timestamp}.json`);
    
    writeFileSync(filepath, JSON.stringify(analysis, null, 2));
    console.log(`\n💾 Analysis saved to: docs/bundle-reports/bundle-analysis-${timestamp}.json\n`);

    // Show top recommendations
    if (analysis.optimization.recommendations.length > 0) {
      console.log('🎯 TOP ACTIONS:\n');
      analysis.optimization.recommendations.slice(0, 3).forEach((rec, i) => {
        console.log(`   ${i + 1}. ${rec}`);
      });
      console.log('');
    }

  } catch (error) {
    if (error instanceof Error && error.message.includes('Build output not found')) {
      console.error('❌ Build output not found.\n');
      console.log('Please run: npm run build\n');
      console.log('Then try again: npm run bundle:analyze\n');
      process.exit(1);
    }
    
    console.error('❌ Bundle analysis failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

async function showQuickStats() {
  const stats = await bundleAnalyzer.getQuickStats();
  
  if (!stats) {
    console.log('\n⚠️  No build found. Run: npm run build\n');
    return;
  }

  console.log('\n📊 Quick Bundle Stats:\n');
  console.log(`   Total Size: ${stats.size}`);
  console.log(`   Gzipped: ${stats.gzipped}`);
  console.log('\n   Run "npm run bundle:analyze" for detailed analysis\n');
}

main();
