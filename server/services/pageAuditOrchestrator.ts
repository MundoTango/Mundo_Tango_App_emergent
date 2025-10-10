import fs from 'fs/promises';
import path from 'path';
import pLimit from 'p-limit';

interface PageConfig {
  file: string;
  category: string;
  displayName: string;
  description: string;
  agents: number[];
  criticalPaths: string[];
  knownIssues: string[];
  lastAudit: string | null;
  auditHistory: AuditHistoryEntry[];
}

interface AuditHistoryEntry {
  date: string;
  agents: number[];
  score: number;
  notes: string;
}

interface PageRegistry {
  agentDefinitions: Record<string, string>;
  pageCategories: Record<string, { description: string; defaultAgents: number[] }>;
  pages: Record<string, PageConfig>;
  metadata: {
    totalPages: number;
    categorized: number;
    pending: number;
  };
}

interface AgentAuditResult {
  agentId: number;
  agentName: string;
  status: 'pass' | 'warn' | 'fail';
  score: number;
  findings: AgentFinding[];
  executionTime: number;
}

interface AgentFinding {
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: string;
  message: string;
  file?: string;
  line?: number;
  recommendation?: string;
}

interface PageAuditReport {
  pageKey: string;
  pageName: string;
  auditDate: string;
  overallScore: number;
  status: 'excellent' | 'good' | 'needs-improvement' | 'critical';
  agentResults: AgentAuditResult[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  recommendations: string[];
  executionTime: number;
}

export class PageAuditOrchestrator {
  private registry: PageRegistry | null = null;
  private registryPath = path.join(process.cwd(), 'docs/pages/page-audit-registry.json');

  /**
   * Load page registry from disk
   */
  private async loadRegistry(): Promise<PageRegistry> {
    if (this.registry) return this.registry;

    try {
      const content = await fs.readFile(this.registryPath, 'utf-8');
      this.registry = JSON.parse(content);
      return this.registry!;
    } catch (error) {
      throw new Error(`Failed to load page registry: ${error}`);
    }
  }

  /**
   * Get page configuration by key
   */
  async getPageConfig(pageKey: string): Promise<PageConfig | null> {
    const registry = await this.loadRegistry();
    return registry.pages[pageKey] || null;
  }

  /**
   * List all registered pages
   */
  async listPages(): Promise<{ key: string; config: PageConfig }[]> {
    const registry = await this.loadRegistry();
    return Object.entries(registry.pages).map(([key, config]) => ({ key, config }));
  }

  /**
   * Get pages by category
   */
  async getPagesByCategory(category: string): Promise<{ key: string; config: PageConfig }[]> {
    const pages = await this.listPages();
    return pages.filter(({ config }) => config.category === category);
  }

  /**
   * Execute audit for a specific page
   */
  async auditPage(pageKey: string): Promise<PageAuditReport> {
    const startTime = Date.now();
    const registry = await this.loadRegistry();
    const pageConfig = await this.getPageConfig(pageKey);

    if (!pageConfig) {
      throw new Error(`Page '${pageKey}' not found in registry`);
    }

    console.log(`🔍 Starting audit for: ${pageConfig.displayName}`);
    console.log(`📋 Executing ${pageConfig.agents.length} ESA agents with controlled concurrency (max 5)...`);

    // Execute agents with controlled concurrency (max 5 at a time)
    const limit = pLimit(5);
    const agentResults = await Promise.all(
      pageConfig.agents.map(agentId => limit(() => this.executeAgent(agentId, pageConfig, registry)))
    );

    // Calculate overall score and summary
    const scores = agentResults.map(r => r.score);
    const overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

    const summary = {
      critical: agentResults.reduce((sum, r) => sum + r.findings.filter(f => f.severity === 'critical').length, 0),
      high: agentResults.reduce((sum, r) => sum + r.findings.filter(f => f.severity === 'high').length, 0),
      medium: agentResults.reduce((sum, r) => sum + r.findings.filter(f => f.severity === 'medium').length, 0),
      low: agentResults.reduce((sum, r) => sum + r.findings.filter(f => f.severity === 'low').length, 0),
      info: agentResults.reduce((sum, r) => sum + r.findings.filter(f => f.severity === 'info').length, 0),
    };

    const executionTime = Date.now() - startTime;

    const report: PageAuditReport = {
      pageKey,
      pageName: pageConfig.displayName,
      auditDate: new Date().toISOString(),
      overallScore,
      status: this.getStatusFromScore(overallScore),
      agentResults,
      summary,
      recommendations: this.generateRecommendations(agentResults, pageConfig),
      executionTime,
    };

    // Update audit history in registry
    await this.updateAuditHistory(pageKey, report);

    return report;
  }

  /**
   * Execute a single ESA agent audit
   */
  private async executeAgent(
    agentId: number,
    pageConfig: PageConfig,
    registry: PageRegistry
  ): Promise<AgentAuditResult> {
    const startTime = Date.now();
    const agentName = registry.agentDefinitions[agentId.toString()] || `Agent #${agentId}`;

    console.log(`  ⚙️  Executing ${agentName}...`);

    // Simulate agent execution (in real implementation, this would call actual audit logic)
    const findings = await this.simulateAgentAudit(agentId, pageConfig);
    
    const criticalCount = findings.filter(f => f.severity === 'critical').length;
    const highCount = findings.filter(f => f.severity === 'high').length;
    
    // Calculate score based on findings
    let score = 100;
    score -= criticalCount * 20;
    score -= highCount * 10;
    score -= findings.filter(f => f.severity === 'medium').length * 5;
    score = Math.max(0, score);

    const status = criticalCount > 0 ? 'fail' : highCount > 0 ? 'warn' : 'pass';

    return {
      agentId,
      agentName,
      status,
      score,
      findings,
      executionTime: Date.now() - startTime,
    };
  }

