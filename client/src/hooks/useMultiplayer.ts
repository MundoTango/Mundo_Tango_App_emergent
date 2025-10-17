/**
 * MULTIPLAYER HOOK
 * MB.MD Track 3: Real-time collaboration
 */

import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/hooks/useAuth';

interface RemoteUser {
  id: string;
  name: string;
  color: string;
  cursorPosition?: { x: number; y: number };
  selection?: { elementId: string; xpath: string };
  currentPage?: string;
}

interface UseMultiplayerOptions {
  page: string;
  enabled?: boolean;
}

export function useMultiplayer({ page, enabled = true }: UseMultiplayerOptions) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<RemoteUser[]>([]);
  const [myColor, setMyColor] = useState<string>('');

  useEffect(() => {
    if (!enabled || !user) return;

    const newSocket = io({
      path: '/multiplayer-socket'
    });

    setSocket(newSocket);

    // Join editor
    newSocket.emit('join-editor', {
      userId: user.id.toString(),
      userName: user.name || 'Anonymous',
      page
    });

    // Handle user joined
    newSocket.on('user-joined', ({ user: newUser }: { user: RemoteUser }) => {
      if (newUser.id === user.id.toString()) {
        // This is us
        setMyColor(newUser.color);
      } else {
        // Another user joined
        setRemoteUsers(prev => [...prev, newUser]);
      }
    });

    // Handle active users list
    newSocket.on('active-users', ({ users }: { users: RemoteUser[] }) => {
      setRemoteUsers(users);
    });

    // Handle cursor updates
    newSocket.on('cursor-update', ({ userId, userName, color, x, y, page: userPage }: any) => {
      if (userPage === page) {
        setRemoteUsers(prev =>
          prev.map(u =>
            u.id === userId
              ? { ...u, cursorPosition: { x, y } }
              : u
          )
        );
      }
    });

    // Handle element selection
    newSocket.on('element-selected', ({ userId, elementId, xpath, page: userPage }: any) => {
      if (userPage === page) {
        setRemoteUsers(prev =>
          prev.map(u =>
            u.id === userId
              ? { ...u, selection: { elementId, xpath } }
              : u
          )
        );
      }
    });

    // Handle page changes
    newSocket.on('user-page-changed', ({ userId, page: newPage }: any) => {
      setRemoteUsers(prev =>
        prev.map(u =>
          u.id === userId
            ? { ...u, currentPage: newPage }
            : u
        )
      );
    });

    // Handle user left
    newSocket.on('user-left', ({ userId }: { userId: string }) => {
      setRemoteUsers(prev => prev.filter(u => u.id !== userId));
    });

    // Cleanup
    return () => {
      newSocket.disconnect();
    };
  }, [enabled, user, page]);

  // Broadcast cursor movement
  const broadcastCursor = useCallback((x: number, y: number) => {
    socket?.emit('cursor-move', { x, y, page });
  }, [socket, page]);

  // Broadcast element selection
  const broadcastSelection = useCallback((elementId: string, xpath: string) => {
    socket?.emit('element-select', { elementId, xpath, page });
  }, [socket, page]);

  // Broadcast page change
  const broadcastPageChange = useCallback((newPage: string) => {
    socket?.emit('page-change', { page: newPage });
  }, [socket]);

  // Broadcast code change
  const broadcastCodeChange = useCallback((filePath: string, content: string) => {
    socket?.emit('code-change', { filePath, content, page });
  }, [socket, page]);

  return {
    remoteUsers: remoteUsers.filter(u => u.currentPage === page),
    myColor,
    broadcastCursor,
    broadcastSelection,
    broadcastPageChange,
    broadcastCodeChange,
    isConnected: socket?.connected || false
  };
}
