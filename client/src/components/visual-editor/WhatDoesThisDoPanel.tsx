/**
 * "What does this element do?" Panel
 * MB.MD: AI explains selected element's purpose and functionality
 */

import { useState } from 'react';
import { ChevronDown, ChevronRight, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { apiRequest } from '@/lib/queryClient';

interface WhatDoesThisDoPanelProps {
  selectedElement: {
    tag: string;
    id?: string;
    className?: string;
    innerHTML?: string;
    xpath: string;
  } | null;
}

export function WhatDoesThisDoPanel({ selectedElement }: WhatDoesThisDoPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [explanation, setExplanation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const analyzeElement = async () => {
    if (!selectedElement) return;

    setIsLoading(true);
    setIsExpanded(true);

    try {
      const response = await apiRequest('/api/chat/projects', {
        method: 'POST',
        body: JSON.stringify({
          message: `Analyze this HTML element and explain what it does, its purpose, and how users interact with it. Be concise and practical.
          
Element: <${selectedElement.tag}>${selectedElement.id ? ` id="${selectedElement.id}"` : ''}${selectedElement.className ? ` class="${selectedElement.className}"` : ''}
Content preview: ${selectedElement.innerHTML?.substring(0, 200)}...
XPath: ${selectedElement.xpath}

Provide a 2-3 sentence explanation that a non-technical user can understand.`,
          agentId: 'visual-editor-analyzer',
          mode: 'chat'
        })
      });

      setExplanation(response.response || 'AI analysis completed. This element is part of the page structure.');
    } catch (error) {
      setExplanation('Unable to analyze element. This may be a decorative or structural component.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedElement) {
    return (
      <Card className="p-4 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <Sparkles className="h-4 w-4" />
          <p className="text-sm">Select an element to see what it does</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-purple-100/50 dark:hover:bg-purple-900/20 transition-colors"
        data-testid="button-toggle-whatdoesthisdo"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            What does this element do?
          </h3>
        </div>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 pt-0 space-y-3" data-testid="content-whatdoesthisdo">
          {!explanation && !isLoading && (
            <Button
              onClick={analyzeElement}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              data-testid="button-analyze-element"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Analyze with AI
            </Button>
          )}

          {isLoading && (
            <div className="flex items-center justify-center py-6 text-purple-600 dark:text-purple-400">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>AI analyzing element...</span>
            </div>
          )}

          {explanation && (
            <div className="space-y-3">
              <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {explanation}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                AI-powered by Multi-AI Consensus Engine
              </div>

              <Button
                onClick={analyzeElement}
                variant="outline"
                size="sm"
                className="w-full"
                data-testid="button-reanalyze"
              >
                Re-analyze
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
