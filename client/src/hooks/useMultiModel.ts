/**
 * Multi-Model Chat Hook
 * Manages streaming chat with model orchestration
 * MB.MD Track 2: Multi-Model Client - Oct 21, 2025
 */

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface StreamOptions {
  projectId: number;
  message: string;
  model?: string;
  personality?: string;
}

export function useMultiModel() {
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const queryClient = useQueryClient();

  const streamMutation = useMutation({
    mutationFn: async ({ projectId, message, model, personality }: StreamOptions) => {
      setIsStreaming(true);
      setStreamingContent('');

      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ projectId, message, model, personality }),
      });

      if (!response.ok) throw new Error('Stream failed');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        const lines = text.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            if (data.chunk) {
              fullContent += data.chunk;
              setStreamingContent(fullContent);
            }
          }
        }
      }

      return fullContent;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['/api/chat/projects', variables.projectId, 'messages'],
      });
      setStreamingContent('');
      setIsStreaming(false);
    },
    onError: () => {
      setIsStreaming(false);
      setStreamingContent('');
    },
  });

  return {
    sendMessage: streamMutation.mutate,
    isStreaming,
    streamingContent,
  };
}
