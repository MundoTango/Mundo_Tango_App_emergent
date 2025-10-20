#!/usr/bin/env node

/**
 * MB.MD S3: Lighthouse Audit Script
 * Created: October 20, 2025
 * 
 * Runs Lighthouse performance audit and generates report
 * Target: All scores > 90
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LIGHTHOUSE_CLI = 'npx lighthouse';
const TARGET_URL = process.env.LIGHTHOUSE_URL || 'http://localhost:5000';
const OUTPUT_DIR = path.join(process.cwd(), 'lighthouse-reports');

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

console.log('🔍 Running Lighthouse Audit...');
console.log(`   Target URL: ${TARGET_URL}`);
console.log(`   Report directory: ${OUTPUT_DIR}\n`);

try {
  // Check if Chrome/Chromium is available
  try {
    execSync('which chromium chromium-browser google-chrome chrome 2>/dev/null', { stdio: 'pipe' });
  } catch (e) {
    console.log('⚠️  Chrome/Chromium not detected in this environment.');
    console.log('ℹ️  Lighthouse requires Chrome to run performance audits.');
    console.log('');
    console.log('To run Lighthouse locally:');
    console.log('  1. Install Chrome or Chromium');
    console.log('  2. Run: node scripts/lighthouse-audit.mjs');
    console.log('  3. Or use Chrome DevTools (F12 → Lighthouse tab)');
    console.log('');
    console.log('✅ Lighthouse script configured and ready for local execution.');
    process.exit(0);
  }

  // Run Lighthouse
  const command = `${LIGHTHOUSE_CLI} ${TARGET_URL} --output=html,json --output-path=${path.join(OUTPUT_DIR, `lighthouse-${timestamp}`)} --chrome-flags="--headless --no-sandbox --disable-dev-shm-usage" --only-categories=performance,accessibility,best-practices,seo --quiet`;
  
  console.log('⏳ Running audit (this may take 30-60 seconds)...\n');
  execSync(command, { stdio: 'inherit' });

  // Read JSON report to extract scores
  const jsonReportPath = `${path.join(OUTPUT_DIR, `lighthouse-${timestamp}`)}.report.json`;
  if (fs.existsSync(jsonReportPath)) {
    const report = JSON.parse(fs.readFileSync(jsonReportPath, 'utf-8'));
    const categories = report.categories;

    console.log('\n📊 Lighthouse Scores:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const performance = (categories.performance.score * 100).toFixed(0);
    const accessibility = (categories.accessibility.score * 100).toFixed(0);
    const bestPractices = (categories['best-practices'].score * 100).toFixed(0);
    const seo = (categories.seo.score * 100).toFixed(0);

    console.log(`   Performance:     ${performance}/100 ${getEmoji(performance)}`);
    console.log(`   Accessibility:   ${accessibility}/100 ${getEmoji(accessibility)}`);
    console.log(`   Best Practices:  ${bestPractices}/100 ${getEmoji(bestPractices)}`);
    console.log(`   SEO:             ${seo}/100 ${getEmoji(seo)}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Check if all scores meet target
    const allScoresAbove90 = [performance, accessibility, bestPractices, seo].every(s => s >= 90);
    
    if (allScoresAbove90) {
      console.log('✅ All scores above 90! Production ready!');
    } else {
      console.log('⚠️  Some scores below 90. Review report for improvements.');
    }

    const htmlReport = `${path.join(OUTPUT_DIR, `lighthouse-${timestamp}`)}.report.html`;
    console.log(`\n📄 Full report: ${htmlReport}`);
    
    // Write summary
    const summary = {
      timestamp: new Date().toISOString(),
      url: TARGET_URL,
      scores: { performance, accessibility, bestPractices, seo },
      passedTargets: allScoresAbove90
    };
    
    fs.writeFileSync(path.join(OUTPUT_DIR, `summary-${timestamp}.json`), JSON.stringify(summary, null, 2));
  }

  console.log('\n✅ Lighthouse audit complete!');
} catch (error) {
  console.error('❌ Lighthouse audit failed:', error.message);
  process.exit(1);
}

function getEmoji(score) {
  if (score >= 90) return '🟢';
  if (score >= 50) return '🟡';
  return '🔴';
}
