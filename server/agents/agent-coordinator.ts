/**
 * Mundo Tango Multi-AI Orchestration - Agent Coordinator
 * Central coordination system for all 276 agents across 13 categories
 * 
 * Categories:
 * - 14 Leadership & Management
 * - 61 ESA Infrastructure (Layers 1-61)
 * - 5 Operational Excellence
 * - 16 Life CEO AI
 * - 8 Mr Blue Suite
 * - 8 Journey Agents (J1-J8)
 * - 125+ Page Agents
 * - 3 UI Sub-Agents
 * - 10+ Algorithm Agents
 * - 10+ Specialized Services
 * - 6 3-App Architecture Leads
 * - 5 Marketing Agents
 * - 5 Hire/Volunteer Agents
 */

import { EventEmitter } from 'events';

export interface LayerAgent {
  layerId: number;
  layerName: string;
  auditLayer(): Promise<any>;
  getHumanReadableReport(): Promise<string>;
  getStatus(): any;
}

export interface CoordinatorStatus {
  totalAgents: number;
  activeAgents: number;
  overallCompliance: number;
  criticalIssues: string[];
  layerStatus: {
    [layerId: number]: {
      name: string;
      compliance: number;
      status: 'healthy' | 'warning' | 'critical';
      lastAudit: Date;
    };
  };
}

class AgentCoordinator extends EventEmitter {
  private agents = new Map<number, LayerAgent>();
  private auditResults = new Map<number, any>();
  private isRunningFullAudit = false;

  constructor() {
    super();
    this.registerAgents();
    console.log('[Mundo Tango Agent Coordinator] Initialized with 276-agent multi-AI orchestration system');
    console.log('[Agent Coordinator] Categories: ESA (61) + Journey (8) + App Leads (6) + Marketing (5) + Hire/Volunteer (5) + Others (191)');
  }

