// ESA LIFE CEO 61×21 AGENTS FRAMEWORK  
// Layer 11: Real-time Features Agent - OnlinePresence Component
// Shows online status of users in real-time

import { useEffect, useState } from 'react';
import { useSocket } from '@/contexts/socket-context';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/theme-context';
import { Users, Circle } from 'lucide-react';

interface OnlineUser {
  userId: string;
  username: string;
  avatar?: string;
  lastSeen?: Date;
}

interface OnlinePresenceProps {
  className?: string;
  showCount?: boolean;
  showList?: boolean;
}

export default function OnlinePresence({ 
  className, 
  showCount = true, 
  showList = false 
}: OnlinePresenceProps) {
  const { socket } = useSocket();
  const { theme } = useTheme();
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

  useEffect(() => {
    if (!socket) return;

    // Request current online users
    socket.emit('users:get-online');

    // Listen for online/offline events
    const handleUserOnline = (user: OnlineUser) => {
      setOnlineUsers(prev => {
        const exists = prev.find(u => u.userId === user.userId);
        if (!exists) {
          return [...prev, user];
        }
        return prev;
      });
    };

    const handleUserOffline = (userId: string) => {
      setOnlineUsers(prev => prev.filter(u => u.userId !== userId));
    };

    const handleOnlineUsersList = (users: OnlineUser[]) => {
      setOnlineUsers(users);
    };

    socket.on('user:online', handleUserOnline);
    socket.on('user:offline', handleUserOffline);
    socket.on('users:online-list', handleOnlineUsersList);

    return () => {
      socket.off('user:online', handleUserOnline);
      socket.off('user:offline', handleUserOffline);
      socket.off('users:online-list', handleOnlineUsersList);
    };
  }, [socket]);

  if (!showCount && !showList) return null;

  return (
    <div className={cn(
      "rounded-lg p-4",
      theme === 'light'
        ? "bg-[var(--color-surface)] dark:bg-gray-900/90 border border-[var(--color-border)]"
        : "bg-slate-900/50 border border-slate-800/50",
      className
    )}>
      {showCount && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className={cn(
              "w-5 h-5",
              theme === 'light' ? "text-purple-500" : "text-cyan-400"
            )} />
            <span className={cn(
              "font-semibold",
              theme === 'light' ? "text-[var(--color-text)] dark:text-white" : "text-white"
            )}>
              Online Now
            </span>
          </div>
          <span className={cn(
            "text-2xl font-bold",
            theme === 'light' ? "text-purple-600" : "text-cyan-400"
          )}>
            {onlineUsers.length}
          </span>
        </div>
      )}

      {showList && onlineUsers.length > 0 && (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {onlineUsers.slice(0, 10).map(user => (
            <div key={user.userId} className="flex items-center gap-3">
              <div className="relative">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5EEAD4] to-[#155E75] flex items-center justify-center text-white text-xs font-bold">
                    {user.username[0].toUpperCase()}
                  </div>
                )}
                <Circle className="absolute -bottom-0.5 -right-0.5 w-3 h-3 text-emerald-500 fill-emerald-500 bg-[var(--color-surface)] dark:bg-slate-900 rounded-full" />
              </div>
              <div className="flex-1">
                <div className={cn(
                  "text-sm font-medium",
                  theme === 'light' ? "text-[var(--color-text)] dark:text-white" : "text-white"
                )}>
                  {user.username}
                </div>
              </div>
            </div>
          ))}
          {onlineUsers.length > 10 && (
            <div className={cn(
              "text-sm text-center py-2",
              theme === 'light' ? "text-gray-500 dark:text-gray-400" : "text-slate-400"
            )}>
              And {onlineUsers.length - 10} more...
            </div>
          )}
        </div>
      )}
    </div>
  );
}