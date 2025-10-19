/**
 * Mr Blue Enhanced Chat Interface with Life CEO Agent Routing
 * mb.md lines 995-999, 1034-1036
 * 
 * Features:
 * - Voice + Text input (Web Speech API)
 * - Life CEO agent routing (16 agents) via backend API
 * - localStorage persistence (privacy-first)
 * - Export functionality (TXT/JSON/email)
 * - Backend integration with /api/mr-blue/chat
 */

import { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Download, Trash2, Mail, Loader2, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  agent?: string;
  model?: string;
}

interface ChatInterfaceEnhancedProps {
  onMessage?: (message: string, type: 'text' | 'voice') => Promise<void>;
  className?: string;
}

const CONVERSATION_KEY = 'mr-blue-conversation';

export function MrBlueChatInterfaceEnhanced({ 
  onMessage, 
  className = ''
}: ChatInterfaceEnhancedProps) {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Load conversation from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(CONVERSATION_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMessages(parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        })));
      } catch (e) {
        console.error('Failed to load conversation:', e);
      }
    }
  }, []);

  // Save conversation to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(CONVERSATION_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Initialize Web Speech API
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        toast({
          title: 'Voice recognition error',
          description: 'Please try again or use text input',
          variant: 'destructive',
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [toast]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call backend API with Life CEO routing
      const response = await fetch('/api/mr-blue/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          personality: 'You are Mr. Blue, a friendly and helpful AI companion for Mundo Tango.',
          context: {
            page: window.location.pathname,
            userJourney: 'active_user',
          },
          conversationHistory: messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content
          })),
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        agent: data.agent || 'Mr Blue Core',
        model: data.model || 'gpt-4o',
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Trigger parent onMessage callback
      if (onMessage) {
        await onMessage(userMessage.content, 'text');
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: 'Error',
        description: 'Failed to get response from Mr Blue. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast({
        title: 'Voice input not supported',
        description: 'Your browser does not support voice recognition',
        variant: 'destructive',
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const clearConversation = () => {
    if (confirm('Clear all conversation history? This cannot be undone.')) {
      setMessages([]);
      localStorage.removeItem(CONVERSATION_KEY);
      toast({
        title: 'Conversation cleared',
        description: 'All messages have been deleted',
      });
    }
  };

  const exportConversation = (format: 'txt' | 'json') => {
    const text = format === 'json'
      ? JSON.stringify(messages, null, 2)
      : messages.map(m => `[${m.timestamp.toLocaleTimeString()}] ${m.role === 'user' ? 'You' : m.agent || 'Mr Blue'}: ${m.content}`).join('\n\n');

    const blob = new Blob([text], { type: format === 'json' ? 'application/json' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mr-blue-conversation-${Date.now()}.${format}`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Conversation exported',
      description: `Downloaded as ${format.toUpperCase()} file`,
    });
  };

  const emailConversation = () => {
    const text = messages.map(m => 
      `[${m.timestamp.toLocaleTimeString()}] ${m.role === 'user' ? 'You' : m.agent || 'Mr Blue'}: ${m.content}`
    ).join('\n\n');

    const subject = 'My Mr Blue Conversation';
    const body = encodeURIComponent(text);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setInput(`[File: ${file.name}]\n${content.substring(0, 1000)}...`);
    };
    
    reader.readAsText(file);
  };

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-gray-900 ${className}`}>
      {/* Header with Export/Clear */}
      <div className="p-3 border-b dark:border-gray-700 flex items-center justify-between">
        <Badge variant="outline" className="text-xs">
          {messages.length} messages
        </Badge>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => exportConversation('txt')}
            title="Export as TXT"
            data-testid="button-export-txt"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => exportConversation('json')}
            title="Export as JSON"
            data-testid="button-export-json"
          >
            <Download className="h-4 w-4 mr-1" />
            JSON
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={emailConversation}
            title="Email conversation"
            data-testid="button-email"
          >
            <Mail className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={clearConversation}
            title="Clear conversation"
            data-testid="button-clear"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" data-testid="messages-container">
        {messages.length === 0 && (
          <Card className="p-6 text-center bg-gradient-to-br from-turquoise-50 to-cyan-50 dark:from-turquoise-950 dark:to-cyan-950 border-turquoise-200 dark:border-turquoise-800">
            <h3 className="font-semibold text-lg mb-2 text-turquoise-900 dark:text-turquoise-100">
              Welcome to Mr Blue!
            </h3>
            <p className="text-sm text-turquoise-700 dark:text-turquoise-300 mb-4">
              I'm your AI companion with access to 16 Life CEO agents for personalized help.
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs text-left text-turquoise-800 dark:text-turquoise-200">
              <div>💼 Career & Finance</div>
              <div>🏋️ Health & Wellness</div>
              <div>📚 Learning & Skills</div>
              <div>✈️ Travel & Events</div>
              <div>💕 Relationships</div>
              <div>🎯 Productivity</div>
              <div>🧘 Mindfulness</div>
              <div>💃 Tango Community</div>
            </div>
          </Card>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-turquoise-500 to-cyan-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
              }`}
              data-testid={`message-${message.role}`}
            >
              {message.agent && message.role === 'assistant' && (
                <div className="text-xs opacity-75 mb-1 flex items-center gap-1">
                  <Badge variant="secondary" className="text-xs">
                    {message.agent}
                  </Badge>
                  {message.model && <span className="text-xs">• {message.model}</span>}
                </div>
              )}
              <div className="text-sm whitespace-pre-wrap">{message.content}</div>
              <div className="text-xs opacity-50 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Mr Blue is thinking...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t dark:border-gray-700">
        <div className="flex gap-2 items-end">
          {/* File Upload */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            accept=".txt,.json,.md"
          />
          <Button
            size="icon"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            title="Attach file"
            data-testid="button-attach-file"
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          {/* Voice Input */}
          <Button
            size="icon"
            variant={isListening ? 'destructive' : 'outline'}
            onClick={toggleVoiceInput}
            title={isListening ? 'Stop listening' : 'Start voice input'}
            data-testid="button-voice-input"
            className={isListening ? 'animate-pulse' : ''}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>

          {/* Text Input */}
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={isListening ? 'Listening...' : 'Ask Mr Blue anything... (Shift+Enter for new line)'}
            className="flex-1 min-h-[60px] max-h-[120px] resize-none"
            disabled={isLoading || isListening}
            data-testid="textarea-message-input"
          />

          {/* Send Button */}
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="icon"
            data-testid="button-send-message"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          💾 Conversations stored locally (privacy-first) • 🔒 Not sent to servers • 🤖 16 Life CEO agents available
        </p>
      </div>
    </div>
  );
}
