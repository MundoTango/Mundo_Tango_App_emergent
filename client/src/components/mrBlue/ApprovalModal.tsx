import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, FileCode, Shield } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ApprovalRequest {
  id: string;
  action: string;
  description: string;
  risk: 'low' | 'medium' | 'high';
  affectedFiles: string[];
  diff?: string;
}

interface ApprovalModalProps {
  open: boolean;
  request: ApprovalRequest | null;
  onApprove: () => void;
  onReject: () => void;
}

const riskColors = {
  low: 'bg-green-500/20 text-green-500 border-green-500/50',
  medium: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50',
  high: 'bg-red-500/20 text-red-500 border-red-500/50'
};

/**
 * Modal for approving/rejecting autonomous actions
 * Shows proposed changes, affected files, and risk level
 */
export function ApprovalModal({ open, request, onApprove, onReject }: ApprovalModalProps) {
  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onReject()}>
      <DialogContent className="max-w-2xl" data-testid="modal-approval">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-teal-500" />
            <DialogTitle>Approval Required</DialogTitle>
          </div>
          <DialogDescription>
            Mr Blue wants to perform an autonomous action that requires your approval.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Risk Level */}
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium">Risk Level:</span>
            <Badge className={riskColors[request.risk]} variant="outline" data-testid="badge-risk-level">
              {request.risk.toUpperCase()}
            </Badge>
          </div>

          {/* Action */}
          <div>
            <h4 className="text-sm font-semibold mb-1">Proposed Action:</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400" data-testid="text-action">
              {request.action}
            </p>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-sm font-semibold mb-1">Description:</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400" data-testid="text-description">
              {request.description}
            </p>
          </div>

          {/* Affected Files */}
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <FileCode className="h-4 w-4" />
              Affected Files ({request.affectedFiles.length}):
            </h4>
            <ScrollArea className="h-32 border rounded p-2 bg-gray-50 dark:bg-gray-900">
              <div className="space-y-1">
                {request.affectedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="text-xs font-mono text-gray-700 dark:text-gray-300"
                    data-testid={`file-${idx}`}
                  >
                    {file}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Diff Preview */}
          {request.diff && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Changes Preview:</h4>
              <ScrollArea className="h-48 border rounded p-3 bg-gray-900 text-gray-100 font-mono text-xs">
                <pre data-testid="diff-preview">{request.diff}</pre>
              </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onReject}
            data-testid="button-reject"
            className="border-red-500/50 text-red-500 hover:bg-red-500/10"
          >
            Reject
          </Button>
          <Button
            onClick={onApprove}
            data-testid="button-approve"
            className="bg-teal-500 hover:bg-teal-600 text-white"
          >
            Approve & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
