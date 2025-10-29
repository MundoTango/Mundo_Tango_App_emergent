/**
 * MR BLUE VISUAL CHAT
 * Integrated chat for Visual Editor with context awareness
 * Knows about current page, selected component, and recent edits
 * Part of Phase 12 Autonomous Learning System
 */

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import type { SelectedComponent } from './ComponentSelector';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface MrBlueVisualChatProps {
  currentPage: string;
  selectedComponent: SelectedComponent | null;
  recentEdits: Array<{
    type: string;
    component: string;
    description: string;
  }>;
}

export function MrBlueVisualChat({
  currentPage,
  selectedComponent,
  recentEdits,
}: MrBlueVisualChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `👋 Hi! I'm Mr Blue, your Visual Editor AI assistant. I can see you're editing **${currentPage}**. How can I help you today?`,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  // Notify about component selection
  useEffect(() => {
    if (selectedComponent) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `I see you selected **${selectedComponent.testId}**. What would you like to do with it?`,
        timestamp: new Date(),
      }]);
    }
  }, [selectedComponent]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/visual-editor/simple-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message: inputValue,
          context: {
            page: currentPage,
            url: window.location.href,
            selectedComponent: selectedComponent ? {
              id: selectedComponent.testId,
              name: selectedComponent.testId,
              type: selectedComponent.type,
            } : undefined,
            recentEdits,
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col" data-testid="mr-blue-visual-chat">
      {/* Chat header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold">Mr Blue</h3>
            <p className="text-xs text-gray-500">Visual Editor AI</p>
          </div>
        </div>

        {/* Context badges */}
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="secondary" className="text-xs">
            {currentPage}
          </Badge>
          {selectedComponent && (
            <Badge variant="default" className="text-xs bg-purple-600">
              {selectedComponent.testId}
            </Badge>
          )}
          {recentEdits.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {recentEdits.length} edits
            </Badge>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user'
                  ? 'bg-gray-200 dark:bg-gray-700'
                  : 'bg-gradient-to-br from-blue-500 to-purple-600'
              }`}>
                {msg.role === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>

              <div className={`flex-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block px-4 py-2 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {msg.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              </div>
              <div className="flex-1">
                <div className="inline-block px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <p className="text-sm text-gray-500">Thinking...</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about editing this page..."
            disabled={isLoading}
            data-testid="input-chat-message"
          />
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            data-testid="button-send-message"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Quick actions */}
        <div className="flex gap-2 mt-2">
          <Button
            size="sm"
            variant="ghost"
            className="text-xs"
            onClick={() => setInputValue("What can I edit on this page?")}
            data-testid="button-quick-what-edit"
          >
            <Sparkles className="w-3 h-3 mr-1" />
            What can I edit?
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-xs"
            onClick={() => setInputValue("Suggest improvements")}
            data-testid="button-quick-suggest"
          >
            <Sparkles className="w-3 h-3 mr-1" />
            Suggest improvements
          </Button>
        </div>
      </div>
    </div>
  );
}
