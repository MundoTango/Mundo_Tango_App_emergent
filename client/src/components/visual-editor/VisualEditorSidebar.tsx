/**
 * VISUAL EDITOR SIDEBAR - Replit-Style Interface
 * 
 * MB.MD Architecture:
 * - Element Inspector (click-to-select)
 * - AI Code Generation Panel
 * - Live Preview + Staging Deploy
 * - Git Branch Management
 * 
 * UX: Inspired by Replit's clean sidebar design
 */

import { useState } from 'react';
import { 
  Code2, 
  Wand2, 
  Eye, 
  GitBranch, 
  Save,
  X,
  ChevronRight,
  Sparkles,
  FileCode,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import CostEstimateDisplay from './CostEstimateDisplay';

interface SelectedElement {
  tag: string;
  id?: string;
  className?: string;
  innerHTML?: string;
  xpath: string;
}

interface VisualEditorSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedElement: SelectedElement | null;
  onGenerateCode: (prompt: string) => Promise<void>;
  onPreview: () => void;
  onDeploy: () => void;
}

export default function VisualEditorSidebar({
  isOpen,
  onClose,
  selectedElement,
  onGenerateCode,
  onPreview,
  onDeploy
}: VisualEditorSidebarProps) {
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [branchName, setBranchName] = useState('');
  const [activeTab, setActiveTab] = useState<'inspect' | 'generate' | 'preview'>('inspect');

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

  if (!isOpen) return null;

  return (
    <div 
      className="fixed right-0 top-0 h-screen w-96 bg-white border-l border-cyan-200 shadow-2xl z-50 flex flex-col"
      data-testid="visual-editor-sidebar"
    >
      {/* Header - MT Ocean Theme */}
      <div className="p-4 border-b border-cyan-200 bg-gradient-to-r from-cyan-50 to-blue-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Visual Editor</h2>
              <p className="text-xs text-cyan-600">AI-Powered Page Editor</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            data-testid="button-close-editor"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Tabs - MT Ocean Theme */}
        <div className="flex gap-1 mt-4 bg-cyan-50 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('inspect')}
            className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'inspect'
                ? 'bg-white text-cyan-600 shadow-sm'
                : 'text-gray-600 hover:text-cyan-600'
            }`}
            data-testid="tab-inspect"
          >
            <Layers className="w-4 h-4 inline mr-1" />
            Inspect
          </button>
          <button
            onClick={() => setActiveTab('generate')}
            className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'generate'
                ? 'bg-white text-cyan-600 shadow-sm'
                : 'text-gray-600 hover:text-cyan-600'
            }`}
            data-testid="tab-generate"
          >
            <Wand2 className="w-4 h-4 inline mr-1" />
            AI
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'preview'
                ? 'bg-white text-cyan-600 shadow-sm'
                : 'text-gray-600 hover:text-cyan-600'
            }`}
            data-testid="tab-preview"
          >
            <Eye className="w-4 h-4 inline mr-1" />
            Preview
          </button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {/* Inspect Tab */}
          {activeTab === 'inspect' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Selected Element</h3>
                {selectedElement ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-cyan-500" />
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
                            <Badge key={i} variant="secondary" className="text-xs bg-cyan-50 text-cyan-700">
                              .{cls}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="mt-2 p-2 bg-cyan-50 rounded border border-cyan-200">
                      <p className="text-xs font-medium text-cyan-600 mb-1">XPath</p>
                      <code className="text-xs font-mono text-gray-700 break-all">
                        {selectedElement.xpath}
                      </code>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Layers className="w-12 h-12 mx-auto mb-2 opacity-50 text-cyan-300" />
                    <p className="text-sm">Click any element on the page to inspect it</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Generate Tab */}
          {activeTab === 'generate' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">AI Code Generation</h3>
                <p className="text-xs text-gray-600 mb-4">
                  Describe what you want to change and AI will generate the code
                </p>
              </div>

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
                disabled={!aiPrompt.trim() || isGenerating}
                className="w-full"
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

              <Separator />

              <div>
                <h4 className="text-xs font-semibold text-gray-900 mb-2">Quick Actions</h4>
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
          )}

          {/* Preview Tab */}
          {activeTab === 'preview' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Deploy Changes</h3>
                <p className="text-xs text-gray-600 mb-4">
                  Preview your changes on a staging URL before deploying to production
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">
                  Branch Name (optional)
                </label>
                <Input
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  placeholder="feature/visual-edit"
                  data-testid="input-branch-name"
                />
              </div>

              <Button
                onClick={onPreview}
                variant="outline"
                className="w-full"
                data-testid="button-preview"
              >
                <Eye className="w-4 h-4 mr-2" />
                Open Staging Preview
              </Button>

              <Button
                onClick={onDeploy}
                className="w-full bg-green-600 hover:bg-green-700"
                data-testid="button-deploy"
              >
                <GitBranch className="w-4 h-4 mr-2" />
                Deploy to Production
              </Button>

              <Separator />

              <div className="text-xs text-gray-600">
                <p className="font-medium mb-1">Git Workflow:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Creates new branch</li>
                  <li>Commits changes</li>
                  <li>Pushes to remote</li>
                  <li>Opens staging URL</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer - MT Ocean Theme */}
      <div className="p-4 border-t border-cyan-200 bg-gradient-to-r from-cyan-50 to-blue-50">
        <div className="flex items-center gap-2 text-xs text-cyan-600">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          AI-powered by OpenAI GPT-4o
        </div>
      </div>
    </div>
  );
}
