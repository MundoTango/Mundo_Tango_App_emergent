/**
 * Universal Save System
 * MB.MD STREAM 2: Execute pending code changes from vibe coding
 * Oct 25, 2025: Complete rewrite to use VisualEditorContext
 */

import { useState, useEffect } from 'react';
import { Save, Clock, CheckCircle2, AlertCircle, Loader2, FileCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useVisualEditorOptional } from '@/contexts/VisualEditorContext';
import { applyCodeChange } from '@/lib/vibeApi';

interface UniversalSaveSystemProps {
  onSaveComplete?: () => void;
}

export function UniversalSaveSystem({ onSaveComplete }: UniversalSaveSystemProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [currentFile, setCurrentFile] = useState<string>('');
  const { toast } = useToast();
  
  // 🚀 STREAM 2: Get pending changes from Visual Editor context
  const visualEditorContext = useVisualEditorOptional();
  const pendingChanges = visualEditorContext?.pendingCodeChanges || [];

  const handleSave = async () => {
    if (pendingChanges.length === 0) {
      toast({
        title: "No Changes",
        description: "There are no code changes to apply",
        duration: 2000
      });
      return;
    }

    setIsSaving(true);
    setSaveStatus('saving');
    
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    try {
      // Apply each code change sequentially
      for (let i = 0; i < pendingChanges.length; i++) {
        const change = pendingChanges[i];
        setCurrentFile(`${i + 1}/${pendingChanges.length}: ${change.filePath}`);
        
        try {
          // Convert type for API (new_file becomes unified_diff)
          const editType = change.type === 'new_file' ? 'unified_diff' : change.type;
          
          console.log(`📝 [Save] Applying change ${i + 1}/${pendingChanges.length}:`, change.filePath);
          
          await applyCodeChange(change.filePath, change.diff, editType);
          
          // 🔧 ARCHITECT FIX: Mark successful change
          change.status = 'applied';
          successCount++;
        } catch (error) {
          // 🔧 ARCHITECT FIX: Mark failed change but keep it
          change.status = 'failed';
          change.error = error instanceof Error ? error.message : 'Unknown error';
          errorCount++;
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`${change.filePath}: ${errorMsg}`);
          console.error(`❌ [Save] Failed to apply change to ${change.filePath}:`, error);
        }
      }
      
      // 🔧 ARCHITECT FIX: Only clear SUCCESSFUL changes, keep failed ones
      if (visualEditorContext) {
        const failedChanges = pendingChanges.filter(c => c.status === 'failed');
        visualEditorContext.setPendingCodeChanges(failedChanges);
      }
      
      setLastSaveTime(new Date());
      
      if (errorCount === 0) {
        setSaveStatus('success');
        toast({
          title: "All Changes Applied! ✅",
          description: `Successfully modified ${successCount} file(s)`,
          duration: 5000
        });
      } else {
        setSaveStatus('error');
        toast({
          title: `Partial Success`,
          description: `${successCount} succeeded, ${errorCount} failed. Check console for details.`,
          variant: "destructive",
          duration: 5000
        });
      }

      onSaveComplete?.();

      // Reset status after 3 seconds
      setTimeout(() => {
        setSaveStatus('idle');
        setCurrentFile('');
      }, 3000);
    } catch (error) {
      setSaveStatus('error');
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusIcon = () => {
    switch (saveStatus) {
      case 'saving':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Save className="h-4 w-4" />;
    }
  };

  const getStatusColor = () => {
    switch (saveStatus) {
      case 'saving':
        return 'bg-blue-100 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700';
      case 'success':
        return 'bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-700';
      case 'error':
        return 'bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-700';
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <Card className={`p-4 ${getStatusColor()} transition-colors duration-300`}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Code Changes
            </h3>
          </div>
          {pendingChanges.length > 0 && (
            <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300">
              {pendingChanges.length} file{pendingChanges.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {/* File List */}
        {pendingChanges.length > 0 && (
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1 max-h-32 overflow-y-auto">
            {pendingChanges.map((change, i) => (
              <div key={change.id} className="flex items-center gap-2">
                <FileCode className="h-3 w-3 text-purple-500" />
                <span className="font-mono truncate">{change.filePath}</span>
              </div>
            ))}
          </div>
        )}
        
        {/* Progress indicator */}
        {isSaving && currentFile && (
          <div className="text-xs text-blue-600 dark:text-blue-400">
            Applying: {currentFile}
          </div>
        )}

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={isSaving || pendingChanges.length === 0}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
          data-testid="button-universal-save"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Applying Changes...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Apply All Code Changes
            </>
          )}
        </Button>

        {/* Last Save Time */}
        {lastSaveTime && (
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Clock className="h-3 w-3" />
            <span>
              Last applied: {lastSaveTime.toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
