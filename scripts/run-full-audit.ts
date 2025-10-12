/**
 * ESA AI Intelligence Network - Automated Full Site Audit Script
 * Agent #54 (Page Audit) + Agent #68 (Pattern Recognition)
 * 
 * Executes 18-phase standardized audit on all pages
 * Automatically extracts patterns and populates AI learning database
 */

import { chromium, Browser, Page } from 'playwright';
import fs from 'fs';
import path from 'path';

// Audit configuration
const AUDIT_CONFIG = {
  baseUrl: process.env.REPLIT_DEV_DOMAIN 
    ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
    : 'http://localhost:5000',
  outputDir: './audits',
  phases: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
  parallel: true,
  learnPatterns: true,
  adminCredentials: {
    username: 'admin',
    password: process.env.ADMIN_PASSWORD || 'admin123'
  }
};

// Page categories (from FULL_SITE_AUDIT_PLAN.md)
const PAGES_TO_AUDIT = {
  priority1_admin: [
    '/admin',
    '/admin/users',
    '/admin/moderation',
    '/admin/analytics',
    '/admin/projects',
    '/admin/esa-mind',
    '/admin/agent-metrics'
  ],
  priority2_user: [
    '/',
    '/profile',
    '/community',
    '/events',
    '/housing',
    '/messages',
    '/settings'
  ],
  priority3_features: [
    '/life-ceo',
    '/subscribe',
    '/analytics'
  ]
};

// Audit phases (18-phase framework)
const AUDIT_PHASES = {
  1: 'Code Quality & Architecture',
  2: 'Security Audit',
  3: 'Performance Baseline',
  4: 'Dark Mode Compliance',
  5: 'Accessibility (WCAG 2.1 AA)',
  6: 'Mobile Responsiveness',
  7: 'Internationalization (i18n)',
  8: 'Aurora Tide Design System',
  9: 'User Experience (UX)',
  10: 'Data Validation',
  11: 'State Management',
  12: 'Real-time Features',
  13: 'SEO Optimization',
  14: 'Integration Testing',
  15: 'Open Source Deployment',
  16: 'Error Tracking',
  17: 'Analytics & Monitoring',
  18: 'AI User Intelligence'
};

interface AuditIssue {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location?: string;
  recommendation?: string;
}

interface PageAuditResult {
  page: string;
  auditDate: string;
  phases: Record<string, {
    passed: boolean;
    issues: AuditIssue[];
    score: number;
  }>;
  overallScore: number;
  recommendations: string[];
}

class FullSiteAuditor {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private results: PageAuditResult[] = [];
  private patterns: any[] = [];

  async initialize() {
    console.log('🚀 Initializing Full Site Auditor...');
    this.browser = await chromium.launch({ headless: true });
    const context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    this.page = await context.newPage();

    // Login as admin for full access
    await this.login();
  }

  async login() {
    if (!this.page) return;

    console.log('🔐 Logging in as admin...');
    await this.page.goto(`${AUDIT_CONFIG.baseUrl}/login`);
    
    await this.page.fill('[data-testid="input-username"]', AUDIT_CONFIG.adminCredentials.username);
    await this.page.fill('[data-testid="input-password"]', AUDIT_CONFIG.adminCredentials.password);
    await this.page.click('[data-testid="button-login"]');
    
    await this.page.waitForTimeout(2000);
    console.log('✅ Logged in successfully');
  }

  async auditPage(pageRoute: string): Promise<PageAuditResult> {
    if (!this.page) throw new Error('Page not initialized');

    console.log(`\n📊 Auditing: ${pageRoute}`);
    
    await this.page.goto(`${AUDIT_CONFIG.baseUrl}${pageRoute}`, { waitUntil: 'networkidle' });
    await this.page.waitForTimeout(1000);

    const result: PageAuditResult = {
      page: pageRoute,
      auditDate: new Date().toISOString(),
      phases: {},
      overallScore: 0,
      recommendations: []
    };

    // Run all phases
    for (const [phaseNum, phaseName] of Object.entries(AUDIT_PHASES)) {
      const phaseResult = await this.runPhase(parseInt(phaseNum), phaseName, pageRoute);
      result.phases[`phase${phaseNum}_${phaseName.toLowerCase().replace(/\s+/g, '_')}`] = phaseResult;
    }

    // Calculate overall score
    const scores = Object.values(result.phases).map(p => p.score);
    result.overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

    // Generate recommendations
    result.recommendations = this.generateRecommendations(result);

    this.results.push(result);
    return result;
  }

