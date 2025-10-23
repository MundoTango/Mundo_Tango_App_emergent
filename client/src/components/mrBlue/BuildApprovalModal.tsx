/**
 * Build Approval Modal - Shows pending AI build intents
 * User can review and approve/reject Mr Blue's planned code changes
 * MB.MD: Chat → Save → Build Workflow (Agent #4)
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Code, FileCode, Terminal, Sparkles, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface BuildIntent {
  messageId: number;
  tool: string;
  params: any;
  description: string;
}

interface BuildApprovalModalProps {
  open: boolean;
  onClose: () => void;
  buildIntents: BuildIntent[];
  onApprove: (messageIds: number[]) => Promise<void>;
  projectId: number;
}

export default function BuildApprovalModal({
  open,
  onClose,
  buildIntents,
  onApprove,
  projectId
}: BuildApprovalModalProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const { toast } = useToast();

  const handleApprove = async () => {
    try {
      setIsExecuting(true);
      const messageIds = buildIntents.map(b => b.messageId);
      await onApprove(messageIds);
      toast({
        title: 'Build Executed',
        description: `Successfully applied ${buildIntents.length} changes`,
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Build Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const getToolIcon = (tool: string) => {
    switch (tool) {
      case 'edit_file':
        return <FileCode className="w-4 h-4 text-cyan-400" />;
      case 'create_component':
        return <Code className="w-4 h-4 text-purple-400" />;
      case 'run_command':
        return <Terminal className="w-4 h-4 text-green-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-blue-400" />;
    }
  };

  const getToolDescription = (intent: BuildIntent) => {
    switch (intent.tool) {
      case 'edit_file':
        return {
          action: 'Edit File',
          details: `File: ${intent.params.file_path || 'Unknown'}`,
          color: 'cyan'
        };
      case 'create_component':
        return {
          action: 'Create Component',
          details: `Name: ${intent.params.component_name || 'Unknown'}`,
          color: 'purple'
        };
      case 'run_command':
        return {
          action: 'Run Command',
          details: `Command: ${intent.params.command || 'Unknown'}`,
          color: 'green'
        };
      default:
        return {
          action: intent.tool,
          details: 'See parameters below',
          color: 'blue'
        };
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 border-cyan-500/20 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            <Sparkles className="w-6 h-6 text-cyan-400" />
            Approve Build Changes
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Mr Blue has planned {buildIntents.length} code change{buildIntents.length !== 1 ? 's' : ''}. Review and approve to execute.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Safety Warning */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-yellow-400">Safety Features Active</p>
                <p className="text-yellow-200/80 mt-1">
                  ✅ Git snapshot will be created before changes<br />
                  ✅ Automatic rollback if build fails<br />
                  ✅ Critical files protected (package.json, .env, etc.)
                </p>
              </div>
            </div>
          </div>

          {/* Build Intents List */}
          <ScrollArea className="max-h-96">
            <div className="space-y-3 pr-4">
              {buildIntents.map((intent, idx) => {
                const { action, details, color } = getToolDescription(intent);
                
                return (
                  <div
                    key={intent.messageId}
                    className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-cyan-500/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-${color}-500/10 border border-${color}-500/30 flex items-center justify-center`}>
                        {getToolIcon(intent.tool)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-white">
                            {idx + 1}. {action}
                          </span>
                        </div>
                        
                        <p className="text-xs text-gray-400 mb-2">{details}</p>
                        
                        <div className="bg-gray-900/50 rounded px-3 py-2 font-mono text-xs text-cyan-300 overflow-x-auto">
                          {intent.description || 'No description'}
                        </div>

                        {/* Show params if available */}
                        {intent.params && Object.keys(intent.params).length > 0 && (
                          <details className="mt-2">
                            <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">
                              View parameters
                            </summary>
                            <pre className="mt-2 bg-gray-950 rounded p-2 text-xs text-gray-300 overflow-x-auto">
                              {JSON.stringify(intent.params, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-700">
            <Button
              onClick={onClose}
              disabled={isExecuting}
              variant="outline"
              className="flex-1 bg-gray-800 hover:bg-gray-700 border-gray-600 text-white"
              data-testid="button-cancel-build"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            
            <Button
              onClick={handleApprove}
              disabled={isExecuting}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold"
              data-testid="button-approve-build"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {isExecuting ? 'Executing...' : `Approve & Execute ${buildIntents.length} Change${buildIntents.length !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