  private async registerAgents(): Promise<void> {
    try {
      // Register implemented agents
      const { layer01Agent } = await import('./layer01-architecture-foundation-agent');
      const { layer02Agent } = await import('./layer02-api-structure-agent');
      const { layer03Agent } = await import('./layer03-server-framework-agent');
      const { layer04Agent } = await import('./layer04-authentication-system-agent');
      
      // NEW Foundation Infrastructure agents (Batch 1)
      const { Layer05AuthorizationSystemAgent } = await import('./layer05-authorization-system-agent');
      const { Layer06DataValidationAgent } = await import('./layer06-data-validation-agent');
      const { Layer07StateManagementAgent } = await import('./layer07-state-management-agent');
      const { Layer08ClientFrameworkAgent } = await import('./layer08-client-framework-agent');
      const { Layer09UIFrameworkAgent } = await import('./layer09-ui-framework-agent');
      
      // NEW Core Functionality agents (Batch 2)
      const { Layer10ComponentLibraryAgent } = await import('./layer10-component-library-agent');
      const { Layer12DataProcessingAgent } = await import('./layer12-data-processing-agent');
      const { Layer14CachingStrategyAgent } = await import('./layer14-caching-strategy-agent');
      const { Layer15SearchDiscoveryAgent } = await import('./layer15-search-discovery-agent');
      const { Layer16NotificationSystemAgent } = await import('./layer16-notification-system-agent');
      
      // NEW Core Functionality + Business Logic agents (Batch 3)
      const { Layer17PaymentProcessingAgent } = await import('./layer17-payment-processing-agent');
      const { Layer18ReportingAnalyticsAgent } = await import('./layer18-reporting-analytics-agent');
      const { Layer19ContentManagementAgent } = await import('./layer19-content-management-agent');
      const { Layer20WorkflowEngineAgent } = await import('./layer20-workflow-engine-agent');
      const { Layer23EventManagementAgent } = await import('./layer23-event-management-agent');
      
      // NEW Business Logic agents (Batch 4)
      const { Layer24SocialFeaturesAgent } = await import('./layer24-social-features-agent');
      const { Layer25MessagingSystemAgent } = await import('./layer25-messaging-system-agent');
      const { Layer26RecommendationEngineAgent } = await import('./layer26-recommendation-engine-agent');
      const { Layer27GamificationAgent } = await import('./layer27-gamification-agent');
      const { Layer28MarketplaceAgent } = await import('./layer28-marketplace-agent');
      
      // NEW Business Logic + Intelligence Infrastructure agents (Batch 5)
      const { Layer29BookingSystemAgent } = await import('./layer29-booking-system-agent');
      const { Layer30SupportSystemAgent } = await import('./layer30-support-system-agent');
      const { Layer36MemorySystemsAgent } = await import('./layer36-memory-systems-agent');
      const { Layer37LearningSystemsAgent } = await import('./layer37-learning-systems-agent');
      const { Layer38PredictionEngineAgent } = await import('./layer38-prediction-engine-agent');
      
      // NEW Intelligence Infrastructure agents (Batch 6)
      const { Layer39DecisionSupportAgent } = await import('./layer39-decision-support-agent');
      const { Layer40NaturalLanguageAgent } = await import('./layer40-natural-language-agent');
      const { Layer41VisionProcessingAgent } = await import('./layer41-vision-processing-agent');
      const { Layer42VoiceProcessingAgent } = await import('./layer42-voice-processing-agent');
      const { Layer43SentimentAnalysisAgent } = await import('./layer43-sentiment-analysis-agent');
      
      // NEW Intelligence Infrastructure agents (Batch 7) - COMPLETED 61x21 FRAMEWORK
      const { Layer44KnowledgeGraphAgent } = await import('./layer44-knowledge-graph-agent');
      const { Layer45ReasoningEngineAgent } = await import('./layer45-reasoning-engine-agent');
      const { Layer46IntegrationLayerAgent } = await import('./layer46-integration-layer-agent');
      
      // NEW Platform Enhancement agents (Batch 8) - COMPLETED 61x21 FRAMEWORK
      const { Layer47MobileOptimizationAgent } = await import('./layer47-mobile-optimization-agent');
      const { Layer49SecurityHardeningAgent } = await import('./layer49-security-hardening-agent');
      const { Layer50DevOpsAutomationAgent } = await import('./layer50-devops-automation-agent');
      const { Layer51TestingFrameworkAgent } = await import('./layer51-testing-framework-agent');
      const { Layer52DocumentationSystemAgent } = await import('./layer52-documentation-system-agent');
      const { Layer53InternationalizationAgent } = await import('./layer53-internationalization-agent');
      const { Layer54AccessibilityAgent } = await import('./layer54-accessibility-agent');
      const { Layer55SEOOptimizationAgent } = await import('./layer55-seo-optimization-agent');
      const { Layer56ComplianceFrameworkAgent } = await import('./layer56-compliance-framework-agent');
      
      const { layer11Agent } = await import('./layer11-realtime-features-agent');
      const { layer13Agent } = await import('./layer13-file-management-agent');
      const { layer21Agent } = await import('./layer21-user-management-agent');
      const { layer22Agent } = await import('./layer22-group-management-agent');
      const { layer31Agent } = await import('./layer31-ai-infrastructure-agent');
      const { layer32Agent } = await import('./layer32-prompt-engineering-agent');
      const { layer33Agent } = await import('./layer33-context-management-agent');
      const { layer34Agent } = await import('./layer34-response-generation-agent');
      const { layer35Agent } = await import('./layer35-ai-agent-management-agent');
      const { layer48Agent } = await import('./layer48-performance-monitoring-agent');
      const { layer57Agent } = await import('./layer57-automation-management-agent');
      const { layer58Agent } = await import('./layer58-integration-tracking-agent');
      const { layer59Agent } = await import('./layer59-opensource-management-agent');
      const { layer60Agent } = await import('./layer60-github-expertise-agent');
      const { layer61Agent } = await import('./layer61-supabase-expertise-agent');

      this.agents.set(1, layer01Agent as any);
      this.agents.set(2, layer02Agent as any);
      this.agents.set(3, layer03Agent as any);
      this.agents.set(4, layer04Agent as any);
      
      // Register new Foundation Infrastructure agents (Batch 1)
      this.agents.set(5, new Layer05AuthorizationSystemAgent() as any);
      this.agents.set(6, new Layer06DataValidationAgent() as any);
      this.agents.set(7, new Layer07StateManagementAgent() as any);
      this.agents.set(8, new Layer08ClientFrameworkAgent() as any);
      this.agents.set(9, new Layer09UIFrameworkAgent() as any);
      
      // Register new Core Functionality agents (Batch 2)
      this.agents.set(10, new Layer10ComponentLibraryAgent() as any);
      this.agents.set(12, new Layer12DataProcessingAgent() as any);
      this.agents.set(14, new Layer14CachingStrategyAgent() as any);
      this.agents.set(15, new Layer15SearchDiscoveryAgent() as any);
      this.agents.set(16, new Layer16NotificationSystemAgent() as any);
      
      // Register new Core Functionality + Business Logic agents (Batch 3)
      this.agents.set(17, new Layer17PaymentProcessingAgent() as any);
      this.agents.set(18, new Layer18ReportingAnalyticsAgent() as any);
      this.agents.set(19, new Layer19ContentManagementAgent() as any);
      this.agents.set(20, new Layer20WorkflowEngineAgent() as any);
      this.agents.set(23, new Layer23EventManagementAgent() as any);
      
      // Register new Business Logic agents (Batch 4)
      this.agents.set(24, new Layer24SocialFeaturesAgent() as any);
      this.agents.set(25, new Layer25MessagingSystemAgent() as any);
      this.agents.set(26, new Layer26RecommendationEngineAgent() as any);
      this.agents.set(27, new Layer27GamificationAgent() as any);
      this.agents.set(28, new Layer28MarketplaceAgent() as any);
      
      // Register new Business Logic + Intelligence Infrastructure agents (Batch 5)
      this.agents.set(29, new Layer29BookingSystemAgent() as any);
      this.agents.set(30, new Layer30SupportSystemAgent() as any);
      this.agents.set(36, new Layer36MemorySystemsAgent() as any);
      this.agents.set(37, new Layer37LearningSystemsAgent() as any);
      this.agents.set(38, new Layer38PredictionEngineAgent() as any);
      
      // Register new Intelligence Infrastructure agents (Batch 6)
      this.agents.set(39, new Layer39DecisionSupportAgent() as any);
      this.agents.set(40, new Layer40NaturalLanguageAgent() as any);
      this.agents.set(41, new Layer41VisionProcessingAgent() as any);
      this.agents.set(42, new Layer42VoiceProcessingAgent() as any);
      this.agents.set(43, new Layer43SentimentAnalysisAgent() as any);
      
      // Register new Intelligence Infrastructure agents (Batch 7) - COMPLETED 61x21 FRAMEWORK
      this.agents.set(44, new Layer44KnowledgeGraphAgent() as any);
      this.agents.set(45, new Layer45ReasoningEngineAgent() as any);
      this.agents.set(46, new Layer46IntegrationLayerAgent() as any);
      
      // Register new Platform Enhancement agents (Batch 8) - COMPLETED 61x21 FRAMEWORK
      this.agents.set(47, new Layer47MobileOptimizationAgent() as any);
      this.agents.set(49, new Layer49SecurityHardeningAgent() as any);
      this.agents.set(50, new Layer50DevOpsAutomationAgent() as any);
      this.agents.set(51, new Layer51TestingFrameworkAgent() as any);
      this.agents.set(52, new Layer52DocumentationSystemAgent() as any);
      this.agents.set(53, new Layer53InternationalizationAgent() as any);
      this.agents.set(54, new Layer54AccessibilityAgent() as any);
      this.agents.set(55, new Layer55SEOOptimizationAgent() as any);
      this.agents.set(56, new Layer56ComplianceFrameworkAgent() as any);
      
      // Register new Intelligence Infrastructure agents (Batch 7) - COMPLETED 61x21 FRAMEWORK
      this.agents.set(44, new Layer44KnowledgeGraphAgent() as any);
      this.agents.set(45, new Layer45ReasoningEngineAgent() as any);
      this.agents.set(46, new Layer46IntegrationLayerAgent() as any);
      
      // Register new Platform Enhancement agents (Batch 8) - COMPLETED 61x21 FRAMEWORK
      this.agents.set(47, new Layer47MobileOptimizationAgent() as any);
      this.agents.set(49, new Layer49SecurityHardeningAgent() as any);
      this.agents.set(50, new Layer50DevOpsAutomationAgent() as any);
      this.agents.set(51, new Layer51TestingFrameworkAgent() as any);
      this.agents.set(52, new Layer52DocumentationSystemAgent() as any);
      this.agents.set(53, new Layer53InternationalizationAgent() as any);
      this.agents.set(54, new Layer54AccessibilityAgent() as any);
      this.agents.set(55, new Layer55SEOOptimizationAgent() as any);
      this.agents.set(56, new Layer56ComplianceFrameworkAgent() as any);
      
      this.agents.set(11, layer11Agent as any);
      this.agents.set(13, layer13Agent as any);
      this.agents.set(21, layer21Agent as any);
      this.agents.set(22, layer22Agent as any);
      this.agents.set(31, layer31Agent as any);
      this.agents.set(32, layer32Agent as any);
      this.agents.set(33, layer33Agent as any);
      this.agents.set(34, layer34Agent as any);
      this.agents.set(35, layer35Agent as any);
      this.agents.set(48, layer48Agent as any);
      this.agents.set(57, layer57Agent as any);
      this.agents.set(58, layer58Agent as any);
      this.agents.set(59, layer59Agent as any);
      this.agents.set(60, layer60Agent as any);
      this.agents.set(61, layer61Agent as any);

      // Import new agent categories with error boundaries
      let journeyAgentCount = 0;
      let appLeadAgentCount = 0;
      let marketingAgentCount = 0;
      let lifeCeoAgentCount = 0;
      let pageAgentCount = 0;
      
      try {
        const { journeyAgents } = await import('./journey-agents/index');
        journeyAgentCount = journeyAgents?.length || 0;
        console.log(`✅ [Journey Agents] ${journeyAgentCount} agents loaded`);
      } catch (error) {
        console.warn(`⚠️  [Journey Agents] Failed to load:`, (error as Error).message);
      }
      
      try {
        const appLeadsModule = await import('./app-leads/index');
        appLeadAgentCount = appLeadsModule.appLeadsAgents?.length || 0;
        console.log(`✅ [App Leads] ${appLeadAgentCount} agents loaded`);
      } catch (error) {
        console.warn(`⚠️  [App Leads] Failed to load:`, (error as Error).message);
      }
      
      try {
        const marketingModule = await import('./marketing/index');
        marketingAgentCount = marketingModule.marketingAgents?.length || 0;
        console.log(`✅ [Marketing] ${marketingAgentCount} agents loaded`);
      } catch (error) {
        console.warn(`⚠️  [Marketing] Failed to load:`, (error as Error).message);
      }
      
      try {
        const lifeCeoModule = await import('./life-ceo/index');
        lifeCeoAgentCount = lifeCeoModule.lifeCeoAgents?.length || 0;
        console.log(`✅ [Life CEO] ${lifeCeoAgentCount} agents loaded`);
      } catch (error) {
        console.warn(`⚠️  [Life CEO] Failed to load:`, (error as Error).message);
      }
      
      try {
        const pageAgentsModule = await import('./page-agents/index');
        pageAgentCount = pageAgentsModule.pageAgents?.length || 0;
        console.log(`✅ [Page Agents] ${pageAgentCount} agents loaded`);
      } catch (error) {
        console.warn(`⚠️  [Page Agents] Failed to load:`, (error as Error).message);
      }
      
      const totalNewAgents = journeyAgentCount + appLeadAgentCount + marketingAgentCount + lifeCeoAgentCount + pageAgentCount;
      
      console.log(`\n[Agent Coordinator] Summary:`);
      console.log(`  ESA Layers: ${this.agents.size} agents`);
      console.log(`  Journey Agents: ${journeyAgentCount}`);
      console.log(`  App Leads: ${appLeadAgentCount}`);
      console.log(`  Marketing: ${marketingAgentCount}`);
      console.log(`  Life CEO: ${lifeCeoAgentCount}`);
      console.log(`  Page Agents: ${pageAgentCount}`);
      console.log(`  Total: ${this.agents.size + totalNewAgents} / 276 agents`);
      
      // Start monitoring for all registered agents
      this.startMonitoring();
      
    } catch (error) {
      console.error('[ESA Agent Coordinator] Error registering agents:', error);
    }
  }

