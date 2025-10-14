import { WebSocketServer, WebSocket } from 'ws';
import * as Y from 'yjs';
import { Server } from 'http';

interface CollaborationRoom {
  doc: Y.Doc;
  clients: Set<WebSocket>;
}

export class CollaborationServer {
  private wss: WebSocketServer;
  private rooms: Map<string, CollaborationRoom> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      server, 
      path: '/collaboration' 
    });

    this.wss.on('connection', (ws: WebSocket, req) => {
      this.handleConnection(ws, req);
    });

    console.log('✅ Collaboration server initialized');
  }

  private handleConnection(ws: WebSocket, req: any) {
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const roomId = url.searchParams.get('room') || 'default';

    console.log(`🤝 Client joined room: ${roomId}`);

    // Get or create room
    let room = this.rooms.get(roomId);
    if (!room) {
      room = {
        doc: new Y.Doc(),
        clients: new Set()
      };
      this.rooms.set(roomId, room);
    }

    room.clients.add(ws);

    // Send current state to new client
    const stateVector = Y.encodeStateVector(room.doc);
    ws.send(JSON.stringify({
      type: 'sync-state',
      stateVector: Array.from(stateVector)
    }));

    // Handle messages
    ws.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleMessage(ws, roomId, message);
      } catch (error) {
        console.error('Collaboration message error:', error);
      }
    });

    // Handle disconnect
    ws.on('close', () => {
      room?.clients.delete(ws);
      console.log(`👋 Client left room: ${roomId}`);

      // Clean up empty rooms
      if (room && room.clients.size === 0) {
        this.rooms.delete(roomId);
        room.doc.destroy();
        console.log(`🗑️  Room cleaned up: ${roomId}`);
      }
    });

    // Send awareness updates
    this.broadcastAwareness(roomId, ws);
  }

  private handleMessage(ws: WebSocket, roomId: string, message: any) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    switch (message.type) {
      case 'update':
        // Apply update to shared doc
        const update = Uint8Array.from(message.update);
        Y.applyUpdate(room.doc, update);
        
        // Broadcast to other clients
        this.broadcast(roomId, ws, {
          type: 'update',
          update: message.update
        });
        break;

      case 'awareness':
        // Broadcast awareness (cursor positions, selections)
        this.broadcast(roomId, ws, {
          type: 'awareness',
          awareness: message.awareness
        });
        break;

      case 'sync-request':
        // Send full document state
        const fullState = Y.encodeStateAsUpdate(room.doc);
        ws.send(JSON.stringify({
          type: 'sync-response',
          state: Array.from(fullState)
        }));
        break;
    }
  }

  private broadcast(roomId: string, sender: WebSocket, message: any) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const data = JSON.stringify(message);
    room.clients.forEach(client => {
      if (client !== sender && client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  private broadcastAwareness(roomId: string, ws: WebSocket) {
    // Send current users in room
    const room = this.rooms.get(roomId);
    if (!room) return;

    ws.send(JSON.stringify({
      type: 'awareness-state',
      users: Array.from(room.clients).length
    }));
  }

  getRoomCount(): number {
    return this.rooms.size;
  }

  getClientCount(): number {
    let total = 0;
    this.rooms.forEach(room => {
      total += room.clients.size;
    });
    return total;
  }
}

export function setupCollaborationServer(server: Server): CollaborationServer {
  return new CollaborationServer(server);
}
