#!/usr/bin/env tsx
/**
 * ESA Baseline Audit Script
 * Agent #59 (Open Source Management) - Layer 59: Community Engagement
 * 
 * Scans all 97 production pages for baseline quality metrics:
 * - Data-testid coverage for TestSprite AI
 * - ARIA label accessibility compliance
 * - i18n translation coverage (68 languages)
 * - Aurora Tide design system compliance
 * - SEO meta tag presence
 * - Error boundary protection
 * 
 * Generates priority matrix: Critical → High → Medium → Low
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface PageIssue {
  file: string;
  route: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'testing' | 'accessibility' | 'i18n' | 'design' | 'seo' | 'resilience';
  issue: string;
  agentRecommended: number[];
}

interface BaselineReport {
  totalPages: number;
  scannedPages: number;
  timestamp: string;
  issues: PageIssue[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    byCategory: Record<string, number>;
  };
  coverage: {
    dataTestId: { pages: number; percentage: number };
    ariaLabels: { pages: number; percentage: number };
    translations: { pages: number; percentage: number };
    errorBoundaries: { pages: number; percentage: number };
  };
}

async function scanPageFile(filePath: string): Promise<PageIssue[]> {
  const issues: PageIssue[] = [];
  const content = fs.readFileSync(filePath, 'utf-8');
  const relativePath = path.relative(process.cwd(), filePath);
  
  // Extract route from registry or filename
  const route = extractRoute(relativePath);

  // Check 1: Data-testid coverage (Agent #53: TestSprite Integration)
  const dataTestIdMatches = content.match(/data-testid=/g);
  const interactiveElements = content.match(/<(button|input|select|textarea|a|Link)/gi) || [];
  if (interactiveElements.length > 0 && (!dataTestIdMatches || dataTestIdMatches.length < interactiveElements.length * 0.5)) {
    issues.push({
      file: relativePath,
      route,
      severity: 'high',
      category: 'testing',
      issue: `Low data-testid coverage: ${dataTestIdMatches?.length || 0}/${interactiveElements.length} elements tagged`,
      agentRecommended: [53, 14]
    });
  }

  // Check 2: ARIA labels (Agent #51: ARIA Accessibility)
  const ariaMatches = content.match(/aria-(label|labelledby|describedby)=/g);
  if (interactiveElements.length > 5 && (!ariaMatches || ariaMatches.length < interactiveElements.length * 0.3)) {
    issues.push({
      file: relativePath,
      route,
      severity: 'high',
      category: 'accessibility',
      issue: `Low ARIA coverage: ${ariaMatches?.length || 0}/${interactiveElements.length} elements labeled`,
      agentRecommended: [51, 11]
    });
  }

  // Check 3: Translation coverage (Agent #54: i18n Coverage)
  const hasTranslations = content.includes('useTranslation') || content.includes('t(');
  const hasHardcodedText = /(['"])(Login|Sign up|Submit|Cancel|Save|Delete|Edit|Profile|Settings|Home|Dashboard)(['"])/gi.test(content);
  if (hasHardcodedText && !hasTranslations) {
    issues.push({
      file: relativePath,
      route,
      severity: 'medium',
      category: 'i18n',
      issue: 'Hardcoded text detected without i18n translation hooks',
      agentRecommended: [54, 22]
    });
  }

  // Check 4: Aurora Tide compliance (Agent #11: UI/UX Design)
  const hasAuroraTide = content.includes('@/components/ui/') || content.includes('shadcn');
  const hasInlineStyles = content.includes('style={{') || content.includes('className="w-');
  if (!hasAuroraTide && hasInlineStyles) {
    issues.push({
      file: relativePath,
      route,
      severity: 'low',
      category: 'design',
      issue: 'Not using Aurora Tide design system components',
      agentRecommended: [11, 2]
    });
  }

  // Check 5: SEO meta tags (Agent #55: SEO Optimization)
  const hasSEO = content.includes('Helmet') || content.includes('<title>') || content.includes('meta name="description"');
  if (!hasSEO && !relativePath.includes('/admin/') && !relativePath.includes('/_debug/')) {
    issues.push({
      file: relativePath,
      route,
      severity: 'medium',
      category: 'seo',
      issue: 'Missing SEO meta tags (title, description)',
      agentRecommended: [55, 11]
    });
  }

  // Check 6: Error boundaries (Agent #7: Platform Orchestration)
  const hasErrorBoundary = content.includes('ErrorBoundary') || content.includes('error-boundary');
  if (!hasErrorBoundary && !relativePath.includes('/_debug/')) {
    issues.push({
      file: relativePath,
      route,
      severity: 'low',
      category: 'resilience',
      issue: 'Missing error boundary protection',
      agentRecommended: [7, 15]
    });
  }

  return issues;
}

function extractRoute(filePath: string): string {
  // Map common file patterns to routes
  const patterns: Record<string, string> = {
    'auth/login': '/login',
    'auth/register': '/register',
    'auth/forgot-password': '/forgot-password',
    'home.tsx': '/home',
    'profile.tsx': '/profile',
    'groups.tsx': '/groups',
    'housing-marketplace': '/housing-marketplace',
    'LifeCEOEnhanced': '/life-ceo',
    'ESAMemoryFeed': '/memories',
    'EnhancedEvents': '/events',
  };

  for (const [key, route] of Object.entries(patterns)) {
    if (filePath.includes(key)) return route;
  }

  // Default: convert filename to route
  const filename = path.basename(filePath, '.tsx');
  return `/${filename.toLowerCase().replace(/([A-Z])/g, '-$1').replace(/^-/, '')}`;
}

async function runBaselineAudit(): Promise<BaselineReport> {
  console.log('🔍 ESA Baseline Audit - Agent #59 (Open Source Management)');
  console.log('📊 Scanning 97 production pages for quality metrics...\n');

  // Find all production pages (exclude tests, archive, debug)
  const pageFiles = await glob('client/src/pages/**/*.{ts,tsx}', {
    ignore: [
      '**/node_modules/**',
      '**/__tests__/**',
      '**/_archive/**',
      '**/_debug/**',
      '**/*.test.{ts,tsx}',
      '**/*.spec.{ts,tsx}'
    ]
  });

  const issues: PageIssue[] = [];
  let scannedPages = 0;

  for (const file of pageFiles) {
    try {
      const pageIssues = await scanPageFile(file);
      issues.push(...pageIssues);
      scannedPages++;
      
      if (scannedPages % 10 === 0) {
        console.log(`   Scanned ${scannedPages}/${pageFiles.length} pages...`);
      }
    } catch (err) {
      console.error(`   ⚠️  Error scanning ${file}:`, (err as Error).message);
    }
  }

  // Calculate summary
  const summary = {
    critical: issues.filter(i => i.severity === 'critical').length,
    high: issues.filter(i => i.severity === 'high').length,
    medium: issues.filter(i => i.severity === 'medium').length,
    low: issues.filter(i => i.severity === 'low').length,
    byCategory: {} as Record<string, number>
  };

  ['testing', 'accessibility', 'i18n', 'design', 'seo', 'resilience'].forEach(cat => {
    summary.byCategory[cat] = issues.filter(i => i.category === cat).length;
  });

  // Calculate coverage
  const pagesWithDataTestId = new Set(issues.filter(i => !i.issue.includes('Low data-testid')).map(i => i.file)).size;
  const pagesWithARIA = new Set(issues.filter(i => !i.issue.includes('Low ARIA')).map(i => i.file)).size;
  const pagesWithTranslations = new Set(issues.filter(i => !i.issue.includes('Hardcoded text')).map(i => i.file)).size;
  const pagesWithErrorBoundaries = new Set(issues.filter(i => !i.issue.includes('error boundary')).map(i => i.file)).size;

  const report: BaselineReport = {
    totalPages: pageFiles.length,
    scannedPages,
    timestamp: new Date().toISOString(),
    issues,
    summary,
    coverage: {
      dataTestId: {
        pages: scannedPages - summary.byCategory['testing'],
        percentage: Math.round(((scannedPages - summary.byCategory['testing']) / scannedPages) * 100)
      },
      ariaLabels: {
        pages: scannedPages - summary.byCategory['accessibility'],
        percentage: Math.round(((scannedPages - summary.byCategory['accessibility']) / scannedPages) * 100)
      },
      translations: {
        pages: scannedPages - summary.byCategory['i18n'],
        percentage: Math.round(((scannedPages - summary.byCategory['i18n']) / scannedPages) * 100)
      },
      errorBoundaries: {
        pages: scannedPages - summary.byCategory['resilience'],
        percentage: Math.round(((scannedPages - summary.byCategory['resilience']) / scannedPages) * 100)
      }
    }
  };

  return report;
}