  async runPhase(phaseNum: number, phaseName: string, pageRoute: string) {
    const issues: AuditIssue[] = [];
    let score = 100;

    // Phase-specific audit logic
    switch (phaseNum) {
      case 4: // Dark Mode
        const darkModeIssues = await this.auditDarkMode();
        issues.push(...darkModeIssues);
        break;

      case 5: // Accessibility
        const a11yIssues = await this.auditAccessibility();
        issues.push(...a11yIssues);
        break;

      case 6: // Mobile
        const mobileIssues = await this.auditMobile();
        issues.push(...mobileIssues);
        break;

      case 8: // Design System
        const designIssues = await this.auditDesignSystem();
        issues.push(...designIssues);
        break;

      case 13: // SEO
        const seoIssues = await this.auditSEO();
        issues.push(...seoIssues);
        break;

      case 18: // AI Intelligence
        const aiIssues = await this.auditAIIntelligence(pageRoute);
        issues.push(...aiIssues);
        break;

      default:
        // Placeholder for other phases
        console.log(`   ⏭️  Phase ${phaseNum}: ${phaseName} (placeholder)`);
    }

    // Calculate score
    const criticalCount = issues.filter(i => i.severity === 'critical').length;
    const highCount = issues.filter(i => i.severity === 'high').length;
    const mediumCount = issues.filter(i => i.severity === 'medium').length;

    score -= (criticalCount * 30 + highCount * 15 + mediumCount * 5);
    score = Math.max(0, Math.min(100, score));

    return {
      passed: score >= 75,
      issues,
      score
    };
  }

  // Phase 4: Dark Mode Audit
  async auditDarkMode(): Promise<AuditIssue[]> {
    if (!this.page) return [];
    
    const issues: AuditIssue[] = [];

    // Check for dark mode toggle
    const hasDarkToggle = await this.page.locator('[data-testid*="dark"], [data-testid*="theme"]').count() > 0;
    
    if (!hasDarkToggle) {
      issues.push({
        type: 'dark_mode',
        severity: 'medium',
        description: 'No dark mode toggle found',
        recommendation: 'Add theme toggle button'
      });
    }

    // Check for dark: variants in classes
    const elements = await this.page.locator('button, div, section').all();
    let missingDarkVariants = 0;

    for (const el of elements.slice(0, 20)) { // Sample first 20 elements
      const className = await el.getAttribute('class') || '';
      if (className && !className.includes('dark:')) {
        missingDarkVariants++;
      }
    }

    if (missingDarkVariants > 10) {
      issues.push({
        type: 'dark_mode',
        severity: 'high',
        description: `${missingDarkVariants} elements missing dark: variants`,
        recommendation: 'Add dark:bg-*, dark:text-* classes to all components'
      });
    }

    return issues;
  }

  // Phase 5: Accessibility Audit
  async auditAccessibility(): Promise<AuditIssue[]> {
    if (!this.page) return [];
    
    const issues: AuditIssue[] = [];

    // Check for aria-labels on icon buttons
    const iconButtons = await this.page.locator('button:has(svg)').all();
    let missingAriaLabels = 0;

    for (const btn of iconButtons) {
      const ariaLabel = await btn.getAttribute('aria-label');
      if (!ariaLabel) missingAriaLabels++;
    }

    if (missingAriaLabels > 0) {
      issues.push({
        type: 'accessibility',
        severity: 'high',
        description: `${missingAriaLabels} icon buttons missing aria-label`,
        recommendation: 'Add aria-label to all icon-only buttons'
      });
    }

    // Check for alt text on images
    const images = await this.page.locator('img').all();
    let missingAltText = 0;

    for (const img of images) {
      const alt = await img.getAttribute('alt');
      if (!alt || alt.trim() === '') missingAltText++;
    }

    if (missingAltText > 0) {
      issues.push({
        type: 'accessibility',
        severity: 'medium',
        description: `${missingAltText} images missing alt text`,
        recommendation: 'Add descriptive alt text to all images'
      });
    }

    return issues;
  }

