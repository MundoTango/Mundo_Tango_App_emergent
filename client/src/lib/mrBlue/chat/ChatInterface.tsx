import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Paperclip, Download, Share, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

/**
 * ESA Agent #74: Mr Blue Chat Interface
 * Speech bubble UI with voice/text toggle, file support, export features
 */

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  agent?: string;
  agentIcon?: string;
}

interface ChatInterfaceProps {
  onMessage: (message: string, type: 'text' | 'voice') => void;
  messages: Message[];
  isTyping?: boolean;
  typingAgent?: string;
  suggestions?: string[];
}

export function ChatInterface({ 
  onMessage, 
  messages, 
  isTyping = false,
  typingAgent,
  suggestions = []
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ========================================
  // VOICE INPUT (Web Speech API)
  // ========================================
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast({
        title: "Voice not supported",
        description: "Your browser doesn't support voice input",
        variant: "destructive",
      });
      return;
    }

    setIsListening(!isListening);
    
    if (!isListening) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US'; // TODO: Get from i18n

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        
        setInput(transcript);
        
        if (event.results[0].isFinal) {
          onMessage(transcript, 'voice');
          setInput('');
          setIsListening(false);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        toast({
          title: "Voice input failed",
          description: "Could not recognize speech",
          variant: "destructive",
        });
      };

      recognition.start();
    }
  };

  // ========================================
  // TEXT INPUT
  // ========================================
  const handleSend = () => {
    if (!input.trim()) return;
    
    onMessage(input, 'text');
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ========================================
  // FILE UPLOAD
  // ========================================
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      onMessage(`[File: ${file.name}]\n${content}`, 'text');
    };
    
    if (file.type.startsWith('image/')) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  };

  // ========================================
  // EXPORT FUNCTIONS
  // ========================================
  const exportChat = (format: 'txt' | 'json' | 'email') => {
    const chatHistory = messages.map(m => 
      `${m.role === 'assistant' ? 'Mr Blue' : 'You'} (${m.timestamp.toLocaleTimeString()}): ${m.content}`
    ).join('\n\n');

    switch (format) {
      case 'txt':
        const blob = new Blob([chatHistory], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mr-blue-chat-${Date.now()}.txt`;
        a.click();
        break;
      
      case 'json':
        const jsonBlob = new Blob([JSON.stringify(messages, null, 2)], { type: 'application/json' });
        const jsonUrl = URL.createObjectURL(jsonBlob);
        const jsonA = document.createElement('a');
        jsonA.href = jsonUrl;
        jsonA.download = `mr-blue-chat-${Date.now()}.json`;
        jsonA.click();
        break;
      
      case 'email':
        window.location.href = `mailto:?subject=Mr Blue Chat Transcript&body=${encodeURIComponent(chatHistory)}`;
        break;
    }

    toast({
      title: "Chat exported",
      description: `Conversation exported as ${format.toUpperCase()}`,
    });
  };

  return (
    <div className="flex flex-col h-full" data-testid="mr-blue-chat-interface">
      {/* ========== CHAT MESSAGES ========== */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
            data-testid={`message-${message.role}`}
          >
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-2",
                message.role === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
              )}
            >
              {message.agent && (
                <div className="text-xs opacity-70 mb-1 flex items-center gap-1">
                  {message.agentIcon && <span>{message.agentIcon}</span>}
                  {message.agent}
                </div>
              )}
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start" data-testid="typing-indicator">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2">
              {typingAgent && (
                <div className="text-xs opacity-70 mb-1">{typingAgent}</div>
              )}
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ========== SUGGESTED REPLIES ========== */}
      {suggestions.length > 0 && (
        <div className="px-4 py-2 border-t dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                onClick={() => {
                  setInput(suggestion);
                  handleSend();
                }}
                className="text-xs"
                data-testid={`suggestion-${i}`}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* ========== INPUT AREA ========== */}
      <div className="border-t dark:border-gray-700 p-4">
        {/* Export Buttons */}
        <div className="flex gap-2 mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => exportChat('txt')}
            className="text-xs"
            data-testid="button-export-txt"
          >
            <Download className="h-3 w-3 mr-1" />
            Export
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => exportChat('json')}
            className="text-xs"
            data-testid="button-export-json"
          >
            <Share className="h-3 w-3 mr-1" />
            Share
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => exportChat('email')}
            className="text-xs"
            data-testid="button-export-email"
          >
            <Mail className="h-3 w-3 mr-1" />
            Email
          </Button>
        </div>

        {/* Input Row */}
        <div className="flex items-end gap-2">
          {/* File Upload */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            accept="image/*,.txt,.pdf,.doc,.docx,.js,.ts,.tsx,.json"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            data-testid="button-attach-file"
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          {/* Voice/Text Toggle */}
          <Button
            variant={isVoiceMode ? 'default' : 'outline'}
            size="icon"
            onClick={() => {
              setIsVoiceMode(!isVoiceMode);
              if (!isVoiceMode) handleVoiceInput();
            }}
            className={isListening ? 'animate-pulse' : ''}
            data-testid="button-voice-toggle"
          >
            {isVoiceMode || isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </Button>

          {/* Text Input */}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask Mr Blue anything..."
            className="flex-1 resize-none border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
            rows={1}
            data-testid="input-chat-message"
          />

          {/* Send Button */}
          <Button
            onClick={handleSend}
            disabled={!input.trim()}
            size="icon"
            data-testid="button-send-message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
