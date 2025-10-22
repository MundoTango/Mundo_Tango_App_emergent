/**
 * Universal Save System
 * MB.MD: Save all Visual Editor changes (styles, content, layout)
 */

import { useState, useEffect } from 'react';
import { Save, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Change {
  id: string;
  timestamp: Date;
  elementSelector: string;
  changeType: 'style' | 'content' | 'layout' | 'delete';
  before: any;
  after: any;
}

interface UniversalSaveSystemProps {
  changes: Change[];
  onSaveComplete?: () => void;
}

export function UniversalSaveSystem({ changes, onSaveComplete }: UniversalSaveSystemProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  // Auto-save every 30 seconds if there are changes
  useEffect(() => {
    if (changes.length > 0) {
      const interval = setInterval(() => {
        handleSave();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [changes]);

  const handleSave = async () => {
    if (changes.length === 0) {
      toast({
        title: "No Changes",
        description: "There are no changes to save",
        duration: 2000
      });
      return;
    }

    setIsSaving(true);
    setSaveStatus('saving');

    try {
      await apiRequest('/api/visual-editor/save', {
        method: 'POST',
        body: JSON.stringify({
          changes: changes.map(change => ({
            ...change,
            timestamp: change.timestamp.toISOString()
          })),
          page: window.location.pathname,
          savedAt: new Date().toISOString()
        })
      });

      setLastSaveTime(new Date());
      setSaveStatus('success');
      
      toast({
        title: "Changes Saved",
        description: `${changes.length} change(s) saved successfully`,
        duration: 3000
      });

      onSaveComplete?.();

      // Reset status after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);
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
              Universal Save
            </h3>
          </div>
          {changes.length > 0 && (
            <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300">
              {changes.length} change{changes.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {/* Changes Summary */}
        {changes.length > 0 && (
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <p>• {changes.filter(c => c.changeType === 'style').length} style changes</p>
            <p>• {changes.filter(c => c.changeType === 'content').length} content changes</p>
            <p>• {changes.filter(c => c.changeType === 'layout').length} layout changes</p>
            <p>• {changes.filter(c => c.changeType === 'delete').length} deletions</p>
          </div>
        )}

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={isSaving || changes.length === 0}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
          data-testid="button-universal-save"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save All Changes
            </>
          )}
        </Button>

        {/* Last Save Time */}
        {lastSaveTime && (
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Clock className="h-3 w-3" />
            <span>
              Last saved: {lastSaveTime.toLocaleTimeString()}
            </span>
          </div>
        )}

        {/* Auto-save indicator */}
        {changes.length > 0 && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Auto-save enabled • Changes save every 30 seconds
          </p>
        )}
      </div>
    </Card>
  );
}
