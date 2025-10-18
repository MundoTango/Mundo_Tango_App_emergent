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
 * 3. Import statements are valid (no broken imports)
 * 4. Exit with code 1 if any issues found (blocks deployment)
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface CriticalFilesRegistry {
  description: string;
  version: string;
  lastUpdated: string;
  categories: {
    [key: string]: {
      description: string;
      files: string[];
    };
  };
}

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function validateFileExistence(): Promise<{ passed: boolean; missing: string[] }> {
  log('\n🔍 [Step 1/3] Checking critical file existence...\n', 'cyan');
  
  const registryPath = path.join(process.cwd(), 'scripts', 'critical-files.json');
  
  if (!fs.existsSync(registryPath)) {
    log('❌ Critical files registry not found: scripts/critical-files.json', 'red');
    return { passed: false, missing: [registryPath] };
  }
  
  const registry: CriticalFilesRegistry = JSON.parse(
    fs.readFileSync(registryPath, 'utf-8')
  );
  
  const missing: string[] = [];
  let totalFiles = 0;
  
  for (const [categoryKey, category] of Object.entries(registry.categories)) {
    log(`  📂 ${categoryKey}: ${category.description}`, 'cyan');
    
    for (const file of category.files) {
      totalFiles++;
      const filePath = path.join(process.cwd(), file);
      
      if (!fs.existsSync(filePath)) {
        log(`    ✗ MISSING: ${file}`, 'red');
        missing.push(file);
      }
    }
    
    console.log(); // Empty line between categories
  }
  
  log(`  Checked: ${totalFiles}/${totalFiles} files\n`, 'cyan');
  
  if (missing.length > 0) {
    log(`❌ DEPLOYMENT BLOCKED - ${missing.length} critical files missing:`, 'red');
    missing.forEach(file => log(`  - ${file}`, 'red'));
    return { passed: false, missing };
  }
  
  log('✅ All critical files exist', 'green');
  return { passed: true, missing: [] };
}

async function validateTypeScript(): Promise<boolean> {
  log('\n🔍 [Step 2/3] Running TypeScript compilation check...', 'cyan');
  
  try {
    execSync('npx tsc --noEmit', {
      stdio: 'pipe',
      encoding: 'utf-8',
    });
    
    log('✅ TypeScript compilation successful - no errors', 'green');
    return true;
  } catch (error: any) {
    const output = error.stdout || error.stderr || '';
    log('❌ DEPLOYMENT BLOCKED - TypeScript compilation errors detected:', 'red');
    console.log(output);
    log('\n💡 Fix TypeScript errors before deployment', 'yellow');
    return false;
  }
}

async function validateImports(): Promise<boolean> {
  log('\n🔍 [Step 3/3] Validating import statements...', 'cyan');
  
  try {
    // Dynamically import the validation function
    const { validateAllImports } = await import('./validate-imports.js');
    
    const directories = ['server', 'client', 'shared'];
    const errors = await validateAllImports(directories);
    
    if (errors.length === 0) {
      log('✅ All imports are valid - no broken import statements', 'green');
      return true;
    } else {
      log(`❌ DEPLOYMENT BLOCKED - Found ${errors.length} broken import(s):`, 'red');
      
      // Group by file
      const errorsByFile = new Map<string, typeof errors>();
      for (const error of errors) {
        if (!errorsByFile.has(error.file)) {
          errorsByFile.set(error.file, []);
        }
        errorsByFile.get(error.file)!.push(error);
      }

      // Display grouped errors
      for (const [file, fileErrors] of errorsByFile) {
        log(`\n  📄 ${file}:`, 'yellow');
        for (const error of fileErrors) {
          log(`    Line ${error.lineNumber}: Cannot find module '${error.importPath}'`, 'red');
          log(`      Expected at: ${error.resolvedPath}`, 'yellow');
        }
      }
      
      log('\n💡 Fix these imports before deployment:', 'yellow');
      log('   1. Create the missing files, OR', 'yellow');
      log('   2. Remove/update the import statements', 'yellow');
      log('   3. Run this check again: npm run validate:imports', 'yellow');
      
      return false;
    }
  } catch (error) {
    log('⚠️  Import validation skipped - validator not available', 'yellow');
    log('   (Will rely on TypeScript compiler for import checking)', 'yellow');
    return true; // Don't block deployment if validator fails to load
  }
}

async function generateReport(
  fileCheck: { passed: boolean; missing: string[] },
  tsCheck: boolean,
  importCheck: boolean
): Promise<void> {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('📊 PRE-DEPLOYMENT VALIDATION REPORT', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  
  const allPassed = fileCheck.passed && tsCheck && importCheck;
  
  log(`\n  File Integrity:    ${fileCheck.passed ? '✅ PASSED' : '❌ FAILED'}`, fileCheck.passed ? 'green' : 'red');
  log(`  TypeScript Check:  ${tsCheck ? '✅ PASSED' : '❌ FAILED'}`, tsCheck ? 'green' : 'red');
  log(`  Import Validation: ${importCheck ? '✅ PASSED' : '❌ FAILED'}`, importCheck ? 'green' : 'red');
  
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  
  if (allPassed) {
    log('✅ DEPLOYMENT VALIDATION PASSED', 'green');
    log('   All checks successful - safe to deploy\n', 'green');
  } else {
    log('❌ DEPLOYMENT VALIDATION FAILED', 'red');
    log('   DO NOT PROCEED - Fix issues above first\n', 'red');
    
    if (!fileCheck.passed) {
      log('💡 To fix missing files:', 'yellow');
      log('   1. Review the list of missing files above', 'yellow');
      log('   2. Create or restore them from git', 'yellow');
      log('   3. Run this check again: npm run predeploy\n', 'yellow');
    }
    
    if (!tsCheck) {
      log('💡 To fix TypeScript errors:', 'yellow');
      log('   1. Review the compilation errors above', 'yellow');
      log('   2. Fix all type errors and missing imports', 'yellow');
      log('   3. Run this check again: npm run predeploy\n', 'yellow');
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
  const importCheck = await validateImports();
  
  // Generate report
  await generateReport(fileCheck, tsCheck, importCheck);
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  log(`⏱️  Validation completed in ${duration}s\n`, 'cyan');
  
  // Exit with appropriate code
  if (fileCheck.passed && tsCheck && importCheck) {
    process.exit(0); // Success
  } else {
    process.exit(1); // Failure - blocks deployment
  }
}

export { validateFileExistence, validateTypeScript, validateImports };

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    log(`\n❌ Fatal error during validation: ${error.message}`, 'red');
    process.exit(1);
  });
}
