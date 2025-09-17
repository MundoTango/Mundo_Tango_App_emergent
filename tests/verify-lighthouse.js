#!/usr/bin/env node

/**
 * ESA Layer 48 - Lighthouse CI Verification Script
 * Quick test to verify Lighthouse CI is properly configured
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

console.log('🔍 Verifying Lighthouse CI Configuration for ESA Layer 48...\n');

async function verifyLighthouseSetup() {
  const results = {
    lhciInstalled: false,
    configValid: false,
    serverRunning: false,
    lighthouseRun: false
  };

  try {
    // 1. Check LHCI is installed
    console.log('1. Checking Lighthouse CI installation...');
    const { stdout: version } = await execAsync('npx lhci --version');
    console.log(`   ✅ Lighthouse CI v${version.trim()} installed`);
    results.lhciInstalled = true;
  } catch (error) {
    console.error('   ❌ Lighthouse CI not installed');
    return results;
  }

  try {
    // 2. Validate configuration
    console.log('\n2. Validating configuration file...');
    const config = await import('../.lighthouserc.js');
    if (config.default && config.default.ci) {
      console.log('   ✅ Configuration file valid');
      console.log(`   📊 Will test ${config.default.ci.collect.url.length} URLs`);
      console.log(`   🔄 Will run ${config.default.ci.collect.numberOfRuns} times per URL`);
      results.configValid = true;
    }
  } catch (error) {
    console.error('   ❌ Configuration file invalid:', error.message);
    return results;
  }

  try {
    // 3. Check if server is running
    console.log('\n3. Checking if dev server is accessible...');
    const response = await fetch('http://localhost:5000/');
    if (response.ok) {
      console.log('   ✅ Dev server is running on port 5000');
      results.serverRunning = true;
    }
  } catch (error) {
    console.error('   ❌ Dev server not accessible. Please run: npm run dev');
    return results;
  }

  try {
    // 4. Run a simple Lighthouse test
    console.log('\n4. Running quick Lighthouse audit on homepage...');
    console.log('   This may take a moment...');
    
    const { stdout } = await execAsync(
      'npx lhci collect --url=http://localhost:5000/ --numberOfRuns=1 --settings.preset=desktop --settings.output=json'
    );
    
    console.log('   ✅ Lighthouse audit completed successfully');
    results.lighthouseRun = true;
  } catch (error) {
    console.error('   ❌ Lighthouse audit failed:', error.message);
  }

  return results;
}

async function main() {
  const results = await verifyLighthouseSetup();
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 ESA LAYER 48 LIGHTHOUSE CI VERIFICATION SUMMARY:');
  console.log('='.repeat(60));
  
  const allPassed = Object.values(results).every(v => v === true);
  
  if (allPassed) {
    console.log('\n✅ All checks passed! Lighthouse CI is properly configured.');
    console.log('\n🚀 You can now run:');
    console.log('   - `npm run test:lighthouse` to run full performance audits');
    console.log('   - `npx playwright test tests/e2e/performance/lighthouse.spec.ts` to run performance tests');
    console.log('   - GitHub Actions will automatically run on push/PR');
  } else {
    console.log('\n❌ Some checks failed. Please fix the issues above.');
    console.log('\n📋 Verification results:');
    Object.entries(results).forEach(([key, value]) => {
      console.log(`   ${key}: ${value ? '✅' : '❌'}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  
  process.exit(allPassed ? 0 : 1);
}

main().catch(console.error);