/**
 * STREAM 2: Guardrails - Human Approval Modal UI
 * 
 * Modal for super admins to approve/reject high-risk operations
 */

import { useState } from 'react';
import { AlertTriangle, Check, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface ApprovalRequest {
  id: string;
  type: 'file_edit' | 'terminal_command' | 'deployment' | 'database_migration';
  operation: string;
  context: any;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  requestedAt: string;
  expiresAt: string;
}

interface ApprovalModalProps {
  request: ApprovalRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onDecision: (approved: boolean) => void;
}

const RISK_COLORS = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

const RISK_ICONS = {
  low: '🟢',
  medium: '🟡',
  high: '🟠',
  critical: '🔴',
};

export function ApprovalModal({ request, isOpen, onClose, onDecision }: ApprovalModalProps) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  if (!request) return null;

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await apiRequest(`/api/approvals/${request.id}/approve`, {
        method: 'POST',
      });

      toast({
        title: 'Operation Approved ✅',
        description: 'The operation has been approved and will execute now.',
      });

      onDecision(true);
      onClose();
    } catch (error) {
      toast({
        title: 'Approval Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      await apiRequest(`/api/approvals/${request.id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason: rejectionReason }),
      });

      toast({
        title: 'Operation Rejected',
        description: 'The operation has been rejected and will not execute.',
      });

      onDecision(false);
      onClose();
    } catch (error) {
      toast({
        title: 'Rejection Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const timeUntilExpiry = new Date(request.expiresAt).getTime() - Date.now();
  const minutesRemaining = Math.max(0, Math.floor(timeUntilExpiry / 60000));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
            <DialogTitle>High-Risk Operation Requires Approval</DialogTitle>
          </div>
          <DialogDescription>
            Review the operation details carefully before approving or rejecting.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Risk Level */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Risk Level:</span>
            <Badge className={RISK_COLORS[request.riskLevel]}>
              {RISK_ICONS[request.riskLevel]} {request.riskLevel.toUpperCase()}
            </Badge>
          </div>

          {/* Operation Type */}
          <div>
            <span className="text-sm font-medium text-gray-700">Operation Type:</span>
            <p className="text-sm text-gray-900 mt-1">{request.type.replace('_', ' ')}</p>
          </div>

          {/* Operation Details */}
          <div>
            <span className="text-sm font-medium text-gray-700">Operation:</span>
            <pre className="mt-1 p-3 bg-gray-50 rounded border border-gray-200 text-xs font-mono overflow-x-auto">
              {request.operation}
            </pre>
          </div>

          {/* Context */}
          {request.context && Object.keys(request.context).length > 0 && (
            <div>
              <span className="text-sm font-medium text-gray-700">Context:</span>
              <pre className="mt-1 p-3 bg-gray-50 rounded border border-gray-200 text-xs font-mono overflow-x-auto max-h-40">
                {JSON.stringify(request.context, null, 2)}
              </pre>
            </div>
          )}

          {/* Time Remaining */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>Expires in {minutesRemaining} minute{minutesRemaining !== 1 ? 's' : ''}</span>
          </div>

          {/* Rejection Reason */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Rejection Reason (optional):
            </label>
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Explain why this operation is being rejected..."
              className="resize-none"
              rows={3}
              data-testid="textarea-rejection-reason"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleReject}
            disabled={isProcessing}
            className="gap-2"
            data-testid="button-reject-operation"
          >
            <X className="w-4 h-4" />
            Reject
          </Button>
          <Button
            onClick={handleApprove}
            disabled={isProcessing}
            className="gap-2 bg-green-600 hover:bg-green-700"
            data-testid="button-approve-operation"
          >
            <Check className="w-4 h-4" />
            {isProcessing ? 'Approving...' : 'Approve & Execute'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
