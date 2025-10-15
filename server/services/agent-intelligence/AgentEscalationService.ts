/**
 * TRACK B: Agent Escalation Service
 * 
 * 4-level escalation hierarchy for agents:
 * Level 1: Peer agents (same layer/domain)
 * Level 2: Domain coordinator  
 * Level 3: Division chief
 * Level 4: Agent #0 (CEO)
 */

import { agentCollaborationService } from './AgentCollaborationService';
import { agentMemoryService } from './AgentMemoryService';

export type EscalationLevel = 'peer' | 'domain' | 'chief' | 'ceo';

export interface EscalationIssue {
  agentId: string;
  issue: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: any;
  attemptedFixes?: string[];
}

export class AgentEscalationService {
  // ESA Framework organizational structure
  private readonly domainCoordinators = {
    'infrastructure': 'DOMAIN-INFRASTRUCTURE',
    'frontend': 'DOMAIN-FRONTEND',
    'backend': 'DOMAIN-BACKEND',
    'business': 'DOMAIN-BUSINESS',
    'intelligence': 'DOMAIN-INTELLIGENCE',
    'platform': 'DOMAIN-PLATFORM',
    'extended': 'DOMAIN-EXTENDED'
  };

  private readonly divisionChiefs = {
    'foundation': 'CHIEF-FOUNDATION', // Layers 1-10
    'core': 'CHIEF-CORE',             // Layers 11-20
    'business': 'CHIEF-BUSINESS',     // Layers 21-30
    'intelligence': 'CHIEF-INTELLIGENCE', // Layers 31-46
    'platform': 'CHIEF-PLATFORM',     // Layers 47-56
    'extended': 'CHIEF-EXTENDED'      // Layers 57-61
  };

  /**
   * Escalate issue through 4-level hierarchy
   */
  async escalateIssue(issue: EscalationIssue, currentLevel: EscalationLevel) {
    switch (currentLevel) {
      case 'peer':
        return await this.escalateToPeer(issue);
      case 'domain':
        return await this.escalateToDomain(issue);
      case 'chief':
        return await this.escalateToChief(issue);
      case 'ceo':
        return await this.emergencyEscalation(issue);
      default:
        throw new Error(`Unknown escalation level: ${currentLevel}`);
    }
  }

  /**
   * Level 1: Escalate to peer agents (same layer/domain)
   */
  private async escalateToPeer(issue: EscalationIssue) {
    // Find peer experts who have solved similar problems
    const peerExperts = await this.findPeerExpert(issue.agentId, issue.issue);

    if (peerExperts.length === 0) {
      // No peer found, escalate to domain
      return await this.escalateToDomain(issue);
    }

    // Send message to peer for help
    const message = await agentCollaborationService.sendMessage({
      fromAgent: issue.agentId,
      toAgent: peerExperts[0],
      messageType: 'request',
      subject: `Help needed: ${issue.issue}`,
      content: `I'm experiencing an issue and noticed you've handled similar problems before. 
      
Issue: ${issue.issue}
Severity: ${issue.severity}
Context: ${JSON.stringify(issue.context, null, 2)}

Attempted fixes: ${issue.attemptedFixes?.join(', ') || 'None yet'}

Can you share your approach?`,
      priority: issue.severity === 'critical' ? 'critical' : 'high',
      requiresResponse: true
    });

    return {
      escalationLevel: 'peer',
      escalatedTo: peerExperts[0],
      messageId: message.id,
      status: 'awaiting_peer_response'
    };
  }

  /**
   * Level 2: Escalate to domain coordinator
   */
  async escalateToDomain(issue: EscalationIssue) {
    const domain = this.identifyDomain(issue.agentId);
    const coordinator = this.domainCoordinators[domain as keyof typeof this.domainCoordinators] || 'DOMAIN-INFRASTRUCTURE';

    const message = await agentCollaborationService.sendMessage({
      fromAgent: issue.agentId,
      toAgent: coordinator,
      messageType: 'alert',
      subject: `Domain escalation: ${issue.issue}`,
      content: `Issue escalated to domain level.

Agent: ${issue.agentId}
Issue: ${issue.issue}
Severity: ${issue.severity}

This requires domain coordinator attention.`,
      priority: issue.severity === 'critical' ? 'critical' : 'high',
      requiresResponse: true,
      metadata: { escalationType: 'domain', originalAgent: issue.agentId }
    });

    return {
      escalationLevel: 'domain',
      escalatedTo: coordinator,
      messageId: message.id,
      status: 'awaiting_domain_response'
    };
  }

