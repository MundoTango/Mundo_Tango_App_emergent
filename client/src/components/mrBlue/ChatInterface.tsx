/**
 * Chat Interface with Projects, Models, Media
 * Complete Mr Blue chat experience
 * MB.MD Parallel Build Integration - Oct 21, 2025
 */

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { ProjectSelector } from './ProjectSelector';
import { ModelSelector } from './ModelSelector';
import VoiceControls from './VoiceControls';
import { MediaUploader } from './MediaUploader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  createdAt: string;
}

export function ChatInterface() {
  const [projectId, setProjectId] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState('auto');
  const [message, setMessage] = useState('');
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const { toast } = useToast();

  // Auto-select first project when projects load
  const { data: projects, refetch } = useQuery<{ id: number; name: string }[]>({
    queryKey: ['/api/chat/projects'],
  });
  
  // Guard to prevent duplicate project creation
  const [hasCreatedDefault, setHasCreatedDefault] = useState(false);

  // Auto-create default project if none exist
  useEffect(() => {
    const createDefaultProject = async () => {
      if (projects && projects.length === 0 && !hasCreatedDefault) {
        setHasCreatedDefault(true);
        try {
          const response = await fetch('/api/chat/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              name: 'My First Project',
              description: 'Default project for chatting with Mr Blue',
            }),
          });
          
          if (response.ok) {
            const newProject = await response.json();
            setProjectId(newProject.id);
            await queryClient.invalidateQueries({ queryKey: ['/api/chat/projects'] });
            await refetch();
            toast({
              title: 'Project Created',
              description: 'Created your first project!',
            });
          }
        } catch (error: unknown) {
          setHasCreatedDefault(false);
          toast({
            title: 'Project Creation Failed',
            description: error instanceof Error ? error.message : 'Unknown error',
            variant: 'destructive',
          });
        }
      } else if (projects && projects.length > 0 && !projectId) {
        setProjectId(projects[0].id);
      }
    };
    
    createDefaultProject();
  }, [projects, projectId, toast, hasCreatedDefault, refetch]);

  const { data: messages, refetch: refetchMessages } = useQuery<Message[]>({
    queryKey: ['/api/chat/projects', projectId, 'messages'],
    enabled: !!projectId,
  });

  const handleSend = async () => {
    if (!message.trim() || !projectId || isStreaming) return;

    const userMessage = message;
    setMessage('');
    setIsStreaming(true);

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          projectId,
          message: userMessage,
          model: selectedModel,
          personality: 'friendly',
        }),
      });

      if (!response.ok) throw new Error('Stream failed');

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        const lines = text.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            if (data.chunk) {
              // Streaming chunk received - UI updates handled by refetch
            }
          }
        }
      }

      refetchMessages();
    } catch (error: unknown) {
      toast({
        title: 'Send Failed',
        description: error instanceof Error ? error.message : 'Could not send message',
        variant: 'destructive',
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleMediaUpload = (result: { url: string; analysis: any }) => {
    const mediaText = `[Uploaded media: ${result.analysis.type}]\n${JSON.stringify(result.analysis, null, 2)}`;
    setMessage((prev) => prev + '\n' + mediaText);
    setShowMediaUpload(false);
    toast({
      title: 'Media Added',
      description: 'Media analysis attached to message',
    });
  };

  const lastAssistantMessage = messages?.filter(m => m.role === 'assistant').pop();

  return (
    <div className="flex flex-col h-full">
      {/* Header Controls */}
      <div className="p-4 border-b border-cyan-500/30 space-y-3">
        <ProjectSelector
          currentProjectId={projectId}
          onProjectChange={setProjectId}
        />
        
        {projectId && (
          <div className="flex items-center gap-2 flex-wrap">
            <ModelSelector value={selectedModel} onChange={setSelectedModel} />
            <VoiceControls
              onTranscript={setMessage}
              lastMessage={lastAssistantMessage?.content}
            />
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!projectId ? (
          <div className="text-center text-muted-foreground py-12">
            Select or create a project to start chatting
          </div>
        ) : messages?.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            Start a conversation with Mr Blue
          </div>
        ) : (
          messages?.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              data-testid={`message-${msg.id}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.role === 'user'
                    ? 'bg-cyan-500/20 border border-cyan-500/30'
                    : 'bg-gray-800/50 border border-gray-700'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                {msg.model && msg.role === 'assistant' && (
                  <p className="text-xs text-muted-foreground mt-1">
                    via {msg.model}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      {projectId && (
        <div className="p-4 border-t border-cyan-500/30">
          {showMediaUpload && (
            <div className="mb-3 p-3 bg-gray-800/50 rounded-lg relative">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowMediaUpload(false)}
                className="absolute top-2 right-2"
              >
                <X className="h-4 w-4" />
              </Button>
              <MediaUploader onUploadComplete={handleMediaUpload} />
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowMediaUpload(!showMediaUpload)}
              data-testid="button-toggle-media"
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Message Mr Blue..."
              className="flex-1 min-h-[60px] resize-none"
              disabled={isStreaming}
              data-testid="input-chat-message"
            />

            <Button
              onClick={handleSend}
              disabled={!message.trim() || isStreaming}
              data-testid="button-send-message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
