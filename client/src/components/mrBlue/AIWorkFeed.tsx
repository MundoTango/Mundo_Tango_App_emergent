/**
 * AI WORK FEED - Real-Time Activity Stream (like Replit Agent)
 * ✅ FIX #3 (Oct 27, FINAL): Show live AI actions during vibe coding
 * 
 * Features:
 * - Server-Sent Events (SSE) streaming
 * - File edit notifications
 * - Test execution updates
 * - Error reporting
 */

import { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileCode, Terminal, CheckCircle, XCircle, Loader2, Sparkles } from 'lucide-react';

interface WorkEvent {
  id: string;
  type: 'file_edit' | 'command' | 'test' | 'plan' | 'error' | 'success';
  title: string;
  timestamp: number;
  file?: string;
  status?: 'running' | 'success' | 'error';
  details?: string;
}

interface AIWorkFeedProps {
  sessionId?: string;
  className?: string;
}

export function AIWorkFeed({ sessionId, className = '' }: AIWorkFeedProps) {
  const [events, setEvents] = useState<WorkEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    console.log(`[AIWorkFeed] Connecting to SSE stream for session ${sessionId}`);
    const eventSource = new EventSource(`/api/ai/stream/${sessionId}`);

    eventSource.onopen = () => {
      console.log('[AIWorkFeed] ✅ SSE connection established');
      setIsConnected(true);
    };

    eventSource.addEventListener('agent-action', (e) => {
      try {
        const event = JSON.parse(e.data) as WorkEvent;
        console.log('[AIWorkFeed] 📥 Received event:', event);
        setEvents(prev => [...prev, event]);
      } catch (error) {
        console.error('[AIWorkFeed] Failed to parse event:', error);
      }
    });

    eventSource.onerror = (error) => {
      console.error('[AIWorkFeed] ❌ SSE error:', error);
      setIsConnected(false);
      eventSource.close();
    };

    return () => {
      console.log('[AIWorkFeed] Closing SSE connection');
      eventSource.close();
    };
  }, [sessionId]);

  const getEventIcon = (type: WorkEvent['type'], status?: string) => {
    if (status === 'running') return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
    
    switch (type) {
      case 'file_edit':
        return <FileCode className="w-4 h-4 text-purple-500" />;
      case 'command':
        return <Terminal className="w-4 h-4 text-cyan-500" />;
      case 'test':
        return status === 'error' ? 
          <XCircle className="w-4 h-4 text-red-500" /> : 
          <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'plan':
        return <Sparkles className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <FileCode className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  if (!sessionId) {
    return (
      <div className={`p-4 text-sm text-muted-foreground text-center ${className}`}>
        No active AI session
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <h3 className="text-sm font-semibold">AI Work Feed</h3>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className="text-xs text-muted-foreground">
            {isConnected ? 'Live' : 'Disconnected'}
          </span>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {events.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-8">
            Waiting for AI activity...
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div 
                key={event.id} 
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                data-testid={`work-event-${event.type}`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getEventIcon(event.type, event.status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium truncate">{event.title}</p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatTime(event.timestamp)}
                    </span>
                  </div>
                  
                  {event.file && (
                    <p className="text-xs text-muted-foreground mt-1 font-mono truncate">
                      {event.file}
                    </p>
                  )}
                  
                  {event.details && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {event.details}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="px-4 py-2 border-t text-xs text-muted-foreground">
        {events.length} action{events.length !== 1 ? 's' : ''} completed
      </div>
    </div>
  );
}
