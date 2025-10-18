#!/usr/bin/env tsx

/**
 * Mundo Tango - File Protection Test Suite
 * 
 * Validates that all critical files and folders exist
 * Prevents deployment if essential files are missing
 * Run: npm run test:protection
 */

import { existsSync, statSync, readdirSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  critical: boolean;
}

const results: TestResult[] = [];

/**
 * Test helper functions
 */
function testExists(path: string, name: string, critical: boolean = true): TestResult {
  const fullPath = join(process.cwd(), path);
  const exists = existsSync(fullPath);
  
  return {
    name,
    passed: exists,
    message: exists ? `✅ ${path}` : `❌ MISSING: ${path}`,
    critical
  };
}

function testDirectory(path: string, minFiles: number, name: string, critical: boolean = true): TestResult {
  const fullPath = join(process.cwd(), path);
  const exists = existsSync(fullPath);
  
  if (!exists) {
    return {
      name,
      passed: false,
      message: `❌ MISSING DIRECTORY: ${path}`,
      critical
    };
  }
  
  const files = readdirSync(fullPath);
  const passed = files.length >= minFiles;
  
  return {
    name,
    passed,
    message: passed 
      ? `✅ ${path} (${files.length} files)` 
      : `⚠️  ${path} has only ${files.length} files (expected ${minFiles}+)`,
    critical
  };
}

/**
 * Main test suite
 */
async function runTests() {
  console.log(chalk.bold.cyan('\n🛡️  Mundo Tango File Protection Test Suite\n'));
  
  // Test 1: Critical Documentation Folders
  console.log(chalk.bold('1. Documentation Folders'));
  results.push(testDirectory('docs/MrBlue', 100, 'docs/MrBlue folder', true));
  results.push(testDirectory('docs/agents', 100, 'docs/agents folder', true));
  results.push(testDirectory('docs/ESA_Agents', 10, 'docs/ESA_Agents folder', true));
  results.push(testDirectory('docs/The Pages', 5, 'docs/The Pages folder', true));
  results.push(testDirectory('docs/audit-reports', 5, 'docs/audit-reports folder', false));
  results.push(testDirectory('docs/api', 1, 'docs/api folder', false));
  
  // Test 2: Critical Root Documentation
  console.log(chalk.bold('\n2. Root Documentation Files'));
  results.push(testExists('mb.md', 'MB.MD methodology guide', true));
  results.push(testExists('replit.md', 'Replit configuration', true));
  results.push(testExists('AGENT_LEARNING.md', 'Agent learning & safety protocols', true));
  results.push(testExists('MT_MASTER_REBUILD_PLAN.md', 'Master rebuild plan', true));
  results.push(testExists('DEPLOYMENT_STABILITY_PLAN.md', 'Deployment stability plan', false));
  
  // Test 3: Protection Scripts
  console.log(chalk.bold('\n3. Protection System Scripts'));
  results.push(testExists('scripts/backup-docs-to-db.ts', 'Backup script', true));
  results.push(testExists('scripts/restore-docs-from-db.ts', 'Restore script', true));
  results.push(testExists('scripts/pre-deploy-check.ts', 'Pre-deploy check', true));
  results.push(testExists('scripts/critical-files.json', 'Critical file registry', true));
  
  // Test 4: Core Agent System
  console.log(chalk.bold('\n4. Agent System Files'));
  results.push(testDirectory('server/agents', 20, 'Agent system folder', true));
  results.push(testExists('server/agents/agent-coordinator.ts', 'Agent coordinator', true));
  results.push(testExists('server/agents/leadership/index.ts', 'Leadership agents', true));
  results.push(testExists('server/agents/mr-blue/index.ts', 'Mr Blue agents', true));
  
  // Test 5: Database Schema
  console.log(chalk.bold('\n5. Database Schema'));
  results.push(testExists('shared/schema.ts', 'Database schema', true));
  results.push(testExists('server/db.ts', 'Database connection', true));
  results.push(testExists('drizzle.config.ts', 'Drizzle configuration', true));
  
  // Test 6: Page Components
  console.log(chalk.bold('\n6. Page Components'));
  results.push(testDirectory('client/src/pages', 5, 'Page components', true));
  results.push(testExists('client/src/pages/Landing.tsx', 'Landing page', false));
  results.push(testExists('client/src/App.tsx', 'App component', true));
  
  // Test 7: Middleware
  console.log(chalk.bold('\n7. Middleware Files'));
  results.push(testExists('server/middleware/errorHandler.ts', 'Error handler', true));
  results.push(testExists('server/middleware/responseTime.ts', 'Response time logger', false));
  results.push(testExists('server/middleware/securityHeaders.ts', 'Security headers', true));
  
  // Print results
  console.log(chalk.bold('\n\n📊 Test Results:\n'));
  
  const passed = results.filter(r => r.passed);
  const failed = results.filter(r => !r.passed);
  const criticalFailed = failed.filter(r => r.critical);
  
  results.forEach(result => {
    if (result.passed) {
      console.log(chalk.green(result.message));
    } else if (result.critical) {
      console.log(chalk.red.bold(result.message));
    } else {
      console.log(chalk.yellow(result.message));
    }
  });
  
  // Summary
  console.log(chalk.bold('\n' + '─'.repeat(60)));
  console.log(chalk.bold(`Total Tests: ${results.length}`));
  console.log(chalk.green(`✅ Passed: ${passed.length}`));
  console.log(chalk.red(`❌ Failed: ${failed.length}`));
  if (criticalFailed.length > 0) {
    console.log(chalk.red.bold(`🚨 Critical Failures: ${criticalFailed.length}`));
  }
  console.log('─'.repeat(60) + '\n');
  
  // Exit code
  if (criticalFailed.length > 0) {
    console.log(chalk.red.bold('❌ CRITICAL FILES MISSING - DEPLOYMENT BLOCKED'));
    console.log(chalk.yellow('\n💡 Recovery Options:'));
    console.log(chalk.yellow('   1. Run: npm run restore-docs'));
    console.log(chalk.yellow('   2. Check git history for deleted files'));
    console.log(chalk.yellow('   3. Review AGENT_LEARNING.md for guidelines\n'));
    process.exit(1);
  } else if (failed.length > 0) {
    console.log(chalk.yellow('⚠️  Some non-critical files missing, but deployment can proceed'));
    process.exit(0);
  } else {
    console.log(chalk.green.bold('✅ ALL PROTECTION TESTS PASSED'));
    console.log(chalk.green('🚀 System integrity verified - safe to deploy\n'));
    process.exit(0);
  }
}

// Run tests
runTests().catch(error => {
  console.error(chalk.red.bold('\n❌ Test suite failed with error:'));
  console.error(error);
  process.exit(1);
});
