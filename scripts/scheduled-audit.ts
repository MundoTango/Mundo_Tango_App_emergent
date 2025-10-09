#!/usr/bin/env tsx

import { scheduledAuditRunner } from '../server/services/scheduledAuditRunner';

async function main() {
  const jobType = process.argv[2] || 'daily';

  if (jobType === 'daily') {
    console.log('Starting daily scheduled audit...\n');
    const result = await scheduledAuditRunner.runDailyAudit();
    
    if (!result.success) {
      console.error('\n❌ Daily audit completed with errors\n');
      process.exit(1);
    }
    
    console.log('✅ Daily audit completed successfully\n');
    process.exit(0);
  } else if (jobType === 'weekly') {
    console.log('Starting weekly scheduled audit...\n');
    const result = await scheduledAuditRunner.runWeeklyAudit();
    
    if (!result.success) {
      console.error('\n❌ Weekly audit completed with errors\n');
      process.exit(1);
    }
    
    console.log('✅ Weekly audit completed successfully\n');
    process.exit(0);
  } else {
    console.log('Usage:');
    console.log('  npm run audit:scheduled daily   # Run daily audit');
    console.log('  npm run audit:scheduled weekly  # Run weekly audit');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Scheduled audit failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
