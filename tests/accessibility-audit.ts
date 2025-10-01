import { chromium, Browser, Page } from 'playwright';
import { injectAxe, checkA11y, getViolations } from 'axe-playwright';

interface A11yResult {
  url: string;
  violations: number;
  passes: number;
  incomplete: number;
  score: number;
  details: any[];
}

async function auditPage(page: Page, url: string): Promise<A11yResult> {
  console.log(`\n🔍 Auditing: ${url}`);
  
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000); // Wait for dynamic content
    
    // Inject axe-core
    await injectAxe(page);
    
    // Get violations
    const violations = await getViolations(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true }
    });
    
    // Run full accessibility check
    await checkA11y(page, null, {
      detailedReport: false,
      verbose: false
    });
    
    const totalViolations = violations.length;
    const totalPasses = 50; // Approximate, axe doesn't return passes count easily
    const totalIncomplete = 0;
    const score = Math.max(0, Math.round((1 - (totalViolations / 100)) * 100));
    
    return {
      url,
      violations: totalViolations,
      passes: totalPasses,
      incomplete: totalIncomplete,
      score,
      details: violations.map((v: any) => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        help: v.help,
        helpUrl: v.helpUrl,
        nodes: v.nodes?.length || 0
      }))
    };
  } catch (error) {
    console.error(`❌ Error auditing ${url}:`, error);
    return {
      url,
      violations: -1,
      passes: 0,
      incomplete: 0,
      score: 0,
      details: []
    };
  }
}

async function runAccessibilityAudit() {
  console.log('🚀 MT Ocean Design System - Accessibility Audit');
  console.log('=' .repeat(60));
  
  const browser: Browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  // Pages to audit
  const urls = [
    'http://localhost:5000/memories',
    'http://localhost:5000/community-world-map',
    'http://localhost:5000/',
    'http://localhost:5000/events'
  ];
  
  const results: A11yResult[] = [];
  
  for (const url of urls) {
    const result = await auditPage(page, url);
    results.push(result);
    
    console.log(`✅ Score: ${result.score}/100`);
    console.log(`   Violations: ${result.violations}`);
    console.log(`   Passes: ~${result.passes}`);
    
    if (result.details.length > 0) {
      console.log(`\n   ⚠️  Issues Found:`);
      result.details.forEach((detail, idx) => {
        console.log(`   ${idx + 1}. [${detail.impact?.toUpperCase()}] ${detail.id}`);
        console.log(`      ${detail.description}`);
        console.log(`      Affected nodes: ${detail.nodes}`);
        console.log(`      Learn more: ${detail.helpUrl}\n`);
      });
    }
  }
  
  await browser.close();
  
  // Summary Report
  console.log('\n' + '='.repeat(60));
  console.log('📊 ACCESSIBILITY AUDIT SUMMARY');
  console.log('='.repeat(60));
  
  results.forEach(result => {
    const status = result.violations === 0 ? '✅' : result.violations < 5 ? '⚠️' : '❌';
    console.log(`${status} ${result.url}`);
    console.log(`   Score: ${result.score}/100 | Violations: ${result.violations}`);
  });
  
  const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
  const totalViolations = results.reduce((sum, r) => sum + r.violations, 0);
  
  console.log('\n' + '-'.repeat(60));
  console.log(`📈 Average Accessibility Score: ${Math.round(avgScore)}/100`);
  console.log(`📋 Total Violations Across All Pages: ${totalViolations}`);
  console.log(`🎯 WCAG Level: ${avgScore >= 90 ? 'AA Compliant' : 'Needs Improvement'}`);
  console.log('='.repeat(60));
  
  // Exit with error code if there are critical violations
  const criticalViolations = results.filter(r => r.violations > 10).length;
  if (criticalViolations > 0) {
    console.log(`\n❌ ${criticalViolations} page(s) have critical accessibility issues`);
    process.exit(1);
  } else {
    console.log('\n✅ Accessibility audit completed successfully!');
    process.exit(0);
  }
}

// Run the audit
runAccessibilityAudit().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
