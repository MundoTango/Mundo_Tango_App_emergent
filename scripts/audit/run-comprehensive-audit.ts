#!/usr/bin/env tsx
/**
 * Comprehensive 10-Layer Audit Runner
 * Executes all audit layers and generates complete health report
 */

import { comprehensiveAuditService } from '../../server/services/comprehensiveAuditService';

async function main() {
  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║    ESA 61×21 COMPREHENSIVE 10-LAYER AUDIT                         ║');
  console.log('║    Platform Health & Quality Assessment                          ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝');
  console.log('');

  try {
    const report = await comprehensiveAuditService.runComprehensiveAudit();

    console.log('\n╔════════════════════════════════════════════════════════════════════╗');
    console.log('║                    AUDIT COMPLETE                                  ║');
    console.log('╚════════════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`🎯 Overall Health Score: ${report.overallHealthScore}/100`);
    console.log('');

    // Display scorecard
    console.log('📊 QUALITY SCORECARD:');
    console.log('═'.repeat(70));
    
    const scorecard = report.qualityScorecard;
    Object.entries(scorecard).forEach(([key, value]) => {
      const label = key.charAt(0).toUpperCase() + key.slice(1);
      const emoji = value.grade === 'A' ? '🟢' : value.grade === 'B' ? '🟡' : '🔴';
      console.log(`${emoji} ${label.padEnd(20)} Score: ${value.score.toString().padStart(3)}/100  Grade: ${value.grade}`);
    });

    console.log('');
    console.log('🚨 PRIORITIZED ISSUES:');
    console.log('═'.repeat(70));

    if (report.prioritizedIssues.length === 0) {
      console.log('✅ No critical or high-priority issues found!');
    } else {
      report.prioritizedIssues.slice(0, 5).forEach((issue, i) => {
        const emoji = issue.priority === 'critical' ? '🔴' : issue.priority === 'high' ? '🟠' : '🟡';
        console.log(`${emoji} [${issue.priority.toUpperCase()}] ${issue.category}`);
        console.log(`   ${issue.description}`);
        console.log('');
      });

      if (report.prioritizedIssues.length > 5) {
        console.log(`   ...and ${report.prioritizedIssues.length - 5} more issues`);
      }
    }

    console.log('');
    console.log('💡 TOP RECOMMENDATIONS:');
    console.log('═'.repeat(70));
    report.recommendations.slice(0, 5).forEach((rec, i) => {
      console.log(`${i + 1}. ${rec}`);
    });

    console.log('');
    console.log('📈 NEXT STEPS:');
    console.log('─'.repeat(70));
    console.log('1. Review detailed reports in docs/audit-reports/');
    console.log('2. Address critical and high-priority issues first');
    console.log('3. Run layer-specific audits for deeper analysis');
    console.log('4. Re-run audit after fixes to track improvement');
    console.log('');

    // Exit with appropriate code
    const hasCritical = report.prioritizedIssues.some(i => i.priority === 'critical');
    process.exit(hasCritical ? 1 : 0);

  } catch (error) {
    console.error('❌ Audit failed:', error);
    process.exit(1);
  }
}

main();
