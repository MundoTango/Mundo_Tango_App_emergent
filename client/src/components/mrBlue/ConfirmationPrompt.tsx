/**
 * Mr Blue Confirmation Prompt
 * Shows Yes/No buttons when Mr Blue needs user confirmation for visual edits
 */

import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ConfirmationPromptProps {
  question: string;
  onConfirm: () => void;
  onDeny: () => void;
  isProcessing?: boolean;
}

export function ConfirmationPrompt({
  question,
  onConfirm,
  onDeny,
  isProcessing = false,
}: ConfirmationPromptProps) {
  return (
    <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {question}
        </p>
        
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={onConfirm}
            disabled={isProcessing}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            data-testid="button-confirm-yes"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Yes, that's right
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={onDeny}
            disabled={isProcessing}
            className="flex-1"
            data-testid="button-confirm-no"
          >
            <XCircle className="h-4 w-4 mr-1" />
            No, let me clarify
          </Button>
        </div>
        
        {isProcessing && (
          <div className="text-xs text-center text-muted-foreground animate-pulse">
            Learning from your confirmation...
          </div>
        )}
      </div>
    </Card>
  );
}
