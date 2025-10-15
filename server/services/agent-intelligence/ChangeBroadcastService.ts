/**
 * TRACK C: Change Broadcast Service
 * 
 * Broadcasts confirmed changes to all affected agents and coordinates their responses.
 */

import { agentCollaborationService } from './AgentCollaborationService';
import { db } from '@db';
import { trackedChanges } from '@shared/schema';
import { eq } from 'drizzle-orm';

export interface BroadcastPackage {
  broadcastId: string;
  changes: any[];
  affectedAgents: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  requiresResponse: boolean;
  deadline?: Date;
}

export interface AgentResponse {
  agentId: string;
  status: 'acknowledged' | 'working' | 'completed' | 'error';
  message?: string;
  estimatedCompletion?: Date;
  issues?: string[];
}

export class ChangeBroadcastService {
  /**
   * Identify which agents are affected by a change
   */
  identifyAffectedAgents(change: any): string[] {
    const affected: string[] = [];

    // Extract component information
    const componentId = change.componentId;
    const changeType = change.changeType;

    // 1. Component agent itself
    affected.push(this.getComponentAgentId(componentId));

    // 2. Parent page agent
    const pageAgent = this.getPageAgentId(change.pagePath || 'unknown');
    if (pageAgent) affected.push(pageAgent);

    // 3. Relevant layer agents based on change type
    const layerAgents = this.getRelevantLayerAgents(changeType);
    affected.push(...layerAgents);

    // 4. Algorithm agents if functionality changes
    if (changeType === 'text' || changeType === 'delete' || changeType === 'add') {
      affected.push('A8-PERFORMANCE-OPTIMIZER'); // May need to re-optimize
    }

    return Array.from(new Set(affected)); // Remove duplicates
  }

  /**
   * Get component agent ID from component name
   */
  private getComponentAgentId(componentId: string): string {
    return `COMPONENT-${componentId.toUpperCase().replace(/[^A-Z0-9]/g, '-')}`;
  }

  /**
   * Get page agent ID from page path
   */
  private getPageAgentId(pagePath: string): string | null {
    if (!pagePath || pagePath === 'unknown') return null;
    
    const pageName = pagePath.split('/').pop() || 'home';
    return `PAGE-${pageName.toUpperCase().replace(/[^A-Z0-9]/g, '-')}`;
  }

  /**
   * Get relevant layer agents based on change type
   */
  private getRelevantLayerAgents(changeType: string): string[] {
    const layers: string[] = [];

    switch (changeType) {
      case 'style':
        layers.push('LAYER-9-UI-FRAMEWORK');
        layers.push('LAYER-10-COMPONENT-LIBRARY');
        break;

      case 'move':
      case 'resize':
        layers.push('LAYER-54-ACCESSIBILITY');
        layers.push('LAYER-9-UI-FRAMEWORK');
        break;

      case 'add':
      case 'delete':
        layers.push('LAYER-48-PERFORMANCE');
        layers.push('LAYER-8-CLIENT-FRAMEWORK');
        break;

      case 'text':
        layers.push('LAYER-53-INTERNATIONALIZATION');
        layers.push('LAYER-54-ACCESSIBILITY');
        break;
    }

    return layers;
  }

