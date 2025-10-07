import { db } from "../db";
import { agentCollaborationLog, insertAgentCollaborationLogSchema } from "../../shared/schema";
import { agentLearningService } from "./AgentLearningCaptureService";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

interface A2AMessage {
  from: string;
  to: string;
  type: 'query' | 'response' | 'broadcast' | 'delegate';
  payload: {
    pattern?: string;
    learning?: any;
    task?: string;
    context?: any;
  };
  metadata: {
    priority: number;
    timestamp: Date;
    correlationId: string;
  };
}

export class CrossDomainLearningService {
  private readonly AGENT_DOMAINS = [
    'infrastructure',
    'frontend',
    'business-logic',
    'real-time',
    'search',
    'life-CEO',
    'platform',
    'background',
    'master-control'
  ];

  async broadcastLearning(learning: any) {
    const recipients = this.getRelevantAgents(learning);
    const collaborationId = `learning-${learning.id || nanoid()}`;

    const collaboration = insertAgentCollaborationLogSchema.parse({
      collaborationId,
      initiatorAgent: learning.discoveredBy || 'infrastructure',
      participantAgents: recipients,
      goal: `Share learning pattern: ${learning.pattern}`,
      status: 'active',
      tasks: {
        broadcast: { status: 'in-progress', recipients },
        apply: { status: 'pending', recipients }
      },
      knowledgeShared: {
        pattern: learning.pattern,
        confidence: learning.confidence,
        esaLayers: learning.esaLayers
      },
      startTime: new Date(),
    });

    const [result] = await db
      .insert(agentCollaborationLog)
      .values(collaboration)
      .returning();

    for (const recipient of recipients) {
      const message: A2AMessage = {
        from: learning.discoveredBy || 'infrastructure',
        to: recipient,
        type: 'broadcast',
        payload: { learning },
        metadata: {
          priority: (learning.confidence || 0) > 0.9 ? 1 : 2,
          timestamp: new Date(),
          correlationId: collaborationId
        }
      };

      await this.sendMessage(message);
    }

    console.log(`[A2A] Broadcasted learning to ${recipients.length} agents: ${learning.pattern}`);
    
    return result.id;
  }

  async applyRemoteLearning(agentId: string, learning: any) {
    if (!learning.agentDomains?.includes(agentId)) {
      console.log(`[A2A] Learning not applicable to ${agentId}`);
      return { applied: false, reason: 'not-applicable' };
    }

    const existing = await this.checkApplied(learning.pattern, agentId);
    if (existing) {
      console.log(`[A2A] Pattern already applied: ${learning.pattern} on ${agentId}`);
      return { applied: false, reason: 'already-applied' };
    }

    console.log(`[A2A] ${agentId} applying pattern: ${learning.pattern}`);

    const result = {
      success: true,
      appliedFiles: learning.appliedTo?.files || [],
      metrics: {
        agentDomain: agentId,
        appliedAt: new Date().toISOString(),
        estimatedImpact: learning.successMetrics
      }
    };

    if (learning.id) {
      await agentLearningService.updateLearningApplication(learning.id, {
        [agentId]: {
          appliedAt: new Date(),
          success: true,
          metrics: result.metrics
        }
      });
    }

    return result;
  }

  private getRelevantAgents(learning: any): string[] {
    const targetDomains = new Set<string>();

    if (learning.agentDomains) {
      learning.agentDomains.forEach((d: string) => targetDomains.add(d));
    }

    if (learning.esaLayers?.some((l: string) => ['7', '14'].includes(l))) {
      targetDomains.add('infrastructure');
      targetDomains.add('frontend');
    }

    if (learning.esaLayers?.some((l: string) => parseInt(l) >= 20 && parseInt(l) <= 30)) {
      targetDomains.add('business-logic');
    }

    if (learning.pattern.includes('real-time') || learning.pattern.includes('websocket')) {
      targetDomains.add('real-time');
    }

    return Array.from(targetDomains).filter(d => this.AGENT_DOMAINS.includes(d));
  }

  private async sendMessage(message: A2AMessage) {
    console.log(`[A2A] ${message.from} → ${message.to}: ${message.type}`, {
      pattern: message.payload.learning?.pattern,
      priority: message.metadata.priority
    });
  }

  private async checkApplied(pattern: string, agentDomain: string): Promise<boolean> {
    const learnings = await agentLearningService.getLearningsByPattern(pattern);
    
    for (const learning of learnings) {
      const appliedTo = learning.appliedTo as any;
      if (appliedTo && appliedTo[agentDomain]) {
        return true;
      }
    }
    
    return false;
  }

  async completeCollaboration(collaborationId: string, result: any) {
    await db
      .update(agentCollaborationLog)
      .set({
        status: 'completed',
        result,
        endTime: new Date(),
        duration: Date.now() - new Date().getTime()
      })
      .where(eq(agentCollaborationLog.collaborationId, collaborationId));
  }
}

export const crossDomainLearning = new CrossDomainLearningService();