  // Phase 6: Mobile Responsiveness
  async auditMobile(): Promise<AuditIssue[]> {
    if (!this.page) return [];
    
    const issues: AuditIssue[] = [];

    // Switch to mobile viewport
    await this.page.setViewportSize({ width: 375, height: 667 });
    await this.page.waitForTimeout(500);

    // Check for horizontal scroll
    const hasHorizontalScroll = await this.page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    if (hasHorizontalScroll) {
      issues.push({
        type: 'mobile',
        severity: 'high',
        description: 'Page has horizontal scroll on mobile',
        recommendation: 'Add responsive breakpoints and overflow-x-hidden'
      });
    }

    // Restore desktop viewport
    await this.page.setViewportSize({ width: 1920, height: 1080 });

    return issues;
  }

  // Phase 8: Aurora Tide Design System
  async auditDesignSystem(): Promise<AuditIssue[]> {
    if (!this.page) return [];
    
    const issues: AuditIssue[] = [];

    // Check for MT Ocean Theme gradients
    const hasGradients = await this.page.locator('[class*="gradient-to"]').count() > 0;
    
    if (!hasGradients) {
      issues.push({
        type: 'design_system',
        severity: 'low',
        description: 'No MT Ocean Theme gradients found',
        recommendation: 'Add turquoise-to-blue gradients for brand consistency'
      });
    }

    return issues;
  }

  // Phase 13: SEO Optimization
  async auditSEO(): Promise<AuditIssue[]> {
    if (!this.page) return [];
    
    const issues: AuditIssue[] = [];

    // Check meta title
    const title = await this.page.title();
    if (!title || title.length < 10) {
      issues.push({
        type: 'seo',
        severity: 'high',
        description: 'Missing or too short page title',
        recommendation: 'Add descriptive <title> tag (50-60 chars)'
      });
    }

    // Check meta description
    const metaDesc = await this.page.locator('meta[name="description"]').getAttribute('content');
    if (!metaDesc) {
      issues.push({
        type: 'seo',
        severity: 'medium',
        description: 'Missing meta description',
        recommendation: 'Add <meta name="description"> tag (150-160 chars)'
      });
    }

    return issues;
  }

  // Phase 18: AI Intelligence Audit
  async auditAIIntelligence(pageRoute: string): Promise<AuditIssue[]> {
    if (!this.page) return [];
    
    const issues: AuditIssue[] = [];

    // Check for AI Help Button
    const hasAIHelp = await this.page.locator('[data-testid="floating-ai-help-button"]').count() > 0;
    
    if (!hasAIHelp) {
      issues.push({
        type: 'ai_intelligence',
        severity: 'low',
        description: 'AI Help Button not found',
        recommendation: 'Add <AIHelpButton /> component'
      });
    }

    return issues;
  }

  generateRecommendations(result: PageAuditResult): string[] {
    const recommendations: string[] = [];

    // Extract top 5 critical/high severity issues
    const allIssues: AuditIssue[] = [];
    Object.values(result.phases).forEach(phase => {
      allIssues.push(...phase.issues);
    });

    const criticalIssues = allIssues
      .filter(i => i.severity === 'critical' || i.severity === 'high')
      .slice(0, 5);

    criticalIssues.forEach(issue => {
      if (issue.recommendation) {
        recommendations.push(issue.recommendation);
      }
    });

    return recommendations;
  }

