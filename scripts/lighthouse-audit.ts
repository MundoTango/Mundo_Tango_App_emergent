#!/usr/bin/env tsx

import { lighthouseAuditor } from '../server/services/lighthouseAuditor';

async function main() {
  const mode = process.argv[2] || 'all';

  if (mode === 'single' && process.argv[3]) {
    const pageName = process.argv[3];
    const url = process.argv[4] || '/';
    
    console.log(`\n🔦 Running Lighthouse audit on ${pageName}...\n`);
    
    const audit = await lighthouseAuditor.auditPage(url, pageName);
    console.log(`✅ Audit complete!`);
    console.log(`   Performance: ${audit.scores.performance}/100`);
    console.log(`   Accessibility: ${audit.scores.accessibility}/100`);
    console.log(`   Best Practices: ${audit.scores.bestPractices}/100`);
    console.log(`   SEO: ${audit.scores.seo}/100`);
    console.log(`   PWA: ${audit.scores.pwa}/100\n`);
  } else {
    console.log('\n🔦 Running Lighthouse audit suite...\n');
    
    const pages = lighthouseAuditor.getTestPages();
    const report = await lighthouseAuditor.auditSuite(pages);
    const formatted = lighthouseAuditor.formatReport(report);
    
    console.log(formatted);

    if (report.summary.criticalIssues > 0) {
      console.log(`⚠️  ${report.summary.criticalIssues} critical issues found!\n`);
      process.exit(1);
    }

    console.log('✅ Lighthouse audit complete!\n');
  }

  process.exit(0);
}

main().catch(error => {
  console.error('❌ Lighthouse audit failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
