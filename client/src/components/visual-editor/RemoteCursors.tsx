/**
 * REMOTE CURSORS COMPONENT
 * MB.MD Track 3: Show other users' cursors
 */

import { useMultiplayer } from '@/hooks/useMultiplayer';
import { MousePointer2 } from 'lucide-react';

interface RemoteCursorsProps {
  page: string;
}

export default function RemoteCursors({ page }: RemoteCursorsProps) {
  const { remoteUsers } = useMultiplayer({ page });

  return (
    <>
      {remoteUsers
        .filter(user => user.cursorPosition)
        .map(user => (
          <div
            key={user.id}
            className="fixed pointer-events-none z-50 transition-all duration-100"
            style={{
              left: user.cursorPosition!.x,
              top: user.cursorPosition!.y,
              color: user.color
            }}
            data-testid={`remote-cursor-${user.id}`}
          >
            <MousePointer2 className="w-5 h-5" />
            <div
              className="mt-1 px-2 py-0.5 rounded text-xs text-white whitespace-nowrap"
              style={{ backgroundColor: user.color }}
            >
              {user.name}
            </div>
          </div>
        ))}
    </>
  );
}