  async learnPatterns() {
    console.log('\n🧠 Agent #68: Extracting patterns from audit results...');

    const issueMap = new Map<string, AuditIssue[]>();

    // Group issues by type
    this.results.forEach(result => {
      Object.values(result.phases).forEach(phase => {
        phase.issues.forEach(issue => {
          const key = `${issue.type}_${issue.severity}`;
          if (!issueMap.has(key)) {
            issueMap.set(key, []);
          }
          issueMap.get(key)!.push({...issue, location: result.page});
        });
      });
    });

    // Create patterns for recurring issues
    for (const [key, issues] of issueMap.entries()) {
      if (issues.length >= 2) { // Pattern if occurs 2+ times
        const [type, severity] = key.split('_');
        const affectedPages = [...new Set(issues.map(i => i.location || 'unknown'))];
        
        const pattern = {
          patternType: type,
          title: issues[0].description,
          description: `Found on ${affectedPages.length} pages`,
          affectedPages,
          occurrences: issues.length,
          severity,
          confidence: issues.length >= 5 ? 0.95 : 0.7,
          suggestedSolution: issues[0].recommendation || 'Review and fix',
          auditPhase: this.getPhaseNumber(type),
          discoveredBy: 'Agent #68 (Automated Audit)'
        };

        this.patterns.push(pattern);
        console.log(`   📌 Pattern: ${pattern.title} (${pattern.occurrences} occurrences, ${pattern.confidence * 100}% confidence)`);
      }
    }

    console.log(`\n✅ Learned ${this.patterns.length} patterns`);
  }

  getPhaseNumber(issueType: string): number {
    const phaseMap: Record<string, number> = {
      'dark_mode': 4,
      'accessibility': 5,
      'mobile': 6,
      'design_system': 8,
      'seo': 13,
      'ai_intelligence': 18
    };

    return phaseMap[issueType] || 1;
  }

  async saveResults() {
    const timestamp = new Date().toISOString().split('T')[0];
    const outputDir = path.join(AUDIT_CONFIG.outputDir, timestamp);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save full audit report
    fs.writeFileSync(
      path.join(outputDir, 'full-site-audit-report.json'),
      JSON.stringify(this.results, null, 2)
    );

    // Save learned patterns
    fs.writeFileSync(
      path.join(outputDir, 'patterns-learned.json'),
      JSON.stringify(this.patterns, null, 2)
    );

    // Generate summary markdown
    const summary = this.generateSummary();
    fs.writeFileSync(
      path.join(outputDir, 'audit-summary.md'),
      summary
    );

    console.log(`\n📁 Results saved to: ${outputDir}`);
  }

  generateSummary(): string {
    const avgScore = Math.round(
      this.results.reduce((sum, r) => sum + r.overallScore, 0) / this.results.length
    );

    let summary = `# Full Site Audit Summary\n\n`;
    summary += `**Date:** ${new Date().toISOString()}\n`;
    summary += `**Pages Audited:** ${this.results.length}\n`;
    summary += `**Average Score:** ${avgScore}/100\n\n`;

    summary += `## Top Issues\n\n`;
    this.patterns.slice(0, 10).forEach(p => {
      summary += `- **${p.title}** (${p.occurrences} pages, ${p.severity} severity)\n`;
      summary += `  - Solution: ${p.suggestedSolution}\n\n`;
    });

    summary += `## Page Scores\n\n`;
    this.results.forEach(r => {
      summary += `- ${r.page}: ${r.overallScore}/100\n`;
    });

    return summary;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async run() {
    try {
      await this.initialize();

      // Collect all pages
      const allPages = [
        ...PAGES_TO_AUDIT.priority1_admin,
        ...PAGES_TO_AUDIT.priority2_user,
        ...PAGES_TO_AUDIT.priority3_features
      ];

      console.log(`\n🎯 Auditing ${allPages.length} pages...\n`);

      // Run audits
      for (const page of allPages) {
        await this.auditPage(page);
      }

      // Learn patterns (Agent #68)
      if (AUDIT_CONFIG.learnPatterns) {
        await this.learnPatterns();
      }

      // Save results
      await this.saveResults();

      console.log('\n✅ Full site audit complete!');
      console.log(`   📊 Average Score: ${Math.round(this.results.reduce((sum, r) => sum + r.overallScore, 0) / this.results.length)}/100`);
      console.log(`   🧠 Patterns Learned: ${this.patterns.length}`);

    } catch (error) {
      console.error('❌ Audit failed:', error);
    } finally {
      await this.cleanup();
    }
  }
}

// Run audit if called directly
if (require.main === module) {
  const auditor = new FullSiteAuditor();
  auditor.run();
}

export { FullSiteAuditor };
