/**
 * TRACK 2: Agent Chat Integration
 * Real-time AI chat with context-aware agent responses
 */

import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Sparkles, Bot } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { cn } from '@/lib/utils';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { useVoiceOutput } from '@/hooks/useVoiceOutput';
import { VoiceButton } from '@/components/voice/VoiceButton';
import { VoiceVisualizer } from '@/components/voice/VoiceVisualizer';

interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  agentId?: string;
  timestamp: Date;
}

interface AgentChatPanelProps {
  featureId: number;
  pageAgent?: string;
  matchedAgents?: string[];
}

export function AgentChatPanel({ featureId, pageAgent, matchedAgents = [] }: AgentChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'agent',
      content: `Hi! I'm ${pageAgent || 'your AI assistant'}. I can help you understand this story card and provide implementation guidance. What would you like to know?`,
      agentId: pageAgent,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Voice integration
  const { isListening, transcript, toggleListening, resetTranscript } = useVoiceInput({
    onTranscript: (text) => {
      setInput(prev => prev + ' ' + text);
    }
  });

  const { speak, isSpeaking } = useVoiceOutput({
    onEnd: () => console.log('Speech ended')
  });

  // Auto-speak agent responses
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'agent' && !isSpeaking) {
      speak(lastMessage.content);
    }
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const response = await apiRequest('/api/agent-chat/message', {
        method: 'POST',
        body: JSON.stringify({
          featureId,
          message: userMessage,
          pageAgent,
          matchedAgents,
          history: messages.slice(-5) // Last 5 messages for context
        })
      });
      return response;
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'agent',
        content: data.response,
        agentId: data.agentId,
        timestamp: new Date()
      }]);
    }
  });

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    
    // Send to AI
    chatMutation.mutate(input);
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Matched Agents Header */}
      <div className="p-3 border-b bg-muted/30">
        <div className="flex items-center gap-2 text-sm">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="font-medium">Active Agents:</span>
          <div className="flex gap-1">
            {[pageAgent, ...matchedAgents].filter(Boolean).slice(0, 4).map((agent) => (
              <span key={agent} className="px-2 py-0.5 bg-primary/10 rounded text-xs">
                {agent}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-3",
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {msg.role === 'agent' && (
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarFallback className="bg-primary/10">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div
                className={cn(
                  "max-w-[80%] rounded-lg p-3",
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                {msg.agentId && msg.role === 'agent' && (
                  <div className="text-xs font-medium mb-1 opacity-70">
                    {msg.agentId}
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>

              {msg.role === 'user' && (
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Voice Visualizer */}
      {(isListening || isSpeaking) && (
        <div className="px-3 py-2 border-t bg-muted/20">
          <VoiceVisualizer isActive={isListening || isSpeaking} />
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <VoiceButton
            isListening={isListening}
            onToggle={() => {
              toggleListening();
              if (!isListening) {
                resetTranscript();
              }
            }}
            disabled={chatMutation.isPending}
          />
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isListening ? "Listening..." : "Ask the agents anything..."}
            data-testid="input-agent-chat"
            disabled={chatMutation.isPending}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || chatMutation.isPending}
            data-testid="button-send-message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
