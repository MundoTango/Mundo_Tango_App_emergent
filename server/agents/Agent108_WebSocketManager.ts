/**
 * ESA AGENT #108: WebSocket Connection Manager
 * MB.MD TRACK 8.3 - Real-time Optimization
 * 
 * Purpose: Manage single pooled WebSocket connection per user
 * Prevents: Multiple redundant WebSocket connections draining resources
 * Runs: Always active, manages all real-time connections
 */

import { Server as SocketServer } from 'socket.io';
import { db } from '../db';
import { agentJobs } from '../../shared/schema';

interface ConnectionStats {
  totalConnections: number;
  activeUsers: number;
  avgConnectionsPerUser: number;
  bandwidthSaved: string;
}

export class Agent108_WebSocketManager {
  private agentId = 108;
  private agentName = 'WebSocket Connection Manager';
  private io: SocketServer | null = null;
  private userConnections: Map<number, string[]> = new Map(); // userId -> socketIds[]
  
  /**
   * Initialize WebSocket manager
   */
  initialize(io: SocketServer): void {
    this.io = io;
    console.log(`[Agent #${this.agentId}] WebSocket Manager initialized`);
    
    // Monitor connections
    io.on('connection', (socket) => {
      this.handleConnection(socket);
    });
  }
  
  /**
   * Handle new WebSocket connection
   */
  private handleConnection(socket: any): void {
    const userId = socket.data?.user?.id;
    
    if (!userId) {
      console.warn(`[Agent #${this.agentId}] Connection without user ID:`, socket.id);
      return;
    }
    
    // Track user connections
    if (!this.userConnections.has(userId)) {
      this.userConnections.set(userId, []);
    }
    
    const connections = this.userConnections.get(userId)!;
    connections.push(socket.id);
    
    // Warn if user has multiple connections
    if (connections.length > 1) {
      console.warn(`[Agent #${this.agentId}] User ${userId} has ${connections.length} connections`);
      
      // Close oldest connection (keep only latest)
      const oldestSocketId = connections[0];
      const oldestSocket = this.io?.sockets.sockets.get(oldestSocketId);
      
      if (oldestSocket) {
        console.log(`[Agent #${this.agentId}] Closing redundant connection: ${oldestSocketId}`);
        oldestSocket.disconnect(true);
        connections.shift(); // Remove from tracking
      }
    }
    
    // Handle disconnection
    socket.on('disconnect', () => {
      this.handleDisconnection(userId, socket.id);
    });
    
    console.log(`[Agent #${this.agentId}] User ${userId} connected (${socket.id})`);
  }
  
  /**
   * Handle WebSocket disconnection
   */
  private handleDisconnection(userId: number, socketId: string): void {
    const connections = this.userConnections.get(userId);
    
    if (connections) {
      const index = connections.indexOf(socketId);
      if (index > -1) {
        connections.splice(index, 1);
      }
      
      // Clean up if no connections left
      if (connections.length === 0) {
        this.userConnections.delete(userId);
      }
    }
    
    console.log(`[Agent #${this.agentId}] User ${userId} disconnected (${socketId})`);
  }
  
  /**
   * Get connection statistics
   */
  async getStats(): Promise<ConnectionStats> {
    const totalConnections = Array.from(this.userConnections.values())
      .reduce((sum, conns) => sum + conns.length, 0);
    
    const activeUsers = this.userConnections.size;
    const avgConnectionsPerUser = activeUsers > 0 ? totalConnections / activeUsers : 0;
    
    // Calculate bandwidth saved by preventing duplicate connections
    const redundantConnections = totalConnections - activeUsers;
    const bandwidthPerConnection = 50; // KB/s average
    const bandwidthSaved = `${(redundantConnections * bandwidthPerConnection).toFixed(1)} KB/s`;
    
    return {
      totalConnections,
      activeUsers,
      avgConnectionsPerUser: parseFloat(avgConnectionsPerUser.toFixed(2)),
      bandwidthSaved
    };
  }
  
  /**
   * Broadcast to user (all their connections)
   */
  broadcastToUser(userId: number, event: string, data: any): void {
    const connections = this.userConnections.get(userId);
    
    if (!connections || connections.length === 0) {
      console.warn(`[Agent #${this.agentId}] No connections for user ${userId}`);
      return;
    }
    
    connections.forEach(socketId => {
      const socket = this.io?.sockets.sockets.get(socketId);
      if (socket) {
        socket.emit(event, data);
      }
    });
  }
  
  /**
   * Force single connection per user
   */
  async enforcePooling(): Promise<{closed: number}> {
    console.log(`[Agent #${this.agentId}] Enforcing single connection per user...`);
    
    let closed = 0;
    
    this.userConnections.forEach((connections, userId) => {
      if (connections.length > 1) {
        // Keep only the most recent connection
        const toClose = connections.slice(0, -1);
        
        toClose.forEach(socketId => {
          const socket = this.io?.sockets.sockets.get(socketId);
          if (socket) {
            socket.disconnect(true);
            closed++;
          }
        });
        
        // Update tracking
        this.userConnections.set(userId, [connections[connections.length - 1]]);
      }
    });
    
    console.log(`[Agent #${this.agentId}] Closed ${closed} redundant connections`);
    
    return { closed };
  }
  
  /**
   * Auto-reconnect with exponential backoff
   */
  setupAutoReconnect(socket: any): void {
    let reconnectAttempts = 0;
    const maxAttempts = 5;
    
    socket.on('disconnect', () => {
      if (reconnectAttempts < maxAttempts) {
        const delay = Math.pow(2, reconnectAttempts) * 1000; // Exponential backoff
        
        setTimeout(() => {
          console.log(`[Agent #${this.agentId}] Reconnect attempt ${reconnectAttempts + 1}/${maxAttempts}`);
          socket.connect();
          reconnectAttempts++;
        }, delay);
      }
    });
    
    socket.on('connect', () => {
      reconnectAttempts = 0; // Reset on successful connection
    });
  }
}

// Export singleton instance
export const agent108 = new Agent108_WebSocketManager();
