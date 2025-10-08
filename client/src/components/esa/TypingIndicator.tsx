// ESA LIFE CEO 61×21 AGENTS FRAMEWORK
// Layer 11: Real-time Features Agent - TypingIndicator Component
// Shows when users are typing in real-time

import { useEffect, useState } from 'react';
import { useSocket } from '@/contexts/socket-context';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/theme-context';

interface TypingUser {
  userId: string;
  username: string;
  avatar?: string;
}

interface TypingIndicatorProps {
  postId?: string;
  className?: string;
}

export default function TypingIndicator({ postId, className }: TypingIndicatorProps) {
  const { socket } = useSocket();
  const { theme } = useTheme();
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

  useEffect(() => {
    if (!socket) return;

    // Listen for typing events
    const handleUserTyping = (data: { userId: string; username: string; avatar?: string; postId?: string }) => {
      // If postId is specified, only show typing for that post
      if (postId && data.postId !== postId) return;

      setTypingUsers(prev => {
        const exists = prev.find(u => u.userId === data.userId);
        if (!exists) {
          return [...prev, { userId: data.userId, username: data.username, avatar: data.avatar }];
        }
        return prev;
      });

      // Remove after 3 seconds
      setTimeout(() => {
        setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
      }, 3000);
    };

    const handleUserStoppedTyping = (data: { userId: string; postId?: string }) => {
      if (postId && data.postId !== postId) return;
      setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
    };

    socket.on('user:typing', handleUserTyping);
    socket.on('user:stopped-typing', handleUserStoppedTyping);

    return () => {
      socket.off('user:typing', handleUserTyping);
      socket.off('user:stopped-typing', handleUserStoppedTyping);
    };
  }, [socket, postId]);

  if (typingUsers.length === 0) return null;

  const displayText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].username} is typing...`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].username} and ${typingUsers[1].username} are typing...`;
    } else {
      return `${typingUsers[0].username} and ${typingUsers.length - 1} others are typing...`;
    }
  };

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-2 rounded-lg animate-pulse",
      theme === 'light' 
        ? "bg-[var(--color-neutral-100)] text-gray-600 dark:text-gray-300"
        : "bg-slate-800/50 text-slate-400",
      className
    )}>
      <div className="flex -space-x-2">
        {typingUsers.slice(0, 3).map(user => (
          <div
            key={user.userId}
            className="w-6 h-6 rounded-full bg-gradient-to-br from-[#5EEAD4] to-[#155E75] flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-slate-900"
          >
            {user.username[0].toUpperCase()}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1">
        <span className="text-sm">{displayText()}</span>
        <div className="flex gap-1">
          <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}