// ESA LIFE CEO 61×21 AGENTS FRAMEWORK
// LAYER 11 - Real-time Features Agent: Socket.io implementation per ESA specifications
import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/hooks/useAuth";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  sendMessage: (type: string, data: any) => void;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
}

export const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      console.log('⏸️ Socket connection deferred - no user');
      return;
    }

    setConnectionStatus('connecting');
    
    // ESA Framework: Connect to Socket.io server
    const socketInstance = io('/', {
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000,
      timeout: 20000
    });

    socketInstance.on('connect', () => {
      console.log('✅ Socket.io connected');
      setIsConnected(true);
      setConnectionStatus('connected');
      
      // Send user authentication
      socketInstance.emit('auth', {
        userId: user.id || user.username,
        username: user.username || user.name,
        avatar: (user as any).avatar || (user as any).profilePicture
      });
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('⚠️ Socket.io disconnected:', reason);
      setIsConnected(false);
      setConnectionStatus('disconnected');
    });

    socketInstance.on('connect_error', (error) => {
      console.error('❌ Socket.io connection error:', error.message);
      setConnectionStatus('error');
    });

    // ESA Framework: Handle real-time events
    socketInstance.on('auth_success', () => {
      console.log('Socket authentication successful');
    });

    socketInstance.on('auth_error', (error) => {
      console.error('Socket authentication failed:', error);
    });

    socketInstance.on('new_message', (data) => {
      window.dispatchEvent(new CustomEvent('newChatMessage', { detail: data }));
    });

    socketInstance.on('new_post', (data) => {
      window.dispatchEvent(new CustomEvent('newPost', { detail: data }));
    });

    socketInstance.on('user:typing', (data) => {
      window.dispatchEvent(new CustomEvent('userTyping', { detail: data }));
    });

    socketInstance.on('user:stopped-typing', (data) => {
      window.dispatchEvent(new CustomEvent('userStoppedTyping', { detail: data }));
    });

    socketInstance.on('user:online', (data) => {
      window.dispatchEvent(new CustomEvent('userOnline', { detail: data }));
    });

    socketInstance.on('user:offline', (data) => {
      window.dispatchEvent(new CustomEvent('userOffline', { detail: data }));
    });

    setSocket(socketInstance);

    return () => {
      console.log('🔌 Cleaning up Socket.io connection');
      socketInstance.disconnect();
    };
  }, [user]);

  const sendMessage = (type: string, data: any) => {
    if (socket && socket.connected) {
      socket.emit(type, data);
    } else {
      console.warn('Socket not connected, message not sent:', type, data);
    }
  };

  return (
    <SocketContext.Provider value={{ 
      socket, 
      isConnected, 
      sendMessage, 
      connectionStatus 
    }}>
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