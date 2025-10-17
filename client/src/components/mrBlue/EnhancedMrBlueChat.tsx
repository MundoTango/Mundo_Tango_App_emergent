/**
 * ENHANCED MR BLUE CHAT
 * Full conversation interface with platform knowledge display
 */

import { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Loader2, 
  Sparkles,
  Brain,
  Eye,
  Cpu,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/queryClient';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  contextSummary?: {
    learnings: number;
    visualChanges: number;
    componentHealth: { healthy: number; warning: number; error: number };
    agents: number;
  };
  sources?: {
    recentLearnings?: any[];
    recentVisualChanges?: any[];
    activeAgents?: any[];
  };
}

interface Props {
  onClose: () => void;
  initialContext?: {
    page?: string;
    url?: string;
    title?: string;
  };
}

export function EnhancedMrBlueChat({ onClose, initialContext }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showContext, setShowContext] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      const response = await apiRequest('/api/mrblue/enhanced-chat', {
        method: 'POST',
        body: JSON.stringify({
          message: input,
          pageContext: initialContext,
          includeHistory: true,
          timeWindow: 24
        })
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        contextSummary: response.contextSummary,
        sources: response.sources
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Mr Blue Enhanced error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I encountered an error. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div 
      className="fixed inset-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl 
                 flex flex-col border border-gray-200 dark:border-gray-700 z-50"
      data-testid="enhanced-mrblue-chat"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 
                          flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Mr Blue AI
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Universal AI Companion with Platform Knowledge
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowContext(!showContext)}
            className="text-gray-600 dark:text-gray-400"
          >
            {showContext ? 'Hide' : 'Show'} Context
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Area */}
        <div className={`flex-1 flex flex-col ${showContext ? 'border-r border-gray-200 dark:border-gray-700' : ''}`}>
          <ScrollArea className="flex-1 p-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Brain className="w-16 h-16 text-blue-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Ask me anything about the platform
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                  I have access to all component learnings, visual editor changes, 
                  agent collaborations, and system health data.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-4 ${
                        msg.role === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      
                      {msg.contextSummary && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-xs opacity-75 mb-2">Context Used:</p>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {msg.contextSummary.learnings} learnings
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {msg.contextSummary.visualChanges} changes
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {msg.contextSummary.agents} agents
                            </Badge>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about learnings, visual changes, agents..."
                disabled={isLoading}
                className="flex-1"
                data-testid="mrblue-chat-input"
              />
              <Button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                data-testid="mrblue-send-button"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Context Panel */}
        {showContext && (
          <div className="w-80 bg-gray-50 dark:bg-gray-800/50 p-6 overflow-y-auto">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Platform Knowledge
            </h3>

            {messages.length > 0 && messages[messages.length - 1].sources && (
              <div className="space-y-4">
                {messages[messages.length - 1].sources?.recentLearnings && 
                 messages[messages.length - 1].sources!.recentLearnings!.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                      <Cpu className="w-3 h-3" />
                      Recent Learnings
                    </h4>
                    <div className="space-y-2">
                      {messages[messages.length - 1].sources!.recentLearnings!.map((learning: any, i: number) => (
                        <div key={i} className="text-xs bg-white dark:bg-gray-900 rounded p-2">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {learning.componentId}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400 truncate">
                            {learning.solution.substring(0, 60)}...
                          </p>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {learning.confidence}% confidence
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {messages[messages.length - 1].sources?.recentVisualChanges && 
                 messages[messages.length - 1].sources!.recentVisualChanges!.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      Visual Changes
                    </h4>
                    <div className="space-y-2">
                      {messages[messages.length - 1].sources!.recentVisualChanges!.map((change: any, i: number) => (
                        <div key={i} className="text-xs bg-white dark:bg-gray-900 rounded p-2">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {change.componentId}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400">
                            {change.changeType}
                          </p>
                          <Badge 
                            variant={change.approved ? 'default' : 'secondary'}
                            className="mt-1 text-xs"
                          >
                            {change.approved === null ? 'PENDING' : change.approved ? 'APPROVED' : 'REJECTED'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
