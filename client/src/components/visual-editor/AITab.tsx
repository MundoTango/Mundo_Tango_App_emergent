/**
 * AI TAB - Element Inspector & Code Generation
 * MB.MD Track 1: AI-powered visual editing
 */

import { Wand2, FileCode, Layers, Code2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import CostEstimateDisplay from './CostEstimateDisplay';

interface SelectedElement {
  tag: string;
  id?: string;
  className?: string;
  innerHTML?: string;
  xpath: string;
}

interface AITabProps {
  selectedElement: SelectedElement | null;
  onGenerateCode: (prompt: string) => Promise<void>;
}

export default function AITab({ selectedElement, onGenerateCode }: AITabProps) {
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    try {
      await onGenerateCode(aiPrompt);
      setAiPrompt('');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Element Inspector */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Selected Element</h3>
        {selectedElement ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-blue-500" />
              <code className="text-sm font-mono text-gray-700 dark:text-gray-300">
                {selectedElement.tag}
              </code>
              {selectedElement.id && (
                <Badge variant="outline" className="text-xs">
                  #{selectedElement.id}
                </Badge>
              )}
            </div>
            {selectedElement.className && (
              <div className="text-xs text-gray-600 dark:text-gray-400">
                <span className="font-medium">Classes:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {selectedElement.className.split(' ').map((cls, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      .{cls}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">XPath</p>
              <code className="text-xs font-mono text-gray-700 dark:text-gray-300 break-all">
                {selectedElement.xpath}
              </code>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Layers className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Click any element on the page to inspect it</p>
          </div>
        )}
      </div>

      {/* AI Code Generation */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">AI Code Generation</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Describe what you want to change and AI will generate the code
        </p>

        <div>
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
            What would you like to change?
          </label>
          <Textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="e.g., Add a blue border and make the text larger"
            className="min-h-[120px] resize-none"
            data-testid="textarea-ai-prompt"
          />
        </div>

        {/* Cost Estimate */}
        {selectedElement && (
          <CostEstimateDisplay 
            changeType="style" 
            filesAffected={1}
          />
        )}

        <Button
          onClick={handleGenerate}
          disabled={!aiPrompt.trim() || isGenerating || !selectedElement}
          className="w-full mt-4"
          data-testid="button-generate-code"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Generate Code
            </>
          )}
        </Button>

        <div className="mt-4">
          <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-2">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAiPrompt('Add a loading skeleton')}
              data-testid="button-quick-skeleton"
            >
              <Code2 className="w-3 h-3 mr-1" />
              Skeleton
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAiPrompt('Make it responsive on mobile')}
              data-testid="button-quick-responsive"
            >
              <Code2 className="w-3 h-3 mr-1" />
              Responsive
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
