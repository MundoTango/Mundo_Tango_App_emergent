import { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Code, 
  Eye, 
  Send,
  StopCircle,
  Check,
  X,
  Loader2,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: {
    codeGenerated?: string;
    filesModified?: string[];
    approval?: 'pending' | 'approved' | 'rejected';
  };
}

export function MrBlueChat() {
  const [mode, setMode] = useState<'chat' | 'code' | 'visual'>('chat');
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/mrblue/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          pageContext: { url: window.location.pathname },
          userRole: user?.role,
          mode
        })
      });

      if (!response.ok) throw new Error('Failed to get response');
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim());
          
          for (const line of lines) {
            if (line.startsWith('0:')) {
              const text = JSON.parse(line.slice(2));
              assistantContent += text;
            }
          }
        }
      }

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: assistantContent
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Mr Blue error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isSuperAdmin) {
    return null; // Only show to super admins for now
  }

  return (
    <div 
      className={`fixed ${isExpanded ? 'inset-4' : 'bottom-6 right-6 w-[500px] h-[600px]'} 
                  bg-white dark:bg-gray-900 rounded-xl shadow-2xl 
                  flex flex-col border border-gray-200 dark:border-gray-700
                  transition-all duration-300 z-50`}
      data-testid="mrblue-chat-container"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Mr Blue</h3>
            <p className="text-xs text-gray-500">AI Assistant • Super Admin</p>
          </div>
        </div>
        
        {/* Mode Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <Button
              size="sm"
              variant={mode === 'chat' ? 'default' : 'ghost'}
              onClick={() => setMode('chat')}
              className="h-8"
              data-testid="button-mode-chat"
            >
              <Sparkles className="w-4 h-4 mr-1" />
              Chat
            </Button>
            <Button
              size="sm"
              variant={mode === 'code' ? 'default' : 'ghost'}
              onClick={() => setMode('code')}
              className="h-8"
              data-testid="button-mode-code"
            >
              <Code className="w-4 h-4 mr-1" />
              Code
            </Button>
            <Button
              size="sm"
              variant={mode === 'visual' ? 'default' : 'ghost'}
              onClick={() => setMode('visual')}
              className="h-8"
              data-testid="button-mode-visual"
            >
              <Eye className="w-4 h-4 mr-1" />
              Visual
            </Button>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            data-testid="button-toggle-expand"
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <Sparkles className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Ask Mr Blue anything!</p>
            <p className="text-sm text-gray-400 mt-2">
              Code intelligence, visual editing, and more...
            </p>
          </div>
        )}

        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Mr Blue is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === 'chat' ? "Ask Mr Blue anything..." :
              mode === 'code' ? "Describe the code you need..." :
              "Describe your visual design..."
            }
            className="flex-1"
            disabled={isLoading}
            data-testid="input-mrblue-message"
          />
          
          {isLoading ? (
            <Button type="button" onClick={() => setIsLoading(false)} variant="destructive" data-testid="button-stop">
              <StopCircle className="w-4 h-4" />
            </Button>
          ) : (
            <Button type="submit" data-testid="button-send">
              <Send className="w-4 h-4" />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] rounded-lg p-3 ${
        isUser 
          ? 'bg-blue-500 text-white' 
          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
      }`}>
        <div className="text-sm whitespace-pre-wrap">
          {message.content}
        </div>

        {message.metadata?.codeGenerated && (
          <div className="mt-3 p-3 bg-black rounded-lg">
            <pre className="text-sm text-green-400 overflow-x-auto">
              <code>{message.metadata.codeGenerated}</code>
            </pre>
          </div>
        )}

        {message.metadata?.filesModified && message.metadata.filesModified.length > 0 && (
          <div className="mt-2 text-xs opacity-75">
            Modified: {message.metadata.filesModified.join(', ')}
          </div>
        )}
      </div>
    </div>
  );
}
