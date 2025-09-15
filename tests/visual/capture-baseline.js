#!/usr/bin/env node

/**
 * Mundo Tango Visual Regression - Baseline Capture Script
 * Captures baseline images for visual regression testing
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const BACKSTOP_CONFIG = path.join(process.cwd(), 'backstop.json');
const PERCY_TOKEN = process.env.PERCY_TOKEN;

console.log('🌊 Mundo Tango Visual Regression - Baseline Capture');
console.log('====================================================\n');

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch('http://localhost:5000');
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Run BackstopJS reference capture
function captureBackstopReference() {
  return new Promise((resolve, reject) => {
    console.log('📸 Capturing BackstopJS reference images...');
    
    exec('npx backstop reference', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ BackstopJS reference capture failed:', error);
        reject(error);
        return;
      }
      
      console.log(stdout);
      if (stderr) console.error(stderr);
      
      console.log('✅ BackstopJS reference images captured successfully!\n');
      resolve();
    });
  });
}

// Run Percy baseline capture
function capturePercyBaseline() {
  return new Promise((resolve, reject) => {
    if (!PERCY_TOKEN) {
      console.log('⚠️  Percy token not found. Skipping Percy baseline capture.');
      console.log('   Set PERCY_TOKEN environment variable to enable Percy.\n');
      resolve();
      return;
    }
    
    console.log('📸 Capturing Percy baseline snapshots...');
    
    const percyCommand = `PERCY_TOKEN=${PERCY_TOKEN} npx percy exec -- npx playwright test tests/visual/percy/percy-snapshots.spec.ts`;
    
    exec(percyCommand, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Percy baseline capture failed:', error);
        reject(error);
        return;
      }
      
      console.log(stdout);
      if (stderr) console.error(stderr);
      
      console.log('✅ Percy baseline snapshots captured successfully!');
      console.log('   View your snapshots at: https://percy.io\n');
      resolve();
    });
  });
}

// Clean old baseline images
function cleanOldBaselines() {
  const backstopDataPath = path.join(process.cwd(), 'backstop_data');
  const referencePath = path.join(backstopDataPath, 'bitmaps_reference');
  
  if (fs.existsSync(referencePath)) {
    console.log('🧹 Cleaning old baseline images...');
    fs.rmSync(referencePath, { recursive: true, force: true });
    console.log('✅ Old baseline images cleaned.\n');
  }
}

// Main execution
async function main() {
  try {
    // Check if server is running
    console.log('🔍 Checking if development server is running...');
    const serverRunning = await checkServer();
    
    if (!serverRunning) {
      console.error('❌ Development server is not running!');
      console.error('   Please start the server with: npm run dev');
      process.exit(1);
    }
    
    console.log('✅ Development server is running.\n');
    
    // Ask user if they want to clean old baselines
    if (process.argv.includes('--clean')) {
      cleanOldBaselines();
    }
    
    // Capture BackstopJS baselines
    await captureBackstopReference();
    
    // Capture Percy baselines
    await capturePercyBaseline();
    
    console.log('🎉 Visual regression baseline capture complete!');
    console.log('\nNext steps:');
    console.log('1. Review captured baselines');
    console.log('2. Run tests with: npm run test:visual');
    console.log('3. Approve changes with: npm run test:visual:approve\n');
    
  } catch (error) {
    console.error('❌ Baseline capture failed:', error);
    process.exit(1);
  }
}

// Run the script
main();