#!/usr/bin/env tsx

import { translationCoverageScanner } from '../server/services/translationCoverageScanner';

async function main() {
  console.log('\n🌍 Scanning Translation Coverage...\n');
  
  try {
    const report = await translationCoverageScanner.scanCoverage();
    const formatted = translationCoverageScanner.formatReport(report);
    
    console.log(formatted);

    if (report.summary.avgCoverage < 100) {
      console.log('💡 RECOMMENDATIONS:\n');
      const incomplete = report.languages.filter(l => l.status !== 'complete');
      if (incomplete.length > 0) {
        console.log(`   - Complete translations for ${incomplete.length} languages`);
        console.log(`   - Priority: Top 7 Tango languages should be 100%\n`);
      }
    } else {
      console.log('✅ Perfect translation coverage!\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Translation scan failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
