/**
 * MR BLUE AI TAB - MB.MD Integration for Visual Editor
 * 
 * Integrates Mr Blue AI with full MB.MD methodology context
 * for collaborative AI-powered page editing
 */

import { useState, useRef, useEffect } from 'react';
import { Wand2, Send, Sparkles, BookOpen, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface SelectedElement {
  tag: string;
  id?: string;
  className?: string;
  innerHTML?: string;
  xpath: string;
  filePath?: string;
}

interface MrBlueAITabProps {
  selectedElement: SelectedElement | null;
  currentPage: string;
  onGenerateCode: (prompt: string) => Promise<void>;
}

export default function MrBlueAITab({ selectedElement, currentPage, onGenerateCode }: MrBlueAITabProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'system',
      content: `Hi! I'm Mr Blue, your MB.MD AI companion. I have full context of the MB.MD methodology and can help you edit this page collaboratively.

**What I can do:**
• Understand MB.MD parallel execution patterns
• Generate production-ready code following ESA Framework
• Suggest optimizations based on methodology history
• Collaborate with you like we're working together

Just describe what you want to change, and I'll help!`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
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
      // Build context for Mr Blue
      const context = {
        page: currentPage,
        selectedElement,
        methodology: 'MB.MD',
        framework: 'ESA Framework (125 Agents, 61 Layers)',
        capabilities: [
          'Parallel execution',
          'Track-based building',
          'Production-ready code generation',
          'ESA compliance checking'
        ]
      };

      // Call Mr Blue API with MB.MD context
      const response = await fetch('/api/mrblue/visual-editor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context,
          mode: 'visual-editor'
        })
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message
      };

      setMessages(prev => [...prev, assistantMessage]);

      // If code generation is suggested, execute it
      if (data.shouldGenerateCode && data.codePrompt) {
        await onGenerateCode(data.codePrompt);
      }

    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Let me try a different approach - describe what you'd like to change and I'll help you implement it.`
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    setInput(action);
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Mr Blue AI</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">MB.MD Collaborative Assistant</p>
          </div>
        </div>

        {selectedElement && (
          <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Selected: <code className="text-blue-600 dark:text-blue-400">&lt;{selectedElement.tag}&gt;</code>
              {selectedElement.id && <span className="ml-1">#{selectedElement.id}</span>}
            </p>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : message.role === 'system'
                  ? 'bg-purple-50 dark:bg-purple-900/20 text-gray-800 dark:text-gray-200 border border-purple-200 dark:border-purple-800'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="px-4 pb-2">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction('Using MB.MD methodology, make this responsive on mobile')}
            data-testid="quick-responsive"
          >
            <Zap className="w-3 h-3 mr-1" />
            Responsive (MB.MD)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction('Add dark mode support following Aurora Tide design system')}
            data-testid="quick-darkmode"
          >
            <Sparkles className="w-3 h-3 mr-1" />
            Dark Mode
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction('Explain the MB.MD approach for this change')}
            data-testid="quick-methodology"
          >
            <BookOpen className="w-3 h-3 mr-1" />
            MB.MD Help
          </Button>
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask Mr Blue anything... (I have full MB.MD context)"
            className="flex-1 min-h-[60px] resize-none"
            data-testid="mrblue-input"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="self-end"
            data-testid="mrblue-send"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          💡 Tip: I understand MB.MD parallel execution, ESA Framework, and can generate production-ready code
        </p>
      </div>
    </div>
  );
}