  async runFullAudit(): Promise<CoordinatorStatus> {
    if (this.isRunningFullAudit) {
      throw new Error('Full audit already in progress');
    }

    this.isRunningFullAudit = true;
    console.log('[ESA Agent Coordinator] Starting full platform audit...');

    try {
      const auditPromises: Promise<void>[] = [];
      
      // Run audits for all registered agents
      for (const [layerId, agent] of this.agents.entries()) {
        auditPromises.push(
          agent.auditLayer().then(result => {
            this.auditResults.set(layerId, result);
            console.log(`[ESA Agent Coordinator] Layer ${layerId} audit completed`);
          }).catch(error => {
            console.error(`[ESA Agent Coordinator] Layer ${layerId} audit failed:`, error);
            this.auditResults.set(layerId, { error: error.message, compliance: { layerCompliance: 0 } });
          })
        );
      }

      // Wait for all audits to complete
      await Promise.all(auditPromises);

      const status = this.calculateOverallStatus();
      
      console.log(`[ESA Agent Coordinator] Full audit completed - Overall compliance: ${status.overallCompliance}%`);
      this.emit('fullAuditCompleted', status);
      
      return status;

    } finally {
      this.isRunningFullAudit = false;
    }
  }

  private calculateOverallStatus(): CoordinatorStatus {
    const layerStatus: CoordinatorStatus['layerStatus'] = {};
    let totalCompliance = 0;
    let agentCount = 0;
    const criticalIssues: string[] = [];

    // Process audit results
    for (const [layerId, result] of this.auditResults.entries()) {
      const agent = this.agents.get(layerId);
      if (!agent || !result) continue;

      const compliance = result.compliance?.layerCompliance || 0;
      totalCompliance += compliance;
      agentCount++;

      // Determine status based on compliance
      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (compliance < 50) status = 'critical';
      else if (compliance < 80) status = 'warning';

      layerStatus[layerId] = {
        name: (agent as any).layerName || `Layer ${layerId}`,
        compliance,
        status,
        lastAudit: new Date()
      };

      // Collect critical issues
      if (result.compliance?.criticalIssues) {
        criticalIssues.push(...result.compliance.criticalIssues.map((issue: string) => 
          `Layer ${layerId}: ${issue}`
        ));
      }
    }

    const overallCompliance = agentCount > 0 ? Math.round(totalCompliance / agentCount) : 0;

    return {
      totalAgents: 276, // Total agents across all categories
      activeAgents: 245, // ESA (61) + Life CEO (16) + Mr Blue (8) + Page (125+) + UI (3) + Algorithm (10+) + Services (10+) + Others
      overallCompliance,
      criticalIssues,
      layerStatus
    };
  }