  /**
   * Simulate agent audit (placeholder for real agent logic)
   */
  private async simulateAgentAudit(agentId: number, pageConfig: PageConfig): Promise<AgentFinding[]> {
    const findings: AgentFinding[] = [];

    // Agent-specific audit logic would go here
    // For now, return sample findings based on agent type
    
    switch (agentId) {
      case 1: // Performance
        findings.push({
          severity: 'info',
          category: 'Performance',
          message: 'Page bundle size: 287KB (target: <200KB)',
          recommendation: 'Enable code splitting and lazy loading'
        });
        break;

      case 2: // Frontend
        findings.push({
          severity: 'info',
          category: 'React Patterns',
          message: 'All components follow Smart/Controlled pattern',
          recommendation: 'Continue using established patterns'
        });
        break;

      case 11: // Aurora (UI/UX)
        findings.push({
          severity: 'info',
          category: 'Design System',
          message: '100% Aurora Tide compliance',
          recommendation: 'Maintain design token usage'
        });
        break;

      case 14: // Code Quality
        findings.push({
          severity: 'medium',
          category: 'TypeScript',
          message: '3 instances of `any` type found',
          file: pageConfig.file,
          recommendation: 'Replace `any` with proper types'
        });
        break;

      case 16: // Translation
        findings.push({
          severity: 'low',
          category: 'i18n',
          message: '2 translation keys missing',
          recommendation: 'Add missing keys to all 68 language files'
        });
        break;
    }

    return findings;
  }

  /**
   * Generate recommendations based on audit results
   */
  private generateRecommendations(
    agentResults: AgentAuditResult[],
    pageConfig: PageConfig
  ): string[] {
    const recommendations: string[] = [];

    const criticalFindings = agentResults.flatMap(r => 
      r.findings.filter(f => f.severity === 'critical')
    );
    
    const highFindings = agentResults.flatMap(r => 
      r.findings.filter(f => f.severity === 'high')
    );

    if (criticalFindings.length > 0) {
      recommendations.push(`🔴 CRITICAL: Fix ${criticalFindings.length} critical issues immediately`);
      criticalFindings.forEach(f => {
        if (f.recommendation) {
          recommendations.push(`   - ${f.recommendation}`);
        }
      });
    }

    if (highFindings.length > 0) {
      recommendations.push(`🟡 HIGH: Address ${highFindings.length} high-priority issues`);
    }

    const failedAgents = agentResults.filter(r => r.status === 'fail');
    if (failedAgents.length > 0) {
      recommendations.push(`⚠️  ${failedAgents.length} agents failed audit - review detailed findings`);
    }

    return recommendations;
  }

  /**
   * Get status label from score
   */
  private getStatusFromScore(score: number): 'excellent' | 'good' | 'needs-improvement' | 'critical' {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 50) return 'needs-improvement';
    return 'critical';
  }

  /**
   * Update audit history in registry
   */
  private async updateAuditHistory(pageKey: string, report: PageAuditReport): Promise<void> {
    const registry = await this.loadRegistry();
    const pageConfig = registry.pages[pageKey];

    if (!pageConfig) return;

    pageConfig.lastAudit = report.auditDate;
    pageConfig.auditHistory.push({
      date: report.auditDate,
      agents: report.agentResults.map(r => r.agentId),
      score: report.overallScore,
      notes: `${report.summary.critical} critical, ${report.summary.high} high priority issues`,
    });

    // Keep only last 10 audits
    if (pageConfig.auditHistory.length > 10) {
      pageConfig.auditHistory = pageConfig.auditHistory.slice(-10);
    }

    // Write updated registry back to disk
    await fs.writeFile(
      this.registryPath,
      JSON.stringify(registry, null, 2),
      'utf-8'
    );
  }

  /**
   * Generate formatted report
   */
  formatReport(report: PageAuditReport): string {
    const lines: string[] = [];
    
    lines.push('═'.repeat(80));
    lines.push(`📊 PAGE AUDIT REPORT: ${report.pageName}`);
    lines.push('═'.repeat(80));
    lines.push('');
    
    lines.push(`📅 Audit Date: ${new Date(report.auditDate).toLocaleString()}`);
    lines.push(`⏱️  Execution Time: ${report.executionTime}ms`);
    lines.push(`📈 Overall Score: ${report.overallScore}/100 (${report.status.toUpperCase()})`);
    lines.push('');
    
    lines.push('📋 SUMMARY:');
    lines.push(`   🔴 Critical: ${report.summary.critical}`);
    lines.push(`   🟠 High: ${report.summary.high}`);
    lines.push(`   🟡 Medium: ${report.summary.medium}`);
    lines.push(`   🟢 Low: ${report.summary.low}`);
    lines.push(`   ℹ️  Info: ${report.summary.info}`);
    lines.push('');
    
    lines.push('🤖 AGENT RESULTS:');
    report.agentResults.forEach(agent => {
      const icon = agent.status === 'pass' ? '✅' : agent.status === 'warn' ? '⚠️ ' : '❌';
      lines.push(`   ${icon} ${agent.agentName}: ${agent.score}/100 (${agent.findings.length} findings, ${agent.executionTime}ms)`);
    });
    lines.push('');
    
    if (report.recommendations.length > 0) {
      lines.push('💡 RECOMMENDATIONS:');
      report.recommendations.forEach(rec => lines.push(`   ${rec}`));
      lines.push('');
    }
    
    lines.push('═'.repeat(80));
    
    return lines.join('\n');
  }
}

// Export singleton instance
export const pageAuditOrchestrator = new PageAuditOrchestrator();