async function main() {
  const report = await runBaselineAudit();

  // Print summary
  console.log('\n📈 BASELINE AUDIT SUMMARY');
  console.log('═'.repeat(60));
  console.log(`Total Pages: ${report.totalPages}`);
  console.log(`Scanned: ${report.scannedPages}`);
  console.log(`Timestamp: ${report.timestamp}\n`);

  console.log('🚨 ISSUE PRIORITY MATRIX:');
  console.log(`   Critical: ${report.summary.critical}`);
  console.log(`   High:     ${report.summary.high}`);
  console.log(`   Medium:   ${report.summary.medium}`);
  console.log(`   Low:      ${report.summary.low}\n`);

  console.log('📊 ISSUES BY CATEGORY:');
  Object.entries(report.summary.byCategory).forEach(([cat, count]) => {
    console.log(`   ${cat.padEnd(15)}: ${count}`);
  });

  console.log('\n✅ COVERAGE METRICS:');
  console.log(`   Data-testid:      ${report.coverage.dataTestId.percentage}% (${report.coverage.dataTestId.pages}/${report.scannedPages} pages)`);
  console.log(`   ARIA Labels:      ${report.coverage.ariaLabels.percentage}% (${report.coverage.ariaLabels.pages}/${report.scannedPages} pages)`);
  console.log(`   Translations:     ${report.coverage.translations.percentage}% (${report.coverage.translations.pages}/${report.scannedPages} pages)`);
  console.log(`   Error Boundaries: ${report.coverage.errorBoundaries.percentage}% (${report.coverage.errorBoundaries.pages}/${report.scannedPages} pages)`);

  // Write report to file
  const outputDir = path.join(process.cwd(), 'docs/audit-reports');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputFile = path.join(outputDir, `baseline-audit-${new Date().toISOString().split('T')[0]}.json`);
  fs.writeFileSync(outputFile, JSON.stringify(report, null, 2));
  console.log(`\n💾 Report saved: ${outputFile}`);

  // Generate human-readable markdown
  const mdFile = outputFile.replace('.json', '.md');
  const markdown = generateMarkdownReport(report);
  fs.writeFileSync(mdFile, markdown);
  console.log(`📄 Markdown report: ${mdFile}`);

  console.log('\n🎯 NEXT STEPS:');
  console.log('   1. Review high-priority issues (Critical + High)');
  console.log('   2. Form 7 mentor squads using 14 certified agents');
  console.log('   3. Execute parallel remediation using LangGraph coordination');
  console.log('   4. Validate with TestSprite AI (npm run test:ai)\n');
}