  /**
   * Level 3: Escalate to division chief
   */
  async escalateToChief(issue: EscalationIssue) {
    const division = this.identifyDivision(issue.agentId);
    const chief = this.divisionChiefs[division as keyof typeof this.divisionChiefs] || 'CHIEF-FOUNDATION';

    const message = await agentCollaborationService.sendMessage({
      fromAgent: issue.agentId,
      toAgent: chief,
      messageType: 'alert',
      subject: `CHIEF ESCALATION: ${issue.issue}`,
      content: `Critical issue requiring chief attention.

Agent: ${issue.agentId}
Issue: ${issue.issue}
Severity: ${issue.severity}

Peer and domain levels unable to resolve.`,
      priority: 'critical',
      requiresResponse: true,
      metadata: { escalationType: 'chief', originalAgent: issue.agentId }
    });

    return {
      escalationLevel: 'chief',
      escalatedTo: chief,
      messageId: message.id,
      status: 'awaiting_chief_response'
    };
  }

  /**
   * Level 4: Emergency escalation to Agent #0 (CEO)
   */
  async emergencyEscalation(issue: EscalationIssue) {
    const message = await agentCollaborationService.sendMessage({
      fromAgent: issue.agentId,
      toAgent: 'AGENT-0-ESA-ORCHESTRATOR',
      messageType: 'alert',
      subject: `🚨 EMERGENCY: ${issue.issue}`,
      content: `CRITICAL SYSTEM ISSUE - CEO ATTENTION REQUIRED

Agent: ${issue.agentId}
Issue: ${issue.issue}
Severity: CRITICAL

All escalation levels exhausted. Immediate attention required.

Context: ${JSON.stringify(issue.context, null, 2)}`,
      priority: 'critical',
      requiresResponse: true,
      metadata: { escalationType: 'emergency', originalAgent: issue.agentId }
    });

    return {
      escalationLevel: 'ceo',
      escalatedTo: 'AGENT-0-ESA-ORCHESTRATOR',
      messageId: message.id,
      status: 'emergency_escalation'
    };
  }

  /**
   * Find peer experts who have solved similar problems
   */
  async findPeerExpert(agentId: string, problem: string): Promise<string[]> {
    // Search knowledge base for agents who solved similar issues
    const knowledge = await agentMemoryService.searchKnowledge(problem, undefined, 5);

    // Extract unique agent IDs who contributed solutions
    const experts = Array.from(new Set(knowledge.map(k => k.sourceAgent)));

    // Filter out the requesting agent
    return experts.filter(e => e !== agentId);
  }

  /**
   * Identify which domain an agent belongs to
   */
  private identifyDomain(agentId: string): string {
    // Extract domain from agent ID pattern
    // Examples: "LAYER-1-DB", "COMPONENT-LOGIN-BUTTON", "A1-MEMORIES-FEED"
    
    if (agentId.startsWith('LAYER-')) {
      const layer = parseInt(agentId.split('-')[1]);
      if (layer <= 10) return 'infrastructure';
      if (layer <= 20) return 'backend';
      if (layer <= 30) return 'business';
      if (layer <= 46) return 'intelligence';
      if (layer <= 56) return 'platform';
      return 'extended';
    }

    if (agentId.startsWith('COMPONENT-')) return 'frontend';
    if (agentId.startsWith('A')) return 'intelligence'; // Algorithm agents
    if (agentId.includes('CEO')) return 'intelligence';

    return 'infrastructure'; // Default
  }

  /**
   * Identify which division an agent belongs to
   */
  private identifyDivision(agentId: string): string {
    const domain = this.identifyDomain(agentId);
    
    // Map domains to divisions
    const domainToDivision: Record<string, string> = {
      'infrastructure': 'foundation',
      'frontend': 'foundation',
      'backend': 'core',
      'business': 'business',
      'intelligence': 'intelligence',
      'platform': 'platform',
      'extended': 'extended'
    };

    return domainToDivision[domain] || 'foundation';
  }

  /**
   * Auto-escalate based on severity and time
   */
  async autoEscalate(issue: EscalationIssue, waitTime: number = 5 * 60 * 1000) {
    // Wait for response, then auto-escalate if no response
    // This would be implemented with a job queue (BullMQ)
    
    return {
      scheduled: true,
      escalateAt: new Date(Date.now() + waitTime),
      fromLevel: 'peer',
      toLevel: 'domain'
    };
  }

  /**
   * Get escalation path for an agent
   */
  getEscalationPath(agentId: string) {
    const domain = this.identifyDomain(agentId);
    const division = this.identifyDivision(agentId);

    return {
      level1_peer: 'Peer agents in same domain',
      level2_domain: this.domainCoordinators[domain as keyof typeof this.domainCoordinators],
      level3_chief: this.divisionChiefs[division as keyof typeof this.divisionChiefs],
      level4_ceo: 'AGENT-0-ESA-ORCHESTRATOR'
    };
  }
}

export const agentEscalationService = new AgentEscalationService();
