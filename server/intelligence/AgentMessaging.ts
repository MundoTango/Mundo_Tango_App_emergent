import type { Server } from 'socket.io';

interface AgentMessage {
  fromAgent: string;
  toAgent: string | 'broadcast';
  messageType: 'insight' | 'request' | 'response' | 'alert';
  payload: any;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
}

/**
 * MB.MD Phase 9 - Track 57: Agent Messaging Protocol
 * WebSocket-based real-time agent communication
 */
export class AgentMessagingProtocol {
  private io: Server;
  private messageHistory: Map<string, AgentMessage[]> = new Map();

  constructor(io: Server) {
    this.io = io;
  }

  /**
   * Publish message to specific agent or broadcast
   */
  async publishMessage(message: AgentMessage): Promise<void> {
    // Store in history
    const agentMessages = this.messageHistory.get(message.toAgent) || [];
    agentMessages.push(message);
    if (agentMessages.length > 100) agentMessages.shift(); // Keep last 100
    this.messageHistory.set(message.toAgent, agentMessages);

    // Broadcast via WebSocket
    if (message.toAgent === 'broadcast') {
      this.io.of('/agents').emit('message', message);
    } else {
      this.io.of('/agents').to(message.toAgent).emit('message', message);
    }
  }

  /**
   * Subscribe agent to messages
   */
  async subscribe(agentId: string, callback: (message: AgentMessage) => void): Promise<void> {
    this.io.of('/agents').on('connection', (socket) => {
      socket.join(agentId);
      
      socket.on('message', (msg: AgentMessage) => {
        if (msg.toAgent === agentId || msg.toAgent === 'broadcast') {
          callback(msg);
        }
      });
    });
  }

  /**
   * Get message history
   */
  async getMessageHistory(agentId: string, limit: number = 50): Promise<AgentMessage[]> {
    const messages = this.messageHistory.get(agentId) || [];
    return messages.slice(-limit);
  }
}
