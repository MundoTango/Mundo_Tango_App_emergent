#!/usr/bin/env tsx

import { optimizationRecommender } from '../server/services/optimizationRecommender';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

async function main() {
  console.log('\n🎯 Generating Optimization Plan...\n');
  console.log('This will analyze:');
  console.log('  • 359 dependencies');
  console.log('  • Security vulnerabilities');
  console.log('  • Bundle size impact');
  console.log('  • Maintainability issues\n');

  try {
    const plan = await optimizationRecommender.generatePlan();
    const report = optimizationRecommender.formatReport(plan);
    
    console.log(report);

    // Save to file
    const reportsDir = join(process.cwd(), 'docs/optimization-reports');
    mkdirSync(reportsDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filepath = join(reportsDir, `optimization-plan-${timestamp}.json`);
    
    writeFileSync(filepath, JSON.stringify(plan, null, 2));
    console.log(`\n💾 Plan saved to: docs/optimization-reports/optimization-plan-${timestamp}.json\n`);

    // Exit with appropriate code
    if (plan.summary.critical > 0) {
      process.exit(2); // Critical recommendations
    } else if (plan.summary.high > 0) {
      process.exit(1); // High priority recommendations
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Optimization analysis failed:', error instanceof Error ? error.message : error);
    process.exit(3);
  }
}

main();
