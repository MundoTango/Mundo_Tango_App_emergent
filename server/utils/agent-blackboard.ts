/**
 * Agent Blackboard Pattern Implementation
 * MB.MD Phase 4: Real agent-to-agent collaboration via shared memory
 * 
 * Research Source: Blackboard architecture, event-driven multi-agent systems
 * Enables Agents #115-117 to communicate asynchronously
 */

import type {
  BlackboardMessage,
  AgentState,
  BlackboardState,
  AgentRole,
  MessageType,
  AgentDecision,
  LearningFeedback
} from '@shared/agent-message-types';

import { v4 as uuidv4 } from 'uuid';

/**
 * Blackboard - Shared knowledge repository for agent collaboration
 */
class Blackboard {
  private messages: BlackboardMessage[] = [];
  private agents: Map<AgentRole, AgentState> = new Map();
  private messageListeners: Set<(message: BlackboardMessage) => void> = new Set();
  private currentQueryId: string | null = null;

  constructor() {
    // Initialize agent states
    this.initializeAgents();
  }

  /**
   * Initialize default agent states
   */
  private initializeAgents(): void {
    const roles: AgentRole[] = ['router', 'ensemble', 'meta-orchestrator'];
    
    for (const role of roles) {
      this.agents.set(role, {
        role,
        status: 'idle',
        messages_processed: 0,
        last_active: new Date().toISOString(),
        learning_data: {
          successful_decisions: 0,
          failed_decisions: 0,
          average_confidence: 0
        }
      });
    }
  }

  /**
   * Post a message to the blackboard
   */
  postMessage(
    type: MessageType,
    agent: AgentRole,
    content: { text?: string; metadata?: Record<string, any> },
    parentId?: string
  ): BlackboardMessage {
    const message: BlackboardMessage = {
      id: uuidv4(),
      type,
      agent,
      timestamp: new Date().toISOString(),
      content,
      parent_id: parentId,
      status: 'pending'
    };

    this.messages.push(message);

    // Update agent state
    const agentState = this.agents.get(agent);
    if (agentState) {
      agentState.messages_processed++;
      agentState.last_active = new Date().toISOString();
      agentState.status = 'active';
    }

    // Notify listeners
    this.notifyListeners(message);

    return message;
  }

  /**
   * Read messages from the blackboard
   */
  getMessages(filter?: {
    type?: MessageType;
    agent?: AgentRole;
    status?: BlackboardMessage['status'];
    since?: string; // ISO timestamp
  }): BlackboardMessage[] {
    let filtered = [...this.messages];

    if (filter) {
      if (filter.type) {
        filtered = filtered.filter(m => m.type === filter.type);
      }
      if (filter.agent) {
        filtered = filtered.filter(m => m.agent === filter.agent);
      }
      if (filter.status) {
        filtered = filtered.filter(m => m.status === filter.status);
      }
      if (filter.since) {
        filtered = filtered.filter(m => m.timestamp >= filter.since);
      }
    }

    return filtered;
  }

  /**
   * Get specific message by ID
   */
  getMessage(id: string): BlackboardMessage | null {
    return this.messages.find(m => m.id === id) || null;
  }

  /**
   * Update message status
   */
  updateMessageStatus(id: string, status: BlackboardMessage['status']): void {
    const message = this.getMessage(id);
    if (message) {
      message.status = status;
    }
  }

  /**
   * Get conversation thread (message + all children)
   */
  getThread(messageId: string): BlackboardMessage[] {
    const thread: BlackboardMessage[] = [];
    const root = this.getMessage(messageId);
    
    if (root) {
      thread.push(root);
      const children = this.messages.filter(m => m.parent_id === messageId);
      thread.push(...children);
    }

    return thread;
  }

