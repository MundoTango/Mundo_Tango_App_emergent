/**
 * ESA LIFE CEO 61x21 - Agent Coordinator
 * Central coordination system for all 61 layer agents
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
    console.log('[ESA Agent Coordinator] Initialized with 61-layer agent system');
  }

  private async registerAgents(): Promise<void> {
    try {
      // Register implemented agents
      const { layer01Agent } = await import('./layer01-architecture-foundation-agent');
      const { layer02Agent } = await import('./layer02-api-structure-agent');
      const { layer03Agent } = await import('./layer03-server-framework-agent');
      const { layer04Agent } = await import('./layer04-authentication-system-agent');
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

      console.log(`[ESA Agent Coordinator] Registered ${this.agents.size} specialized layer agents`);
      
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
      totalAgents: 61, // Total framework layers
      activeAgents: this.agents.size,
      overallCompliance,
      criticalIssues,
      layerStatus
    };
  }

  async generateHumanReadableReport(): Promise<string> {
    const status = await this.runFullAudit();
    
    const reportSections: string[] = [
      '# ESA LIFE CEO 61x21 Framework - Complete Audit Report',
      '',
      `## Executive Summary`,
      `- **Overall Compliance**: ${status.overallCompliance}%`,
      `- **Active Agents**: ${status.activeAgents}/${status.totalAgents}`,
      `- **Critical Issues**: ${status.criticalIssues.length}`,
      '',
      '## Layer-by-Layer Status'
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