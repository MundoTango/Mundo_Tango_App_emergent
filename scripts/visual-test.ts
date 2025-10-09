#!/usr/bin/env tsx

import { visualRegressionTester } from '../server/services/visualRegressionTester';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === 'update' || command === 'baseline') {
    await updateBaselines();
    return;
  }

  console.log('\n📸 Starting Visual Regression Tests...\n');
  console.log('⚙️  Running tests against http://localhost:5000\n');

  try {
    const tests = visualRegressionTester.getPlatformTestSuite();
    console.log(`Running ${tests.length} visual tests:\n`);
    tests.forEach((test, i) => {
      console.log(`  ${i + 1}. ${test.name} - ${test.url}`);
    });
    console.log('');

    const suite = await visualRegressionTester.runTests(tests);
    const report = visualRegressionTester.formatReport(suite);
    
    console.log(report);

    // Show recommendations
    if (suite.summary.failed > 0) {
      console.log('⚠️  FAILED TESTS DETECTED\n');
      console.log('Actions:');
      console.log('  1. Review diff images in tests/visual/diffs/');
      console.log('  2. If changes are intentional, update baselines:');
      console.log('     npm run visual:update\n');
      console.log('  3. Re-run tests to confirm:');
      console.log('     npm run visual:test\n');
      process.exit(1);
    }

    if (suite.summary.new > 0) {
      console.log('🆕 NEW TESTS DETECTED\n');
      console.log('To create baselines for new tests:');
      console.log('  npm run visual:update\n');
    }

    if (suite.summary.passed === suite.summary.total) {
      console.log('✅ All visual tests passed!\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Visual testing failed:', error instanceof Error ? error.message : error);
    console.error('\nMake sure the development server is running on http://localhost:5000\n');
    process.exit(1);
  }
}

async function updateBaselines() {
  console.log('\n📸 Updating Visual Test Baselines...\n');

  try {
    const result = await visualRegressionTester.updateBaselines();
    console.log(`✅ Updated ${result.updated} baselines (${result.total} total screenshots)\n`);
    console.log('Baseline images saved to: tests/visual/baselines/\n');
    console.log('Run tests to verify:');
    console.log('  npm run visual:test\n');
  } catch (error) {
    console.error('❌ Failed to update baselines:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
