#!/usr/bin/env tsx

import { userJourneyTester } from '../server/services/userJourneyTester';

async function main() {
  const args = process.argv.slice(2);
  const criticalOnly = args.includes('--critical');

  console.log('\n🚶 Starting User Journey Tests...\n');
  console.log('⚙️  Running tests against http://localhost:5000\n');

  try {
    let journeys = userJourneyTester.getCriticalJourneys();
    
    if (criticalOnly) {
      journeys = journeys.filter(j => j.criticalPath);
      console.log(`Running ${journeys.length} critical path journeys:\n`);
    } else {
      console.log(`Running ${journeys.length} user journeys:\n`);
    }

    journeys.forEach((journey, i) => {
      const icon = journey.criticalPath ? '🔥' : '📝';
      console.log(`  ${i + 1}. ${icon} ${journey.name} - ${journey.description}`);
    });
    console.log('');

    const suite = await userJourneyTester.runJourneys(journeys);
    const report = userJourneyTester.formatReport(suite);
    
    console.log(report);

    // Show recommendations
    if (suite.summary.failed > 0) {
      console.log('⚠️  FAILED JOURNEYS DETECTED\n');
      console.log('Actions:');
      console.log('  1. Review screenshots in tests/journey/screenshots/');
      console.log('  2. Check test selectors match current UI');
      console.log('  3. Fix issues and re-run:');
      console.log('     npm run journey:test\n');
    }

    if (suite.summary.criticalPaths > suite.summary.criticalPathsPassed) {
      console.log('🔥 CRITICAL PATH FAILURES\n');
      console.log(`${suite.summary.criticalPaths - suite.summary.criticalPathsPassed} critical paths failed!\n`);
      process.exit(2);
    }

    if (suite.summary.failed > 0) {
      process.exit(1);
    }

    console.log('✅ All user journeys passed!\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Journey testing failed:', error instanceof Error ? error.message : error);
    console.error('\nMake sure the development server is running on http://localhost:5000\n');
    process.exit(1);
  }
}

main();