  /**
   * Create broadcast package from changes
   */
  packageChange(changes: any[], affectedAgents: string[]): BroadcastPackage {
    const broadcastId = `BROADCAST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Determine priority based on change types
    const hasCriticalChanges = changes.some(c => c.changeType === 'delete');
    const priority = hasCriticalChanges ? 'high' : 'medium';

    return {
      broadcastId,
      changes,
      affectedAgents,
      priority,
      requiresResponse: true,
      deadline: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
    };
  }

  /**
   * Broadcast changes to all affected agents
   */
  async broadcastToAgents(broadcastPackage: BroadcastPackage) {
    const results = [];

    for (const agentId of broadcastPackage.affectedAgents) {
      const message = await agentCollaborationService.sendMessage({
        fromAgent: 'MR-BLUE-COORDINATOR',
        toAgent: agentId,
        messageType: 'update',
        priority: broadcastPackage.priority,
        subject: `Visual Editor Changes - Action Required`,
        content: this.formatBroadcastMessage(broadcastPackage),
        requiresResponse: broadcastPackage.requiresResponse,
        responseBy: broadcastPackage.deadline,
        metadata: {
          broadcastId: broadcastPackage.broadcastId,
          changeCount: broadcastPackage.changes.length
        }
      });

      results.push({
        agentId,
        messageId: message.id,
        sentAt: new Date()
      });
    }

    return {
      broadcastId: broadcastPackage.broadcastId,
      sentTo: broadcastPackage.affectedAgents.length,
      results
    };
  }

  /**
   * Format broadcast message for agents
   */
  private formatBroadcastMessage(broadcast: BroadcastPackage): string {
    const changesSummary = broadcast.changes
      .map((c, i) => `${i + 1}. ${c.aiSummary || c.changeType}`)
      .join('\n');

    return `User has confirmed ${broadcast.changes.length} change(s) in the Visual Editor:

${changesSummary}

Please review these changes and respond with:
1. ACKNOWLEDGED - You've received this and will process it
2. Your estimated completion time
3. Any issues or concerns

Deadline for response: ${broadcast.deadline?.toLocaleString() || 'ASAP'}

Changes are ready to be implemented. Please coordinate with other agents if needed.`;
  }

  /**
   * Collect responses from agents
   */
  async collectResponses(broadcastId: string): Promise<AgentResponse[]> {
    // Get all messages related to this broadcast
    const messages = await agentCollaborationService.getInbox('MR-BLUE-COORDINATOR');

    // Filter responses to this broadcast
    const responses = messages.filter(m => 
      m.metadata?.broadcastId === broadcastId && 
      m.messageType === 'answer'
    );

    return responses.map(r => ({
      agentId: r.fromAgent,
      status: this.parseResponseStatus(r.content),
      message: r.content,
      estimatedCompletion: this.parseEstimatedCompletion(r.content)
    }));
  }

  /**
   * Parse agent response status
   */
  private parseResponseStatus(content: string): AgentResponse['status'] {
    const lower = content.toLowerCase();
    
    if (lower.includes('acknowledged') || lower.includes('received')) return 'acknowledged';
    if (lower.includes('working') || lower.includes('processing')) return 'working';
    if (lower.includes('completed') || lower.includes('done')) return 'completed';
    if (lower.includes('error') || lower.includes('failed')) return 'error';
    
    return 'acknowledged';
  }

  /**
   * Parse estimated completion time from response
   */
  private parseEstimatedCompletion(content: string): Date | undefined {
    // Simple pattern matching for time estimates
    const minutesMatch = content.match(/(\d+)\s*minutes?/i);
    if (minutesMatch) {
      const minutes = parseInt(minutesMatch[1]);
      return new Date(Date.now() + minutes * 60 * 1000);
    }

    const hoursMatch = content.match(/(\d+)\s*hours?/i);
    if (hoursMatch) {
      const hours = parseInt(hoursMatch[1]);
      return new Date(Date.now() + hours * 60 * 60 * 1000);
    }

    return undefined;
  }

  /**
   * Route agent questions about the changes
   */
  async routeQuestions(agentId: string, question: string, broadcastId: string) {
    // Forward question to Mr Blue or appropriate coordinator
    return await agentCollaborationService.sendMessage({
      fromAgent: agentId,
      toAgent: 'MR-BLUE-COORDINATOR',
      messageType: 'question',
      subject: `Question about ${broadcastId}`,
      content: question,
      priority: 'medium',
      requiresResponse: true,
      metadata: { broadcastId }
    });
  }

  /**
   * Aggregate results from all agents
   */
  async aggregateResults(broadcastId: string) {
    const responses = await this.collectResponses(broadcastId);

    const total = responses.length;
    const acknowledged = responses.filter(r => r.status === 'acknowledged').length;
    const working = responses.filter(r => r.status === 'working').length;
    const completed = responses.filter(r => r.status === 'completed').length;
    const errors = responses.filter(r => r.status === 'error').length;

    const allCompleted = completed === total;
    const hasErrors = errors > 0;

    return {
      broadcastId,
      totalAgents: total,
      acknowledged,
      working,
      completed,
      errors,
      allCompleted,
      hasErrors,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      responses
    };
  }

  /**
   * Monitor broadcast progress in real-time
   */
  async monitorProgress(broadcastId: string) {
    const results = await this.aggregateResults(broadcastId);

    return {
      ...results,
      status: this.determineBroadcastStatus(results),
      estimatedCompletion: this.estimateCompletion(results.responses)
    };
  }

  /**
   * Determine overall broadcast status
   */
  private determineBroadcastStatus(results: any): string {
    if (results.allCompleted) return 'completed';
    if (results.hasErrors) return 'partial';
    if (results.working > 0) return 'in_progress';
    if (results.acknowledged > 0) return 'acknowledged';
    return 'pending';
  }

  /**
   * Estimate overall completion time
   */
  private estimateCompletion(responses: AgentResponse[]): Date | null {
    const estimates = responses
      .map(r => r.estimatedCompletion)
      .filter(e => e !== undefined) as Date[];

    if (estimates.length === 0) return null;

    // Return the latest estimate (all agents must complete)
    return new Date(Math.max(...estimates.map(d => d.getTime())));
  }

  /**
   * Send completion report back to user
   */
  async reportCompletion(broadcastId: string) {
    const results = await this.aggregateResults(broadcastId);

    const report = {
      broadcastId,
      status: this.determineBroadcastStatus(results),
      summary: this.generateCompletionSummary(results),
      details: results
    };

    return report;
  }

  /**
   * Generate human-readable completion summary
   */
  private generateCompletionSummary(results: any): string {
    if (results.allCompleted) {
      return `✅ All ${results.totalAgents} agents completed processing your changes successfully!`;
    }

    if (results.hasErrors) {
      return `⚠️ ${results.completed}/${results.totalAgents} agents completed. ${results.errors} encountered errors.`;
    }

    if (results.working > 0) {
      return `⏳ ${results.working}/${results.totalAgents} agents are currently working on your changes...`;
    }

    return `📥 ${results.acknowledged}/${results.totalAgents} agents acknowledged your changes.`;
  }
}

export const changeBroadcastService = new ChangeBroadcastService();
