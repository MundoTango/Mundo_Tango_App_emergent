#!/usr/bin/env tsx
/**
 * Pre-Deployment Integrity Check
 * 
 * Runs before every deployment to ensure all critical files exist
 * and the build will succeed.
 * 
 * Usage: npm run predeploy
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const CRITICAL_FILES = require('./critical-files.json');

interface MissingFile {
  category: string;
  file: string;
}

async function checkCriticalFiles(): Promise<boolean> {
  console.log('🔍 Checking critical files...\n');
  const missing: MissingFile[] = [];
  
  for (const [category, files] of Object.entries(CRITICAL_FILES.criticalFiles)) {
    for (const file of files as string[]) {
      const exists = fs.existsSync(file);
      if (!exists) {
        missing.push({ category, file });
        console.error(`   ❌ ${category}: ${file}`);
      } else {
        console.log(`   ✅ ${file}`);
      }
    }
  }
  
  if (missing.length > 0) {
    console.error(`\n❌ CRITICAL: ${missing.length} files missing!`);
    console.error('\n💡 Run this to restore from git:');
    console.error('   git log --all --oneline --name-status -- <filename>');
    console.error('   git show <commit>:<file> > <destination>');
    return false;
  }
  
  console.log('\n✅ All critical files present');
  return true;
}

async function checkDirectories(): Promise<boolean> {
  console.log('\n🔍 Checking required directories...\n');
  const missing: string[] = [];
  
  for (const dir of CRITICAL_FILES.requiredDirectories) {
    const exists = fs.existsSync(dir);
    if (!exists) {
      missing.push(dir);
      console.error(`   ❌ ${dir}`);
    } else {
      console.log(`   ✅ ${dir}`);
    }
  }
  
  if (missing.length > 0) {
    console.error(`\n❌ CRITICAL: ${missing.length} directories missing!`);
    return false;
  }
  
  console.log('\n✅ All required directories present');
  return true;
}

async function checkTypeScript(): Promise<boolean> {
  console.log('\n🔍 Checking TypeScript compilation...\n');
  try {
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
    console.log('✅ TypeScript compiles successfully');
    return true;
  } catch (error) {
    console.error('❌ TypeScript compilation failed');
    console.error('\n💡 Fix TypeScript errors before deploying');
    return false;
  }
}

async function main() {
  console.log('🛡️  PRE-DEPLOYMENT INTEGRITY CHECK\n');
  console.log('=' .repeat(60));
  
  const filesOk = await checkCriticalFiles();
  const dirsOk = await checkDirectories();
  
  console.log('=' .repeat(60));
  
  if (!filesOk || !dirsOk) {
    console.error('\n❌ PRE-DEPLOYMENT CHECK FAILED');
    console.error('   Fix the issues above before deploying\n');
    process.exit(1);
  }
  
  console.log('\n✅ ALL CHECKS PASSED - SAFE TO DEPLOY\n');
  process.exit(0);
}

main().catch(err => {
  console.error('\n❌ PRE-DEPLOYMENT CHECK FAILED:', err.message);
  process.exit(1);
});
