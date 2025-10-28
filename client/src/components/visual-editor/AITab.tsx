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
  
  // 🎯 PLANNING/BUILDING MODE: User can clarify work before execution (Oct 28, 2025)
  const [executionMode, setExecutionMode] = useState<'plan' | 'build'>('plan');

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
      // 🎯 EXECUTION MODE INTEGRATION (Oct 28, 2025)
      if (executionMode === 'plan') {
        // Plan mode: Show what will be done, ask for clarification
        toast({
          title: '📋 Planning Mode Active',
          description: 'AI will analyze your request and ask clarifying questions before generating code',
          duration: 3000,
        });
      }
      
      // 🎯 TODO: Get conversationId from Mr Blue context (using placeholder 0 for now)
      // This component needs refactoring to work with Mr Blue conversations
      const conversationId = 0; // Placeholder - AITab needs Mr Blue integration
      
      // Call vibe coding API with visual editor context AND execution mode
      const result = await executeVibeCoding(
        conversationId,
        aiPrompt,
        {
          selectedElement,
          previewPath: window.location.pathname,
          executionMode
        }
      );

      // 🎯 PLAN MODE: If AI needs clarification, show question
      if (executionMode === 'plan' && result.status === 'needs_clarification') {
        toast({
          title: '❓ Clarification Needed',
          description: result.clarificationQuestion || 'Please provide more details',
          duration: 5000,
        });
        setAiPrompt(result.clarificationQuestion || '');
        return; // Don't generate code yet
      }

      // Show generated code changes
      setCodeChanges(result.codeChanges);
      
      toast({
        title: executionMode === 'plan' ? 'Plan Complete! ✨' : 'Code Generated! ✨',
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

        {/* 🎯 PLANNING/BUILDING MODE TOGGLE (Oct 28, 2025) */}
        <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg mb-4">
          <span className="text-xs font-medium text-cyan-900">Mode:</span>
          <div className="flex gap-1 bg-white rounded-md p-0.5 shadow-sm">
            <button
              onClick={() => setExecutionMode('plan')}
              className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                executionMode === 'plan' 
                  ? 'bg-cyan-500 text-white shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              data-testid="button-ve-mode-plan"
            >
              📋 Plan
            </button>
            <button
              onClick={() => setExecutionMode('build')}
              className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                executionMode === 'build' 
                  ? 'bg-green-500 text-white shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              data-testid="button-ve-mode-build"
            >
              🚀 Build
            </button>
          </div>
          <span className="text-xs text-gray-600">
            {executionMode === 'plan' ? 'Clarify first' : 'Execute now'}
          </span>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">
            What would you like to change?
          </label>
          <Textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder={executionMode === 'plan' 
              ? "Describe your changes... (I'll ask clarifying questions first)" 
              : "e.g., Add a blue border and make the text larger"}
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
          className={`w-full mt-4 ${
            executionMode === 'plan' 
              ? 'bg-cyan-500 hover:bg-cyan-600' 
              : 'bg-green-500 hover:bg-green-600'
          }`}
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
              {executionMode === 'plan' ? 'Plan Changes' : 'Generate Code'}
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
