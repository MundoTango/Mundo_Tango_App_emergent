#!/usr/bin/env tsx
/**
 * Mundo Tango - Pre-Deployment Validation
 * 3-Step validation: File existence, TypeScript compilation, Import validation
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

interface CriticalFilesRegistry {
  description: string;
  categories: Record<string, { description: string; files: string[] }>;
}

console.log('╔════════════════════════════════════════════╗');
console.log('║  Mundo Tango - Pre-Deployment Validation  ║');
console.log('╚════════════════════════════════════════════╝\n');

let exitCode = 0;
const errors: string[] = [];

// ==============================================
// STEP 1: File Existence Check
// ==============================================

console.log('🔍 [Step 1/3] Checking critical file existence...');

try {
  const registryPath = join(__dirname, 'critical-files.json');
  const registry: CriticalFilesRegistry = JSON.parse(
    readFileSync(registryPath, 'utf-8')
  );

  let totalFiles = 0;
  let missingFiles = 0;
  const missing: Record<string, string[]> = {};

  for (const [category, { files }] of Object.entries(registry.categories)) {
    for (const file of files) {
      totalFiles++;
      const filePath = join(projectRoot, file);
      
      if (!existsSync(filePath)) {
        missingFiles++;
        if (!missing[category]) {
          missing[category] = [];
        }
        missing[category].push(file);
      }
    }
  }

  if (missingFiles > 0) {
    console.log(`❌ DEPLOYMENT BLOCKED - ${missingFiles}/${totalFiles} critical files missing:\n`);
    
    for (const [category, files] of Object.entries(missing)) {
      console.log(`   Category: ${category}`);
      files.forEach(file => console.log(`     - ${file}`));
      console.log('');
    }
    
    errors.push(`Missing ${missingFiles} critical files`);
    exitCode = 1;
  } else {
    console.log(`✅ All ${totalFiles} critical files exist\n`);
  }
} catch (error) {
  console.log(`❌ Failed to check file existence: ${(error as Error).message}\n`);
  errors.push('File existence check failed');
  exitCode = 1;
}

// ==============================================
// STEP 2: TypeScript Compilation Check
// ==============================================

console.log('🔍 [Step 2/3] Running TypeScript compilation check...');

try {
  execSync('npx tsc --noEmit', {
    cwd: projectRoot,
    stdio: 'pipe',
    encoding: 'utf-8'
  });
  
  console.log('✅ TypeScript compilation successful\n');
} catch (error: any) {
  const output = error.stdout || error.stderr || error.message;
  
  console.log('❌ DEPLOYMENT BLOCKED - TypeScript compilation errors detected:\n');
  console.log(output);
  console.log('');
  
  errors.push('TypeScript compilation failed');
  exitCode = 1;
}

// ==============================================
// STEP 3: Import Validation
// ==============================================

console.log('🔍 [Step 3/3] Validating import statements...');

try {
  const output = execSync('tsx scripts/validate-imports.ts', {
    cwd: projectRoot,
    encoding: 'utf-8',
    stdio: 'pipe'
  });
  
  console.log('✅ All imports are valid\n');
} catch (error: any) {
  const output = error.stdout || error.message;
  
  console.log('❌ DEPLOYMENT BLOCKED - Found broken import(s):\n');
  console.log(output);
  console.log('');
  
  errors.push('Import validation failed');
  exitCode = 1;
}

// ==============================================
// FINAL REPORT
// ==============================================

console.log('📊 PRE-DEPLOYMENT VALIDATION REPORT');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`  File Integrity:    ${errors.includes('Missing') || errors.includes('File existence') ? '❌ FAILED' : '✅ PASSED'}`);
console.log(`  TypeScript Check:  ${errors.includes('TypeScript') ? '❌ FAILED' : '✅ PASSED'}`);
console.log(`  Import Validation: ${errors.includes('Import') ? '❌ FAILED' : '✅ PASSED'}`);
console.log('');

if (exitCode === 0) {
  console.log('✅ DEPLOYMENT VALIDATION PASSED');
  console.log('   Safe to proceed with deployment\n');
} else {
  console.log('❌ DEPLOYMENT VALIDATION FAILED');
  console.log('   DO NOT PROCEED - Fix issues above first\n');
  console.log('Errors:');
  errors.forEach(err => console.log(`  - ${err}`));
  console.log('');
}

process.exit(exitCode);
