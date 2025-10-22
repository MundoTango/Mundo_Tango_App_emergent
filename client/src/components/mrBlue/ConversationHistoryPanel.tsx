/**
 * STREAM 2: Conversation History Panel
 * Displays past voice conversation turns with replay capability
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Clock, Volume2, Wrench } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ConversationTurn {
  id: number;
  role: 'user' | 'assistant';
  transcript: string;
  audioUrl?: string;
  audioDuration?: number;
  language: string;
  toolsUsed: string[];
  createdAt: string;
}

interface ConversationHistoryPanelProps {
  projectId: number;
}

export function ConversationHistoryPanel({ projectId }: ConversationHistoryPanelProps) {
  const [playingAudio, setPlayingAudio] = useState<number | null>(null);

  // Fetch conversation history
  const { data: turns, isLoading } = useQuery<ConversationTurn[]>({
    queryKey: ['/api/voice/conversations', projectId],
    enabled: !!projectId,
  });

  const playAudio = (turnId: number, audioUrl: string) => {
    if (playingAudio === turnId) {
      setPlayingAudio(null);
      return;
    }

    const audio = new Audio(audioUrl);
    audio.play();
    setPlayingAudio(turnId);
    
    audio.onended = () => setPlayingAudio(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-sm text-gray-500">Loading conversation history...</p>
      </div>
    );
  }

  if (!turns || turns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center p-4">
        <Volume2 className="w-12 h-12 text-gray-300 mb-3" />
        <p className="text-sm text-gray-500">No voice conversations yet</p>
        <p className="text-xs text-gray-400 mt-1">Start a voice call to see history here</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[500px] pr-4">
      <div className="space-y-3">
        {turns.map((turn) => (
          <div
            key={turn.id}
            className={`p-3 rounded-lg border ${
              turn.role === 'user'
                ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
                : 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800'
            }`}
            data-testid={`conversation-turn-${turn.id}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold ${
                  turn.role === 'user' ? 'text-blue-700 dark:text-blue-400' : 'text-purple-700 dark:text-purple-400'
                }`}>
                  {turn.role === 'user' ? '👤 You' : '🤖 Mr Blue'}
                </span>
                <span className="text-xs text-gray-500 uppercase">{turn.language}</span>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(turn.createdAt), { addSuffix: true })}
              </div>
            </div>

            {/* Transcript */}
            <p className="text-sm text-gray-900 dark:text-gray-100 mb-2">
              {turn.transcript}
            </p>

            {/* Tools Used */}
            {turn.toolsUsed.length > 0 && (
              <div className="flex items-center gap-1 mb-2 flex-wrap">
                <Wrench className="w-3 h-3 text-gray-500" />
                {turn.toolsUsed.map((tool, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            )}

            {/* Audio Playback */}
            {turn.audioUrl && (
              <div className="flex items-center gap-2 mt-2">
                <Button
                  onClick={() => playAudio(turn.id, turn.audioUrl!)}
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  data-testid={`button-play-audio-${turn.id}`}
                >
                  <Play className={`w-3 h-3 mr-1 ${playingAudio === turn.id ? 'animate-pulse' : ''}`} />
                  {playingAudio === turn.id ? 'Playing...' : 'Play Audio'}
                </Button>
                {turn.audioDuration && (
                  <span className="text-xs text-gray-500">
                    {Math.round(turn.audioDuration / 1000)}s
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