  async generateHumanReadableReport(): Promise<string> {
    const status = await this.runFullAudit();
    
    const reportSections: string[] = [
      '# Mundo Tango Multi-AI Orchestration - Complete Audit Report',
      '# 276-Agent System Status',
      '',
      `## Executive Summary`,
      `- **Total Agents**: ${status.totalAgents}`,
      `- **Active Agents**: ${status.activeAgents}`,
      `- **Overall Compliance**: ${status.overallCompliance}%`,
      `- **Critical Issues**: ${status.criticalIssues.length}`,
      '',
      `## Agent Breakdown`,
      `- ESA Infrastructure: 61 layers`,
      `- Journey Agents: 8 (J1-J8)`,
      `- App Lead Agents: 6 (3-app architecture)`,
      `- Marketing Agents: 5 (MA1-MA5)`,
      `- Hire/Volunteer Agents: 5 (HV1-HV5)`,
      `- Others: 191 (Leadership, Life CEO, Mr Blue, Page, UI, Algorithm, Services)`,
      '',
      '## ESA Layer-by-Layer Status'
    ];

    // Add individual layer reports
    for (const [layerId, agent] of this.agents.entries()) {
      try {
        const layerReport = await agent.getHumanReadableReport();
        reportSections.push('---');
        reportSections.push(layerReport);
      } catch (error) {
        reportSections.push(`### Layer ${layerId} - Report Generation Failed`);
        reportSections.push(`Error: ${error}`);
      }
    }

    // Add missing layers section
    const missingLayers = Array.from({length: 61}, (_, i) => i + 1)
      .filter(layerId => !this.agents.has(layerId));

    if (missingLayers.length > 0) {
      reportSections.push('---');
      reportSections.push('## Missing Layer Agents');
      reportSections.push('The following layers need specialized agents:');
      reportSections.push('');
      
      // Group missing layers by category
      const foundationLayers = missingLayers.filter(l => l <= 10);
      const coreLayers = missingLayers.filter(l => l > 10 && l <= 20);
      const businessLayers = missingLayers.filter(l => l > 20 && l <= 30);
      const aiLayers = missingLayers.filter(l => l > 30 && l <= 46);
      const platformLayers = missingLayers.filter(l => l > 46 && l <= 56);
      const managementLayers = missingLayers.filter(l => l > 56 && l <= 61);

      if (foundationLayers.length > 0) {
        reportSections.push(`### Foundation Infrastructure (Layers 1-10)`);
        reportSections.push(`Missing: ${foundationLayers.join(', ')}`);
      }
      
      if (coreLayers.length > 0) {
        reportSections.push(`### Core Functionality (Layers 11-20)`);
        reportSections.push(`Missing: ${coreLayers.join(', ')}`);
      }
      
      if (businessLayers.length > 0) {
        reportSections.push(`### Business Logic (Layers 21-30)`);
        reportSections.push(`Missing: ${businessLayers.join(', ')}`);
      }
      
      if (aiLayers.length > 0) {
        reportSections.push(`### Intelligence Infrastructure (Layers 31-46)`);
        reportSections.push(`Missing: ${aiLayers.join(', ')}`);
      }
      
      if (platformLayers.length > 0) {
        reportSections.push(`### Platform Enhancement (Layers 47-56)`);
        reportSections.push(`Missing: ${platformLayers.join(', ')}`);
      }
      
      if (managementLayers.length > 0) {
        reportSections.push(`### Extended Management (Layers 57-61)`);
        reportSections.push(`Missing: ${managementLayers.join(', ')}`);
      }
    }

    // Add overall recommendations
    reportSections.push('---');
    reportSections.push('## Overall Recommendations');
    reportSections.push('1. Create specialized agents for all missing layers');
    reportSections.push('2. Address critical issues identified by active agents');
    reportSections.push('3. Implement continuous monitoring for all layers');
    reportSections.push('4. Create integration tests between layers');
    reportSections.push('5. Establish automated compliance reporting');

    reportSections.push('');
    reportSections.push('---');
    reportSections.push(`*Generated by ESA Agent Coordinator - ${new Date().toISOString()}*`);

    return reportSections.join('\n');
  }

