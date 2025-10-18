/**
 * Mundo Tango ESA LIFE CEO - WebSocket Service
 * Phase 11 Task 6: Enhanced with heartbeat, room management, and delivery confirmation
 */

import { WebSocketServer, WebSocket } from "ws";
import { storage } from "../storage";
import { verifyToken } from "../middleware/auth";

interface AuthenticatedWebSocket extends WebSocket {
  userId?: number;
  username?: string;
  lastPong?: number;
  rooms?: Set<string>;
  isAlive?: boolean;
}

interface SocketMessage {
  type: string;
  data: any;
  timestamp: number;
  messageId?: string;
}

export class SocketService {
  private wss: WebSocketServer;
  private clients: Map<number, AuthenticatedWebSocket> = new Map();
  private rooms: Map<string, Set<number>> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private readonly HEARTBEAT_INTERVAL = 30000; // 30 seconds
  private readonly CONNECTION_TIMEOUT = 90000; // 90 seconds

  constructor(wss: WebSocketServer) {
    this.wss = wss;
    this.setupWebSocketServer();
    this.startHeartbeat();
  }

  /**
   * Phase 11 Task 6.1: Heartbeat mechanism to detect dead connections
   */
  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.clients.forEach((ws, userId) => {
        if (ws.isAlive === false) {
          console.log(`⚠️ WebSocket heartbeat timeout for user ${userId}, terminating connection`);
          ws.terminate();
          this.cleanupConnection(ws);
          return;
        }

        // Mark as not alive, will be set to true on pong
        ws.isAlive = false;
        ws.ping();
      });
    }, this.HEARTBEAT_INTERVAL);

    console.log('✅ WebSocket heartbeat started (30s interval)');
  }

  private setupWebSocketServer() {
    this.wss.on('connection', async (ws: AuthenticatedWebSocket, req) => {
      console.log('🔌 New WebSocket connection');
      
      // Initialize connection state
      ws.isAlive = true;
      ws.lastPong = Date.now();
      ws.rooms = new Set();

      // Phase 11 Task 6.1: Handle pong responses
      ws.on('pong', () => {
        ws.isAlive = true;
        ws.lastPong = Date.now();
      });

      // Handle messages
      ws.on('message', async (message: string) => {
        try {
          const data = JSON.parse(message);
          
          if (data.type === 'auth') {
            await this.authenticateSocket(ws, data.token);
          } else if (data.type === 'pong') {
            // Manual pong from client (in case automatic pong doesn't work)
            ws.isAlive = true;
            ws.lastPong = Date.now();
          } else if (data.type === 'chat_message') {
            await this.handleChatMessage(ws, data);
          } else if (data.type === 'join_room') {
            await this.handleJoinRoom(ws, data.roomSlug);
          } else if (data.type === 'leave_room') {
            await this.handleLeaveRoom(ws, data.roomSlug);
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
          ws.send(JSON.stringify({ 
            type: 'error', 
            message: 'Invalid message format',
            timestamp: Date.now()
          }));
        }
      });

      ws.on('close', () => {
        this.cleanupConnection(ws);
      });

      ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
        this.cleanupConnection(ws);
      });
    });
  }

  /**
   * Phase 11 Task 6: Cleanup connection resources
   */
  private cleanupConnection(ws: AuthenticatedWebSocket) {
    if (ws.userId) {
      this.clients.delete(ws.userId);
      
      // Remove user from all rooms
      if (ws.rooms) {
        ws.rooms.forEach(roomSlug => {
          const room = this.rooms.get(roomSlug);
          if (room) {
            room.delete(ws.userId!);
            if (room.size === 0) {
              this.rooms.delete(roomSlug);
            }
          }
        });
      }
      
      console.log(`👋 User ${ws.userId} disconnected and cleaned up`);
    }
  }

  private async authenticateSocket(ws: AuthenticatedWebSocket, token: string) {
    try {
      // Phase 11: Use hardened auth verification
      const decoded = verifyToken(token, 'access');
      const user = await storage.getUser(decoded.userId);

      if (!user || user.isActive === false) {
        ws.send(JSON.stringify({ 
          type: 'auth_error', 
          message: 'Invalid token or inactive user',
          timestamp: Date.now()
        }));
        ws.close();
        return;
      }

      ws.userId = user.id;
      ws.username = user.username;
      this.clients.set(user.id, ws);

      ws.send(JSON.stringify({ 
        type: 'auth_success', 
        message: 'Authentication successful',
        user: { id: user.id, username: user.username, name: user.name },
        timestamp: Date.now()
      }));

      console.log(`✅ User ${user.username} (${user.id}) authenticated via WebSocket`);
    } catch (error) {
      ws.send(JSON.stringify({ 
        type: 'auth_error', 
        message: 'Authentication failed',
        timestamp: Date.now()
      }));
      ws.close();
    }
  }

  /**
   * Phase 11 Task 6.3: Handle chat messages with delivery confirmation
   */
  private async handleChatMessage(ws: AuthenticatedWebSocket, data: any) {
    if (!ws.userId) {
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: 'Not authenticated',
        timestamp: Date.now()
      }));
      return;
    }

    try {
      const messageId = data.messageId || `msg_${Date.now()}_${ws.userId}`;
      
      const message = await storage.createChatMessage({
        slug: messageId,
        chatRoomSlug: data.roomSlug,
        userSlug: ws.userId.toString(),
        messageType: 'TEXT',
        message: data.message,
      });

      // Phase 11 Task 6.3: Send delivery confirmation to sender
      ws.send(JSON.stringify({
        type: 'message_sent',
        messageId: messageId,
        timestamp: Date.now(),
        roomSlug: data.roomSlug
      }));

      // Broadcast message to all users in the chat room
      this.broadcastToRoom(data.roomSlug, 'new_message', {
        ...message,
        username: ws.username,
      });
    } catch (error) {
      console.error('Chat message error:', error);
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: 'Failed to send message',
        messageId: data.messageId,
        timestamp: Date.now()
      }));
    }
  }

  /**
   * Phase 11 Task 6.2: Proper room management - track users per room
   */
  private async handleJoinRoom(ws: AuthenticatedWebSocket, roomSlug: string) {
    if (!ws.userId) {
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: 'Not authenticated',
        timestamp: Date.now()
      }));
      return;
    }

    // Add room to user's room set
    if (!ws.rooms) {
      ws.rooms = new Set();
    }
    ws.rooms.add(roomSlug);

    // Add user to room's user set
    if (!this.rooms.has(roomSlug)) {
      this.rooms.set(roomSlug, new Set());
    }
    this.rooms.get(roomSlug)!.add(ws.userId);

    // Send confirmation
    ws.send(JSON.stringify({ 
      type: 'room_joined', 
      roomSlug,
      message: `Joined room ${roomSlug}`,
      userCount: this.rooms.get(roomSlug)!.size,
      timestamp: Date.now()
    }));

    // Notify others in the room
    this.broadcastToRoom(roomSlug, 'user_joined', {
      userId: ws.userId,
      username: ws.username,
      roomSlug,
    }, ws.userId); // Exclude the user who just joined

    console.log(`📍 User ${ws.userId} joined room ${roomSlug} (${this.rooms.get(roomSlug)!.size} users)`);
  }

  /**
   * Phase 11 Task 6.2: Handle leaving a room
   */
  private async handleLeaveRoom(ws: AuthenticatedWebSocket, roomSlug: string) {
    if (!ws.userId) return;

    // Remove room from user's room set
    if (ws.rooms) {
      ws.rooms.delete(roomSlug);
    }

    // Remove user from room's user set
    const room = this.rooms.get(roomSlug);
    if (room) {
      room.delete(ws.userId);
      
      // Clean up empty rooms
      if (room.size === 0) {
        this.rooms.delete(roomSlug);
      }

      // Notify others in the room
      this.broadcastToRoom(roomSlug, 'user_left', {
        userId: ws.userId,
        username: ws.username,
        roomSlug,
      });

      console.log(`👋 User ${ws.userId} left room ${roomSlug}`);
    }

    // Send confirmation
    ws.send(JSON.stringify({ 
      type: 'room_left', 
      roomSlug,
      timestamp: Date.now()
    }));
  }

  public broadcastToFollowers(userId: number, type: string, data: any) {
    storage.getFollowers(userId).then(followers => {
      followers.forEach(follower => {
        const client = this.clients.get(follower.id);
        if (client && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type,
            data,
            timestamp: Date.now(),
          }));
        }
      });
    });
  }

  /**
   * Phase 11 Task 6.2: Broadcast only to users in a specific room
   */
  public broadcastToRoom(roomSlug: string, type: string, data: any, excludeUserId?: number) {
    const room = this.rooms.get(roomSlug);
    if (!room) return;

    room.forEach(userId => {
      // Skip excluded user (e.g., the sender)
      if (excludeUserId && userId === excludeUserId) return;

      const client = this.clients.get(userId);
      if (client && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type,
          data,
          roomSlug,
          timestamp: Date.now(),
        }));
      }
    });
  }

  public sendToUser(userId: number, type: string, data: any) {
    const client = this.clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type,
        data,
        timestamp: Date.now(),
      }));
    }
  }

  /**
   * Get stats about active connections
   */
  public getStats() {
    return {
      totalConnections: this.clients.size,
      totalRooms: this.rooms.size,
      rooms: Array.from(this.rooms.entries()).map(([slug, users]) => ({
        slug,
        userCount: users.size,
      })),
    };
  }

  /**
   * Cleanup on server shutdown
   */
  public shutdown() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      console.log('❌ WebSocket heartbeat stopped');
    }

    this.clients.forEach((ws) => {
      ws.close(1001, 'Server shutting down');
    });

    console.log('❌ WebSocket service shut down');
  }
}
