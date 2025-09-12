// LAYER 11 - Real-time Features Agent: Enhanced WebSocket with auto-reconnect
import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";

interface SocketContextType {
  socket: WebSocket | null;
  isConnected: boolean;
  sendMessage: (type: string, data: any) => void;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
}

export const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const { user } = useAuth();

  // LAYER 11: Auto-reconnect WebSocket connection
  const connectWebSocket = () => {
    if (!user) return;
    
    setConnectionStatus('connecting');
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/api/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('✅ WebSocket connected');
      setIsConnected(true);
      setConnectionStatus('connected');
      reconnectAttempts.current = 0;
      
      // LAYER 11: Send user context for real-time features
      ws.send(JSON.stringify({ 
        type: 'auth', 
        userId: user.id,
        username: user.username 
      }));
    };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('WebSocket message received:', message);
          
          // Handle different message types
          switch (message.type) {
            case 'auth_success':
              console.log('Socket authentication successful');
              break;
            case 'auth_error':
              console.error('Socket authentication failed:', message.message);
              break;
            case 'new_message':
              // Handle new chat messages
              window.dispatchEvent(new CustomEvent('newChatMessage', { detail: message.data }));
              break;
            case 'new_post':
              // Handle new posts
              window.dispatchEvent(new CustomEvent('newPost', { detail: message.data }));
              break;
            default:
              console.log('Unknown message type:', message.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('⚠️ WebSocket disconnected');
        setIsConnected(false);
        setConnectionStatus('disconnected');
        
        // LAYER 11: Auto-reconnect with exponential backoff
        if (reconnectAttempts.current < 5) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          console.log(`🔄 Reconnecting in ${delay}ms...`);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connectWebSocket();
          }, delay);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setIsConnected(false);
        setConnectionStatus('error');
      };

      setSocket(ws);

      return () => {
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        ws.close();
      };
    };
    
    return ws;
  };

  useEffect(() => {
    const ws = connectWebSocket();
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (ws) {
        ws.close();
      }
    };
  }, [user]);

  const sendMessage = (type: string, data: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type, data }));
    }
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, sendMessage, connectionStatus }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