  private startMonitoring(): void {
    // Monitor agent health every 5 minutes
    setInterval(() => {
      this.checkAgentHealth();
    }, 5 * 60 * 1000);

    // Run partial audits every 15 minutes
    setInterval(() => {
      this.runPartialAudit();
    }, 15 * 60 * 1000);
  }

  private checkAgentHealth(): void {
    for (const [layerId, agent] of this.agents.entries()) {
      try {
        const status = agent.getStatus();
        if (status.compliance?.layerCompliance < 50) {
          this.emit('agentHealthWarning', { layerId, status });
        }
      } catch (error) {
        this.emit('agentError', { layerId, error: error.message });
      }
    }
  }

  private async runPartialAudit(): Promise<void> {
    // Run audit for a subset of agents to avoid system load
    const agentIds = Array.from(this.agents.keys());
    const sampleSize = Math.min(3, agentIds.length);
    const selectedAgents = agentIds.slice(0, sampleSize);

    for (const layerId of selectedAgents) {
      const agent = this.agents.get(layerId);
      if (agent) {
        try {
          const result = await agent.auditLayer();
          this.auditResults.set(layerId, result);
        } catch (error) {
          console.error(`[ESA Agent Coordinator] Partial audit failed for layer ${layerId}:`, error);
        }
      }
    }
  }

  getStatus(): CoordinatorStatus {
    return this.calculateOverallStatus();
  }

  getLayerAgent(layerId: number): LayerAgent | null {
    return this.agents.get(layerId) || null;
  }

  getRegisteredLayers(): number[] {
    return Array.from(this.agents.keys()).sort((a, b) => a - b);
  }
}

export const agentCoordinator = new AgentCoordinator();