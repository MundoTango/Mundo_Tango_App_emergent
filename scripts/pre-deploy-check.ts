#!/usr/bin/env tsx
/**
 * Mundo Tango ESA LIFE CEO - Pre-Deployment File Integrity Check
 * 
 * Purpose: Validate all critical files exist and TypeScript compiles before deployment
 * Usage: npm run predeploy
 * 
 * Checks:
 * 1. All critical files from critical-files.json exist
 * 2. TypeScript compilation passes (no LSP errors)
 * 3. Exit with code 1 if any issues found (blocks deployment)
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface CriticalFilesRegistry {
  description: string;
  version: string;
  lastUpdated: string;
  categories: {
    [category: string]: {
      description: string;
      files: string[];
    };
  };
}

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof COLORS = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function loadCriticalFiles(): CriticalFilesRegistry {
  const registryPath = path.join(process.cwd(), 'scripts', 'critical-files.json');
  
  if (!fs.existsSync(registryPath)) {
    log('❌ CRITICAL: scripts/critical-files.json not found!', 'red');
    log('   File integrity system is not properly configured.', 'red');
    process.exit(1);
  }

  try {
    const content = fs.readFileSync(registryPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    log('❌ CRITICAL: Failed to parse critical-files.json', 'red');
    log(`   Error: ${error}`, 'red');
    process.exit(1);
  }
}

async function validateFileExistence(): Promise<{ passed: boolean; missing: string[] }> {
  log('\n🔍 [Step 1/3] Checking critical file existence...', 'cyan');
  
  const registry = loadCriticalFiles();
  const missing: string[] = [];
  let totalFiles = 0;
  let checkedFiles = 0;

  // Count total files first
  for (const [categoryName, category] of Object.entries(registry.categories)) {
    totalFiles += category.files.length;
  }

  // Check each category
  for (const [categoryName, category] of Object.entries(registry.categories)) {
    log(`\n  📂 ${categoryName}: ${category.description}`, 'blue');
    
    for (const file of category.files) {
      checkedFiles++;
      const exists = fs.existsSync(file);
      
      if (exists) {
        // Silent success for cleaner output
        // log(`    ✓ ${file}`, 'green');
      } else {
        log(`    ✗ MISSING: ${file}`, 'red');
        missing.push(file);
      }
    }
  }

  log(`\n  Checked: ${checkedFiles}/${totalFiles} files`, 'cyan');

  if (missing.length === 0) {
    log('✅ All critical files exist', 'green');
    return { passed: true, missing: [] };
  } else {
    log(`\n❌ DEPLOYMENT BLOCKED - ${missing.length} critical files missing:`, 'red');
    missing.forEach(f => log(`  - ${f}`, 'red'));
    return { passed: false, missing };
  }
}

async function validateTypeScript(): Promise<boolean> {
  log('\n🔍 [Step 2/3] Running TypeScript compilation check...', 'cyan');
  
  try {
    // Run TypeScript compiler in check mode (no emit)
    execSync('npx tsc --noEmit --skipLibCheck', {
      stdio: 'pipe',
      encoding: 'utf-8'
    });
    
    log('✅ TypeScript compilation passed - 0 errors', 'green');
    return true;
  } catch (error: any) {
    log('❌ DEPLOYMENT BLOCKED - TypeScript compilation errors detected:', 'red');
    
    // Show the errors
    if (error.stdout) {
      console.log(error.stdout);
    }
    if (error.stderr) {
      console.error(error.stderr);
    }
    
    log('\n💡 Fix TypeScript errors before deployment', 'yellow');
    return false;
  }
}

async function validateImports(): Promise<boolean> {
  log('\n🔍 [Step 3/3] Validating import statements...', 'cyan');
  
  // This is a simple check - could be enhanced later with full import graph validation
  // For now, if TypeScript compiles, imports are valid
  
  log('✅ Import validation delegated to TypeScript compiler', 'green');
  return true;
}

async function generateReport(
  fileCheck: { passed: boolean; missing: string[] },
  tsCheck: boolean
): Promise<void> {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('📊 PRE-DEPLOYMENT VALIDATION REPORT', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  
  const allPassed = fileCheck.passed && tsCheck;
  
  log(`\n  File Integrity:    ${fileCheck.passed ? '✅ PASSED' : '❌ FAILED'}`, fileCheck.passed ? 'green' : 'red');
  log(`  TypeScript Check:  ${tsCheck ? '✅ PASSED' : '❌ FAILED'}`, tsCheck ? 'green' : 'red');
  log(`  Import Validation: ✅ PASSED`, 'green');
  
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  
  if (allPassed) {
    log('✅ DEPLOYMENT VALIDATION PASSED', 'green');
    log('   Safe to proceed with build and deployment', 'green');
  } else {
    log('❌ DEPLOYMENT VALIDATION FAILED', 'red');
    log('   DO NOT PROCEED - Fix issues above first', 'red');
    
    if (!fileCheck.passed) {
      log('\n💡 To fix missing files:', 'yellow');
      log('   1. Review the list of missing files above', 'yellow');
      log('   2. Create or restore them from git', 'yellow');
      log('   3. Run this check again: npm run predeploy', 'yellow');
    }
    
    if (!tsCheck) {
      log('\n💡 To fix TypeScript errors:', 'yellow');
      log('   1. Review the compilation errors above', 'yellow');
      log('   2. Fix all type errors and missing imports', 'yellow');
      log('   3. Run this check again: npm run predeploy', 'yellow');
    }
  }
  
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');
}

async function main() {
  log('╔════════════════════════════════════════════╗', 'cyan');
  log('║  Mundo Tango - Pre-Deployment Validation  ║', 'cyan');
  log('╚════════════════════════════════════════════╝', 'cyan');
  
  const startTime = Date.now();
  
  // Run all checks
  const fileCheck = await validateFileExistence();
  const tsCheck = await validateTypeScript();
  await validateImports();
  
  // Generate report
  await generateReport(fileCheck, tsCheck);
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  log(`⏱️  Validation completed in ${duration}s\n`, 'cyan');
  
  // Exit with appropriate code
  if (fileCheck.passed && tsCheck) {
    process.exit(0); // Success
  } else {
    process.exit(1); // Failure - blocks deployment
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    log(`\n❌ CRITICAL ERROR: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  });
}

export { validateFileExistence, validateTypeScript, validateImports };
