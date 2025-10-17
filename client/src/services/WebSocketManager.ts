// TRACK 10: Enhanced WebSocket Manager with Auto-Reconnect
export class WebSocketManager {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(url: string) {
    this.socket = new WebSocket(url);
    
    this.socket.onopen = () => {
      console.log('🔌 WebSocket connected');
      this.reconnectAttempts = 0;
    };
    
    this.socket.onclose = () => {
      console.log('🔌 WebSocket disconnected');
      this.attemptReconnect(url);
    };
    
    this.socket.onerror = (error) => {
      console.error('🔌 WebSocket error:', error);
    };
  }

  private attemptReconnect(url: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      setTimeout(() => {
        console.log(`🔄 Reconnecting... (attempt ${this.reconnectAttempts})`);
        this.connect(url);
      }, delay);
    }
  }

  send(data: any) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    }
  }

  close() {
    this.socket?.close();
  }
}
