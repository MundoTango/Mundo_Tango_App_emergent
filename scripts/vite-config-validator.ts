#!/usr/bin/env tsx
/**
 * Vite Config Validation Script
 * 
 * Purpose: Ensure vite.config.ts exists and is valid before deployment
 * Created: October 19, 2025 (MB.MD Phase 3: MITIGATION)
 * 
 * This script prevents deployment build failures by:
 * 1. Checking vite.config.ts exists
 * 2. Validating it has required fields (root, plugins, resolve.alias)
 * 3. Confirming build output directory is configured
 * 
 * Usage:
 *   tsx scripts/vite-config-validator.ts
 *   npm run validate:vite-config (add to package.json)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const viteConfigPath = path.join(rootDir, 'vite.config.ts');

console.log('🔍 Validating vite.config.ts...\n');

// 1. Check file exists
if (!fs.existsSync(viteConfigPath)) {
  console.error('❌ FATAL: vite.config.ts not found!');
  console.error('Expected location:', viteConfigPath);
  console.error('\nThis file is CRITICAL for production builds.');
  console.error('Without it, `npm run build` will fail.\n');
  console.error('Solution: Create vite.config.ts in root directory');
  console.error('Copy from dist/vite.config.ts or server/vite.ts inline config\n');
  process.exit(1);
}

console.log('✅ vite.config.ts exists');

// 2. Read and validate content
const configContent = fs.readFileSync(viteConfigPath, 'utf-8');

const requiredFields = [
  { field: "root: 'client'", description: 'Client directory as root' },
  { field: 'plugins:', description: 'Vite plugins (react)' },
  { field: 'resolve:', description: 'Path aliases configuration' },
  { field: 'alias:', description: 'Path aliases (@ and @shared)' },
  { field: 'build:', description: 'Build configuration' },
  { field: 'outDir:', description: 'Build output directory' },
];

let allValid = true;

console.log('\n🔍 Validating configuration fields:\n');

for (const { field, description } of requiredFields) {
  const exists = configContent.includes(field);
  if (exists) {
    console.log(`✅ ${description} (${field})`);
  } else {
    console.error(`❌ Missing: ${description} (${field})`);
    allValid = false;
  }
}

if (!allValid) {
  console.error('\n❌ vite.config.ts is invalid!');
  console.error('Some required fields are missing.\n');
  console.error('Fix the configuration before deploying.\n');
  process.exit(1);
}

// 3. Check specific critical values
if (!configContent.includes("root: 'client'")) {
  console.error("\n⚠️  WARNING: root is not set to 'client'");
  console.error('This may cause build failures.\n');
  allValid = false;
}

if (!configContent.includes("outDir: '../dist/public'")) {
  console.error("\n⚠️  WARNING: outDir is not '../dist/public'");
  console.error('Build output may go to wrong directory.\n');
  allValid = false;
}

if (!allValid) {
  console.error('❌ Configuration has warnings. Review and fix.\n');
  process.exit(1);
}

// 4. Validate it's not corrupted (basic syntax check)
if (configContent.length < 100) {
  console.error('\n❌ vite.config.ts seems corrupted (file too small)');
  console.error(`Current size: ${configContent.length} bytes`);
  console.error('Expected size: >1000 bytes\n');
  process.exit(1);
}

console.log('\n✅ All configuration fields present');
console.log(`✅ File size: ${configContent.length} bytes`);
console.log('\n🎉 vite.config.ts validation PASSED!\n');

// 5. Report success
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ VITE CONFIG VALIDATION: PASSED');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

process.exit(0);
