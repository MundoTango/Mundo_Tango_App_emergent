#!/usr/bin/env tsx

import { pageAuditOrchestrator } from '../server/services/pageAuditOrchestrator';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    console.log('📋 Page Audit CLI\n');
    console.log('Usage:');
    console.log('  npm run audit-page <page-key>         # Audit a specific page');
    console.log('  npm run audit-page list               # List all pages');
    console.log('  npm run audit-page category <name>    # Audit all pages in category');
    console.log('  npm run audit-page all                # Audit all pages');
    console.log('\nExamples:');
    console.log('  npm run audit-page memories-feed');
    console.log('  npm run audit-page category social');
    console.log('  npm run audit-page all');
    process.exit(0);
  }

  try {
    if (command === 'list') {
      await listPages();
    } else if (command === 'category') {
      const category = args[1];
      if (!category) {
        console.error('❌ Error: Category name required');
        console.log('Usage: npm run audit-page category <name>');
        process.exit(1);
      }
      await auditCategory(category);
    } else if (command === 'all') {
      await auditAll();
    } else {
      await auditSinglePage(command);
    }
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

async function listPages() {
  const pages = await pageAuditOrchestrator.listPages();
  
  console.log(`\n📋 Registered Pages (${pages.length} total)\n`);
  
  const byCategory: Record<string, typeof pages> = {};
  
  pages.forEach(({ key, config }) => {
    if (!byCategory[config.category]) {
      byCategory[config.category] = [];
    }
    byCategory[config.category].push({ key, config });
  });

  Object.entries(byCategory).forEach(([category, categoryPages]) => {
    console.log(`\n${category.toUpperCase()}:`);
    categoryPages.forEach(({ key, config }) => {
      const auditStatus = config.lastAudit 
        ? `✅ Last audit: ${new Date(config.lastAudit).toLocaleDateString()}`
        : '⏳ Never audited';
      console.log(`  ${key.padEnd(30)} - ${config.displayName.padEnd(25)} ${auditStatus}`);
    });
  });
  
  console.log('');
}

async function auditSinglePage(pageKey: string) {
  console.log(`\n🚀 Starting audit for page: ${pageKey}\n`);
  
  const report = await pageAuditOrchestrator.auditPage(pageKey);
  const formatted = pageAuditOrchestrator.formatReport(report);
  
  console.log(formatted);
  
  // Save report to file
  const fs = await import('fs/promises');
  const path = await import('path');
  const reportsDir = path.join(process.cwd(), 'docs/audit-reports');
  await fs.mkdir(reportsDir, { recursive: true });
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const filename = `${pageKey}-${timestamp}.json`;
  const filepath = path.join(reportsDir, filename);
  
  await fs.writeFile(filepath, JSON.stringify(report, null, 2));
  console.log(`\n💾 Report saved to: docs/audit-reports/${filename}\n`);
}

async function auditCategory(category: string) {
  const pages = await pageAuditOrchestrator.getPagesByCategory(category);
  
  if (pages.length === 0) {
    console.error(`❌ No pages found in category: ${category}`);
    process.exit(1);
  }

  console.log(`\n🚀 Starting audit for ${pages.length} pages in category: ${category}\n`);
  
  const reports: any[] = [];
  
  for (const { key, config } of pages) {
    console.log(`\n📄 Auditing: ${config.displayName}...`);
    const report = await pageAuditOrchestrator.auditPage(key);
    reports.push(report);
    console.log(`   Score: ${report.overallScore}/100 (${report.status})`);
  }
  
  // Summary
  const avgScore = Math.round(reports.reduce((sum, r) => sum + r.overallScore, 0) / reports.length);
  const totalCritical = reports.reduce((sum, r) => sum + r.summary.critical, 0);
  const totalHigh = reports.reduce((sum, r) => sum + r.summary.high, 0);
  
  console.log('\n═'.repeat(80));
  console.log(`📊 CATEGORY SUMMARY: ${category}`);
  console.log('═'.repeat(80));
  console.log(`Average Score: ${avgScore}/100`);
  console.log(`Total Critical Issues: ${totalCritical}`);
  console.log(`Total High Priority Issues: ${totalHigh}`);
  console.log('═'.repeat(80) + '\n');
}

async function auditAll() {
  const pages = await pageAuditOrchestrator.listPages();
  
  console.log(`\n🚀 Starting full platform audit: ${pages.length} pages\n`);
  console.log('⚠️  This may take several minutes...\n');
  
  const reports: any[] = [];
  
  for (const { key, config } of pages) {
    console.log(`📄 [${reports.length + 1}/${pages.length}] ${config.displayName}...`);
    const report = await pageAuditOrchestrator.auditPage(key);
    reports.push({ key, report });
  }
  
  // Generate platform-wide summary
  const avgScore = Math.round(reports.reduce((sum, r) => sum + r.report.overallScore, 0) / reports.length);
  const totalCritical = reports.reduce((sum, r) => sum + r.report.summary.critical, 0);
  const totalHigh = reports.reduce((sum, r) => sum + r.report.summary.high, 0);
  const excellent = reports.filter(r => r.report.status === 'excellent').length;
  const good = reports.filter(r => r.report.status === 'good').length;
  const needsImprovement = reports.filter(r => r.report.status === 'needs-improvement').length;
  const critical = reports.filter(r => r.report.status === 'critical').length;
  
  console.log('\n' + '═'.repeat(80));
  console.log('📊 PLATFORM-WIDE AUDIT SUMMARY');
  console.log('═'.repeat(80));
  console.log(`Total Pages Audited: ${pages.length}`);
  console.log(`Average Score: ${avgScore}/100`);
  console.log('');
  console.log('Status Breakdown:');
  console.log(`  ✅ Excellent: ${excellent} pages`);
  console.log(`  🟢 Good: ${good} pages`);
  console.log(`  🟡 Needs Improvement: ${needsImprovement} pages`);
  console.log(`  🔴 Critical: ${critical} pages`);
  console.log('');
  console.log('Issues Found:');
  console.log(`  🔴 Critical: ${totalCritical}`);
  console.log(`  🟠 High: ${totalHigh}`);
  console.log('═'.repeat(80) + '\n');
  
  // Save platform summary
  const fs = await import('fs/promises');
  const path = await import('path');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const summaryPath = path.join(process.cwd(), 'docs/audit-reports', `platform-summary-${timestamp}.json`);
  
  await fs.writeFile(summaryPath, JSON.stringify({
    auditDate: new Date().toISOString(),
    totalPages: pages.length,
    avgScore,
    statusBreakdown: { excellent, good, needsImprovement, critical },
    totalIssues: { critical: totalCritical, high: totalHigh },
    pageReports: reports,
  }, null, 2));
  
  console.log(`💾 Platform summary saved to: docs/audit-reports/platform-summary-${timestamp}.json\n`);
}

main();