  /**
   * Subscribe to new messages
   */
  subscribe(listener: (message: BlackboardMessage) => void): () => void {
    this.messageListeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.messageListeners.delete(listener);
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(message: BlackboardMessage): void {
    for (const listener of this.messageListeners) {
      try {
        listener(message);
      } catch (error) {
        console.error('Listener error:', error);
      }
    }
  }

  /**
   * Get agent state
   */
  getAgentState(role: AgentRole): AgentState | null {
    return this.agents.get(role) || null;
  }

  /**
   * Update agent state
   */
  updateAgentState(role: AgentRole, updates: Partial<AgentState>): void {
    const state = this.agents.get(role);
    if (state) {
      Object.assign(state, updates);
    }
  }

  /**
   * Get current blackboard state
   */
  getState(): BlackboardState {
    return {
      messages: [...this.messages],
      agents: Array.from(this.agents.values()),
      current_query_id: this.currentQueryId,
      status: this.currentQueryId ? 'processing' : 'idle'
    };
  }

  /**
   * Set current query ID (for tracking)
   */
  setCurrentQuery(queryId: string | null): void {
    this.currentQueryId = queryId;
  }

  /**
   * Record agent decision for learning
   */
  recordDecision(decision: AgentDecision): string {
    const decisionId = uuidv4();
    
    this.postMessage(
      'feedback',
      decision.agent,
      {
        text: decision.decision,
        metadata: {
          decision_id: decisionId,
          confidence: decision.confidence,
          reasoning: decision.reasoning,
          alternatives: decision.alternatives
        }
      }
    );

    return decisionId;
  }

  /**
   * Record learning feedback (success/failure)
   */
  recordFeedback(feedback: LearningFeedback): void {
    // Update agent learning data
    const message = this.messages.find(
      m => m.content.metadata?.decision_id === feedback.decision_id
    );

    if (message) {
      const agentState = this.agents.get(message.agent);
      if (agentState) {
        if (feedback.outcome === 'success') {
          agentState.learning_data.successful_decisions++;
        } else {
          agentState.learning_data.failed_decisions++;
        }

        // Update average confidence
        const total = agentState.learning_data.successful_decisions + 
                     agentState.learning_data.failed_decisions;
        const successRate = agentState.learning_data.successful_decisions / total;
        agentState.learning_data.average_confidence = successRate;
      }

      // Post feedback message
      this.postMessage(
        'feedback',
        message.agent,
        {
          text: feedback.lesson,
          metadata: {
            decision_id: feedback.decision_id,
            outcome: feedback.outcome,
            actual_result: feedback.actual_result,
            expected_result: feedback.expected_result
          }
        },
        message.id
      );
    }
  }

  /**
   * Clear old messages (keep last 24 hours)
   */
  cleanup(hoursToKeep: number = 24): void {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - hoursToKeep);
    const cutoffISO = cutoff.toISOString();

    this.messages = this.messages.filter(m => m.timestamp >= cutoffISO);
  }

  /**
   * Reset blackboard (for testing)
   */
  reset(): void {
    this.messages = [];
    this.currentQueryId = null;
    this.initializeAgents();
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      total_messages: this.messages.length,
      messages_by_type: this.getMessageCountByType(),
      messages_by_agent: this.getMessageCountByAgent(),
      agent_states: Array.from(this.agents.values())
    };
  }

  private getMessageCountByType(): Record<MessageType, number> {
    const counts: Partial<Record<MessageType, number>> = {};
    for (const message of this.messages) {
      counts[message.type] = (counts[message.type] || 0) + 1;
    }
    return counts as Record<MessageType, number>;
  }

  private getMessageCountByAgent(): Record<AgentRole, number> {
    const counts: Partial<Record<AgentRole, number>> = {};
    for (const message of this.messages) {
      counts[message.agent] = (counts[message.agent] || 0) + 1;
    }
    return counts as Record<AgentRole, number>;
  }
}

// Singleton instance
let blackboardInstance: Blackboard | null = null;

export function getBlackboard(): Blackboard {
  if (!blackboardInstance) {
    blackboardInstance = new Blackboard();

    // Set up periodic cleanup (every hour)
    setInterval(() => {
      blackboardInstance?.cleanup(24);
    }, 60 * 60 * 1000);
  }
  return blackboardInstance;
}

export { Blackboard };
