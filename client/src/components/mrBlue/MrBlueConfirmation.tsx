/**
 * MB.MD Mr Blue Confirmation Dialog
 * Mr Blue asks super admin before applying Visual Editor changes
 * 
 * Usage:
 * <MrBlueConfirmation change={change} onApprove={handleApprove} onReject={handleReject} />
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import type { VisualEditorChange } from '../visual-editor/VisualEditorTracker';

interface MrBlueConfirmationProps {
  change: VisualEditorChange | null;
  onApprove: () => void;
  onReject: () => void;
  isApplying?: boolean;
}

export function MrBlueConfirmation({
  change,
  onApprove,
  onReject,
  isApplying = false
}: MrBlueConfirmationProps) {
  if (!change) return null;

  // Format change details for display
  const getChangeDescription = () => {
    switch (change.type) {
      case 'attribute':
        return `Changed ${change.attributeName}: ${change.oldValue} → ${change.newValue}`;
      case 'style':
        return 'Modified styles';
      case 'class':
        return `Changed classes: ${change.oldValue} → ${change.newValue}`;
      case 'text':
        return `Changed text: "${change.oldValue}" → "${change.newValue}"`;
      case 'structure':
        return 'Modified component structure';
      default:
        return 'Unknown change';
    }
  };

  const getChangeTypeColor = () => {
    switch (change.type) {
      case 'style':
      case 'class':
        return 'bg-blue-500';
      case 'text':
        return 'bg-green-500';
      case 'attribute':
        return 'bg-yellow-500';
      case 'structure':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const isCriticalChange = change.type === 'structure';

  return (
    <Dialog open={!!change} onOpenChange={(open) => !open && onReject()}>
      <DialogContent className="max-w-2xl" data-testid="mrblue-confirmation-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            <span>Mr Blue: Confirm Visual Change</span>
          </DialogTitle>
          <DialogDescription>
            I detected a change in the Visual Editor. Should I apply it and let the component learn from it?
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Change details */}
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950 dark:to-blue-950 p-4 rounded-lg border border-cyan-200 dark:border-cyan-800">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Component:
                </span>
                <Badge variant="outline" className="font-mono">
                  {change.componentId}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Change Type:
                </span>
                <Badge className={getChangeTypeColor()}>
                  {change.type.toUpperCase()}
                </Badge>
              </div>

              <div className="pt-2 border-t border-cyan-200 dark:border-cyan-800">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {getChangeDescription()}
                </p>
              </div>

              {isCriticalChange && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-md border border-yellow-200 dark:border-yellow-800">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Critical change:</strong> This modifies the component structure
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Learning preview */}
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
            <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              📚 What happens if you approve:
            </h4>
            <ol className="text-sm space-y-1 text-gray-600 dark:text-gray-400 list-decimal list-inside">
              <li>Component will validate the change (5-track MB.MD research)</li>
              <li>Component will learn from this change for future improvements</li>
              <li>Component may attempt auto-fix if issues are detected</li>
              <li>Change will be recorded in component learning history</li>
              <li>If validation fails, change will be rolled back automatically</li>
            </ol>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <Button 
              onClick={onApprove} 
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
              disabled={isApplying}
              data-testid="button-approve-change"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {isApplying ? 'Applying...' : 'Yes, Apply & Learn'}
            </Button>
            <Button 
              onClick={onReject} 
              variant="outline" 
              className="flex-1"
              disabled={isApplying}
              data-testid="button-reject-change"
            >
              <XCircle className="w-4 h-4 mr-2" />
              No, Reject Change
            </Button>
          </div>

          {/* Timestamp */}
          <p className="text-xs text-center text-gray-500 dark:text-gray-500">
            Change detected at {new Date(change.timestamp).toLocaleTimeString()}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
