/**
 * DIFF PREVIEW CARD - Show code changes before applying
 * MB.MD SIMULTANEOUS - Agent #5: Visual Editor Integration Specialist
 * 
 * Shows unified diff with before/after comparison
 * Allows user to Apply or Reject changes
 * 
 * Created: October 23, 2025
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, X, Eye, Code } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface DiffPreviewCardProps {
  filePath: string;
  beforeCode: string;
  afterCode: string;
  diffString?: string;
  onApply?: () => void;
  onReject?: () => void;
  screenshot?: string; // Optional before/after screenshot
}

export function DiffPreviewCard({
  filePath,
  beforeCode,
  afterCode,
  diffString,
  onApply,
  onReject,
  screenshot
}: DiffPreviewCardProps) {
  const [isApplying, setIsApplying] = useState(false);
  const { toast } = useToast();

  const handleApply = async () => {
    setIsApplying(true);
    
    try {
      // Apply the diff via API
      const response = await apiRequest('/api/vibe/edit-file', {
        method: 'POST',
        body: {
          filePath,
          editType: 'unified_diff',
          diffContent: diffString || generateDiff(beforeCode, afterCode)
        }
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Changes applied!',
          description: `Updated ${filePath}`,
        });
        
        onApply?.();
      } else {
        throw new Error(result.error || 'Failed to apply changes');
      }
    } catch (error) {
      toast({
        title: 'Failed to apply changes',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setIsApplying(false);
    }
  };

  const handleReject = () => {
    toast({
      title: 'Changes rejected',
      description: 'No modifications were made'
    });
    
    onReject?.();
  };

  return (
    <Card 
      className="mt-4 border-2 border-teal-500/30 bg-gradient-to-br from-teal-50/50 to-cyan-50/50 dark:from-teal-950/20 dark:to-cyan-950/20"
      data-testid="diff-preview-card"
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="w-5 h-5 text-teal-600" />
          Preview Code Changes
        </CardTitle>
        <CardDescription>
          File: <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{filePath}</code>
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="diff" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="diff" data-testid="tab-diff">
              Diff
            </TabsTrigger>
            <TabsTrigger value="before" data-testid="tab-before">
              Before
            </TabsTrigger>
            <TabsTrigger value="after" data-testid="tab-after">
              After
            </TabsTrigger>
          </TabsList>

          <TabsContent value="diff" className="mt-4">
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm font-mono whitespace-pre">
                {diffString || generateSimpleDiff(beforeCode, afterCode)}
              </pre>
            </div>
          </TabsContent>

          <TabsContent value="before" className="mt-4">
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm font-mono whitespace-pre">
                {beforeCode}
              </pre>
            </div>
          </TabsContent>

          <TabsContent value="after" className="mt-4">
            <div className="bg-green-950 text-green-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm font-mono whitespace-pre">
                {afterCode}
              </pre>
            </div>
          </TabsContent>
        </Tabs>

        {screenshot && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Visual Preview:</h4>
            <img 
              src={screenshot} 
              alt="Before/After Preview" 
              className="w-full rounded-lg border border-gray-300"
            />
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={handleReject}
          data-testid="button-reject-changes"
          className="gap-2"
        >
          <X className="w-4 h-4" />
          Reject
        </Button>
        
        <Button
          onClick={handleApply}
          disabled={isApplying}
          data-testid="button-apply-changes"
          className="gap-2 bg-teal-600 hover:bg-teal-700"
        >
          {isApplying ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Applying...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              Apply Changes
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

/**
 * Generate simple unified diff for display
 */
function generateSimpleDiff(before: string, after: string): string {
  const beforeLines = before.split('\n');
  const afterLines = after.split('\n');
  
  let diff = '--- before\n+++ after\n';
  
  const maxLength = Math.max(beforeLines.length, afterLines.length);
  
  for (let i = 0; i < maxLength; i++) {
    const beforeLine = beforeLines[i];
    const afterLine = afterLines[i];
    
    if (beforeLine !== afterLine) {
      if (beforeLine !== undefined) {
        diff += `-${beforeLine}\n`;
      }
      if (afterLine !== undefined) {
        diff += `+${afterLine}\n`;
      }
    } else {
      diff += ` ${beforeLine || ''}\n`;
    }
  }
  
  return diff;
}

/**
 * Generate actual unified diff (simplified)
 */
function generateDiff(before: string, after: string): string {
  // This is a simplified diff generator
  // In production, we'd use the 'diff' library on the backend
  return `--- a/file\n+++ b/file\n@@ -1,${before.split('\n').length} +1,${after.split('\n').length} @@\n${generateSimpleDiff(before, after)}`;
}
