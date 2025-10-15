/**
 * TRACK B: Agent Collaboration Service
 * 
 * Enables agents to communicate, plan together, and collaborate on problems.
 * Implements agent-to-agent messaging and collaboration sessions.
 */

import { db } from '../../db';
import { 
  agentCommunications, 
  agentCollaborations,
  type InsertAgentCommunication,
  type InsertAgentCollaboration 
} from '../../../shared/schema';
import { eq, desc, and, or, isNull, inArray } from 'drizzle-orm';

export class AgentCollaborationService {
  /**
   * Send message from one agent to another
   */
  async sendMessage(data: InsertAgentCommunication) {
    const [message] = await db
      .insert(agentCommunications)
      .values(data)
      .returning();
    return message;
  }

  /**
   * Broadcast message to all agents in a domain
   */
  async broadcast(fromAgent: string, domain: string, subject: string, content: string) {
    // For broadcast, toAgent is null
    const message: InsertAgentCommunication = {
      fromAgent,
      toAgent: null,
      messageType: 'update',
      subject: `[${domain}] ${subject}`,
      content,
      priority: 'medium',
      metadata: { domain, broadcast: true }
    };

    const [broadcast] = await db
      .insert(agentCommunications)
      .values(message)
      .returning();

    return broadcast;
  }

  /**
   * Get agent's inbox (messages sent to this agent)
   */
  async getInbox(agentId: string, unreadOnly = false) {
    let query = db
      .select()
      .from(agentCommunications)
      .where(
        or(
          eq(agentCommunications.toAgent, agentId),
          isNull(agentCommunications.toAgent) // Include broadcasts
        )
      )
      .orderBy(desc(agentCommunications.createdAt));

    if (unreadOnly) {
      query = db
        .select()
        .from(agentCommunications)
        .where(
          and(
            or(
              eq(agentCommunications.toAgent, agentId),
              isNull(agentCommunications.toAgent)
            ),
            eq(agentCommunications.status, 'sent')
          )
        )
        .orderBy(desc(agentCommunications.createdAt));
    }

    return await query;
  }

  /**
   * Respond to a message
   */
  async respondToMessage(
    messageId: number, 
    respondingAgent: string, 
    response: string
  ) {
    // Get original message
    const [originalMessage] = await db
      .select()
      .from(agentCommunications)
      .where(eq(agentCommunications.id, messageId));

    if (!originalMessage) {
      throw new Error('Message not found');
    }

    // Mark original as responded
    await db
      .update(agentCommunications)
      .set({ status: 'responded' })
      .where(eq(agentCommunications.id, messageId));

    // Send response
    const responseMessage: InsertAgentCommunication = {
      fromAgent: respondingAgent,
      toAgent: originalMessage.fromAgent,
      messageType: 'answer',
      subject: `Re: ${originalMessage.subject}`,
      content: response,
      parentMessageId: messageId,
      priority: originalMessage.priority
    };

    return await this.sendMessage(responseMessage);
  }

  /**
   * Start a collaboration session
   */
  async initiateCollaboration(data: InsertAgentCollaboration) {
    const [collaboration] = await db
      .insert(agentCollaborations)
      .values(data)
      .returning();
    return collaboration;
  }

  /**
   * Add agent to existing collaboration
   */
  async joinCollaboration(collaborationId: number, agentId: string) {
    const [collab] = await db
      .select()
      .from(agentCollaborations)
      .where(eq(agentCollaborations.id, collaborationId));

    if (!collab) {
      throw new Error('Collaboration not found');
    }

    const participants = collab.participantAgents || [];
    if (!participants.includes(agentId)) {
      participants.push(agentId);
    }

    const [updated] = await db
      .update(agentCollaborations)
      .set({ participantAgents: participants })
      .where(eq(agentCollaborations.id, collaborationId))
      .returning();

    return updated;
  }

  /**
   * Update collaboration progress
   */
  async updateProgress(
    collaborationId: number,
    status: 'planning' | 'executing' | 'testing' | 'complete',
    progress: number
  ) {
    const updates: any = { currentStatus: status, progress };

    if (status === 'complete') {
      updates.completedAt = new Date();
    }

    const [updated] = await db
      .update(agentCollaborations)
      .set(updates)
      .where(eq(agentCollaborations.id, collaborationId))
      .returning();

    return updated;
  }

  /**
   * Set collaboration outcome
   */
  async setOutcome(
    collaborationId: number,
    outcome: 'success' | 'failure' | 'partial',
    result?: any
  ) {
    const [updated] = await db
      .update(agentCollaborations)
      .set({ 
        outcome,
        currentStatus: 'complete',
        completedAt: new Date(),
        plan: { ...((await this.getCollaboration(collaborationId))?.plan || {}), result }
      })
      .where(eq(agentCollaborations.id, collaborationId))
      .returning();

    return updated;
  }

  /**
   * Get collaboration details
   */
  async getCollaboration(collaborationId: number) {
    const [collab] = await db
      .select()
      .from(agentCollaborations)
      .where(eq(agentCollaborations.id, collaborationId));
    return collab;
  }

  /**
   * Get agent's active collaborations
   */
  async getActiveCollaborations(agentId: string) {
    // Agent is either leader or participant
    const collabs = await db
      .select()
      .from(agentCollaborations)
      .where(
        and(
          or(
            eq(agentCollaborations.leaderAgent, agentId),
            // Check if agentId is in participantAgents array
          ),
          inArray(agentCollaborations.currentStatus, ['planning', 'executing', 'testing'])
        )
      )
      .orderBy(desc(agentCollaborations.startedAt));

    // Filter by participant (drizzle doesn't support array contains easily)
    return collabs.filter(c => 
      c.leaderAgent === agentId || 
      (c.participantAgents || []).includes(agentId)
    );
  }

  /**
   * Find expert peer agents based on problem domain
   */
  async findPeerExpert(currentAgent: string, problem: string) {
    // This would query agent memories/knowledge to find experts
    // For now, return a placeholder
    return {
      expertAgents: [],
      reasoning: 'Would search agent knowledge base for relevant expertise'
    };
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId: number) {
    await db
      .update(agentCommunications)
      .set({ status: 'read' })
      .where(eq(agentCommunications.id, messageId));
  }

  /**
   * Get conversation thread (message + all responses)
   */
  async getThread(messageId: number) {
    // Get original message
    const [original] = await db
      .select()
      .from(agentCommunications)
      .where(eq(agentCommunications.id, messageId));

    // Get all responses
    const responses = await db
      .select()
      .from(agentCommunications)
      .where(eq(agentCommunications.parentMessageId, messageId))
      .orderBy(agentCommunications.createdAt);

    return {
      original,
      responses
    };
  }

  /**
   * Get collaboration statistics for an agent
   */
  async getCollaborationStats(agentId: string) {
    const allCollabs = await db
      .select()
      .from(agentCollaborations);

    const led = allCollabs.filter(c => c.leaderAgent === agentId);
    const participated = allCollabs.filter(c => 
      (c.participantAgents || []).includes(agentId)
    );

    const successful = [...led, ...participated].filter(c => c.outcome === 'success');

    return {
      totalLed: led.length,
      totalParticipated: participated.length,
      successRate: successful.length / (led.length + participated.length) || 0,
      activeCollaborations: await this.getActiveCollaborations(agentId)
    };
  }
}

export const agentCollaborationService = new AgentCollaborationService();