function generateMarkdownReport(report: BaselineReport): string {
  const md: string[] = [];

  md.push('# ESA Baseline Audit Report');
  md.push(`**Date:** ${new Date(report.timestamp).toLocaleDateString()}`);
  md.push(`**Pages Scanned:** ${report.scannedPages}/${report.totalPages}\n`);

  md.push('## 📊 Executive Summary\n');
  md.push('### Priority Matrix');
  md.push(`- 🚨 **Critical:** ${report.summary.critical}`);
  md.push(`- 🔴 **High:** ${report.summary.high}`);
  md.push(`- 🟡 **Medium:** ${report.summary.medium}`);
  md.push(`- 🔵 **Low:** ${report.summary.low}\n`);

  md.push('### Coverage Metrics');
  md.push(`- **Data-testid:** ${report.coverage.dataTestId.percentage}% (${report.coverage.dataTestId.pages}/${report.scannedPages} pages)`);
  md.push(`- **ARIA Labels:** ${report.coverage.ariaLabels.percentage}% (${report.coverage.ariaLabels.pages}/${report.scannedPages} pages)`);
  md.push(`- **Translations:** ${report.coverage.translations.percentage}% (${report.coverage.translations.pages}/${report.scannedPages} pages)`);
  md.push(`- **Error Boundaries:** ${report.coverage.errorBoundaries.percentage}% (${report.coverage.errorBoundaries.pages}/${report.scannedPages} pages)\n`);

  md.push('## 🔍 Issues by Category\n');
  Object.entries(report.summary.byCategory).forEach(([cat, count]) => {
    md.push(`### ${cat.charAt(0).toUpperCase() + cat.slice(1)} (${count} issues)`);
    const categoryIssues = report.issues.filter(i => i.category === cat);
    categoryIssues.slice(0, 5).forEach(issue => {
      md.push(`- **${issue.file}** (${issue.route})`);
      md.push(`  - ${issue.issue}`);
      md.push(`  - Severity: ${issue.severity}`);
      md.push(`  - Recommended Agents: ${issue.agentRecommended.join(', ')}`);
    });
    if (categoryIssues.length > 5) {
      md.push(`  - *...and ${categoryIssues.length - 5} more*`);
    }
    md.push('');
  });

  md.push('## 🎯 Recommended Actions\n');
  md.push('1. **Form Mentor Squads:** Assign 14 certified agents to 7 parallel squads');
  md.push('2. **Prioritize High/Critical:** Focus on testing and accessibility first');
  md.push('3. **Execute Blitz:** Deploy squads using LangGraph coordination');
  md.push('4. **Validate:** Run TestSprite AI tests after each squad completion\n');

  md.push('---');
  md.push('*Generated by Agent #59 (Open Source Management) using ESA 61x21 framework*');

  return md.join('\n');
}

// Run the audit
main().catch(console.error);
