#!/usr/bin/env node

/**
 * Mundo Tango Visual Regression - Setup Verification Script
 * Verifies that all visual regression testing components are properly configured
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🌊 Mundo Tango Visual Regression Testing - Setup Verification');
console.log('=============================================================\n');

const checks = {
  'Percy Configuration': '.percy.yml',
  'BackstopJS Configuration': 'backstop.json',
  'Lighthouse Configuration': 'lighthouserc.json',
  'Percy Test Suite': 'tests/visual/percy/percy-snapshots.spec.ts',
  'Accessibility Tests': 'tests/visual/accessibility-visual.spec.ts',
  'Baseline Capture Script': 'tests/visual/capture-baseline.js',
  'OnBefore Script': 'tests/visual/puppet/onBefore.js',
  'OnReady Script': 'tests/visual/puppet/onReady.js',
  'Dark Mode Script': 'tests/visual/puppet/setDarkMode.js',
  'GitHub Actions Workflow': '.github/workflows/visual-regression.yml',
  'Documentation': 'docs/VISUAL_REGRESSION_TESTING.md'
};

let allPassed = true;

console.log('📋 Checking configuration files...\n');

for (const [name, file] of Object.entries(checks)) {
  const exists = fs.existsSync(path.join(process.cwd(), file));
  if (exists) {
    console.log(`✅ ${name}: ${file}`);
  } else {
    console.log(`❌ ${name}: ${file} - NOT FOUND`);
    allPassed = false;
  }
}

console.log('\n📦 Checking npm scripts...\n');

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredScripts = [
  'test:visual',
  'test:visual:backstop',
  'test:visual:percy',
  'test:visual:baseline',
  'test:visual:a11y',
  'test:lighthouse'
];

for (const script of requiredScripts) {
  if (packageJson.scripts[script]) {
    console.log(`✅ Script '${script}' is configured`);
  } else {
    console.log(`❌ Script '${script}' is missing`);
    allPassed = false;
  }
}

console.log('\n🔍 Checking dependencies...\n');

const requiredDeps = [
  '@percy/playwright',
  '@axe-core/playwright',
  '@lhci/cli',
  'backstopjs'
];

for (const dep of requiredDeps) {
  const installed = packageJson.dependencies[dep] || packageJson.devDependencies[dep];
  if (installed) {
    console.log(`✅ ${dep} is installed (v${installed})`);
  } else {
    console.log(`❌ ${dep} is not installed`);
    allPassed = false;
  }
}

console.log('\n🌍 Checking environment...\n');

// Check for Percy token
if (process.env.PERCY_TOKEN) {
  console.log(`✅ PERCY_TOKEN is set`);
} else {
  console.log(`⚠️  PERCY_TOKEN is not set (Percy tests will be skipped)`);
}

// Check if Playwright is installed
try {
  execSync('npx playwright --version', { stdio: 'ignore' });
  console.log(`✅ Playwright is installed`);
} catch (error) {
  console.log(`❌ Playwright is not installed - run 'npm run test:install'`);
  allPassed = false;
}

console.log('\n=============================================================');

if (allPassed) {
  console.log('✅ Visual regression testing setup is complete!');
  console.log('\nNext steps:');
  console.log('1. Set PERCY_TOKEN environment variable (optional)');
  console.log('2. Run "npm run test:visual:baseline" to capture baselines');
  console.log('3. Run "npm run test:visual" to run visual tests');
} else {
  console.log('⚠️  Some components are missing. Please review the output above.');
}

console.log('\n📚 Documentation: docs/VISUAL_REGRESSION_TESTING.md');
console.log('=============================================================\n');

process.exit(allPassed ? 0 : 1);