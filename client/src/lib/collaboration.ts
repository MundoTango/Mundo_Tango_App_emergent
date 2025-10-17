import * as Y from 'yjs';

export class CollaborativeEditor {
  private ydoc: Y.Doc;
  private ws: WebSocket | null = null;
  private roomId: string;
  private awarenessCallbacks: Set<(states: any) => void> = new Set();

  constructor(roomId: string) {
    this.roomId = roomId;
    this.ydoc = new Y.Doc();
  }

  connect() {
    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/collaboration?room=${this.roomId}`;
    
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('🤝 Connected to collaboration server');
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };

    this.ws.onerror = (error) => {
      console.error('Collaboration error:', error);
    };

    this.ws.onclose = () => {
      console.log('👋 Disconnected from collaboration server');
      // Auto-reconnect after 3 seconds
      setTimeout(() => this.connect(), 3000);
    };

    // Listen for local updates
    this.ydoc.on('update', (update: Uint8Array) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          type: 'update',
          update: Array.from(update)
        }));
      }
    });
  }

  private handleMessage(message: any) {
    switch (message.type) {
      case 'sync-state':
        // Send our current state
        const state = Y.encodeStateAsUpdate(this.ydoc);
        this.ws?.send(JSON.stringify({
          type: 'sync-request'
        }));
        break;

      case 'sync-response':
        // Apply full state
        const fullState = Uint8Array.from(message.state);
        Y.applyUpdate(this.ydoc, fullState);
        break;

      case 'update':
        // Apply incremental update
        const update = Uint8Array.from(message.update);
        Y.applyUpdate(this.ydoc, update);
        break;

      case 'awareness':
        // Handle awareness updates (cursors, selections)
        this.awarenessCallbacks.forEach(cb => cb(message.awareness));
        break;

      case 'awareness-state':
        console.log(`👥 ${message.users} users in room`);
        break;
    }
  }

  getSharedText(key: string = 'content'): Y.Text {
    return this.ydoc.getText(key);
  }

  getSharedMap(key: string = 'data'): Y.Map<any> {
    return this.ydoc.getMap(key);
  }

  getSharedArray(key: string = 'items'): Y.Array<any> {
    return this.ydoc.getArray(key);
  }

  onAwarenessChange(callback: (states: any) => void) {
    this.awarenessCallbacks.add(callback);
    return () => this.awarenessCallbacks.delete(callback);
  }

  sendAwareness(awareness: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'awareness',
        awareness
      }));
    }
  }

  disconnect() {
    this.ws?.close();
    this.ydoc.destroy();
  }
}
