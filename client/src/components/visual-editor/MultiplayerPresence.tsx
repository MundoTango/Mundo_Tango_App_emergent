/**
 * MULTIPLAYER PRESENCE COMPONENT
 * MB.MD Track 3: Show active users and cursors
 */

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useMultiplayer } from '@/hooks/useMultiplayer';
import { Users } from 'lucide-react';

interface MultiplayerPresenceProps {
  page: string;
}

export default function MultiplayerPresence({ page }: MultiplayerPresenceProps) {
  const { remoteUsers, myColor, isConnected } = useMultiplayer({ page });

  if (!isConnected) return null;

  return (
    <div className="flex items-center gap-2">
      {/* Status indicator */}
      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <Users className="w-3 h-3" />
        <span>{remoteUsers.length + 1}</span>
      </div>

      {/* Active users */}
      <div className="flex -space-x-2">
        {/* Current user */}
        <Avatar
          className="w-7 h-7 border-2"
          style={{ borderColor: myColor }}
          data-testid="multiplayer-current-user"
        >
          <AvatarFallback
            className="text-xs text-white"
            style={{ backgroundColor: myColor }}
          >
            You
          </AvatarFallback>
        </Avatar>

        {/* Remote users */}
        {remoteUsers.map(user => (
          <Avatar
            key={user.id}
            className="w-7 h-7 border-2"
            style={{ borderColor: user.color }}
            title={user.name}
            data-testid={`multiplayer-user-${user.id}`}
          >
            <AvatarFallback
              className="text-xs text-white"
              style={{ backgroundColor: user.color }}
            >
              {user.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
    </div>
  );
}
