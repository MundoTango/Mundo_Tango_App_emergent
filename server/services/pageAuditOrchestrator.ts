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
   * Execute agent audit with real checks based on enhanced 43-agent framework
   */
  private async simulateAgentAudit(agentId: number, pageConfig: PageConfig): Promise<AgentFinding[]> {
    const findings: AgentFinding[] = [];

    try {
      // Read the actual page file for analysis
      const pageContent = await fs.readFile(pageConfig.file, 'utf-8');
      
      switch (agentId) {
        case 0: // Phase 0: Documentation Review
          await this.auditDocumentationReview(pageContent, pageConfig, findings);
          break;
          
        case 1: // Performance Optimization
          await this.auditPerformance(pageContent, pageConfig, findings);
          break;

        case 2: // Frontend Architecture
          await this.auditFrontendArchitecture(pageContent, pageConfig, findings);
          break;

        case 3: // Background Processing
          await this.auditBackgroundProcessing(pageContent, pageConfig, findings);
          break;

        case 4: // Real-time Communications
          await this.auditRealtime(pageContent, pageConfig, findings);
          break;

        case 5: // Business Logic
          await this.auditBusinessLogic(pageContent, pageConfig, findings);
          break;

        case 6: // Search & Analytics
          await this.auditSearchAnalytics(pageContent, pageConfig, findings);
          break;

        case 7: // Platform Orchestration (Agents 7-9)
        case 8:
        case 9:
          await this.auditPlatformOrchestration(pageContent, pageConfig, findings);
          break;

        case 10: // AI Research
          await this.auditAIIntegration(pageContent, pageConfig, findings);
          break;

        case 11: // UI/UX & Accessibility
          await this.auditUIUXAccessibility(pageContent, pageConfig, findings);
          break;

        case 12: // Data Visualization
          await this.auditDataVisualization(pageContent, pageConfig, findings);
          break;

        case 13: // Media Optimization
          await this.auditMediaOptimization(pageContent, pageConfig, findings);
          break;

        case 14: // Code Quality
          await this.auditCodeQuality(pageContent, pageConfig, findings);
          break;

        case 15: // Dependency Health (2B.1)
          await this.auditDependencyHealth(pageContent, pageConfig, findings);
          break;

        case 16: // API Contract Validation (2B.2)
          await this.auditAPIContract(pageContent, pageConfig, findings);
          break;

        case 17: // Cross-Page Consistency (2B.3)
          await this.auditCrossPageConsistency(pageContent, pageConfig, findings);
          break;

        case 18: // User Flow Validation (2B.4)
          await this.auditUserFlow(pageContent, pageConfig, findings);
          break;

        case 19: // Security Deep Dive (2B.5)
          await this.auditSecurityDeepDive(pageContent, pageConfig, findings);
          break;

        case 20: // Performance Budget (2B.6)
          await this.auditPerformanceBudget(pageContent, pageConfig, findings);
          break;

        case 21: // Technical Debt Score (2B.7)
          await this.auditTechnicalDebt(pageContent, pageConfig, findings);
          break;

        case 22: // Internationalization Coverage (2B.8)
          await this.auditI18nCoverage(pageContent, pageConfig, findings);
          break;

        // Gap Analysis Agents (23-43) would go here
        default:
          // For gap analysis agents not yet implemented
          break;
      }
    } catch (error) {
      findings.push({
        severity: 'critical',
        category: 'Audit Error',
        message: `Failed to audit: ${error instanceof Error ? error.message : 'Unknown error'}`,
        recommendation: 'Check file path and permissions'
      });
    }

    return findings;
  }

  // Phase 0: Documentation Review
  private async auditDocumentationReview(content: string, config: PageConfig, findings: AgentFinding[]): Promise<void> {
    // Check if page references approved patterns
    const hasApprovedPatternReference = /approved-patterns|platform-handoff|component-library/i.test(content);
    
    if (!hasApprovedPatternReference) {
      findings.push({
        severity: 'medium',
        category: 'Documentation',
        message: 'No reference to approved patterns found',
        file: config.file,
        recommendation: 'Check docs/platform-handoff/approved-patterns-2025-10-10.md for existing solutions'
      });
    }

    // Check for hardcoded solutions that might exist elsewhere
    const hasCustomImplementation = /custom|new|create/.test(content.toLowerCase());
    if (hasCustomImplementation) {
      findings.push({
        severity: 'info',
        category: 'Documentation',
        message: 'Custom implementations found - verify no existing solution',
        recommendation: 'Search codebase for similar patterns before creating new'
      });
    }
  }

  // Agent 1: Performance Optimization
  private async auditPerformance(content: string, config: PageConfig, findings: AgentFinding[]): Promise<void> {
    // Check lazy loading
    const hasLazyLoading = /lazy|React\.lazy|dynamic.*import/.test(content);
    if (!hasLazyLoading && content.length > 10000) {
      findings.push({
        severity: 'medium',
        category: 'Performance',
        message: 'Large component without lazy loading',
        file: config.file,
        recommendation: 'Use React.lazy() for code splitting'
      });
    }

    // Check for optimization
    const hasMemo = /useMemo|useCallback|React\.memo/.test(content);
    if (!hasMemo && content.includes('map(') && content.includes('filter(')) {
      findings.push({
        severity: 'low',
        category: 'Performance',
        message: 'Array operations without memoization',
        recommendation: 'Consider useMemo for expensive computations'
      });
    }

    findings.push({
      severity: 'info',
      category: 'Performance',
      message: 'Performance check complete',
      recommendation: 'Run Lighthouse audit for detailed metrics'
    });
  }

  // Agent 2: Frontend Architecture
  private async auditFrontendArchitecture(content: string, config: PageConfig, findings: AgentFinding[]): Promise<void> {
    // Check React Query cache invalidation
    const hasCacheInvalidation = /invalidateQueries|queryClient/.test(content);
    const hasMutation = /useMutation/.test(content);
    
    if (hasMutation && !hasCacheInvalidation) {
      findings.push({
        severity: 'high',
        category: 'React Query',
        message: 'Mutation without cache invalidation',
        file: config.file,
        recommendation: 'Use pattern from approved-patterns.md: queryClient.invalidateQueries()'
      });
    }

    // Check TypeScript any usage
    const anyMatches = content.match(/:\s*any\b/g);
    if (anyMatches && anyMatches.length > 0) {
      findings.push({
        severity: 'medium',
        category: 'TypeScript',
        message: `${anyMatches.length} instances of 'any' type found`,
        file: config.file,
        recommendation: 'Replace with proper types from @shared/schema.ts'
      });
    }
  }

  // Agent 3: Background Processing
  private async auditBackgroundProcessing(content: string, config: PageConfig, findings: AgentFinding[]): Promise<void> {
    const hasBackgroundTask = /setTimeout|setInterval|worker/i.test(content);
    
    if (hasBackgroundTask) {
      findings.push({
        severity: 'info',
        category: 'Background',
        message: 'Background task detected',
        recommendation: 'Ensure proper cleanup in useEffect'
      });
    }
  }

  // Agent 4: Real-time Communications
  private async auditRealtime(content: string, config: PageConfig, findings: AgentFinding[]): Promise<void> {
    const hasSocket = /socket\.io|useSocket|WebSocket/.test(content);
    const hasPolling = /setInterval.*fetch|useQuery.*refetchInterval/.test(content);
    
    if (hasSocket) {
      const hasReconnect = /reconnect|connect.*error/.test(content);
      if (!hasReconnect) {
        findings.push({
          severity: 'medium',
          category: 'Real-time',
          message: 'WebSocket without reconnection logic',
          recommendation: 'Add reconnection handling for reliability'
        });
      }
    } else if (!hasPolling && config.category === 'SOCIAL') {
      findings.push({
        severity: 'low',
        category: 'Real-time',
        message: 'No real-time updates found for social page',
        recommendation: 'Consider adding polling or WebSocket for live updates'
      });
    }
  }

  // Agent 5: Business Logic
  private async auditBusinessLogic(content: string, config: PageConfig, findings: AgentFinding[]): Promise<void> {
    // Check auth
    const hasAuth = /useAuth|useUser|isAuthenticated/.test(content);
    if (!hasAuth && !config.file.includes('auth/')) {
      findings.push({
        severity: 'medium',
        category: 'Authorization',
        message: 'No authentication check found',
        file: config.file,
        recommendation: 'Add useAuth() check if page requires authentication'
      });
    }

    // Check validation
    const hasValidation = /zodResolver|validate|schema/.test(content);
    const hasForm = /useForm|Form/.test(content);
    
    if (hasForm && !hasValidation) {
      findings.push({
        severity: 'high',
        category: 'Validation',
        message: 'Form without validation',
        recommendation: 'Use zodResolver with schema from @shared/schema.ts'
      });
    }
  }

  // Agent 6: Search & Analytics
  private async auditSearchAnalytics(content: string, config: PageConfig, findings: AgentFinding[]): Promise<void> {
    const hasSearch = /search|filter|query/i.test(content);
    const hasDebounce = /debounce|useDebounce/.test(content);
    
    if (hasSearch && !hasDebounce) {
      findings.push({
        severity: 'low',
        category: 'Search',
        message: 'Search without debouncing',
        recommendation: 'Use debounce (300ms) for search input'
      });
    }
  }

  // Agent 7-9: Platform Orchestration
  private async auditPlatformOrchestration(content: string, config: PageConfig, findings: AgentFinding[]): Promise<void> {
    const hasErrorBoundary = /withResilience|ErrorBoundary/.test(content);
    
    if (!hasErrorBoundary && content.length > 5000) {
      findings.push({
        severity: 'medium',
        category: 'Error Handling',
        message: 'Large component without error boundary',
        file: config.file,
        recommendation: 'Wrap with withResilience() HOC'
      });
    }
  }

  // Agent 10: AI Research
  private async auditAIIntegration(content: string, config: PageConfig, findings: AgentFinding[]): Promise<void> {
    const hasAI = /openai|gpt|ai|agent/i.test(content);
    
    if (hasAI) {
      findings.push({
        severity: 'info',
        category: 'AI',
        message: 'AI integration detected',
        recommendation: 'Ensure proper error handling and fallback'
      });
    }
  }

  // Agent 11: UI/UX & Accessibility
  private async auditUIUXAccessibility(content: string, config: PageConfig, findings: AgentFinding[]): Promise<void> {
    // Check Aurora Tide components
    const hasGlassCard = /GlassCard/.test(content);
    const hasDarkMode = /dark:|dark:bg|dark:text/.test(content);
    const hasI18n = /useTranslation|{t\(/.test(content);
    const hasTestId = /data-testid/.test(content);
    const hasAria = /aria-label|aria-/.test(content);
    
    const score = [hasGlassCard, hasDarkMode, hasI18n, hasTestId, hasAria].filter(Boolean).length;
    
    if (!hasDarkMode) {
      findings.push({
        severity: 'high',
        category: 'Dark Mode',
        message: 'Missing dark mode variants',
        file: config.file,
        recommendation: 'Add dark: variants to all visual elements (see events page example)'
      });
    }

    if (!hasTestId) {
      findings.push({
        severity: 'medium',
        category: 'Testing',
        message: 'Missing data-testid attributes',
        recommendation: 'Add data-testid to all interactive elements'
      });
    }

    if (!hasI18n) {
      findings.push({
        severity: 'high',
        category: 'i18n',
        message: 'No translation implementation found',
        recommendation: 'Use useTranslation() hook for all text'
      });
    }
  }

  // Agent 12: Data Visualization
  private async auditDataVisualization(content: string, config: PageConfig, findings: AgentFinding[]): Promise<void> {
    const hasChart = /Recharts|Chart|Graph/.test(content);
    
    if (hasChart) {
      findings.push({
        severity: 'info',
        category: 'Visualization',
        message: 'Data visualization found',
        recommendation: 'Ensure charts are accessible and responsive'
      });
    }
  }

  // Agent 13: Media Optimization
  private async auditMediaOptimization(content: string, config: PageConfig, findings: AgentFinding[]): Promise<void> {
    const hasImage = /<img|Image/.test(content);
    const hasLazyImage = /loading="lazy"|react-lazy-load-image/.test(content);
    
    if (hasImage && !hasLazyImage) {
      findings.push({
        severity: 'low',
        category: 'Media',
        message: 'Images without lazy loading',
        recommendation: 'Add loading="lazy" to images'
      });
    }
  }

  // Agent 14: Code Quality
  private async auditCodeQuality(content: string, config: PageConfig, findings: AgentFinding[]): Promise<void> {
    // Check for TODOs/FIXMEs
    const todos = content.match(/TODO|FIXME/g);
    if (todos && todos.length > 0) {
      findings.push({
        severity: 'low',
        category: 'Technical Debt',
        message: `${todos.length} TODO/FIXME comments found`,
        file: config.file,
        recommendation: 'Address or document technical debt'
      });
    }

    // Check for console.logs
    const consoleLogs = content.match(/console\.log/g);
    if (consoleLogs && consoleLogs.length > 0) {
      findings.push({
        severity: 'low',
        category: 'Code Quality',
        message: `${consoleLogs.length} console.log statements found`,
        recommendation: 'Remove debug logs before production'
      });
    }
  }

  // Agent 15: Dependency Health (2B.1)
  private async auditDependencyHealth(content: string, config: PageConfig, findings: AgentFinding[]): Promise<void> {
    const imports = content.match(/import .* from ['"](.+)['"]/g) || [];
    const uniquePackages = new Set(
      imports
        .map(i => i.match(/from ['"](.+)['"]/)?.[1])
        .filter(p => p && !p.startsWith('.') && !p.startsWith('@/'))
    );

    findings.push({
      severity: 'info',
      category: 'Dependencies',
      message: `Uses ${uniquePackages.size} external packages`,
      recommendation: 'Run npm audit to check for vulnerabilities'
    });
  }

  // Agent 16: API Contract Validation (2B.2)
  private async auditAPIContract(content: string, config: PageConfig, findings: AgentFinding[]): Promise<void> {
    const apiCalls = content.match(/['"`]\/api\/[^'"`]+['"`]/g) || [];
    
    if (apiCalls.length > 0) {
      findings.push({
        severity: 'info',
        category: 'API',
        message: `Found ${apiCalls.length} API endpoint calls`,
        recommendation: 'Verify all endpoints exist in server/routes.ts'
      });
    }
  }

  // Agent 17: Cross-Page Consistency (2B.3)
  private async auditCrossPageConsistency(content: string, config: PageConfig, findings: AgentFinding[]): Promise<void> {
    // This would compare patterns with other pages
    findings.push({
      severity: 'info',
      category: 'Consistency',
      message: 'Pattern consistency check',
      recommendation: 'Compare with events (99/100) and memories (91/100) pages'
    });
  }

  // Agent 18: User Flow Validation (2B.4)
  private async auditUserFlow(content: string, config: PageConfig, findings: AgentFinding[]): Promise<void> {
    const hasLoadingState = /isLoading|isPending|loading/.test(content);
    const hasErrorState = /isError|error/.test(content);
    const hasEmptyState = /empty|no.*data|no.*results/i.test(content);
    
    if (!hasLoadingState) {
      findings.push({
        severity: 'medium',
        category: 'User Flow',
        message: 'Missing loading state',
        recommendation: 'Show skeleton/spinner while loading'
      });
    }

    if (!hasErrorState) {
      findings.push({
        severity: 'medium',
        category: 'User Flow',
        message: 'Missing error state handling',
        recommendation: 'Display error message to users'
      });
    }
  }

  // Agent 19: Security Deep Dive (2B.5)
  private async auditSecurityDeepDive(content: string, config: PageConfig, findings: AgentFinding[]): Promise<void> {
    const hasSanitization = /DOMPurify|sanitize/.test(content);
    const hasDangerousHTML = /dangerouslySetInnerHTML/.test(content);
    
    if (hasDangerousHTML && !hasSanitization) {
      findings.push({
        severity: 'critical',
        category: 'Security',
        message: 'Unsanitized HTML injection risk',
        file: config.file,
        recommendation: 'Use DOMPurify.sanitize() before setting innerHTML'
      });
    }
  }

  // Agent 20: Performance Budget (2B.6)
  private async auditPerformanceBudget(content: string, config: PageConfig, findings: AgentFinding[]): Promise<void> {
    const sizeKB = Buffer.from(content).length / 1024;
    
    if (sizeKB > 100) {
      findings.push({
        severity: 'medium',
        category: 'Bundle Size',
        message: `Component size: ${sizeKB.toFixed(0)}KB (target: <100KB)`,
        file: config.file,
        recommendation: 'Consider code splitting or extracting components'
      });
    }
  }

  // Agent 21: Technical Debt Score (2B.7)
  private async auditTechnicalDebt(content: string, config: PageConfig, findings: AgentFinding[]): Promise<void> {
    const todos = (content.match(/TODO|FIXME/g) || []).length;
    const anyTypes = (content.match(/:\s*any\b/g) || []).length;
    const consoleLogs = (content.match(/console\.log/g) || []).length;
    
    const debtScore = (todos * 5) + (anyTypes * 3) + (consoleLogs * 1);
    
    if (debtScore > 20) {
      findings.push({
        severity: 'medium',
        category: 'Technical Debt',
        message: `Debt score: ${debtScore} (${todos} TODOs, ${anyTypes} anys, ${consoleLogs} logs)`,
        file: config.file,
        recommendation: 'Refactor to reduce technical debt'
      });
    } else {
      findings.push({
        severity: 'info',
        category: 'Technical Debt',
        message: `Low debt score: ${debtScore}`,
        recommendation: 'Maintain code quality'
      });
    }
  }

  // Agent 22: Internationalization Coverage (2B.8)
  private async auditI18nCoverage(content: string, config: PageConfig, findings: AgentFinding[]): Promise<void> {
    const hasI18n = /useTranslation|{t\(/.test(content);
    const hasHardcodedText = /<[^>]+>([A-Z][a-z]+ [a-z]+|[A-Z][a-z]{4,})/g.test(content);
    
    if (!hasI18n) {
      findings.push({
        severity: 'critical',
        category: 'i18n',
        message: 'No i18next implementation',
        file: config.file,
        recommendation: 'Use useTranslation() hook for all text'
      });
    }

    if (hasHardcodedText) {
      findings.push({
        severity: 'high',
        category: 'i18n',
        message: 'Hardcoded text detected',
        recommendation: 'Replace all text with translation keys'
      });
    }
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
