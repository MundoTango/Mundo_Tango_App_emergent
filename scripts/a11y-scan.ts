#!/usr/bin/env tsx

import { accessibilityScanner } from '../server/services/accessibilityScanner';

async function main() {
  console.log('\n♿ Starting Accessibility Scan (WCAG 2.1)...\n');
  
  try {
    const pages = accessibilityScanner.getTestPages();
    console.log(`Scanning ${pages.length} pages for accessibility issues:\n`);
    pages.forEach((p, i) => console.log(`  ${i + 1}. ${p.name} - ${p.url}`));
    console.log('');

    const suite = await accessibilityScanner.scanPages(pages);
    const report = accessibilityScanner.formatReport(suite);
    
    console.log(report);

    if (!suite.summary.wcagCompliant) {
      console.log('⚠️  WCAG COMPLIANCE ISSUES DETECTED\n');
      console.log('Fix critical and serious violations to achieve compliance.\n');
      process.exit(1);
    }

    console.log('✅ All pages are WCAG 2.1 compliant!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Accessibility scan failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
