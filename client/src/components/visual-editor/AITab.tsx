/**
 * AI TAB - Element Inspector & Code Generation
 * MB.MD Track 1: AI-powered visual editing
 */

import { Wand2, FileCode, Layers, Code2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import CostEstimateDisplay from './CostEstimateDisplay';
import { DiffPreviewCard } from './DiffPreviewCard';
import { executeVibeCoding, applyCodeChange, type CodeChange } from '@/lib/vibeApi';
import { useToast } from '@/hooks/use-toast';
import type { VisualEditorContextType } from '@/contexts/VisualEditorContext';

interface SelectedElement {
  tag: string;
  id?: string;
  className?: string;
  innerHTML?: string;
  xpath: string;
}

interface AITabProps {
  selectedElement: SelectedElement | null;
  visualEditorContext?: VisualEditorContextType;
  onGenerateCode: (prompt: string) => Promise<void>;
}

export default function AITab({ selectedElement, visualEditorContext, onGenerateCode }: AITabProps) {
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [codeChanges, setCodeChanges] = useState<CodeChange[]>([]);
  const { toast} = useToast();

  // ✅ ARCHITECT FIX v2: Watch VisualEditorContext for pending AI prompt (React pattern)
  useEffect(() => {
    if (visualEditorContext?.pendingAIPrompt) {
      console.log('🤖 [AITab] Received pending prompt from context:', visualEditorContext.pendingAIPrompt);
      setAiPrompt(visualEditorContext.pendingAIPrompt);
      
      // Clear the pending prompt after reading
      visualEditorContext.setPendingAIPrompt(null);
      
      toast({
        title: 'Element Context Loaded ✅',
        description: 'Edit the prompt below to describe your changes',
      });
    }
  }, [visualEditorContext?.pendingAIPrompt]); // Run when pending prompt changes

  const handleGenerate = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    try {
      // Call vibe coding API with visual editor context
      const result = await executeVibeCoding(aiPrompt, {
        selectedElement,
        previewPath: window.location.pathname
      });

      // Show generated code changes
      setCodeChanges(result.codeChanges);
      
      toast({
        title: 'Code Generated! ✨',
        description: `${result.codeChanges.length} file(s) will be modified`,
      });
      
      setAiPrompt('');
    } catch (error) {
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyChange = async (change: CodeChange) => {
    try {
      // Convert type - only unified_diff and search_replace are supported by applyCodeChange
      const editType = change.type === 'new_file' ? 'unified_diff' : change.type;
      await applyCodeChange(change.filePath, change.diff, editType);
      
      toast({
        title: 'Changes Applied! ✅',
        description: `Updated ${change.filePath}`,
      });

      // Remove from list
      setCodeChanges(prev => prev.filter(c => c !== change));
    } catch (error) {
      toast({
        title: 'Apply Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleRejectChange = (change: CodeChange) => {
    setCodeChanges(prev => prev.filter(c => c !== change));
    toast({
      title: 'Change Rejected',
      description: 'Discarded proposed changes',
    });
  };

  return (
    <div className="p-4 space-y-4">
      {/* Element Inspector */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Selected Element</h3>
        {selectedElement ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-blue-500" />
              <code className="text-sm font-mono text-gray-700">
                {selectedElement.tag}
              </code>
              {selectedElement.id && (
                <Badge variant="outline" className="text-xs">
                  #{selectedElement.id}
                </Badge>
              )}
            </div>
            {selectedElement.className && (
              <div className="text-xs text-gray-600">
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
            <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
              <p className="text-xs font-medium text-gray-500 mb-1">XPath</p>
              <code className="text-xs font-mono text-gray-700 break-all">
                {selectedElement.xpath}
              </code>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Layers className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Click any element on the page to inspect it</p>
          </div>
        )}
      </div>

      {/* AI Code Generation */}
      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">AI Code Generation</h3>
        <p className="text-xs text-gray-500 mb-4">
          Describe what you want to change and AI will generate the code
        </p>

        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">
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

        {/* Generated Code Changes */}
        {codeChanges.length > 0 && (
          <div className="mt-6 space-y-4">
            <h4 className="text-sm font-semibold text-gray-900">Generated Changes</h4>
            {codeChanges.map((change, index) => (
              <DiffPreviewCard
                key={index}
                filePath={change.filePath}
                beforeCode="// Loading..."
                afterCode={change.diff}
                onApply={() => handleApplyChange(change)}
                onReject={() => handleRejectChange(change)}
              />
            ))}
          </div>
        )}

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
