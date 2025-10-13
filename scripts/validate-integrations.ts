#!/usr/bin/env tsx
/**
 * ESA106: Integration Validation Script
 * PHASE 1 TRACK 6: Frontend-Backend Integration Verification
 */

import { esa106IntegrationValidator } from '../server/services/ESA106IntegrationValidator';

async function main() {
  console.log('🚀 ESA106: Integration Validator');
  console.log('=' .repeat(60) + '\n');

  const report = await esa106IntegrationValidator.validate();

  if (report.issues.length > 0 && process.argv.includes('--fix')) {
    await esa106IntegrationValidator.autoFix(report);
  }

  process.exit(report.issues.filter(i => i.severity === 'critical').length > 0 ? 1 : 0);
}

main().catch(console.error);
